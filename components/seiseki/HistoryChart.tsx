"use client";

import { useState, useRef } from 'react';
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

type ViewMode = 'all' | 'year';

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
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [monthOffset, setMonthOffset] = useState(0); // 0=直近12ヶ月, 1=1ヶ月前から12ヶ月, etc.
  const touchStartX = useRef<number | null>(null);
  const dragStartOffset = useRef<number>(0);
  const isDragging = useRef<boolean>(false);

  // グラフ用にデータを整形 - Updated
  const allChartData = personHistory.history.map(h => ({
    period: `${h.year}/${String(h.month).padStart(2, '0')}`,
    rank: h.rank,
    targetSize: h.targetSizeNumeric,
    rankTitle: h.rankTitle,
  }));

  // 1年表示時のデータフィルタリング
  const getFilteredData = () => {
    if (viewMode === 'all') {
      return allChartData;
    }

    // 1年表示: 月単位でオフセット（0=直近12ヶ月）
    const endIndex = allChartData.length - monthOffset;
    const startIndex = Math.max(0, endIndex - 12);
    return allChartData.slice(startIndex, endIndex);
  };

  const chartData = getFilteredData();

  // 的のサイズの最大値を計算（null値を除外）
  const maxTargetSize = Math.max(
    ...chartData
      .map(d => d.targetSize)
      .filter((size): size is number => size !== null),
    0  // デフォルト値として0を設定
  );

  // 最大オフセット数を計算（月単位）
  const maxMonthOffset = Math.max(0, allChartData.length - 12);

  // 表示期間のラベルを取得
  const getPeriodLabel = () => {
    if (viewMode === 'all' || chartData.length === 0) return '';
    const startPeriod = chartData[0].period;
    const endPeriod = chartData[chartData.length - 1].period;
    return `${startPeriod} 〜 ${endPeriod}`;
  };

  // リアルタイムスワイプハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.touches[0].clientX;
    dragStartOffset.current = monthOffset;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode !== 'year' || !isDragging.current || touchStartX.current === null) return;

    const currentX = e.touches[0].clientX;
    const diff = touchStartX.current - currentX;

    // スワイプ距離を月数に変換（100pxで約1ヶ月）
    const monthDiff = Math.round(diff / 100);
    const newOffset = Math.max(0, Math.min(maxMonthOffset, dragStartOffset.current + monthDiff));

    setMonthOffset(newOffset);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    touchStartX.current = null;
  };

  // スライダー変更ハンドラー
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMonthOffset(Number(e.target.value));
  };

  // 表示モード変更時にオフセットをリセット
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'year') {
      setMonthOffset(0);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 期間選択トグルボタン */}
      <div className="flex justify-center items-center gap-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            全期間
          </button>
          <button
            onClick={() => handleViewModeChange('year')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'year'
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            1年
          </button>
        </div>
      </div>

      {/* 1年表示時のスライダーと期間表示 */}
      {viewMode === 'year' && (
        <div className="space-y-3 px-4">
          {/* 期間ラベル */}
          <div className="text-center text-sm text-gray-700 font-medium">
            {getPeriodLabel()}
          </div>

          {/* スライダー */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={maxMonthOffset}
              value={monthOffset}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-accent
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4
                [&::-moz-range-thumb]:h-4
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-accent
                [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:cursor-pointer"
            />
            {/* スライダーのラベル */}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>直近</span>
              <span>過去</span>
            </div>
          </div>
        </div>
      )}

      {/* グラフ（スワイプ対応） */}
      <div
        className="w-full h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
            tickFormatter={(value) => Number(value).toFixed(1)}
          />

          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            formatter={(value: unknown, name: string) => {
              if (value === null || value === undefined) {
                return ['データなし', name === 'rank' ? '順位' : '的の大きさ'];
              }
              const numValue = typeof value === 'number' ? value : Number(value);
              if (name === 'rank') {
                return [`${numValue}位`, '順位'];
              }
              if (name === 'targetSize') {
                return [numValue.toFixed(1), '的の大きさ'];
              }
              return [numValue, name];
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
    </div>
  );
}
