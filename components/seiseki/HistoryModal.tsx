"use client";

import { useEffect } from 'react';
import type { PersonHistory } from '@/types/seiseki';
import HistoryChart from './HistoryChart';

interface HistoryModalProps {
  personHistory: PersonHistory;
  onClose: () => void;
}

export default function HistoryModal({ personHistory, onClose }: HistoryModalProps) {
  // ESCキーで閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 背景クリックで閉じる
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {personHistory.name}{personHistory.history[personHistory.history.length - 1]?.rankTitle || ''} の成績推移
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* グラフ本体 */}
        <div className="flex-1 overflow-auto p-6">
          <HistoryChart personHistory={personHistory} />
        </div>
      </div>
    </div>
  );
}
