"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PersonTaikaiHistory } from "@/types/taikai";

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
    window.addEventListener("resize", checkOrientation);
    return () => window.removeEventListener("resize", checkOrientation);
  }, []);

  // グラフ用にデータを整形（逆順にして新しい年を右側に）
  const chartData = personHistory.history
    .slice()
    .reverse()
    .map((h) => ({
      year: h.year.toString(),
      rank: h.rank,
      taikaiName: h.taikaiName,
      totalScore: h.totalScore,
    }));

  // Y軸の最大順位を計算
  const maxRank = Math.max(...chartData.map((d) => d.rank));

  // dotの見切れ防止のための余白定数
  const RANK_PADDING = 0.5;

  // グラフサイズ設定
  const chartHeight = isLandscape ? 400 : 700;

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 10, bottom: 80, left: 0 }}>
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

          {/* Y軸: 順位（1位が上） */}
          <YAxis
            domain={[1 - RANK_PADDING, maxRank + RANK_PADDING]}
            reversed
            allowDataOverflow={true}
            ticks={Array.from({ length: maxRank }, (_, i) => i + 1)}
            tick={{ fontSize: 11, fill: "#8B0000" }}
            tickFormatter={(value) => `${value}位`}
            scale="linear"
            type="number"
          />

          <Tooltip
            contentStyle={{ backgroundColor: "white", border: "1px solid #ccc" }}
            formatter={(value: number, name: string) => {
              if (name === "rank") {
                return [`${value}位`, "順位"];
              }
              if (name === "totalScore") {
                return [value, "合計スコア"];
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
      </ResponsiveContainer>
    </div>
  );
}
