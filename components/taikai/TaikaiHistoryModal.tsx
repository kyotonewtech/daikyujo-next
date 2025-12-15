"use client";

import { useEffect } from "react";
import TaikaiHistoryChart from "./TaikaiHistoryChart";
import type { PersonTaikaiHistory } from "@/types/taikai";

interface TaikaiHistoryModalProps {
  personHistory: PersonTaikaiHistory;
  onClose: () => void;
}

export default function TaikaiHistoryModal({ personHistory, onClose }: TaikaiHistoryModalProps) {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {personHistory.name} の大会成績推移
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* グラフエリア */}
        <div className="p-6">
          <TaikaiHistoryChart personHistory={personHistory} />
        </div>
      </div>
    </div>
  );
}
