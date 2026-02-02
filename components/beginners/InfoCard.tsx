"use client";

import { motion } from "framer-motion";
import type { InfoCardProps } from "@/types/beginners";

export default function InfoCard({ title, description, icon, delay = 0 }: InfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 p-6 md:p-8"
    >
      {icon && <div className="text-accent mb-4 flex justify-center">{icon}</div>}
      <h3 className="font-shippori text-xl font-bold text-center mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 text-center leading-relaxed">{description}</p>
    </motion.div>
  );
}
