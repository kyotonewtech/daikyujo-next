"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eng?: string;
  children: ReactNode;
  /** 見出しの位置: デフォルトは center */
  align?: "center" | "left";
}

/**
 * セクション共通見出しコンポーネント。
 * 英字ラベル（accent 色）+ h2（font-shippori text-3xl）の統一パターン。
 */
export default function SectionHeading({ eng, children, align = "center" }: SectionHeadingProps) {
  const alignClass = align === "left" ? "text-left" : "text-center";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-16 ${alignClass}`}
    >
      <h2 className="font-shippori text-3xl font-bold mb-3 text-foreground">{children}</h2>
      {eng && <span className="block text-xs font-sans text-accent tracking-[0.3em]">{eng}</span>}
    </motion.div>
  );
}
