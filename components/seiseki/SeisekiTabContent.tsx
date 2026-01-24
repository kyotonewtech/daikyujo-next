"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import SeisekiCard from "./SeisekiCard";
import MonthCarousel from "./MonthCarousel";
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
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  // モーダル状態管理
  const [selectedPersonHistory, setSelectedPersonHistory] = useState<PersonHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const monthsData = yearDataMap.get(selectedYear) || [];

  // 利用可能な月のリスト（降順: 12月→1月）
  const availableMonths = useMemo(
    () => monthsData.map(m => m.month),
    [monthsData]
  );

  // 選択されている月
  const selectedMonth = monthsData[currentMonthIndex]?.month;

  // 年変更時の処理
  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
    const newMonthsData = yearDataMap.get(newYear) || [];

    // 最新月のインデックスを見つける（その年の最新月）
    if (newYear === latestYear && latestMonth) {
      const latestIndex = newMonthsData.findIndex(m => m.month === latestMonth);
      setCurrentMonthIndex(latestIndex >= 0 ? latestIndex : 0);
    } else {
      // その年の最初の月（降順なので12月など）
      setCurrentMonthIndex(0);
    }
  };

  // 月変更時の処理
  const handleMonthChange = (month: number) => {
    const index = monthsData.findIndex(m => m.month === month);
    if (index >= 0) {
      setCurrentMonthIndex(index);
    }
  };

  // 月インデックス変更時の処理（カルーセルから）
  const handleMonthIndexChange = (index: number) => {
    setCurrentMonthIndex(index);
  };

  // 初期化：最新年の最新月を表示
  useEffect(() => {
    if (selectedYear === latestYear && latestMonth) {
      const latestIndex = monthsData.findIndex(m => m.month === latestMonth);
      if (latestIndex >= 0) {
        setCurrentMonthIndex(latestIndex);
      }
    }
  }, [selectedYear, latestYear, latestMonth, monthsData]);

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
      {/* 年・月選択ドロップダウン */}
      <div className="mb-8 flex flex-col sm:flex-row justify-center gap-4">
        {/* 年選択 */}
        <select
          value={selectedYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}年
            </option>
          ))}
        </select>

        {/* 月選択 */}
        {availableMonths.length > 0 && (
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-bold text-accent focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}月
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 月別成績表示 */}
      {monthsData.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 py-12"
        >
          {selectedYear}年のデータがありません
        </motion.div>
      ) : (
        <>
          {/* モバイル: カルーセル表示 */}
          <div className="md:hidden">
            <MonthCarousel
              monthsData={monthsData}
              currentMonthIndex={currentMonthIndex}
              onMonthChange={handleMonthIndexChange}
              latestYear={latestYear}
              latestMonth={latestMonth}
              selectedYear={selectedYear}
              onCardClick={handleCardClick}
            />
          </div>

          {/* デスクトップ: 従来の表示（全ての月を縦にスクロール） */}
          <div className="hidden md:block space-y-12">
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
                  id={`month-${monthData.month}`}
                >
                  {/* 月ヘッダー */}
                  <h2 className="text-2xl font-bold text-accent mb-6 border-b-2 border-accent pb-2">
                    {monthData.month}月の成績
                  </h2>

                  {/* 成績カードグリッド（デスクトップ: 左列1-5位、右列6-10位） */}
                  <div className="grid grid-cols-2 gap-4">
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
                </motion.section>
              );
            })}
          </div>
        </>
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
