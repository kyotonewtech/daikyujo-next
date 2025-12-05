"use client";

import { motion } from "framer-motion";
import { AlertCircle, Info } from "lucide-react";
import type { NoticeBoxProps } from "@/types/beginners";

export default function NoticeBox({
  variant,
  title,
  children,
}: NoticeBoxProps) {
  const isInfo = variant === "info";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`rounded-sm border p-6 md:p-8 ${
        isInfo
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${isInfo ? "text-green-600" : "text-red-600"}`}>
          {isInfo ? <Info size={24} /> : <AlertCircle size={24} />}
        </div>
        <div className="flex-1">
          {title && (
            <h3
              className={`font-bold text-lg mb-3 ${
                isInfo ? "text-green-900" : "text-red-900"
              }`}
            >
              {title}
            </h3>
          )}
          <div
            className={`text-base leading-relaxed ${
              isInfo ? "text-green-800" : "text-red-800"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
