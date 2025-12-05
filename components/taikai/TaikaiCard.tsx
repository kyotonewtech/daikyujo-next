"use client";

import type { TaikaiParticipant } from "@/types/taikai";

interface TaikaiCardProps {
  participant: TaikaiParticipant;
  index: number;
}

const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return "text-yellow-600"; // Gold
    case 2:
      return "text-gray-400"; // Silver
    case 3:
      return "text-orange-600"; // Bronze
    default:
      return "text-accent";
  }
};

const getRankBgColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return "bg-yellow-50";
    case 2:
      return "bg-gray-50";
    case 3:
      return "bg-orange-50";
    default:
      return "bg-white";
  }
};

export default function TaikaiCard({ participant, index }: TaikaiCardProps) {
  const rankColor = getRankColor(participant.rank);
  const bgColor = getRankBgColor(participant.rank);

  return (
    <div
      className={`${bgColor} border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300`}
    >
      <div className="flex items-center gap-6">
        {/* 順位 */}
        <span className={`${rankColor} font-bold text-xl flex-shrink-0`}>
          {participant.rank}位
        </span>

        {/* 名前+段位 */}
        <span className="font-shippori text-lg text-gray-800 flex-shrink-0">
          {participant.name}{participant.rankTitle}
        </span>

        {/* スコア */}
        <span className="text-lg text-gray-700">
          {participant.score1}+{participant.score2}={" "}
          <span className={`font-bold text-xl ${rankColor}`}>
            {participant.totalScore}
          </span>
        </span>
      </div>
    </div>
  );
}
