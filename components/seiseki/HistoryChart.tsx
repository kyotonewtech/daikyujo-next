"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PersonHistory } from '@/types/seiseki';

interface HistoryChartProps {
  personHistory: PersonHistory;
}

// 縦書きラベルコンポーネント
interface VerticalLabelProps {
  viewBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fill: string;
  text: string;
  position: 'left' | 'right';
}

const VerticalLabel = ({ viewBox, fill, text, position }: VerticalLabelProps) => {
  if (!viewBox) return null;

  const chars = text.split('');
  const lineHeight = 16; // 文字間の縦方向間隔

  // Y軸の中央位置を計算
  const centerY = viewBox.y + viewBox.height / 2;
  const startY = centerY - ((chars.length - 1) * lineHeight) / 2;

  // X座標を計算
  let finalX: number;
  if (position === 'left') {
    // 左側Y軸: viewBoxの左端から右に30px
    finalX = viewBox.x + 30;
  } else {
    // 右側Y軸: viewBoxの右端から左に30px
    finalX = viewBox.x + viewBox.width - 30;
  }

  return (
    <text
      x={finalX}
      y={startY}
      fill={fill}
      textAnchor="middle"
      style={{ fontSize: 14, fontWeight: 'normal' }}
    >
      {chars.map((char, i) => (
        <tspan key={i} x={finalX} dy={i === 0 ? 0 : lineHeight}>
          {char}
        </tspan>
      ))}
    </text>
  );
};

export default function HistoryChart({ personHistory }: HistoryChartProps) {
  // グラフ用にデータを整形 - Updated
  const chartData = personHistory.history.map(h => ({
    period: `${h.year}/${String(h.month).padStart(2, '0')}`,
    rank: h.rank,
    targetSize: h.targetSizeNumeric,
    rankTitle: h.rankTitle,
  }));

  // 的のサイズの最大値を計算（null値を除外）
  const maxTargetSize = Math.max(
    ...chartData
      .map(d => d.targetSize)
      .filter((size): size is number => size !== null),
    0  // デフォルト値として0を設定
  );

  return (
    <div className="w-full h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          {/* X軸: 年月 */}
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 11 }}
          />

          {/* Y軸（左）: 順位（1位が上） */}
          <YAxis
            yAxisId="rank"
            domain={[1, 11]}
            reversed
            label={(props) => (
              <VerticalLabel
                {...props}
                fill="#8B0000"
                text="順位"
                position="left"
              />
            )}
            tick={{ fontSize: 11 }}
            tickFormatter={(value) => value === 11 ? '圏外' : `${value}位`}
          />

          {/* Y軸（右）: 的の大きさ（小さい値が上） */}
          <YAxis
            yAxisId="size"
            orientation="right"
            domain={[maxTargetSize, 'auto']}
            reversed
            label={(props) => (
              <VerticalLabel
                {...props}
                fill="#4A90E2"
                text="的の大きさ"
                position="right"
              />
            )}
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            formatter={(value: number | null, name: string) => {
              if (value === null) {
                return ['データなし', name === 'rank' ? '順位' : '的の大きさ'];
              }
              if (name === 'rank') {
                return [`${value}位`, '順位'];
              }
              if (name === 'targetSize') {
                return [value, '的の大きさ'];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `期間: ${label}`}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              if (value === 'rank') return '順位';
              if (value === 'targetSize') return '的の大きさ';
              return value;
            }}
          />

          {/* 順位の折れ線グラフ（赤色） */}
          <Line
            yAxisId="rank"
            type="monotone"
            dataKey="rank"
            stroke="#8B0000"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="rank"
          />

          {/* 的のサイズの折れ線グラフ（青色） */}
          <Line
            yAxisId="size"
            type="monotone"
            dataKey="targetSize"
            stroke="#4A90E2"
            strokeWidth={2}
            dot={{ r: 4 }}
            name="targetSize"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
