"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Radio, Hash, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase"; // sesuaikan path firebase kamu
import { collection, addDoc } from "firebase/firestore";

export default function TambahRfidPage() {
  const router = useRouter();

  const [rfidId, setRfidId] = useState("");
  const [tableId, setTableId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      setError("Format UID tidak valid. Gunakan format XX:XX:XX:XX (contoh: 5A:5F:B5:02).");
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

      // Kembali ke halaman RFID setelah 1.5 detik
      setTimeout(() => {
        router.push("/admin/rfid");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Tambah RFID</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Daftarkan kartu RFID baru ke sistem</p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Top accent */}
        <div className="h-1 bg-[#4B135F]" />

        <div className="p-6 space-y-5">
          {/* RFID UID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#4B135F]" />
              RFID UID
            </label>
            <input
              type="text"
              value={rfidId}
              onChange={(e) => setRfidId(e.target.value.toUpperCase())}
              placeholder="5A:5F:B5:02"
              maxLength={11}
              className="w-full px-3 py-2.5 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent tracking-widest placeholder:tracking-normal placeholder:font-sans"
            />
            <p className="text-xs text-neutral-400">Format: XX:XX:XX:XX — tap kartu pada reader untuk mendapatkan UID</p>
          </div>

          {/* Table ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#4B135F]" />
              Table ID
            </label>
            <input
              type="number"
              value={tableId}
              onChange={(e) => setTableId(e.target.value)}
              placeholder="12"
              min={1}
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <p className="text-xs text-neutral-400">Nomor meja yang akan dipasangkan dengan kartu ini</p>
          </div>

          {/* Default values info */}
          <div className="bg-neutral-50 border border-neutral-100 rounded-lg px-4 py-3 space-y-1.5">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Nilai Default</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span>deviceStatus</span>
              <span className="font-mono text-neutral-700">&quot;active&quot;</span>
              <span>isOccupied</span>
              <span className="font-mono text-neutral-700">false</span>
              <span>status</span>
              <span className="font-mono text-neutral-700">&quot;available&quot;</span>
              <span>uid</span>
              <span className="font-mono text-neutral-700">&quot;&quot;</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-sm text-green-700 font-medium">RFID berhasil ditambahkan! Mengalihkan...</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button onClick={() => router.back()} disabled={loading} className="flex-1 py-2.5 text-sm border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50">
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="flex-1 py-2.5 text-sm bg-[#4B135F] text-white rounded-lg hover:bg-[#3a0f49] transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
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
    </div>
  );
}
