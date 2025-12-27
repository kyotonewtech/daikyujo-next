"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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

export type ViewMode = 'all' | 'year';

interface HistoryChartProps {
  personHistory: PersonHistory;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
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
  fontSize?: number;
}

// 定数: Y軸ラベル配置
const MAX_LABEL_OFFSET = 18;
const LABEL_OFFSET_RATIO = 1.4;
const LINE_HEIGHT_MARGIN = 2;

const VerticalLabel = ({ viewBox, fill, text, position, fontSize = 14 }: VerticalLabelProps) => {
  if (!viewBox) return null;

  const chars = text.split('');
  const lineHeight = fontSize + LINE_HEIGHT_MARGIN;

  // Y軸の中央位置を計算
  const centerY = viewBox.y + viewBox.height / 2;
  const startY = centerY - ((chars.length - 1) * lineHeight) / 2;

  // X座標を計算（フォントサイズに応じて調整）
  const xOffset = Math.min(MAX_LABEL_OFFSET, fontSize * LABEL_OFFSET_RATIO);
  let finalX: number;
  if (position === 'left') {
    // 左側Y軸: viewBoxの左端から右に調整
    finalX = viewBox.x + xOffset;
  } else {
    // 右側Y軸: viewBoxの右端から左に調整
    finalX = viewBox.x + viewBox.width - xOffset;
  }

  return (
    <text
      x={finalX}
      y={startY}
      fill={fill}
      textAnchor="middle"
      style={{ fontSize, fontWeight: 'normal' }}
    >
      {chars.map((char, i) => (
        <tspan key={i} x={finalX} dy={i === 0 ? 0 : lineHeight}>
          {char}
        </tspan>
      ))}
    </text>
  );
};

