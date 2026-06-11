"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

/** エラーメッセージ表示用の軽量トースト */
export default function Toast({ message, onClose }: ToastProps) {
  // 5秒で自動消滅
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-lg bg-gray-900 px-5 py-3 text-white shadow-lg"
        >
          <span className="text-sm font-medium">{message}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="ml-2 flex-shrink-0 rounded p-0.5 text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
