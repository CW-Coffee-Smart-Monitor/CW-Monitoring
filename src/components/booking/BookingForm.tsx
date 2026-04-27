'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import TablePicker from '@/components/booking/TablePicker';
import type { BookingFormValues } from '@/types/booking';
import { getTableBlockOptions } from '@/data/tables';
import { getBlockAvailabilityForDateTime } from '@/lib/firestoreService';

interface BookingFormProps {
  onSubmit: (values: BookingFormValues) => void | Promise<void>;
  readonly initialBlockCode?: string;
}

const BLOCK_OPTIONS = getTableBlockOptions();

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);

const initialForm: BookingFormValues = {
  branch: 'CW Coffee',
  blockCode: '',
  date: '',
  time: '',
  note: '',
  paymentProof: null,
};

export default function BookingForm({ onSubmit, initialBlockCode }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormValues>(() => ({
    ...initialForm,
    blockCode: initialBlockCode ?? '',
  }));
  const [selectedHour, setSelectedHour] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availabilityByBlock, setAvailabilityByBlock] = useState<Record<string, boolean>>({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toLocaleDateString('en-CA');

  const selectedBlock = BLOCK_OPTIONS.find(
    (block) => block.code === form.blockCode
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === 'date' || name === 'time') {
        next.blockCode = '';
      }

      return next;
    });
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadAvailability() {
      if (!form.date || !form.time) {
        setAvailabilityByBlock({});
        setIsLoadingAvailability(false);
        return;
      }

      setIsLoadingAvailability(true);

      try {
        const result = await getBlockAvailabilityForDateTime({
          date: form.date,
          arrivalTime: form.time,
          durationMinutes: 30,
          blocks: BLOCK_OPTIONS.map((block) => ({
            code: block.code,
            coveredTableIds: block.tableIds,
          })),
        });

        if (!isCancelled) {
          setAvailabilityByBlock(result);
        }
      } catch (error) {
        console.error('LOAD BLOCK AVAILABILITY ERROR:', error);
        if (!isCancelled) {
          setAvailabilityByBlock({});
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingAvailability(false);
        }
      }
    }

    loadAvailability();

    return () => {
      isCancelled = true;
    };
  }, [form.date, form.time]);

  const handleBlockSelect = (blockCode: string) => {
    setForm((prev) => ({
      ...prev,
      blockCode,
    }));
  };

  const handleHourSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextHour = e.target.value;
    setSelectedHour(nextHour);

    setForm((prev) => ({
      ...prev,
      blockCode: '',
      time: nextHour ? `${nextHour}:00` : '',
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
    setFormError('');

    if (!form.date || !form.time || !form.blockCode) {
      setFormError('Mohon lengkapi tanggal, waktu, dan blok reservasi terlebih dahulu.');
      return;
    }

    if (!form.paymentProof) {
      setFormError('Mohon upload bukti pembayaran DP terlebih dahulu.');
      return;
    }

    if (availabilityByBlock[form.blockCode] === false) {
      setFormError('Blok yang dipilih sudah dibooking pada tanggal dan waktu tersebut.');
      return;
    }

    onSubmit(form);
    setForm(initialForm);
    setSelectedHour('');
    setAvailabilityByBlock({});
    setFormError('');
    handleRemoveFile();
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
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
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Cafe
          </label>
          <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800">
            CW Coffee
          </div>
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
          <select
            value={selectedHour}
            onChange={handleHourSelect}
            className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none ${
              selectedHour === '' ? 'text-neutral-400' : 'text-neutral-900'
            }`}
          >
            <option value="" disabled>
              Pilih jam
            </option>
            {HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={hour}>
                {hour}:00
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-neutral-500">
            Pilihan waktu tersedia per jam.
          </p>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-700">
              Pilih Blok Sofa
            </label>
            {form.blockCode && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Terpilih ✓
              </span>
            )}
          </div>

          <TablePicker
            selectedCode={form.blockCode}
            selectedDate={form.date}
            selectedTime={form.time}
            availabilityByBlock={availabilityByBlock}
            isLoadingAvailability={isLoadingAvailability}
            onChange={handleBlockSelect}
          />

          {!form.date || !form.time ? (
            <p className="mt-2 text-xs text-neutral-500">
              Isi tanggal dan waktu terlebih dahulu sebelum memilih blok.
            </p>
          ) : isLoadingAvailability ? (
            <p className="mt-2 text-xs text-neutral-500">
              Sedang memeriksa ketersediaan blok...
            </p>
          ) : (
            <p className="mt-2 text-xs text-neutral-500">
              Blok yang berstatus “Sudah dibooking” tidak bisa dipilih.
            </p>
          )}

          {selectedBlock && (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Cakupan reservasi
              </p>
              <p className="mt-1 text-sm text-neutral-700">
                {selectedBlock.label} akan mencakup:
              </p>
              <p className="mt-1 text-sm font-medium text-neutral-900">
                {selectedBlock.tableNames.join(', ')}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Catatan
          </label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            rows={3}
            placeholder="Contoh: reservasi untuk komunitas, butuh area yang tenang"
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none"
          />
          <p className="mt-2 text-xs text-neutral-500">
            Jika membutuhkan reservasi lebih dari 1 jam, mohon tuliskan di kolom catatan.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">
            Bukti Pembayaran DP <span className="text-red-500">*</span>
          </label>
          <p className="mb-2 text-xs text-neutral-500">
            Upload screenshot/foto bukti transfer DP Rp 50.000.
          </p>

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

        {formError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        )}

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