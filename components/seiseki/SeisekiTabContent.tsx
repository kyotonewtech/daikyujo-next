"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import SeisekiCard from "./SeisekiCard";
import HistoryModal from "./HistoryModal";
import type { SeisekiMonth, SeisekiEntry, PersonHistory } from "@/types/seiseki";

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
    personId: "",
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

  // モーダル状態管理
  const [selectedPersonHistory, setSelectedPersonHistory] = useState<PersonHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const monthsData = yearDataMap.get(selectedYear) || [];

  // カードクリック時の処理
  const handleCardClick = async (personId: string) => {
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/seiseki/person/${personId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch person history');
      }
      const personHistory: PersonHistory = await response.json();
      setSelectedPersonHistory(personHistory);
    } catch (error) {
      console.error('Error fetching person history:', error);
      alert('成績履歴の取得に失敗しました');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setSelectedPersonHistory(null);
  };

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
                        onClick={handleCardClick}
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
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>
      )}

      {/* 成績推移グラフモーダル */}
      {selectedPersonHistory && (
        <HistoryModal
          personHistory={selectedPersonHistory}
          onClose={handleCloseModal}
        />
      )}

      {/* ローディング表示 */}
      {isLoadingHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="text-lg font-bold text-gray-800">データ読み込み中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
