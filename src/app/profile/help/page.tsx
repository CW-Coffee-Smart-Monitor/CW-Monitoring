"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
};

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const router = useRouter();

  const faqs: FAQItem[] = [
    {
      question: "Bagaimana cara melakukan reservasi?",
      answer: 'Masuk ke menu Booking, pilih meja di peta, lalu klik tombol "Pesan Sekarang".',
    },
    {
      question: "Apa itu RFID dan bagaimana cara menggunakannya?",
      answer: "RFID digunakan untuk check-in di meja. Tempelkan kartu RFID kamu ke sensor yang tersedia.",
    },
    {
      question: "Apakah saya bisa membatalkan reservasi?",
      answer: "Ya, kamu bisa membatalkan reservasi sebelum waktu check-in melalui menu Booking.",
    },
    {
      question: "Kenapa saya tidak bisa memilih meja?",
      answer: "Kemungkinan meja sedang penuh atau dalam status cleaning. Coba pilih meja lain.",
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={5} />
        </button>

        <h1 className="text-lg font-semibold text-neutral-900">Pusat Bantuan</h1>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-neutral-200">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b last:border-none">
            <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex justify-between items-center py-3 text-left">
              <span className="text-sm font-medium text-neutral-800">{faq.question}</span>

              {openIndex === index ? <ChevronUp className="h-4 w-4 text-neutral-400" /> : <ChevronDown className="h-4 w-4 text-neutral-400" />}
            </button>

            {openIndex === index && <p className="pb-3 text-sm text-neutral-600">{faq.answer}</p>}
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">Butuh bantuan lebih lanjut?</h2>

        <p className="text-sm text-neutral-600">Hubungi tim kami melalui:</p>

        <div className="space-y-2">
          <a href="mailto:support@cwcoffee.com" className="flex items-center gap-2 text-sm text-amber-500 font-medium">
            <Mail className="h-4 w-4" />
            support@cwcoffee.com
          </a>

          <a href="https://wa.me/628123456789" target="_blank" className="flex items-center gap-2 text-sm text-green-500 font-medium">
            <MessageCircle className="h-4 w-4" />
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}
