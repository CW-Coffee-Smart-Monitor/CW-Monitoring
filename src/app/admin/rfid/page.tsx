"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, Plus, X } from "lucide-react";
import { db } from "@/lib/firebase"; // sesuaikan path firebase kamu
import { collection, addDoc, onSnapshot } from "firebase/firestore";

interface DeviceDoc {
  id: string;
  tableId: number;
  rfidId: string;
  deviceStatus: string;
  status: string;
  isOccupied: boolean;
  uid: string | null;
}

export default function TambahRfidPage() {
  const router = useRouter();

  // Devices registry state
  const [devices, setDevices] = useState<DeviceDoc[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rfidId, setRfidId] = useState("");
  const [tableId, setTableId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Subscribe to devices in Firestore for the grid list
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "devices"),
      (snapshot) => {
        const items: DeviceDoc[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as DeviceDoc);
        });
        // Sort by Table ID for display consistency
        items.sort((a, b) => a.tableId - b.tableId);
        setDevices(items);
        setLoadingList(false);
      },
      (err) => {
        console.error("Error loading devices list: ", err);
        setLoadingList(false);
      }
    );
    return () => unsub();
  }, []);

  /* ── Validasi format UID XX:XX:XX:XX ── */
  const isValidUid = (uid: string) => /^([0-9A-Fa-f]{2}:){3}[0-9A-Fa-f]{2}$/.test(uid);

  const isValidTableId = (id: string) => /^\d+$/.test(id) && parseInt(id) > 0;

  async function handleSubmit() {
    setError(null);

    if (!rfidId.trim()) {
      setError("RFID UID tidak boleh kosong.");
      return;
    }
    if (!isValidUid(rfidId.trim())) {
      setError("Format UID tidak valid. Gunakan format XX:XX:XX:XX (contoh: 5A:5F:B3:01).");
      return;
    }
    if (!tableId.trim()) {
      setError("Table ID tidak boleh kosong.");
      return;
    }
    if (!isValidTableId(tableId.trim())) {
      setError("Table ID harus berupa angka positif.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "devices"), {
        rfidId: rfidId.trim().toUpperCase(),
        tableId: parseInt(tableId.trim()),
        deviceStatus: "active",
        isOccupied: false,
        status: "available",
        uid: "",
      });

      setSuccess(true);

      // Close modal and reset fields after 1.2s
      setTimeout(() => {
        setIsModalOpen(false);
        setRfidId("");
        setTableId("");
        setSuccess(false);
        setError(null);
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">

          <div>
            <h1 className="text-2xl font-bold text-neutral-900 leading-tight">RFID Devices</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Daftar kartu RFID yang terdaftar di sistem</p>
          </div>
        </div>
        
        {/* Top-right Tambah RFID Button (Opens Modal) */}
        <button
          onClick={() => {
            setError(null);
            setSuccess(false);
            setRfidId("");
            setTableId("");
            setIsModalOpen(true);
          }}
          className="bg-[#4B135F] text-white px-5 py-2.5 rounded-xl hover:bg-[#3a0f49] transition-colors text-sm font-semibold shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah RFID
        </button>
      </div>

      {/* ── Devices Grid List ── */}
      {loadingList ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#4B135F]" />
          <p className="text-sm">Memuat daftar RFID...</p>
        </div>
      ) : devices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center text-neutral-500">
          Belum ada kartu RFID terdaftar. Klik tombol <span className="font-semibold text-[#4B135F]">Tambah RFID</span> di pojok kanan atas untuk mulai mendaftarkan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {devices.map((device) => (
            <div 
              key={device.id} 
              className="bg-white rounded-[24px] border border-neutral-200/85 p-6 shadow-sm space-y-6 hover:shadow-md transition-shadow animate-in fade-in duration-200"
            >
              {/* Card Graphic */}
              <div className="relative w-full aspect-[1.58/1] bg-[#4B135F] rounded-2xl overflow-hidden shadow-md p-6 flex flex-col justify-between text-white select-none">
                {/* Geometric pattern on the right half */}
                <div className="absolute right-0 top-0 h-full w-[48%] opacity-30 pointer-events-none">
                  <svg className="w-full h-full" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                    <line x1="0" y1="0" x2="0" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="40" y1="0" x2="40" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="80" y1="0" x2="80" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="120" y1="0" x2="120" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="160" y1="0" x2="160" y2="200" stroke="white" strokeWidth="1.5" />

                    <line x1="-80" y1="0" x2="120" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="-40" y1="0" x2="160" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="0" y1="0" x2="200" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="40" y1="0" x2="240" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="80" y1="0" x2="280" y2="200" stroke="white" strokeWidth="1.5" />
                    <line x1="120" y1="0" x2="320" y2="200" stroke="white" strokeWidth="1.5" />

                    <line x1="0" y1="200" x2="200" y2="0" stroke="white" strokeWidth="1.5" />
                    <line x1="-40" y1="200" x2="160" y2="0" stroke="white" strokeWidth="1.5" />
                    <line x1="-80" y1="200" x2="120" y2="0" stroke="white" strokeWidth="1.5" />
                    <line x1="40" y1="200" x2="240" y2="0" stroke="white" strokeWidth="1.5" />
                    <line x1="80" y1="200" x2="280" y2="0" stroke="white" strokeWidth="1.5" />
                    <line x1="120" y1="200" x2="320" y2="0" stroke="white" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Logo */}
                <div className="z-10">
                  <img src="/CWClub.png" alt="CW Coffee Logo" className="w-8 h-8 object-contain" />
                </div>

                {/* UID */}
                <div className="z-10 flex flex-col gap-0.5">
                  <span className="text-[8px] uppercase tracking-widest text-white/50 font-bold">RFID UID</span>
                  <span className="font-mono text-xl font-bold tracking-widest uppercase truncate">{device.rfidId}</span>
                </div>

                {/* Table ID */}
                <div className="z-10 font-mono text-xs text-white/90">
                  Table ID {device.tableId}
                </div>
              </div>

              {/* NILAI DEFAULT Box */}
              <div className="bg-neutral-300/90 rounded-none px-4 py-4 space-y-2 text-xs font-mono text-neutral-800 select-none">
                <p className="font-bold text-neutral-900 tracking-wider">NILAI DEFAULT</p>
                <div className="space-y-1">
                  <div className="flex justify-between max-w-[280px]">
                    <span>deviceStatus</span>
                    <span>&#39;{device.deviceStatus || "active"}&#39;</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>isOccupied</span>
                    <span>{device.isOccupied ? "true" : "false"}</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>status</span>
                    <span>&#39;{device.status || "available"}&#39;</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>uid</span>
                    <span>&#39;{device.uid || ""}&#39;</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pop-up Form Modal (Opens when isModalOpen is true) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          {/* Modal Card Box */}
          <div className="bg-white rounded-[24px] border border-neutral-200/85 p-8 shadow-2xl max-w-md w-full space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button X */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Mendaftarkan RFID</h2>
              <p className="text-neutral-500 text-xs mt-0.5">Silakan isi detail kartu baru di bawah</p>
            </div>

            {/* RFID Card Preview Container (Contains Integrated Inputs) */}
            <div className="relative w-full aspect-[1.58/1] bg-[#4B135F] rounded-2xl overflow-hidden shadow-lg p-6 flex flex-col justify-between text-white select-none">
              {/* Geometric pattern on the right half */}
              <div className="absolute right-0 top-0 h-full w-[48%] opacity-30 pointer-events-none">
                <svg className="w-full h-full" viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="0" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="40" y1="0" x2="40" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="80" y1="0" x2="80" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="120" y1="0" x2="120" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="160" y1="0" x2="160" y2="200" stroke="white" strokeWidth="1.5" />

                  <line x1="-80" y1="0" x2="120" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="-40" y1="0" x2="160" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="0" y1="0" x2="200" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="40" y1="0" x2="240" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="80" y1="0" x2="280" y2="200" stroke="white" strokeWidth="1.5" />
                  <line x1="120" y1="0" x2="320" y2="200" stroke="white" strokeWidth="1.5" />

                  <line x1="0" y1="200" x2="200" y2="0" stroke="white" strokeWidth="1.5" />
                  <line x1="-40" y1="200" x2="160" y2="0" stroke="white" strokeWidth="1.5" />
                  <line x1="-80" y1="200" x2="120" y2="0" stroke="white" strokeWidth="1.5" />
                  <line x1="40" y1="200" x2="240" y2="0" stroke="white" strokeWidth="1.5" />
                  <line x1="80" y1="200" x2="280" y2="0" stroke="white" strokeWidth="1.5" />
                  <line x1="120" y1="200" x2="320" y2="0" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Top block: Logo */}
              <div className="z-10 flex items-center justify-between">
                <img src="/CWClub.png" alt="CW Coffee Logo" className="w-8 h-8 object-contain" />
              </div>

              {/* Middle block: RFID UID Input */}
              <div className="z-10 flex flex-col gap-1">
                <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">RFID UID</span>
                <input
                  type="text"
                  value={rfidId}
                  onChange={(e) => setRfidId(e.target.value.toUpperCase())}
                  placeholder="5A:5F:B3:01"
                  maxLength={11}
                  className="bg-transparent border-b border-white/20 focus:border-white w-full text-white outline-none font-mono text-2xl font-bold py-0.5 uppercase tracking-widest transition-colors placeholder:text-white/20 select-text"
                  aria-label="RFID UID Input"
                />
              </div>

              {/* Bottom block: Table ID Input */}
              <div className="z-10 flex items-center gap-1.5 font-mono text-xs text-white/90">
                <span className="select-none">Table ID</span>
                <input
                  type="text"
                  value={tableId}
                  onChange={(e) => setTableId(e.target.value)}
                  placeholder="12"
                  className="bg-transparent border-b border-white/20 focus:border-white w-16 text-white outline-none font-mono text-xs px-1 py-0.5 transition-colors select-text"
                  aria-label="Table ID Input"
                />
              </div>
            </div>

            {/* Nilai Default and Feedback Messages */}
            <div className="space-y-4">
              {/* Default Values Box */}
              <div className="bg-neutral-300/90 rounded-none px-4 py-4 space-y-2 text-xs font-mono text-neutral-800 select-none">
                <p className="font-bold text-neutral-900 tracking-wider">NILAI DEFAULT</p>
                <div className="space-y-1">
                  <div className="flex justify-between max-w-[280px]">
                    <span>deviceStatus</span>
                    <span>&#39;active&#39;</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>isOccupied</span>
                    <span>false</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>status</span>
                    <span>&#39;available&#39;</span>
                  </div>
                  <div className="flex justify-between max-w-[280px]">
                    <span>uid</span>
                    <span>&#39;&#39;</span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 animate-in fade-in duration-200">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-sm text-green-700 font-medium">RFID berhasil ditambahkan! Mengalihkan...</p>
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={loading}
                className="flex-1 py-3 text-sm border border-neutral-300 rounded-xl text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || success}
                className="flex-1 py-3 text-sm bg-[#4B135F] text-white rounded-xl hover:bg-[#3a0f49] transition-colors font-semibold disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Tersimpan
                  </>
                ) : (
                  "Simpan RFID"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
