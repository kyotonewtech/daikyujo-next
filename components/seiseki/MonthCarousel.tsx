"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { padEntriesToTen } from "@/lib/seiseki-entry-utils";
import type { SeisekiMonth } from "@/types/seiseki";
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
    <div>
      {/* ヘッダー行: 月タイトルと前後ナビゲーション矢印をまとめて配置 */}
      <div className="flex items-center justify-between mb-6 border-b-2 border-accent pb-2">
        {/* 新しい月へ戻るボタン（44×44px以上のタップ領域確保）
            monthsData は降順（index 0 = 最新月）のため index-1 = 時間的に次の月 */}
        <button
          type="button"
          onClick={() => hasPrev && handleMonthChange(currentMonthIndex - 1)}
          disabled={!hasPrev || isAnimating}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="次の月へ"
        >
          <ChevronLeft className="w-6 h-6 text-accent" />
        </button>

        {/* 月タイトル */}
        <h2 className="text-2xl font-bold text-accent">{currentMonthData.month}月の成績</h2>

        {/* 前の月へ戻るボタン（44×44px以上のタップ領域確保）
            index+1 = 時間的に前の月（古い月） */}
        <button
          type="button"
          onClick={() => hasNext && handleMonthChange(currentMonthIndex + 1)}
          disabled={!hasNext || isAnimating}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white shadow-md hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="前の月へ"
        >
          <ChevronRight className="w-6 h-6 text-accent" />
        </button>
      </div>

      <div className="overflow-hidden">
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
      </div>

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
