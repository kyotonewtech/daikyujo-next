"use client";

import type { SeisekiEntry } from "@/types/seiseki";

interface SeisekiCardProps {
  entry: SeisekiEntry;
  index: number;
  isEmpty?: boolean;
}

// 日付フォーマット関数: "2025年11月26日" → "11月26日"
function formatShortDate(fullDate: string): string {
  return fullDate.replace(/^\d{4}年/, '');
}

export default function SeisekiCard({ entry, index, isEmpty = false }: SeisekiCardProps) {
  // 順位に応じた色
  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-600"; // 金
    if (rank === 2) return "text-gray-400";   // 銀
    if (rank === 3) return "text-orange-600"; // 銅
    return "text-accent";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 transition-shadow duration-300 ${
        isEmpty ? 'opacity-50 cursor-default' : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-center gap-6">
        {/* 順位 */}
        <span className={`font-bold text-xl ${isEmpty ? 'text-gray-400' : getRankColor(entry.rank)}`}>
          {entry.rank}位
        </span>

        {/* 名前+段位 */}
        <span className={`font-shippori text-lg ${isEmpty ? 'text-gray-400' : 'text-gray-800'}`}>
          {entry.name}{entry.rankTitle}
        </span>

        {/* 的の大きさ */}
        <span className={`text-xl font-bold ${isEmpty ? 'text-gray-400' : 'text-accent'}`}>
          {entry.targetSize}
        </span>

        {/* 更新日・有効期限は空の場合は非表示 */}
        {!isEmpty && (
          <>
            {/* 更新日 */}
            <span className="text-sm text-gray-600">
              (更新日){formatShortDate(entry.updatedDate)}
            </span>

            {/* 有効期限 */}
            <span className="text-sm text-gray-600">
              (有効期限){formatShortDate(entry.expiryDate)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
