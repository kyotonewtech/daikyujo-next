"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { ChecklistItemProps } from "@/types/beginners";

export default function ChecklistItem({ text, delay = 0 }: ChecklistItemProps) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-3"
    >
      <Check size={20} className="text-accent flex-shrink-0 mt-0.5" />
      <span className="text-gray-700 leading-relaxed">{text}</span>
    </motion.li>
  );
}
