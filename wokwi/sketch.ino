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
#define LED_HIJAU       12   // Indikator Meja Kosong
#define LED_MERAH       14   // Indikator Meja Terisi

// ==========================================
// KONFIGURASI FIREBASE & WIFI
// ==========================================
// Wokwi: gunakan "Wokwi-GUEST" (tanpa password)
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

// URL Realtime Database — ganti dengan URL project kamu
// Contoh: https://projek-uts-bab96-default-rtdb.firebaseio.com
const char* FIREBASE_DB_URL = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com";

// ID sofa yang dimonitor ESP32 ini (1–32)
const int TABLE_ID = 1;

// Ambang batas jarak (cm) ghost booking
const float GHOST_THRESHOLD_CM = 60.0;

// ==========================================
// KONFIGURASI OVERSTAY
// ==========================================
// Durasi (ms) sebelum status jadi "warning" = 2 jam
const unsigned long OVERSTAY_MS = 2UL * 60UL * 60UL * 1000UL;

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

  // Tentukan status
  String status;
  if (!isOccupied)   status = "available";
  else if (isGhost)  status = "warning";
  else               status = "occupied";

  unsigned long elapsedSec = (isOccupied && checkInTime > 0)
    ? (millis() - checkInTime) / 1000
    : 0;

  // Buat payload JSON
  StaticJsonDocument<256> doc;
  doc["status"]         = status;
  doc["isOccupied"]     = isOccupied;
  doc["distance"]       = (int)distance;
  doc["isGhostBooking"] = isGhost;
  doc["elapsedSeconds"] = (long)elapsedSec;

  if (currentUID.length() > 0)    doc["uid"]         = currentUID;
  else                             doc["uid"]         = (char*)nullptr;

  if (isOccupied && checkInTime > 0) doc["checkInTime"] = (long long)checkInTime;
  else                               doc["checkInTime"] = (char*)nullptr;

  doc["updatedAt"] = (long long)millis();

  String body;
  serializeJson(doc, body);

  String url = String(FIREBASE_DB_URL) + "/tables/" + String(TABLE_ID) + ".json";
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int httpCode = http.sendRequest("PATCH", body);
  http.end();

  Serial.printf("[Firebase] PATCH /tables/%d → HTTP %d | %s | dist=%.1fcm | uid=%s\n",
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

  // Kondisi awal: Meja kosong → LED hijau menyala
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
  Serial.printf ("   Monitoring TABLE_ID = %d          \n", TABLE_ID);
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
  // 1. LOGIKA CHECK-IN & CHECK-OUT (Sensor RFID — Toggle)
  // ---------------------------------------------------------
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
    isOccupied = !isOccupied;
    isGhost    = false;

    Serial.println("-------------------------------------");
    if (isOccupied) {
      currentUID  = getRFIDUID();
      checkInTime = millis();
      digitalWrite(LED_HIJAU, LOW);
      digitalWrite(LED_MERAH, HIGH);
      Serial.println(">>> CHECK-IN BERHASIL: MEJA TERISI");
      Serial.println("    UID: " + currentUID);
    } else {
      currentUID  = "";
      checkInTime = 0;
      digitalWrite(LED_HIJAU, HIGH);
      digitalWrite(LED_MERAH, LOW);
      Serial.println(">>> CHECK-OUT BERHASIL: MEJA KOSONG");
    }
    Serial.println("-------------------------------------\n");

    // Kirim perubahan ke Firebase segera
    sendToFirebase(distance);

    delay(1000);
    mfrc522.PICC_HaltA();
  }

  // ---------------------------------------------------------
  // 2. LOGIKA VALIDASI FISIK (Sensor Ultrasonik)
  //    Hanya aktif jika meja berstatus TERISI
  // ---------------------------------------------------------
  if (isOccupied) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    distance = duration * 0.034f / 2.0f;

    if (distance > GHOST_THRESHOLD_CM) {
      isGhost = true;
      Serial.print("⚠️  GHOST BOOKING: Meja terisi tapi tidak ada orang! (Jarak: ");
      Serial.print(distance);
      Serial.println(" cm)");
    } else {
      isGhost = false;
      Serial.print("✅ User terdeteksi duduk (Jarak: ");
      Serial.print(distance);
      Serial.println(" cm)");
    }

    // Cek overstay
    if (checkInTime > 0 && (millis() - checkInTime) >= OVERSTAY_MS) {
      isGhost = true; // gunakan status warning juga untuk overstay
      Serial.println("🕐 OVERSTAY: Pengguna sudah melewati batas waktu!");
    }

    // Kirim update ke Firebase setiap loop (saat terisi)
    sendToFirebase(distance);
  }

  delay(500);
}

 *
 * Komponen:
 *   - HC-SR04  : deteksi jarak (apakah sofa terisi)
 *   - MFRC522  : baca RFID card (UID pengunjung)
 *
 * Wiring:
 *   HC-SR04 → ESP32
 *     VCC  → 5V
 *     GND  → GND
 *     TRIG → GPIO 13
 *     ECHO → GPIO 14
 *
 *   MFRC522 → ESP32
 *     3.3V → 3V3
 *     GND  → GND
 *     SCK  → GPIO 18
 *     MISO → GPIO 19
 *     MOSI → GPIO 23
 *     SDA  → GPIO 5  (SS)
 *     RST  → GPIO 22
 *
 * Library yang dibutuhkan (Wokwi sudah built-in):
 *   - ArduinoJson
 *   - MFRC522
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SPI.h>
#include <MFRC522.h>

