'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X, AlertCircle, Clock3 } from 'lucide-react';
import TablePicker from '@/components/booking/TablePicker';
import type { BookingFormValues } from '@/types/booking';
import type { TableState } from '@/types';

interface BookingFormProps {
    onSubmit: (values: BookingFormValues) => void | Promise<void>;
}

const BRANCH_OPTIONS = [
    'CW Coffee',
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, '0')
);

const MINUTE_OPTIONS = ['00', '15', '30', '45'];

const initialForm: BookingFormValues = {
    branch: '',
    room: '',
    tableId: null,
    tableName: '',
    date: '',
    time: '',
    note: '',
    paymentProof: null,
};

export default function BookingForm({ onSubmit }: BookingFormProps) {
    const [form, setForm] = useState<BookingFormValues>(initialForm);
    const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('');
    const [selectedMinute, setSelectedMinute] = useState('');
    // Payment proof file + preview URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const timePickerRef = useRef<HTMLDivElement>(null);

    // Minimum date = today in YYYY-MM-DD (local time)
    const todayStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!timePickerRef.current?.contains(event.target as Node)) {
                setIsTimePickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);
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

        if (!form.branch || !form.tableId || !form.date || !form.time) {
            alert('Mohon lengkapi data booking terlebih dahulu (cabang, meja, tanggal, dan waktu).');
            return;
        }

        if (!form.paymentProof) {
            alert('Mohon upload bukti pembayaran DP terlebih dahulu.');
            return;
        }

        onSubmit(form);
        setForm(initialForm);
        setSelectedHour('');
        setSelectedMinute('');
        setIsTimePickerOpen(false);
        handleRemoveFile();
    };

    const handleHourSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextHour = e.target.value;
        setSelectedHour(nextHour);

        setForm((prev) => ({
            ...prev,
            time: nextHour && selectedMinute ? `${nextHour}:${selectedMinute}` : '',
        }));
    };

    const handleMinuteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextMinute = e.target.value;
        setSelectedMinute(nextMinute);

        if (selectedHour && nextMinute) {
            setForm((prev) => ({ ...prev, time: `${selectedHour}:${nextMinute}` }));
            setIsTimePickerOpen(false);
            return;
        }

        setForm((prev) => ({ ...prev, time: '' }));
    };

    const handleClearTime = () => {
        setSelectedHour('');
        setSelectedMinute('');
        setForm((prev) => ({ ...prev, time: '' }));
        setIsTimePickerOpen(false);
    };

    const handleToggleTimePicker = () => {
        if (!isTimePickerOpen) {
            const [hour = '', minute = ''] = form.time.split(':');
            setSelectedHour(hour);
            setSelectedMinute(minute);
        }

        setIsTimePickerOpen((prev) => !prev);
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
                        Pilih Cafe
                    </label>
                    <select
                        name="branch"
                        value={form.branch}
                        onChange={handleChange}
                        className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                            form.branch === '' ? 'text-neutral-400' : 'text-neutral-900'
                        }`}
                    >
                        <option value="" disabled hidden>Pilih cafe</option>
                        {BRANCH_OPTIONS.map((branch) => (
                            <option key={branch} value={branch} className="text-neutral-900">
                                {branch}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pilih Meja */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-neutral-700">
                            Pilih Sofa
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
                    <div ref={timePickerRef} className="relative">
                        <button
                            type="button"
                            onClick={handleToggleTimePicker}
                            className={`flex w-full items-center rounded-xl border border-neutral-300 bg-white px-3 py-2 text-left text-sm outline-none transition ${
                                form.time === '' ? 'text-neutral-400' : 'text-neutral-900'
                            } ${isTimePickerOpen ? 'border-amber-400 ring-2 ring-amber-100' : ''}`}
                            aria-haspopup="dialog"
                            aria-expanded={isTimePickerOpen}
                            aria-label="Pilih waktu reservasi"
                        >
                            <span>{form.time || 'HH:mm'}</span>
                            <Clock3 className="ml-auto h-4 w-4 shrink-0 text-neutral-400" />
                        </button>

                        {isTimePickerOpen && (
                            <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                            Jam
                                        </label>
                                        <select
                                            value={selectedHour}
                                            onChange={handleHourSelect}
                                            className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                                                selectedHour === '' ? 'text-neutral-400' : 'text-neutral-900'
                                            }`}
                                        >
                                            <option value="" disabled>Pilih jam</option>
                                            {HOUR_OPTIONS.map((hour) => (
                                                <option key={hour} value={hour}>
                                                    {hour}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                            Menit
                                        </label>
                                        <select
                                            value={selectedMinute}
                                            onChange={handleMinuteSelect}
                                            className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                                                selectedMinute === '' ? 'text-neutral-400' : 'text-neutral-900'
                                            }`}
                                        >
                                            <option value="" disabled>Pilih menit</option>
                                            {MINUTE_OPTIONS.map((minute) => (
                                                <option key={minute} value={minute}>
                                                    {minute}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between">
                                    <p className="text-xs text-neutral-500">
                                        Format 24 jam, tanpa AM/PM.
                                    </p>
                                    {form.time && (
                                        <button
                                            type="button"
                                            onClick={handleClearTime}
                                            className="text-xs font-medium text-amber-700 transition hover:text-amber-800"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
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
