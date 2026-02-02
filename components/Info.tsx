"use client";

import { motion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";

export default function Info() {
  return (
    <section id="info" className="py-24 px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-shippori text-3xl font-bold mb-3">営業案内</h2>
          <span className="block text-xs font-sans text-accent tracking-[0.3em]">INFORMATION</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-[#fcfaf2] p-8 md:p-12 rounded-sm border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
        >
          <div className="space-y-8">
            {/* Hours */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-gray-200/60 pb-8">
              <div className="flex items-center gap-3 w-40 font-bold text-accent mb-3 md:mb-0">
                <Clock size={20} />
                <span className="tracking-widest">営業時間</span>
              </div>
              <div className="flex-1">
                <p className="text-2xl font-serif mb-2">10:00 〜 19:00（土日祝）</p>
                <p className="text-2xl font-serif mb-2">13:00 〜 19:00（平日）</p>
                <p className="text-sm text-gray-500">※不定休あり。</p>
              </div>
            </div>

            {/* Notice */}
            <div className="flex flex-col md:flex-row md:items-start border-b border-gray-200/60 pb-8">
              <div className="flex items-center gap-3 w-40 font-bold text-accent mb-3 md:mb-0">
                <AlertCircle size={20} />
                <span className="tracking-widest">お知らせ</span>
              </div>
              <div className="flex-1">
                <p className="mb-2 font-medium">予約制となっております。</p>
                <p className="text-gray-600">ご来場の際は事前にお電話にてご連絡ください。</p>
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col md:flex-row md:items-start">
              <div className="flex items-center gap-3 w-40 font-bold text-accent mb-3 md:mb-0">
                <AlertCircle size={20} />
                <span className="tracking-widest">注意事項</span>
              </div>
              <div className="flex-1 text-sm text-gray-600 space-y-3">
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  14歳以下のお子様のご利用は安全上の理由からご遠慮いただいております。
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  飲酒されている方のご利用はお断りいたします。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
