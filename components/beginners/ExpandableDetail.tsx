"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ExpandableDetailProps } from "@/types/beginners";

export default function ExpandableDetail({
  summary,
  children,
  id,
}: ExpandableDetailProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div id={id} className="border border-gray-200 rounded-sm overflow-hidden bg-white mb-[10px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-[15px] text-left transition-colors ${
          isOpen ? "border-b border-gray-100 bg-[#fcfcfc]" : "hover:bg-gray-50"
        }`}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-gray-800 flex-1">{summary}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-accent flex-shrink-0 ml-4"
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
          >
            <div className="p-5 text-gray-700 leading-relaxed text-[0.95rem]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
