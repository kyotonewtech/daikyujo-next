"use client";

import type { SeisekiEntry } from "@/types/seiseki";

interface SeisekiCardProps {
  entry: SeisekiEntry;
  index: number;
  isEmpty?: boolean;
  className?: string;
  isLatestMonth?: boolean;
  onClick?: (personId: string) => void;
}

// 日付フォーマット関数: "2025-11-26" → "11/26"
function formatShortDate(dateString: string): string {
  if (!dateString) return '';
  // yyyy-mm-dd 形式から mm/dd 形式に変換
  const match = dateString.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    return `${month}/${day}`;
  }
  return dateString;
}

export default function SeisekiCard({ entry, index, isEmpty = false, className, isLatestMonth = false, onClick }: SeisekiCardProps) {
  // 順位に応じた色
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600"; // 金
    if (rank === 2) return "text-gray-400";   // 銀
    if (rank === 3) return "text-orange-600"; // 銅
    return "text-accent";
  };

  // クリックハンドラー
  const handleClick = () => {
    if (!isEmpty && onClick && entry.personId) {
      onClick(entry.personId);
    }
  };

  // キーボードハンドラー（Enter/Space）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isEmpty && onClick && entry.personId) {
      e.preventDefault();
      onClick(entry.personId);
    }
  };

  // クリック可能かどうか
  const isClickable = !isEmpty && onClick;

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 transition-shadow duration-300 ${
        isEmpty ? 'opacity-50 cursor-default' : 'hover:shadow-lg'
      } ${isClickable ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {/* 最新月の場合は2行表示 */}
      {!isEmpty && isLatestMonth ? (
        <div className="flex flex-col gap-2">
          {/* 1行目: 順位・的のサイズ・名前・級 */}
          <div className="flex items-center gap-6">
            {/* 順位 */}
            <span className={`font-bold text-xl ${getRankColor(entry.rank)}`}>
              {entry.rank}位
            </span>

            {/* 的の大きさ */}
            <span className="text-xl font-bold text-accent">
              {entry.targetSize}
            </span>

            {/* 名前+段位 */}
            <span className="font-shippori text-lg text-gray-800">
              {entry.name}{entry.rankTitle}
            </span>
          </div>

          {/* 2行目: 更新日・有効期限 */}
          <div className="flex items-center gap-6 text-sm text-gray-600 ml-2">
            {/* 更新日 */}
            <span>
              (更新日){formatShortDate(entry.updatedDate)}
            </span>

            {/* 有効期限 */}
            <span>
              (有効期限){formatShortDate(entry.expiryDate)}
            </span>
          </div>
        </div>
      ) : (
        /* 最新月以外、または空の場合は1行表示 */
        <div className="flex items-center gap-6">
          {/* 順位 */}
          <span className={`font-bold text-xl ${isEmpty ? 'text-gray-400' : getRankColor(entry.rank)}`}>
            {entry.rank}位
          </span>

          {/* 的の大きさ */}
          <span className={`text-xl font-bold ${isEmpty ? 'text-gray-400' : 'text-accent'}`}>
            {entry.targetSize}
          </span>

          {/* 名前+段位 */}
          <span className={`font-shippori text-lg ${isEmpty ? 'text-gray-400' : 'text-gray-800'}`}>
            {entry.name}{entry.rankTitle}
          </span>
        </div>
      )}
    </div>
  );
}
