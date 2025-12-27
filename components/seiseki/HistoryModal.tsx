"use client";

import { useEffect, useState } from 'react';
import type { PersonHistory } from '@/types/seiseki';
import HistoryChart, { type ViewMode } from './HistoryChart';

interface HistoryModalProps {
  personHistory: PersonHistory;
  onClose: () => void;
}

export default function HistoryModal({ personHistory, onClose }: HistoryModalProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isLandscape, setIsLandscape] = useState(false);

  // 横画面検知
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(
        window.innerHeight < window.innerWidth &&
        window.innerHeight < 500
      );
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // モーダル表示中は背景のスクロールを無効化
  useEffect(() => {
    // 現在のoverflow値を保存
    const originalOverflow = document.body.style.overflow;
    // スクロールを無効化
    document.body.style.overflow = 'hidden';

    // クリーンアップ: モーダルが閉じたら元に戻す
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
      style={{ touchAction: 'none' }}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" style={{ touchAction: 'auto' }}>
        {/* ヘッダー */}
        <div className={`flex items-center justify-between gap-4 px-6 border-b border-gray-200 ${isLandscape ? 'py-2' : 'py-4'}`}>
          <h2 className={`font-bold text-gray-800 ${isLandscape ? 'text-lg' : 'text-2xl'}`}>
            {personHistory.name}{personHistory.history[personHistory.history.length - 1]?.rankTitle || ''} の成績推移
          </h2>

          {/* 期間切替ボタン */}
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-1 rounded-md font-medium text-sm ${
                viewMode === 'all'
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              全期間
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`px-4 py-1 rounded-md font-medium text-sm ${
                viewMode === 'year'
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              1年
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
            aria-label="閉じる"
          >
            <svg
              className={isLandscape ? 'w-5 h-5' : 'w-6 h-6'}
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
        <div className={`flex-1 overflow-hidden ${isLandscape ? 'p-3' : 'p-6'}`}>
          <HistoryChart
            personHistory={personHistory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
}
