"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Mail, MessageCircle, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const router = useRouter();
  const { t } = useLanguage();
  const h = t.help;

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900">{h.title}</h1>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-white shadow-sm border border-neutral-200 overflow-hidden">
        <p className="px-4 pt-3 pb-2 text-[11px] font-semibold tracking-widest uppercase text-neutral-400">{h.faqLabel}</p>

        {h.faqs.map((faq, index) => (
          <div key={index} className="border-t border-neutral-100">
            <button onClick={() => toggle(index)} className="w-full flex justify-between items-center px-4 py-3 text-left gap-3">
              <span className="text-sm font-medium text-neutral-800 leading-snug">{faq.question}</span>
              {openIndex === index ? <ChevronUp className="h-4 w-4 text-neutral-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />}
            </button>

            {openIndex === index && <p className="px-4 pb-3 text-sm text-neutral-500 leading-relaxed">{faq.answer}</p>}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="rounded-2xl bg-white shadow-sm border border-neutral-200 p-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-neutral-800">{h.contactTitle}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{h.contactSub}</p>
        </div>

        <div className="space-y-2">
          {/* Email */}
          <a href="mailto:support@cwcoffee.com" className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 shrink-0">
              <Mail className="h-4 w-4 text-green-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800">{h.emailLabel}</span>
              <span className="text-xs text-neutral-400">support@cwcoffee.com</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-neutral-300 ml-auto" />
          </a>

          {/* WhatsApp */}
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 shrink-0">
              <MessageCircle className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-800">{h.waLabel}</span>
              <span className="text-xs text-neutral-400">+62 812-3456-789</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
