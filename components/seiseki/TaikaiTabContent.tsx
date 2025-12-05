"use client";

import { motion } from "framer-motion";
import TaikaiCard from "@/components/taikai/TaikaiCard";
import type { TaikaiData } from "@/types/taikai";

interface TaikaiTabContentProps {
  taikaiList: TaikaiData[];
}

export default function TaikaiTabContent({ taikaiList }: TaikaiTabContentProps) {
  if (taikaiList.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        大会データがありません
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {taikaiList.map((taikai) => {
        return (
          <motion.section
            key={taikai.year}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* 大会情報ヘッダー */}
            <div className="mb-8 border-l-4 border-accent pl-4">
              <h2 className="text-3xl font-bold text-accent mb-2">
                {taikai.taikaiName}
              </h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>開催: {taikai.eventDate}</span>
                <span>参加者: {taikai.participants.length}名</span>
              </div>
            </div>

            {/* 参加者カードグリッド */}
            <div className="grid grid-cols-1 gap-4">
              {taikai.participants.map((participant, index) => (
                <TaikaiCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
