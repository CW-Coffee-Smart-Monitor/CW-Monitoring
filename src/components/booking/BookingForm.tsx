'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import TablePicker from '@/components/booking/TablePicker';
import type { BookingFormValues } from '@/types/booking';
import type { TableState } from '@/types';

interface BookingFormProps {
    onSubmit: (values: BookingFormValues) => void;
}

const BRANCH_OPTIONS = [
    'CW Coffee Pusat',
    'CW Coffee Barat',
    'CW Coffee Timur',
];

/** Cafe buka 24 jam, menit setiap 30 menit */
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
);
const MINUTE_OPTIONS = ['00', '30'];

const initialForm: BookingFormValues = {
    branch: '',
    room: '',
    tableId: null,
    tableName: '',
    chairsNeeded: 1,
    date: '',
    time: '',
    note: '',
    paymentProof: null,
};

export default function BookingForm({ onSubmit }: BookingFormProps) {
    const [form, setForm] = useState<BookingFormValues>(initialForm);
    // Separate raw string state for the chairs input to allow free typing
    const [chairsInput, setChairsInput] = useState('1');
    // Separate hour/minute selects to avoid browser manual-typing quirks on type="time"
    const [hourInput, setHourInput] = useState('');
    const [minuteInput, setMinuteInput] = useState('');
    // Payment proof file + preview URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Minimum date = today in YYYY-MM-DD (local time)
    const todayStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    /** Allow free typing; only update form.chairsNeeded when value is a valid number >= 1 */
    const handleChairsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setChairsInput(raw);
        const parsed = parseInt(raw, 10);
        if (!isNaN(parsed) && parsed >= 1) {
            setForm((prev) => ({ ...prev, chairsNeeded: parsed }));
        }
    };

    /** On blur: if empty or invalid, snap back to minimum 1 */
    const handleChairsBlur = () => {
        const parsed = parseInt(chairsInput, 10);
        const clamped = isNaN(parsed) || parsed < 1 ? 1 : parsed;
        setChairsInput(String(clamped));
        setForm((prev) => ({ ...prev, chairsNeeded: clamped }));
    };

    const handleTableSelect = (table: TableState) => {
        setForm((prev) => ({
            ...prev,
            tableId: table.id,
            tableName: table.name,
            room: table.zone,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        // Revoke previous object URL to avoid memory leak
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(file));
        setForm((prev) => ({ ...prev, paymentProof: file }));
    };

    const handleRemoveFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
        setForm((prev) => ({ ...prev, paymentProof: null }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.branch || !form.tableId || !form.date || !form.time || form.chairsNeeded < 1) {
            alert('Mohon lengkapi data booking terlebih dahulu (cabang, meja, tanggal, dan waktu).');
            return;
        }

        if (!form.paymentProof) {
            alert('Mohon upload bukti pembayaran DP terlebih dahulu.');
            return;
        }

        onSubmit(form);
        setForm(initialForm);
        setChairsInput('1');
        setHourInput('');
        setMinuteInput('');
        handleRemoveFile();
    };

    /** Sync jam + menit ke form.time sebagai "HH:MM" */
    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const h = e.target.value;
        setHourInput(h);
        const m = minuteInput || '00';
        setForm((prev) => ({ ...prev, time: h ? `${h}:${m}` : '' }));
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const m = e.target.value;
        setMinuteInput(m);
        if (hourInput) {
            setForm((prev) => ({ ...prev, time: `${hourInput}:${m}` }));
        }
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">Form Reservasi</h2>
            <p className="mt-1 text-sm text-neutral-500">
                Isi data booking meja untuk pelanggan.
            </p>

            {/* Banner info DP */}
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <div>
                    <p className="text-sm font-semibold text-amber-800">DP Reservasi Rp 50.000</p>
                    <p className="mt-0.5 text-xs text-amber-700">
                        Lakukan pembayaran DP sebesar <strong>Rp 50.000</strong> ke rekening berikut, lalu upload bukti transfer di bawah.
                    </p>
                    <div className="mt-2 rounded-lg bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm ring-1 ring-amber-200">
                        <span className="font-medium">BCA</span> · <span className="font-mono tracking-wide">1234-5678-90</span>
                        <br />
                        a.n. <span className="font-medium">CW Coffee</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                {/* Pilih Cabang */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Pilih Cabang
                    </label>
                    <select
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                            form.branch === '' ? 'text-neutral-400' : 'text-neutral-900'
                        }`}
                    >
                        <option value="" disabled hidden>Pilih cabang</option>
                        {BRANCH_OPTIONS.map((branch) => (
                            <option key={branch} value={branch} className="text-neutral-900">
                                {branch}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pilih Meja — Gojek style */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-neutral-700">
                            Pilih Meja
                        </label>
                        {form.tableId && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                Terpilih ✓
                            </span>
                        )}
                    </div>
                    <TablePicker
                        selectedId={form.tableId}
                        selectedName={form.tableName}
                        onChange={handleTableSelect}
                    />
                </div>

                {/* Jumlah Kursi */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Jumlah Kursi yang Diperlukan
                    </label>
                    <input
                        type="number"
                        inputMode="numeric"
                        name="chairsNeeded"
                        value={chairsInput}
                        onChange={handleChairsChange}
                        onBlur={handleChairsBlur}
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
                    />
                </div>

                {/* Tanggal */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Tanggal
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={form.date}
                        min={todayStr}
                        onChange={handleChange}
                        className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                            form.date === '' ? 'text-neutral-400' : 'text-neutral-900'
                        }`}
                    />
                </div>

                {/* Waktu */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Waktu
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={hourInput}
                            onChange={handleHourChange}
                            className={`w-1/2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                                hourInput === '' ? 'text-neutral-400' : 'text-neutral-900'
                            }`}
                        >
                            <option value="" disabled hidden>HH</option>
                            {HOUR_OPTIONS.map((h) => (
                                <option key={h} value={h} className="text-neutral-900">{h}</option>
                            ))}
                        </select>
                        <select
                            value={minuteInput}
                            onChange={handleMinuteChange}
                            className={`w-1/2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                                minuteInput === '' ? 'text-neutral-400' : 'text-neutral-900'
                            }`}
                        >
                            <option value="" disabled hidden>MM</option>
                            {MINUTE_OPTIONS.map((m) => (
                                <option key={m} value={m} className="text-neutral-900">{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Catatan */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Catatan
                    </label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Contoh: dekat colokan, area tenang, untuk 4 orang"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
                    />
                </div>

                {/* Upload Bukti Pembayaran DP */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Bukti Pembayaran DP <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-xs text-neutral-500">
                        Upload screenshot/foto bukti transfer DP Rp 50.000.
                    </p>

                    {/* Drop zone / upload area */}
                    {!previewUrl ? (
                        <label
                            htmlFor="paymentProof"
                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 py-6 text-center transition hover:border-amber-400 hover:bg-amber-50"
                        >
                            <Upload className="h-6 w-6 text-neutral-400" />
                            <span className="text-sm font-medium text-neutral-600">Pilih file gambar</span>
                            <span className="text-xs text-neutral-400">JPG, PNG, WEBP · Maks. 5 MB</span>
                            <input
                                ref={fileInputRef}
                                id="paymentProof"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleFileChange}
                            />
                        </label>
                    ) : (
                        <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Preview bukti pembayaran"
                                className="max-h-56 w-full object-contain"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900/70 text-white backdrop-blur-sm transition hover:bg-red-600"
                                aria-label="Hapus gambar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <p className="truncate px-3 py-2 text-xs text-neutral-500">
                                {form.paymentProof?.name}
                            </p>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-amber-300 active:scale-95"
                >
                    Simpan Booking
                </button>
            </form>
        </div>
    );
}