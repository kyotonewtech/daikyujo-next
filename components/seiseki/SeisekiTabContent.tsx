"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SeisekiCard from "./SeisekiCard";
import type { SeisekiMonth, SeisekiEntry } from "@/types/seiseki";

interface SeisekiTabContentProps {
  availableYears: number[];
  yearDataMap: Map<number, SeisekiMonth[]>;
  latestYear: number | null;
  latestMonth: number | null;
}

// 空エントリーを生成（10件未満の場合に埋めるため）
function createEmptyEntry(rank: number): SeisekiEntry {
  return {
    id: `empty-${rank}`,
    rank,
    name: "該当なし",
    rankTitle: "",
    targetSize: "-",
    updatedDate: "",
    expiryDate: "",
    isEmpty: true,
  };
}

// エントリーを10件に揃える
function padEntriesToTen(entries: SeisekiEntry[]): SeisekiEntry[] {
  if (entries.length >= 10) return entries.slice(0, 10);

  const padded = [...entries];
  for (let i = entries.length; i < 10; i++) {
    padded.push(createEmptyEntry(i + 1));
  }
  return padded;
}

// エントリーを再配置（デスクトップ用: 左列1-5位、右列6-10位）
function reorderEntriesForDesktop(entries: SeisekiEntry[]): SeisekiEntry[] {
  if (entries.length !== 10) return entries;

  const reordered: SeisekiEntry[] = [];
  for (let i = 0; i < 5; i++) {
    reordered.push(entries[i]);      // 1位, 2位, 3位, 4位, 5位
    reordered.push(entries[i + 5]);  // 6位, 7位, 8位, 9位, 10位
  }
  return reordered;
}

export default function SeisekiTabContent({ availableYears, yearDataMap, latestYear, latestMonth }: SeisekiTabContentProps) {
  // デフォルトは最新年（配列は降順なので先頭）
  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  const monthsData = yearDataMap.get(selectedYear) || [];

  return (
    <div>
      {/* 年選択ドロップダウン */}
      <div className="mb-8 flex justify-center">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>
      </div>

      {/* 月別成績表示（12月→1月） */}
      {monthsData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-12"
        >
          {selectedYear}年のデータがありません
        </motion.div>
      ) : (
        <div className="space-y-12">
          {monthsData.map((monthData) => {
            const paddedEntries = padEntriesToTen(monthData.entries);

            // この月が最新かどうかを判定
            const isLatestMonth =
              selectedYear === latestYear &&
              monthData.month === latestMonth;

            return (
              <motion.section
                key={`${monthData.year}-${monthData.month}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                {/* 月ヘッダー */}
                <h2 className="text-2xl font-bold text-accent mb-6 border-b-2 border-accent pb-2">
                  {monthData.month}月の成績
                </h2>

                {/* 成績カードグリッド（モバイル: 1-10位、デスクトップ: 左列1-5位、右列6-10位） */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* モバイル: 元の順序で表示 */}
                  <div className="block md:hidden space-y-4">
                    {paddedEntries.map((entry, index) => (
                      <SeisekiCard
                        key={entry.id}
                        entry={entry}
                        index={index}
                        isEmpty={entry.isEmpty}
                        isLatestMonth={isLatestMonth}
                      />
                    ))}
                  </div>

                  {/* デスクトップ: 再配置した順序で表示 */}
                  <div className="hidden md:grid md:grid-cols-2 gap-4 w-full col-span-2">
                    {reorderEntriesForDesktop(paddedEntries).map((entry, index) => (
                      <SeisekiCard
                        key={entry.id}
                        entry={entry}
                        index={index}
                        isEmpty={entry.isEmpty}
                        isLatestMonth={isLatestMonth}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>
      )}
    </div>
  );
}
