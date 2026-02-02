"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ExpandableDetailProps } from "@/types/beginners";

export default function ExpandableDetail({ summary, children, id }: ExpandableDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // URLハッシュと一致する場合は自動的に開く
  useEffect(() => {
    if (id && window.location.hash === `#${id}`) {
      // URLハッシュによる初期状態の設定
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHighlighted(true);

      // 展開後にコンテンツ領域にフォーカス（スクリーンリーダー用）
      setTimeout(() => {
        contentRef.current?.focus();
      }, 350);

      // ハイライトを2秒後に解除
      setTimeout(() => {
        setIsHighlighted(false);
      }, 2000);
    }
  }, [id]);

  return (
    <div
      id={id}
      className={`border rounded-sm overflow-hidden bg-white mb-[10px] transition-all duration-300 ${
        isHighlighted ? "border-accent shadow-lg ring-2 ring-accent/20" : "border-gray-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-[15px] text-left transition-colors ${
          isOpen ? "border-b border-gray-100 bg-[#fcfcfc]" : "hover:bg-gray-50"
        }`}
        aria-expanded={isOpen}
        aria-controls={id ? `content-${id}` : undefined}
        id={id ? `button-${id}` : undefined}
      >
        <span className="font-medium text-gray-800 flex-1">{summary}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent flex-shrink-0 ml-4"
          aria-hidden="true"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            id={id ? `content-${id}` : undefined}
            role="region"
            aria-labelledby={id ? `button-${id}` : undefined}
          >
            <div
              ref={contentRef}
              tabIndex={-1}
              className="p-5 text-gray-700 leading-relaxed text-[0.95rem] focus:outline-none"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
