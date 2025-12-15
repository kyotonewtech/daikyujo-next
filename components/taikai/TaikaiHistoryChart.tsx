"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PersonTaikaiHistory } from '@/types/taikai';

interface TaikaiHistoryChartProps {
  personHistory: PersonTaikaiHistory;
}

export default function TaikaiHistoryChart({ personHistory }: TaikaiHistoryChartProps) {
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

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 80, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* X軸: 年度 */}
          <XAxis
            dataKey="year"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
            label={{ value: '開催年', position: 'insideBottom', offset: -20 }}
          />

          {/* Y軸: 順位（1位が上） */}
          <YAxis
            domain={[1, maxRank]}
            reversed
            label={{ value: '順位', angle: -90, position: 'insideLeft', style: { fontSize: 14 } }}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => `${value}位`}
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

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'rank') return '順位';
              return value;
            }}
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
      </ResponsiveContainer>
    </div>
  );
}
