"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { SeisekiEntry, SeisekiMonth } from "@/types/seiseki";
import SeisekiCard from "./SeisekiCard";

interface MonthCarouselProps {
  monthsData: SeisekiMonth[];
  currentMonthIndex: number;
  onMonthChange: (index: number) => void;
  latestYear: number | null;
  latestMonth: number | null;
  selectedYear: number;
  onCardClick: (personId: string) => void;
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
function _reorderEntriesForDesktop(entries: SeisekiEntry[]): SeisekiEntry[] {
  if (entries.length !== 10) return entries;

  const reordered: SeisekiEntry[] = [];
  for (let i = 0; i < 5; i++) {
    reordered.push(entries[i]); // 1位, 2位, 3位, 4位, 5位
    reordered.push(entries[i + 5]); // 6位, 7位, 8位, 9位, 10位
  }
  return reordered;
}

export default function MonthCarousel({
  monthsData,
  currentMonthIndex,
  onMonthChange,
  latestYear,
  latestMonth,
  selectedYear,
  onCardClick,
}: MonthCarouselProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState(0);

  const minSwipeDistance = 50;

  // 現在の月のデータ
  const currentMonthData = useMemo(
    () => monthsData[currentMonthIndex],
    [monthsData, currentMonthIndex]
  );

  // スワイプ方向を設定して月を変更
  const handleMonthChange = (newIndex: number) => {
    if (isAnimating || newIndex === currentMonthIndex) return;

    setDirection(newIndex > currentMonthIndex ? 1 : -1);
    setIsAnimating(true);
    onMonthChange(newIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // タッチイベントハンドラー
  const onTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentMonthIndex < monthsData.length - 1) {
      handleMonthChange(currentMonthIndex + 1);
    }

    if (isRightSwipe && currentMonthIndex > 0) {
      handleMonthChange(currentMonthIndex - 1);
    }
  };

  // アニメーションバリアント
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  if (!currentMonthData) {
    return <div className="text-center text-gray-500 py-12">データがありません</div>;
  }

  const paddedEntries = padEntriesToTen(currentMonthData.entries);
  const isLatestMonth = selectedYear === latestYear && currentMonthData.month === latestMonth;

  const hasPrev = currentMonthIndex > 0;
  const hasNext = currentMonthIndex < monthsData.length - 1;

  return (
    <div className="relative overflow-hidden">
      {/* 左矢印ボタン */}
      {hasPrev && (
        <button
          type="button"
          onClick={() => handleMonthChange(currentMonthIndex - 1)}
          disabled={isAnimating}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="前の月"
        >
          <ChevronLeft className="w-6 h-6 text-accent" />
        </button>
      )}

      {/* 右矢印ボタン */}
      {hasNext && (
        <button
          type="button"
          onClick={() => handleMonthChange(currentMonthIndex + 1)}
          disabled={isAnimating}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="次の月"
        >
          <ChevronRight className="w-6 h-6 text-accent" />
        </button>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.section
          key={`${currentMonthData.year}-${currentMonthData.month}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="will-change-transform"
        >
          {/* 月ヘッダー */}
          <h2 className="text-2xl font-bold text-accent mb-6 border-b-2 border-accent pb-2">
            {currentMonthData.month}月の成績
          </h2>

          {/* 成績カードグリッド */}
          <div className="space-y-4">
            {paddedEntries.map((entry, index) => (
              <SeisekiCard
                key={entry.id}
                entry={entry}
                index={index}
                isEmpty={entry.isEmpty}
                isLatestMonth={isLatestMonth}
                onClick={onCardClick}
              />
            ))}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* ページネーションドット */}
      {monthsData.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 pb-4">
          {monthsData.map((month, index) => (
            <button
              type="button"
              key={`${month.year}-${month.month}`}
              onClick={() => handleMonthChange(index)}
              disabled={isAnimating}
              className={`transition-all duration-300 rounded-full disabled:cursor-not-allowed ${
                index === currentMonthIndex
                  ? "w-8 h-3 bg-accent"
                  : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`${month.month}月の成績を表示`}
              aria-current={index === currentMonthIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