export default function HistoryChart({ personHistory, viewMode, onViewModeChange }: HistoryChartProps) {
  const [panOffset, setPanOffset] = useState(0); // px単位のオフセット
  const [maxPanOffset, setMaxPanOffset] = useState(0); // 最大パンオフセット
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0); // Y軸固定表示用のコンテナ幅
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragStartOffset = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const isHorizontalSwipe = useRef<boolean>(false);

  // 画面方向・サイズ検知
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerHeight < window.innerWidth && window.innerHeight < 500;
      const isMobilePortraitMode = window.innerWidth < 640 && window.innerHeight > window.innerWidth;

      setIsLandscape(isLandscapeMode);
      setIsMobilePortrait(isMobilePortraitMode);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // 定数: 表示月数
  const VISIBLE_MONTHS = 12;

  // レスポンシブMONTH_WIDTH設定（12ヶ月が画面に収まるように調整）
  const monthWidth = useMemo(() => {
    if (isMobilePortrait) {
      // スマホ縦画面: 画面幅から左右マージン(18+28=46px)を引いた幅を12で割る
      const availableWidth = window.innerWidth - 46;
      return Math.max(30, Math.floor(availableWidth / VISIBLE_MONTHS));
    }
    if (isLandscape) {
      // 横画面: 画面幅から左右マージン(35+45=80px)を引いた幅を12で割る
      const availableWidth = window.innerWidth - 80;
      return Math.max(40, Math.floor(availableWidth / VISIBLE_MONTHS));
    }
    return 60; // デスクトップは固定
  }, [isMobilePortrait, isLandscape]);

  // グラフ用にデータを整形
  const allChartData = useMemo(() =>
    personHistory.history.map(h => ({
      period: `${h.year}/${String(h.month).padStart(2, '0')}`,
      rank: h.rank,
      targetSize: h.targetSizeNumeric,
      rankTitle: h.rankTitle,
    })),
    [personHistory.history]
  );

  const totalMonths = allChartData.length;
  const totalWidth = totalMonths * monthWidth;

  // 全データの的のサイズの最大値を計算（1年表示でもY軸が変わらないように）
  const maxTargetSize = useMemo(() =>
    allChartData.reduce((max, d) => {
      return d.targetSize !== null && d.targetSize > max ? d.targetSize : max;
    }, 0),
    [allChartData]
  );

  // レスポンシブmargin設定（useMemoでメモ化）
  const chartMargin = useMemo(() => {
    if (isMobilePortrait) {
      return { top: 15, right: 28, bottom: 45, left: 18 };
    }
    if (isLandscape) {
      return { top: 10, right: 45, bottom: 50, left: 35 };
    }
    return { top: 20, right: 50, bottom: 80, left: 40 };
  }, [isMobilePortrait, isLandscape]);

  // レスポンシブフォントサイズ設定（useMemoでメモ化）
  const labelFontSize = useMemo(() => isMobilePortrait ? 10 : 12, [isMobilePortrait]);
  const tickFontSize = useMemo(() => isMobilePortrait ? 8 : 10, [isMobilePortrait]);

  // 表示期間のラベルを取得（panOffsetから逆算）
  const getPeriodLabel = () => {
    if (viewMode === 'all' || allChartData.length === 0) return '';

    const startMonthIndex = Math.max(0, Math.floor(-panOffset / monthWidth));
    const endMonthIndex = Math.min(startMonthIndex + VISIBLE_MONTHS, totalMonths);

    const startPeriod = allChartData[startMonthIndex]?.period || '';
    const endPeriod = allChartData[endMonthIndex - 1]?.period || '';

    return `${startPeriod} 〜 ${endPeriod}`;
  };

  // 共通のパンオフセット更新関数
  const updatePanOffset = useCallback((clientX: number) => {
    if (touchStartX.current === null) return;
    const diff = clientX - touchStartX.current;
    const newOffset = Math.max(maxPanOffset, Math.min(0, dragStartOffset.current + diff));
    setPanOffset(newOffset);
  }, [maxPanOffset]);

  // リアルタイムパンハンドラー
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartOffset.current = panOffset;
    isDragging.current = true;
    isHorizontalSwipe.current = false;
  }, [viewMode, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
      e.preventDefault();
      updatePanOffset(currentX);
    }
  }, [viewMode, updatePanOffset]);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
  }, []);

  // マウスドラッグ対応
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.clientX;
    dragStartOffset.current = panOffset;
    isDragging.current = true;
  }, [viewMode, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'year' || !isDragging.current) return;
    updatePanOffset(e.clientX);
  }, [viewMode, updatePanOffset]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    touchStartX.current = null;
  }, []);

  // 実際の表示領域幅を取得してmaxPanOffsetを計算
  useEffect(() => {
    if (viewMode !== 'year') {
      setMaxPanOffset(0);
      setContainerWidth(0);
      return;
    }

    const updateMaxPanOffset = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        const calculatedMaxPanOffset = -(totalWidth - width);
        setMaxPanOffset(calculatedMaxPanOffset);
      }
    };

    // DOMが完全にレンダリングされた後に実行
    const timer = setTimeout(updateMaxPanOffset, 0);
    window.addEventListener('resize', updateMaxPanOffset);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateMaxPanOffset);
    };
  }, [totalWidth, viewMode, isMobilePortrait, isLandscape]);

  // 表示モード変更時にオフセットをリセット
  useEffect(() => {
    if (viewMode === 'year' && maxPanOffset < 0) {
      setPanOffset(maxPanOffset); // 直近データを表示
    } else if (viewMode === 'all') {
      setPanOffset(0);
    }
  }, [viewMode, maxPanOffset]);

  // 全期間モード用のResponsive Container
  if (viewMode === 'all') {
    return (
      <div className="w-full">
        {/* 全期間グラフ（ResponsiveContainer使用） */}
        <div className="w-full h-[60vh] min-h-[400px] max-h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={allChartData}
              margin={chartMargin}
            >
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="period"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: tickFontSize }}
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
                  fontSize={labelFontSize}
                />
              )}
              tick={{ fontSize: tickFontSize }}
              tickFormatter={(value) => value === 11 ? '圏外' : `${value}位`}
            />

            <YAxis
              yAxisId="size"
              orientation="right"
              domain={[0, maxTargetSize]}
              label={(props) => (
                <VerticalLabel
                  {...props}
                  fill="#4A90E2"
                  text="的の大きさ"
                  position="right"
                  fontSize={labelFontSize}
                />
              )}
              tick={{ fontSize: tickFontSize }}
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
  const graphHeight = isLandscape
    ? 'clamp(250px, 45vh, 350px)'
    : 'clamp(400px, 60vh, 600px)';

  // グラフの実際のheight（数値）
  const chartHeight = isLandscape ? 300 : 500;

  return (
    <div className="w-full space-y-2">
      {/* 期間ラベル */}
      <div className="text-center text-sm text-gray-700 font-medium">
        {getPeriodLabel()}
      </div>

      {/* パン可能なグラフ（Y軸固定） */}
      <div
        className="w-full select-none"
        style={{
          position: 'relative',
          height: graphHeight,
          paddingLeft: chartMargin.left,
          paddingRight: chartMargin.right,
        }}
      >
        {/* 固定Y軸背景層（スワイプしても動かない） */}
        {containerWidth > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <svg width="100%" height={chartHeight}>
              {/* 左Y軸エリア (順位: reversed, 1位=上, 11位=下) */}
              <g transform={`translate(0, ${chartMargin.top})`}>
                {Array.from({ length: 11 }, (_, i) => i + 1).map((value) => {
                  const chartAreaHeight = chartHeight - chartMargin.top - chartMargin.bottom;
                  // reversedなので: 1位=top(0%), 11位=bottom(100%)
                  const y = ((value - 1) / 10) * chartAreaHeight;
                  return (
                    <text
                      key={value}
                      x={chartMargin.left - 5}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={tickFontSize}
                      fill="#666"
                    >
                      {value === 11 ? '圏外' : `${value}位`}
                    </text>
                  );
                })}
                {/* Y軸線 */}
                <line
                  x1={chartMargin.left}
                  y1={0}
                  x2={chartMargin.left}
                  y2={chartHeight - chartMargin.top - chartMargin.bottom}
                  stroke="#ccc"
                  strokeWidth={1}
                />
              </g>

              {/* 右Y軸エリア (的の大きさ: 小さい方が上) */}
              <g transform={`translate(${containerWidth + chartMargin.left}, ${chartMargin.top})`}>
                {(() => {
                  const chartAreaHeight = chartHeight - chartMargin.top - chartMargin.bottom;
                  const ticks = [];
                  const step = maxTargetSize > 3 ? 0.5 : 0.2;
                  for (let v = 0; v <= maxTargetSize; v += step) {
                    ticks.push(v);
                  }
                  return ticks.map((value, index) => {
                    // 小さい値が上: 0=top(0%), maxTargetSize=bottom(100%)
                    const y = (value / maxTargetSize) * chartAreaHeight;
                    return (
                      <text
                        key={index}
                        x={5}
                        y={y}
                        textAnchor="start"
                        dominantBaseline="middle"
                        fontSize={tickFontSize}
                        fill="#666"
                      >
                        {value.toFixed(1)}寸
                      </text>
                    );
                  });
                })()}
                {/* Y軸線 */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={chartHeight - chartMargin.top - chartMargin.bottom}
                  stroke="#ccc"
                  strokeWidth={1}
                />
              </g>
            </svg>
          </div>
        )}

        {/* スクロール可能なデータ層 */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            left: chartMargin.left,
            right: chartMargin.right,
            top: 0,
            bottom: 0,
            overflow: 'hidden',
            zIndex: 5,
          }}
        >
          <div
            className="cursor-grab active:cursor-grabbing"
            style={{
              height: '100%',
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
                background: 'rgba(255, 255, 255, 0.01)',
              }}
            >
              <ComposedChart
                data={allChartData}
                width={totalWidth}
                height={chartHeight}
                margin={chartMargin}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="period"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: tickFontSize }}
                  interval={2}
                />

                {/* Y軸は座標系のみ使用、表示は固定層で行う */}
                <YAxis
                  yAxisId="rank"
                  domain={[1, 11]}
                  reversed
                  axisLine={false}
                  tick={false}
                />

                <YAxis
                  yAxisId="size"
                  orientation="right"
                  domain={[0, maxTargetSize]}
                  reversed
                  axisLine={false}
                  tick={false}
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
