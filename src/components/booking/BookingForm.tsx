'use client';

import { useMemo, useState } from 'react';
import { INITIAL_TABLES } from '@/data/tables';
import type { BookingFormValues } from '@/types/booking';

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
    chairsNeeded: 1,
    date: '',
    time: '',
    note: '',
};

export default function BookingForm({ onSubmit }: BookingFormProps) {
    const [form, setForm] = useState<BookingFormValues>(initialForm);
    // Separate raw string state for the chairs input to allow free typing
    const [chairsInput, setChairsInput] = useState('1');
    // Separate hour/minute selects to avoid browser manual-typing quirks on type="time"
    const [hourInput, setHourInput] = useState('');
    const [minuteInput, setMinuteInput] = useState('');

    // Minimum date = today in YYYY-MM-DD (local time)
    const todayStr = new Date().toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format

    const roomOptions = useMemo(() => {
        const uniqueZones = [...new Set(INITIAL_TABLES.map((table) => table.zone))];
        return uniqueZones;
    }, []);

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.branch || !form.room || !form.date || !form.time || form.chairsNeeded < 1) {
            alert('Mohon lengkapi data booking terlebih dahulu.');
            return;
        }

        onSubmit(form);
        setForm(initialForm);
        setChairsInput('1');
        setHourInput('');
        setMinuteInput('');
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

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Ruangan
                    </label>
                    <select
                        name="room"
                        value={form.room}
                        onChange={handleChange}
                        className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
                            form.room === '' ? 'text-neutral-400' : 'text-neutral-900'
                        }`}
                    >
                        <option value="" disabled hidden>Pilih ruangan</option>
                        {roomOptions.map((room) => (
                            <option key={room} value={room} className="text-neutral-900">
                                {room}
                            </option>
                        ))}
                    </select>
                </div>

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

                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                        Catatan
                    </label>
                    <textarea
                        name="note"
                        value={form.note}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Contoh: dekat colokan, area tenang, untuk 4 orang"
                        className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-900"
                >
                    Simpan Booking
                </button>
            </form>
        </div>
    );
}