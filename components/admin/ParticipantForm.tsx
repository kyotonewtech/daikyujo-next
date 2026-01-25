"use client";

import type { TaikaiParticipant } from "@/types/taikai";

interface ParticipantFormProps {
  participant: TaikaiParticipant;
  onUpdate: (id: string, field: keyof TaikaiParticipant, value: string | number) => void;
  onRemove: (id: string) => void;
  rank: number;
}

const RANK_OPTIONS = [
  { value: "\u4e94\u6bb5", label: "\u4e94\u6bb5" },
  { value: "\u56db\u6bb5", label: "\u56db\u6bb5" },
  { value: "\u4e09\u6bb5", label: "\u4e09\u6bb5" },
  { value: "\u4e8c\u6bb5", label: "\u4e8c\u6bb5" },
  { value: "\u521d\u6bb5", label: "\u521d\u6bb5" },
  { value: "\u4e00\u7d1a", label: "\u4e00\u7d1a" },
  { value: "\u4e8c\u7d1a", label: "\u4e8c\u7d1a" },
  { value: "\u4e09\u7d1a", label: "\u4e09\u7d1a" },
  { value: "\u56db\u7d1a", label: "\u56db\u7d1a" },
  { value: "\u4e94\u7d1a", label: "\u4e94\u7d1a" },
];

export default function ParticipantForm({
  participant,
  onUpdate,
  onRemove,
  rank,
}: ParticipantFormProps) {
  const handleScoreChange = (field: "score1" | "score2", value: string) => {
    // 入力途中で一旦空にすることを許可
    if (value === "") {
      onUpdate(participant.id, field, "");
      return;
    }

    // 半角数字以外は無視（0〜3桁）
    if (!/^\d{1,3}$/.test(value)) {
      return; // 入力を反映しない
    }

    const numValue = parseInt(value, 10);
    const clampedValue = Math.min(Math.max(numValue, 0), 999);

    onUpdate(participant.id, field, clampedValue);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Rank {rank}</h3>
        <button
          type="button"
          onClick={() => onRemove(participant.id)}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={participant.name}
            onChange={(e) => onUpdate(participant.id, "name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rank Title</label>
          <select
            value={participant.rankTitle}
            onChange={(e) => onUpdate(participant.id, "rankTitle", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select rank</option>
            {RANK_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="999"
            step="1"
            value={participant.score1 === "" ? "" : participant.score1}
            onChange={(e) => handleScoreChange("score1", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="0-999"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score 2 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="999"
            step="1"
            value={participant.score2 === "" ? "" : participant.score2}
            onChange={(e) => handleScoreChange("score2", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="0-999"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Score (Automatic)
          </label>
          <input
            type="number"
            value={participant.totalScore}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
            placeholder="Total Score"
          />
        </div>
      </div>
    </div>
  );
}
