"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TaikaiCard from "@/components/taikai/TaikaiCard";
import TaikaiHistoryModal from "@/components/taikai/TaikaiHistoryModal";
import type { TaikaiData, PersonTaikaiHistory } from "@/types/taikai";

interface TaikaiTabContentProps {
  taikaiList: TaikaiData[];
}

export default function TaikaiTabContent({ taikaiList }: TaikaiTabContentProps) {
  // モーダル状態管理
  const [selectedPersonHistory, setSelectedPersonHistory] = useState<PersonTaikaiHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // カードクリック処理
  const handleCardClick = async (personName: string) => {
    setIsLoadingHistory(true);
    try {
      const encodedName = encodeURIComponent(personName);
      const response = await fetch(`/api/taikai/person/${encodedName}`);

      if (!response.ok) {
        throw new Error('Failed to fetch person taikai history');
      }

      const personHistory: PersonTaikaiHistory = await response.json();
      setSelectedPersonHistory(personHistory);
    } catch (error) {
      console.error('Error fetching person taikai history:', error);
      alert('大会参加履歴の取得に失敗しました');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setSelectedPersonHistory(null);
  };
  if (taikaiList.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        大会データがありません
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {taikaiList.map((taikai) => {
        return (
          <motion.section
            key={taikai.year}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* 大会情報ヘッダー */}
            <div className="mb-8 border-l-4 border-accent pl-4">
              <h2 className="text-3xl font-bold text-accent mb-2">
                {taikai.taikaiName}
              </h2>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>開催: {taikai.eventDate}</span>
                <span>参加者: {taikai.participants.length}名</span>
              </div>
            </div>

            {/* 参加者カードグリッド */}
            <div
              className="grid grid-cols-2 grid-flow-col gap-4"
              style={{
                gridTemplateRows: `repeat(${Math.ceil(taikai.participants.length / 2)}, minmax(0, 1fr))`
              }}
            >
              {taikai.participants.map((participant, index) => (
                <TaikaiCard
                  key={participant.id}
                  participant={participant}
                  index={index}
                  onClick={handleCardClick}
                />
              ))}
            </div>
          </motion.section>
        );
      })}

      {/* 大会参加履歴グラフモーダル */}
      {selectedPersonHistory && (
        <TaikaiHistoryModal
          personHistory={selectedPersonHistory}
          onClose={handleCloseModal}
        />
      )}

      {/* ローディング表示 */}
      {isLoadingHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-6 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="text-lg font-bold text-gray-800">データ読み込み中...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
