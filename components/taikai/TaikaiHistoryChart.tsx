"use client";

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { PersonTaikaiHistory } from '@/types/taikai';

// 定数: グラフの固定値
const RANK_MIN = 0.2; // 1位の上に余白確保（メモリは非表示）

interface TaikaiHistoryChartProps {
  personHistory: PersonTaikaiHistory;
}

export default function TaikaiHistoryChart({ personHistory }: TaikaiHistoryChartProps) {
  const [isLandscape, setIsLandscape] = useState(false);

  // 画面方向検知
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerHeight < window.innerWidth && window.innerHeight < 500;
      setIsLandscape(isLandscapeMode);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // グラフ用にデータを整形（逆順にして新しい年を右側に）
  const chartData = personHistory.history
    .slice()
    .reverse()
    .map(h => ({
      year: h.year.toString(),
      rank: h.rank,
      taikaiName: h.taikaiName,
      totalScore: h.totalScore,
    }));

  // Y軸の最大順位を計算
  const maxRank = Math.max(...chartData.map(d => d.rank));

  // グラフサイズ設定（全期間成績グラフと同様）
  const chartHeight = isLandscape ? 400 : 700;
  const chartWidth = typeof window !== 'undefined' ? window.innerWidth - 40 : 800;

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        margin={{ top: 20, right: 10, bottom: 80, left: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {/* X軸: 年度 */}
        <XAxis
          dataKey="year"
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
        />

        {/* Y軸: 順位（1位が上、RANK_MINで上部余白確保） */}
        <YAxis
          domain={[RANK_MIN, maxRank]}
          reversed
          allowDataOverflow={true}
          ticks={Array.from({ length: maxRank }, (_, i) => i + 1)}
          tick={{ fontSize: 11, fill: '#8B0000' }}
          tickFormatter={(value) => `${value}位`}
          scale="linear"
          type="number"
        />

        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
          formatter={(value: number, name: string) => {
            if (name === 'rank') {
              return [`${value}位`, '順位'];
            }
            if (name === 'totalScore') {
              return [value, '合計スコア'];
            }
            return [value, name];
          }}
          labelFormatter={(label) => `${label}年度`}
        />

        {/* 順位の折れ線グラフ（赤色） */}
        <Line
          type="monotone"
          dataKey="rank"
          stroke="#8B0000"
          strokeWidth={3}
          dot={{ r: 5 }}
          name="rank"
        />
      </LineChart>
    </div>
  );
}
