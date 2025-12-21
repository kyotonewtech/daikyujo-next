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
  const [panOffset, setPanOffset] = useState(0); // px単位のオフセット
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragStartOffset = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const isHorizontalSwipe = useRef<boolean>(false);

  // 定数: 1ヶ月あたりの幅（レスポンシブ対応）
  const MONTH_WIDTH_MOBILE = 80;
  const MONTH_WIDTH_TABLET = 70;
  const MONTH_WIDTH_DESKTOP = 60;
  const VISIBLE_MONTHS = 12;

  // グラフ用にデータを整形
  const allChartData = personHistory.history.map(h => ({
    period: `${h.year}/${String(h.month).padStart(2, '0')}`,
    rank: h.rank,
    targetSize: h.targetSizeNumeric,
    rankTitle: h.rankTitle,
  }));

  const totalMonths = allChartData.length;

  // レスポンシブ: デフォルトはデスクトップ幅を使用
  const MONTH_WIDTH = MONTH_WIDTH_DESKTOP;
  const totalWidth = totalMonths * MONTH_WIDTH;
  const visibleWidth = VISIBLE_MONTHS * MONTH_WIDTH;
  const maxPanOffset = -(totalWidth - visibleWidth);

  // 全データの的のサイズの最大値を計算（1年表示でもY軸が変わらないように）
  const maxTargetSize = Math.max(
    ...allChartData
      .map(d => d.targetSize)
      .filter((size): size is number => size !== null),
    0
  );

  // 表示期間のラベルを取得（panOffsetから逆算）
  const getPeriodLabel = () => {
    if (viewMode === 'all' || allChartData.length === 0) return '';

    const startMonthIndex = Math.max(0, Math.floor(-panOffset / MONTH_WIDTH));
    const endMonthIndex = Math.min(startMonthIndex + VISIBLE_MONTHS, totalMonths);

    const startPeriod = allChartData[startMonthIndex]?.period || '';
    const endPeriod = allChartData[endMonthIndex - 1]?.period || '';

    return `${startPeriod} 〜 ${endPeriod}`;
  };

  // リアルタイムパンハンドラー
  const handleTouchStart = (e: React.TouchEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartOffset.current = panOffset;
    isDragging.current = true;
    isHorizontalSwipe.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (viewMode !== 'year' || !isDragging.current || touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // 初回の移動で横スワイプか縦スワイプか判定
    if (!isHorizontalSwipe.current && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
    }

    // 横スワイプの場合のみパン
    if (isHorizontalSwipe.current) {
      e.preventDefault(); // 横スワイプ時のみスクロール防止
      const newOffset = Math.max(maxPanOffset, Math.min(0, dragStartOffset.current + diffX));
      setPanOffset(newOffset);
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
  };

  // マウスドラッグ対応
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.clientX;
    dragStartOffset.current = panOffset;
    isDragging.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (viewMode !== 'year' || !isDragging.current || touchStartX.current === null) return;

    const currentX = e.clientX;
    const diff = currentX - touchStartX.current;

    const newOffset = Math.max(maxPanOffset, Math.min(0, dragStartOffset.current + diff));
    setPanOffset(newOffset);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    touchStartX.current = null;
  };

  // 表示モード変更時にオフセットをリセット
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'year') {
      setPanOffset(maxPanOffset); // 直近12ヶ月を表示
    }
  };

  // 全期間モード用のResponsive Container
  if (viewMode === 'all') {
    return (
      <div className="w-full space-y-4">
        {/* 期間選択トグルボタン */}
        <div className="flex justify-center items-center gap-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('all')}
              className="px-6 py-2 rounded-md font-medium bg-white text-accent shadow-sm"
            >
              全期間
            </button>
            <button
              onClick={() => handleViewModeChange('year')}
              className="px-6 py-2 rounded-md font-medium text-gray-600 hover:text-gray-800"
            >
              1年
            </button>
          </div>
        </div>

        {/* 全期間グラフ（ResponsiveContainer使用） */}
        <div className="w-full h-[60vh] min-h-[400px] max-h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={allChartData}
              margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
            >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />

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
              tickFormatter={(value) => `${Number(value).toFixed(1)}寸`}
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

            <Line
              yAxisId="rank"
              type="monotone"
              dataKey="rank"
              stroke="#8B0000"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="rank"
            />

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

  // 1年モード: パン可能なグラフ
  return (
    <div className="w-full space-y-4">
      {/* 期間選択トグルボタン */}
      <div className="flex justify-center items-center gap-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewModeChange('all')}
            className="px-6 py-2 rounded-md font-medium text-gray-600 hover:text-gray-800"
          >
            全期間
          </button>
          <button
            onClick={() => handleViewModeChange('year')}
            className="px-6 py-2 rounded-md font-medium bg-white text-accent shadow-sm"
          >
            1年
          </button>
        </div>
      </div>

      {/* 期間ラベル */}
      <div className="text-center text-sm text-gray-700 font-medium">
        {getPeriodLabel()}
      </div>

      {/* パン可能なグラフ（Y軸固定） */}
      <div
        className="w-full select-none"
        style={{
          position: 'relative',
          height: 'clamp(400px, 60vh, 600px)',
        }}
      >
        {/* Y軸を常に表示するため、overflowはdata領域のみに適用 */}
        <div style={{ position: 'relative', height: '100%', paddingLeft: 60, paddingRight: 80 }}>
          <div
            className="cursor-grab active:cursor-grabbing"
            style={{
              height: '100%',
              overflowX: 'hidden',
              overflowY: 'hidden',
              position: 'relative',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `translateX(${panOffset}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.2s ease-out',
                width: totalWidth,
                willChange: 'transform',
                marginLeft: -60,
              }}
            >
          <ComposedChart
            data={allChartData}
            width={totalWidth}
            height={500}
            margin={{ top: 20, right: 80, bottom: 80, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 11 }}
              interval={2} // 3ヶ月ごとにラベル表示
            />

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
              tickFormatter={(value) => `${Number(value).toFixed(1)}寸`}
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

            <Line
              yAxisId="rank"
              type="monotone"
              dataKey="rank"
              stroke="#8B0000"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="rank"
              isAnimationActive={false}
            />

            <Line
              yAxisId="size"
              type="monotone"
              dataKey="targetSize"
              stroke="#4A90E2"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="targetSize"
              isAnimationActive={false}
            />
          </ComposedChart>
          </div>
        </div>
        </div>
      </div>

      {/* 操作ヒント */}
      <div className="text-center text-xs text-gray-500">
        グラフをドラッグ/スワイプして期間を移動できます
      </div>
    </div>
  );
}
