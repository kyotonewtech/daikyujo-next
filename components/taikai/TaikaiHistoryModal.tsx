"use client";

import { useCallback, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";
import type { PersonTaikaiHistory } from "@/types/taikai";
import TaikaiHistoryChart from "./TaikaiHistoryChart";

interface TaikaiHistoryModalProps {
  personHistory: PersonTaikaiHistory;
  onClose: () => void;
}

export default function TaikaiHistoryModal({ personHistory, onClose }: TaikaiHistoryModalProps) {
  // 最新の段級位を取得
  const latestRankTitle = personHistory.history[0]?.rankTitle || "";
  const titleId = useId();

  // フォーカストラップ（ESCハンドリングはこちらに委譲）
  const dialogRef = useFocusTrap<HTMLDivElement>(true, onClose);

  // body scroll lock
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: モーダルオーバーレイの背景クリックで閉じるパターン。フォーカスはダイアログ内でトラップ済み
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackgroundClick}
      style={{ touchAction: "none" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ touchAction: "auto" }}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <h2 id={titleId} className="text-2xl font-bold text-gray-800">
            {personHistory.name}
            {latestRankTitle}の大会成績推移
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {/* グラフエリア */}
        <div className="flex-1 overflow-auto p-6">
          <TaikaiHistoryChart personHistory={personHistory} />
        </div>
      </div>
    </div>,
    document.body
  );
}
