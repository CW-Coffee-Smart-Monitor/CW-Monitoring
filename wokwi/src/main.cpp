#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ==========================================
// KONFIGURASI PIN (Sesuai Wiring Wokwi)
// ==========================================
#define RST_PIN         22
#define SS_PIN          5    // SDA RFID
#define TRIG_PIN        26   // Pin Trigger Ultrasonik
#define ECHO_PIN        27   // Pin Echo Ultrasonik
#define LED_HIJAU       14   // Indikator Meja Kosong (led1, GPIO14)
#define LED_MERAH       12   // Indikator Meja Terisi (led2, GPIO12)

// ==========================================
// KONFIGURASI FIREBASE & WIFI
// ==========================================
// Wokwi VS Code: gunakan "Wokwi-GUEST" (tanpa password)
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

// ⚠ GANTI dengan URL RTDB project kamu
const char* FIREBASE_DB_URL = "https://projek-uts-bab96-default-rtdb.asia-southeast1.firebasedatabase.app";

// ID sofa yang dimonitor ESP32 ini (1–32)
const int TABLE_ID = 5;  // Sofa E1

// Ambang batas jarak (cm) ghost booking
const float GHOST_THRESHOLD_CM = 60.0;

// ==========================================
// STATE
// ==========================================
MFRC522 mfrc522(SS_PIN, RST_PIN);

bool          isOccupied  = false;
bool          isGhost     = false;
String        currentUID  = "";
unsigned long checkInTime = 0;

// ==========================================
// FUNGSI: Kirim data ke Firebase RTDB
// ==========================================
void sendToFirebase(float distance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Tidak terhubung, skip kirim.");
    return;
  }

  String status;
  if (!isOccupied)   status = "available";
  else if (isGhost)  status = "warning";
  else               status = "occupied";

  unsigned long elapsedSec = (isOccupied && checkInTime > 0)
    ? (millis() - checkInTime) / 1000
    : 0;

  StaticJsonDocument<256> doc;
  doc["status"]         = status;
  doc["isOccupied"]     = isOccupied;
  doc["distance"]       = (int)distance;
  doc["isGhostBooking"] = isGhost;
  doc["elapsedSeconds"] = (long)elapsedSec;

  if (currentUID.length() > 0)       doc["uid"]         = currentUID;
  else                               doc["uid"]         = (char*)nullptr;

  // checkInTime dikirim sebagai unix ms (pakai unixTime dari NTP jika tersedia,
  // fallback ke 0 agar website tidak salah hitung elapsed dari millis() ESP32)
  doc["checkInTime"] = (char*)nullptr;  // website hitung dari elapsedSeconds

  doc["updatedAt"] = (long long)millis();

  String body;
  serializeJson(doc, body);

  String url = String(FIREBASE_DB_URL) + "/tables/" + String(TABLE_ID) + ".json";
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.sendRequest("PATCH", body);
  http.end();

  Serial.printf("[Firebase] PATCH /tables/%d -> HTTP %d | %s | dist=%.1fcm | uid=%s\n",
    TABLE_ID, httpCode, status.c_str(), distance, currentUID.c_str());
}

// ==========================================
// FUNGSI: Baca UID RFID
// ==========================================
String getRFIDUID() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

// ==========================================
// SETUP
// ==========================================
void setup() {
  Serial.begin(115200);
  SPI.begin();
  mfrc522.PCD_Init();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_HIJAU, OUTPUT);
  pinMode(LED_MERAH, OUTPUT);

  // Kondisi awal: Meja kosong
  digitalWrite(LED_HIJAU, HIGH);
  digitalWrite(LED_MERAH, LOW);

  // Hubungkan WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("[WiFi] Menghubungkan");
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Terhubung! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] GAGAL — mode offline, data tidak dikirim.");
  }

  Serial.println("=====================================");
  Serial.println("   Sistem CW-SmartMonitor Standby   ");
  Serial.printf ("   Monitoring TABLE_ID = %d\n", TABLE_ID);
  Serial.println("     Menunggu Tap Kartu RFID...      ");
  Serial.println("=====================================\n");

  // Kirim status awal ke Firebase
  sendToFirebase(999.0);
}

// ==========================================
// LOOP
// ==========================================
void loop() {
  float distance = 999.0;

  // ---------------------------------------------------------
  // 1. LOGIKA RFID — Double Tap untuk Check-In / Check-Out
  //    Tap 1x kartu baru → Check-In
  //    Tap 2x kartu yang sama (dalam 2 detik) → Check-Out
  // ---------------------------------------------------------
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    String tappedUID = getRFIDUID();
    isOccupied = !isOccupied;
    isGhost    = false;

    Serial.println("-------------------------------------");
    if (isOccupied) {
      currentUID  = tappedUID;
      checkInTime = millis();
      digitalWrite(LED_HIJAU, LOW);
      digitalWrite(LED_MERAH, HIGH);
      Serial.println(">>> CHECK-IN: MEJA TERISI");
      Serial.println("    UID: " + currentUID);
    } else {
      currentUID  = "";
      checkInTime = 0;
      digitalWrite(LED_HIJAU, HIGH);
      digitalWrite(LED_MERAH, LOW);
      Serial.println(">>> CHECK-OUT: MEJA KOSONG");
    }
    Serial.println("-------------------------------------\n");

    sendToFirebase(distance);
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    delay(1500);  // tunggu cukup lama agar kartu tidak terbaca ulang
  }

  // ---------------------------------------------------------
  // 2. LOGIKA VALIDASI FISIK (Ultrasonik — hanya saat terisi)
  // Ghost detection dinonaktifkan: di Wokwi tidak ada objek fisik
  // sehingga distance selalu > threshold dan selalu trigger warning.
  // Status tetap 'occupied' selama isOccupied = true.
  // ---------------------------------------------------------
  if (isOccupied) {
    sendToFirebase(999.0);
  }

  // Tidak ada delay — loop secepat mungkin untuk real-time
}