// ── Konfigurasi ────────────────────────────────────────────────

// WiFi — gunakan "Wokwi-GUEST" di Wokwi (tanpa password)
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";

// Firebase Realtime Database URL
// Ganti dengan URL project kamu
// Format: https://{project-id}-default-rtdb.firebaseio.com
const char* FIREBASE_DB_URL = "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com";

// ID sofa yang dimonitor ESP32 ini (sesuaikan: 1–32)
const int TABLE_ID = 1;

// Ambang batas jarak (cm): di bawah nilai ini = ada orang
const float OCCUPIED_CM = 30.0;

// Ambang batas overstay (detik) = 2 jam
const unsigned long OVERSTAY_SEC = 7200;

// ── Pin Definitions ────────────────────────────────────────────

#define TRIG_PIN  13
#define ECHO_PIN  14
#define SS_PIN     5
#define RST_PIN   22

// ── Global State ───────────────────────────────────────────────

MFRC522 rfid(SS_PIN, RST_PIN);

String  g_status     = "available";
String  g_uid        = "";
bool    g_occupied   = false;
unsigned long g_checkInMs = 0;

// ── Fungsi Sensor ──────────────────────────────────────────────

/** Baca jarak dari HC-SR04 dalam cm */
float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // timeout 30ms
  if (duration == 0) return 999.0; // tidak ada pantulan
  return duration * 0.034f / 2.0f;
}

/** Baca UID RFID jika ada kartu baru, kembalikan string UID */
String readRFUID() {
  if (!rfid.PICC_IsNewCardPresent()) return "";
  if (!rfid.PICC_ReadCardSerial())   return "";
  String uid = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(rfid.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return uid;
}

// ── Kirim Data ke RTDB ─────────────────────────────────────────

void sendToRTDB(float distance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Tidak terhubung, skip kirim data.");
    return;
  }

  unsigned long elapsedSec = g_occupied && g_checkInMs > 0
    ? (millis() - g_checkInMs) / 1000
    : 0;

  // Buat JSON payload
  StaticJsonDocument<256> doc;
  doc["status"]         = g_status;
  doc["isOccupied"]     = g_occupied;
  doc["distance"]       = (int)distance;
  doc["isGhostBooking"] = (g_status == "warning");
  doc["elapsedSeconds"] = (long)elapsedSec;

  if (g_uid.length() > 0) {
    doc["uid"] = g_uid;
  } else {
    doc["uid"] = (char*)nullptr; // null
  }

  if (g_occupied && g_checkInMs > 0) {
    doc["checkInTime"] = (long long)g_checkInMs;
  } else {
    doc["checkInTime"] = (char*)nullptr;
  }

  doc["updatedAt"] = (long long)millis();

  String body;
  serializeJson(doc, body);

  // PATCH ke RTDB (update field saja, tidak hapus yang lain)
  String url = String(FIREBASE_DB_URL) + "/tables/" + String(TABLE_ID) + ".json";

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  // PATCH menggunakan sendRequest karena HTTPClient tidak punya .patch()
  int code = http.sendRequest("PATCH", body);
  http.end();

  Serial.printf("[RTDB] PATCH /tables/%d → HTTP %d | dist=%.1fcm | %s | uid=%s\n",
    TABLE_ID, code, distance, g_status.c_str(), g_uid.c_str());
}

// ── Setup ──────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  SPI.begin();
  rfid.PCD_Init();
  Serial.println("[RFID] MFRC522 siap.");

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
    Serial.println("\n[WiFi] GAGAL terhubung. Cek SSID/password.");
  }

  Serial.printf("[INFO] Monitoring TABLE_ID=%d, threshold=%.0fcm\n", TABLE_ID, OCCUPIED_CM);
}

// ── Loop ───────────────────────────────────────────────────────

void loop() {
  float distance = readDistanceCm();
  bool  nowOccupied = (distance < OCCUPIED_CM);

  // ── Cek RFID ─────────────────────────────────────────────────
  String scanned = readRFUID();
  if (scanned.length() > 0) {
    g_uid = scanned;
    Serial.println("[RFID] Kartu terdeteksi: " + g_uid);
  }

  // ── Check-in ─────────────────────────────────────────────────
  if (nowOccupied && !g_occupied) {
    g_occupied   = true;
    g_status     = "occupied";
    g_checkInMs  = millis();
    Serial.printf("[EVENT] CHECK-IN | dist=%.1fcm\n", distance);
  }

  // ── Check-out ────────────────────────────────────────────────
  if (!nowOccupied && g_occupied) {
    g_occupied  = false;
    g_status    = "available";
    g_uid       = "";
    g_checkInMs = 0;
    Serial.println("[EVENT] CHECK-OUT");
  }

  // ── Overstay / Ghost booking ──────────────────────────────────
  if (g_occupied && g_checkInMs > 0) {
    unsigned long elapsed = (millis() - g_checkInMs) / 1000;
    if (elapsed >= OVERSTAY_SEC) {
      g_status = "warning";
    }
  }

  // ── Kirim ke Firebase RTDB ────────────────────────────────────
  sendToRTDB(distance);

  delay(2000); // Update setiap 2 detik
}
