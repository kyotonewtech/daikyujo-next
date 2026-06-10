"use client";

/** フルスクリーンのローディングオーバーレイ */
export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg p-6 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
          <span className="text-lg font-bold text-gray-800">データ読み込み中...</span>
        </div>
      </div>
    </div>
  );
}
