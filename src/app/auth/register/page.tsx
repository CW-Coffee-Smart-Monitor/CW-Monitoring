"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, Lock, UserPlus } from "lucide-react";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email    = (formData.get("email")    as string).trim();
    const fullname = (formData.get("fullname") as string).trim();
    const phone    = (formData.get("phone")    as string).trim();
    const password =  formData.get("password") as string;

    // --- Validasi sisi klien ---
    if (!fullname) {
      setError("Nama lengkap tidak boleh kosong.");
      setIsLoading(false);
      return;
    }
    if (!email) {
      setError("Email tidak boleh kosong.");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Buat akun di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Simpan data tambahan ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullname,
        email,
        phone: phone || null,
        createdAt: new Date().toISOString(),
        role: "user",
      });

      setSuccess("Akun berhasil dibuat! Mengarahkan ke halaman login...");
      form.reset();

      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);

    } catch (err: unknown) {
      // Log lengkap untuk debugging
      console.error("Register error:", err);

      const firebaseError = err as { code?: string; message?: string };
      console.error("Error code:", firebaseError.code);
      console.error("Error message:", firebaseError.message);

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("Email sudah terdaftar. Silakan gunakan email lain atau masuk.");
          break;
        case "auth/weak-password":
          setError("Password terlalu lemah. Gunakan minimal 6 karakter.");
          break;
        case "auth/invalid-email":
          setError("Format email tidak valid.");
          break;
        case "auth/network-request-failed":
          setError("Koneksi gagal. Periksa koneksi internet kamu.");
          break;
        case "auth/too-many-requests":
          setError("Terlalu banyak percobaan. Coba lagi beberapa saat.");
          break;
        case "auth/operation-not-allowed":
          setError("Metode Email/Password belum diaktifkan di Firebase Console.");
          break;
        default:
          setError(
            `Terjadi kesalahan (${firebaseError.code ?? "unknown"}). Coba lagi.`
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex justify-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
            ☕
          </div>
        </div>

        {/* Judul */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Bergabung <br /> dengan Kami!
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Dapatkan rekomendasi kursi cerdas dan nikmati kopi favoritmu tanpa antre.
          </p>
        </div>

        {/* Pesan error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-3">
            <span className="text-red-500 mt-0.5">⚠</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Pesan sukses */}
        {success && (
          <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 p-3">
            <span className="text-green-500 mt-0.5">✓</span>
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200 focus-within:border-neutral-400 transition">
            <User className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              type="text"
              name="fullname"
              placeholder="Nama Lengkap"
              required
              disabled={isLoading}
              className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200 focus-within:border-neutral-400 transition">
            <Mail className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={isLoading}
              className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200 focus-within:border-neutral-400 transition">
            <Phone className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              type="tel"
              name="phone"
              placeholder="Nomor HP (opsional)"
              disabled={isLoading}
              className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200 focus-within:border-neutral-400 transition">
            <Lock className="h-5 w-5 text-neutral-400 shrink-0" />
            <input
              type="password"
              name="password"
              placeholder="Kata Sandi (min. 6 karakter)"
              required
              disabled={isLoading}
              className="w-full bg-transparent text-sm outline-none disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Memproses...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" strokeWidth={2.5} />
                Daftar Akun
              </>
            )}
          </button>

          <p className="text-center text-sm text-neutral-500">
            Sudah memiliki akun?{" "}
            <Link href="/auth/login" className="font-medium text-neutral-900 hover:underline">
              Masuk
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
