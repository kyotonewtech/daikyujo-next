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

// 定数: グラフの固定値
const TARGET_SIZE_MAX = 3.0;
const RANK_PADDING = 0.5; // dotの見切れ防止のための余白定数
const RANK_MAX = 11;

// 定数: X軸ラベル表示エリアの高さ（plot areaには影響させない）
const X_AXIS_LABEL_AREA_HEIGHT = 100;

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

export default function HistoryChart({ personHistory, viewMode }: HistoryChartProps) {
  const [panOffset, setPanOffset] = useState(0); // px単位のオフセット
  const [maxPanOffset, setMaxPanOffset] = useState(0); // 最大パンオフセット
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);
  const [containerWidth, setContainerWidth] = useState(typeof window !== 'undefined' ? window.innerWidth - 100 : 300); // Y軸固定表示用のコンテナ幅（初期推定値）
  const [isDragging, setIsDragging] = useState(false); // ドラッグ中フラグ（レンダリングに使用）
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const dragStartOffset = useRef<number>(0);
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

  // 的の大きさの最小値・最大値を計算（順位1位と最小的サイズが同じ高さになるように調整）
  const targetSizeRange = useMemo(() => {
    const sizes = allChartData
      .map(d => d.targetSize)
      .filter((size): size is number => size !== null && size !== undefined);

    if (sizes.length === 0) {
      return { min: 0, max: TARGET_SIZE_MAX };
    }

    const minTargetSize = Math.min(...sizes);
    const maxTargetSize = Math.max(...sizes);

    // 順位のdomain範囲
    const rankDomainMin = 1 - RANK_PADDING; // 0.5
    const rankDomainMax = RANK_MAX + RANK_PADDING; // 11.5

    // 実際のデータから的サイズの変化率を計算
    // 最小的サイズを1位の位置に配置するため、データ範囲から単位あたりの変化率を算出
    const actualTargetRange = maxTargetSize - minTargetSize;
    const actualRankRange = RANK_MAX - 1; // 1位から11位までの範囲

    // 順位1単位あたりの的サイズの変化量
    const targetSizePerRankUnit = actualRankRange > 0
      ? actualTargetRange / actualRankRange
      : 0.3; // データが1つしかない場合のデフォルト値

    // 的の大きさのdomainを計算（1位の位置に最小的サイズが来るように調整）
    const calculatedMin = minTargetSize - (1 - rankDomainMin) * targetSizePerRankUnit;
    const calculatedMax = minTargetSize + (rankDomainMax - 1) * targetSizePerRankUnit;

    return {
      min: Math.max(0, calculatedMin),
      max: Math.min(TARGET_SIZE_MAX, calculatedMax)
    };
  }, [allChartData]);

  const totalMonths = allChartData.length;
  const totalWidth = totalMonths * monthWidth;

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
  const getPeriodLabel = useMemo(() => {
    if (viewMode === 'all' || allChartData.length === 0) return '';

    const startMonthIndex = Math.max(0, Math.floor(-panOffset / monthWidth));
    const endMonthIndex = Math.min(startMonthIndex + VISIBLE_MONTHS, totalMonths);

    const startPeriod = allChartData[startMonthIndex]?.period || '';
    const endPeriod = allChartData[endMonthIndex - 1]?.period || '';

    return `${startPeriod} 〜 ${endPeriod}`;
  }, [viewMode, allChartData, panOffset, monthWidth, VISIBLE_MONTHS, totalMonths]);

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
    setIsDragging(true);
    isHorizontalSwipe.current = false;
  }, [viewMode, panOffset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (viewMode !== 'year' || !isDragging || touchStartX.current === null || touchStartY.current === null) return;

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
  }, [viewMode, isDragging, updatePanOffset]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = false;
  }, []);

  // マウスドラッグ対応
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'year') return;
    touchStartX.current = e.clientX;
    dragStartOffset.current = panOffset;
    setIsDragging(true);
  }, [viewMode, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (viewMode !== 'year' || !isDragging) return;
    updatePanOffset(e.clientX);
  }, [viewMode, isDragging, updatePanOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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

  // グラフの実際のheight（数値）- 両モード共通
  const chartHeight = isLandscape ? 300 : 500;

  // 全期間モード: モーダル領域を最大限活用（1年モードより大きく）
  if (viewMode === 'all') {
    // 全期間グラフ用のマージン（左右0で最大領域を確保）
    const allPeriodMargin = { top: 20, right: 0, bottom: 80, left: 0 };
    // 全期間グラフは凡例・ヒント不要なので、より大きな高さを使用
    const allPeriodHeight = isLandscape ? 400 : 700;

    return (
      <div className="w-full">
        {/* 全期間グラフ（モーダル領域最大化、凡例なし） */}
        <div className="w-full" style={{ height: allPeriodHeight }}>
          <ComposedChart
            data={allChartData}
            width={typeof window !== 'undefined' ? window.innerWidth - 40 : 800}
            height={allPeriodHeight}
            margin={allPeriodMargin}
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
              domain={[() => 1 - RANK_PADDING, () => RANK_MAX + RANK_PADDING]}
              reversed
              allowDataOverflow={true}
              ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
              tick={{ fontSize: tickFontSize, fill: '#8B0000' }}
              tickFormatter={(value) => value === RANK_MAX ? '圏外' : `${value}位`}
              scale="linear"
              type="number"
            />

            <YAxis
              yAxisId="size"
              orientation="right"
              domain={[targetSizeRange.min, targetSizeRange.max]}
              reversed
              allowDataOverflow={true}
              tick={{ fontSize: tickFontSize, fill: '#4A90E2' }}
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
        </div>
      </div>
    );
  }

  // Rechartsのmargin設定（1年モード用）
  const rechartsMargin = { top: 20, right: 0, bottom: 0, left: 0 };

  // Rechartsのプロット領域の高さ
  // 重要: XAxis height は chartHeight の中から確保されるため、引く必要がある
  // plotAreaHeight = chartHeight - margin.top - margin.bottom - XAxis.height
  const plotAreaHeight = chartHeight - rechartsMargin.top - X_AXIS_LABEL_AREA_HEIGHT;

  // 1年モード: コンテナ高さ（chartHeightにはXAxisが含まれているのでそのまま使用）
  const containerHeight = chartHeight;

  return (
    <div className="w-full space-y-2">
      {/* 期間ラベル */}
      <div className="text-center text-sm text-gray-700 font-medium">
        {getPeriodLabel}
      </div>

      {/* パン可能なグラフ（Y軸固定） */}
      <div
        className="w-full select-none"
        style={{
          position: 'relative',
          height: containerHeight,
          paddingLeft: chartMargin.left,
          paddingRight: chartMargin.right,
          overflow: 'visible',
        }}
      >
        {/* 固定Y軸背景層（スワイプしても動かない） */}
        {containerWidth > 100 && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 10,
              overflow: 'visible',
            }}
          >
            <svg width="100%" height={containerHeight} style={{ overflow: 'visible' }}>
              {/* 左Y軸エリア (順位: reversed, 1位=上, 11位=下) */}
              <g transform={`translate(0, ${rechartsMargin.top})`}>
                {Array.from({ length: RANK_MAX }, (_, i) => i + 1).map((value) => {
                  const chartAreaHeight = plotAreaHeight;
                  const domainMin = 1 - RANK_PADDING;
                  const domainMax = RANK_MAX + RANK_PADDING;
                  // reversedなので: 1位=top, 11位=bottom
                  const y = ((value - domainMin) / (domainMax - domainMin)) * chartAreaHeight;
                  return (
                    <text
                      key={value}
                      x={chartMargin.left - 5}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fontSize={tickFontSize}
                      fill="#8B0000"
                    >
                      {value === RANK_MAX ? '圏外' : `${value}位`}
                    </text>
                  );
                })}
                {/* Y軸線 */}
                <line
                  x1={chartMargin.left}
                  y1={0}
                  x2={chartMargin.left}
                  y2={plotAreaHeight}
                  stroke="#ccc"
                  strokeWidth={1}
                />
              </g>

              {/* 右Y軸エリア (的の大きさ: 人物ごとに可変、X軸は視覚的に底辺) */}
              <g transform={`translate(${containerWidth + chartMargin.left}, ${rechartsMargin.top})`}>
                {(() => {
                  const chartAreaHeight = plotAreaHeight;
                  const { min, max } = targetSizeRange;
                  const range = max - min;

                  // 人物の範囲でtickを生成（0.2寸刻み）
                  const ticks = [];
                  const tickInterval = 0.2;
                  for (let v = Math.floor(min / tickInterval) * tickInterval; v <= max; v += tickInterval) {
                    ticks.push(Number(v.toFixed(1)));
                  }

                  return ticks.map((value, index) => {
                    // 座標系は動的min〜max、小さい値が上（reversed）
                    const y = ((value - min) / range) * chartAreaHeight;
                    return (
                      <text
                        key={index}
                        x={5}
                        y={y}
                        textAnchor="start"
                        dominantBaseline="middle"
                        fontSize={tickFontSize}
                        fill="#4A90E2"
                      >
                        {value.toFixed(1)}寸
                      </text>
                    );
                  });
                })()}
                {/* Y軸線（全範囲） */}
                <line
                  x1={0}
                  y1={0}
                  x2={0}
                  y2={plotAreaHeight}
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
            height: containerHeight,
            overflowX: 'hidden',
            overflowY: 'visible',
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
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                width: totalWidth,
                willChange: 'transform',
                background: 'rgba(255, 255, 255, 0.01)',
              }}
            >
              <ComposedChart
                data={allChartData}
                width={totalWidth}
                height={chartHeight}
                margin={rechartsMargin}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="period"
                  angle={-45}
                  textAnchor="end"
                  height={X_AXIS_LABEL_AREA_HEIGHT}
                  tick={{ fontSize: tickFontSize, dy: 5 }}
                  interval={2}
                  tickLine={{ transform: 'translate(0, 0)' }}
                />

                {/* Y軸は座標系のみ使用、表示は固定層で行う */}
                <YAxis
                  yAxisId="rank"
                  domain={[() => 1 - RANK_PADDING, () => RANK_MAX + RANK_PADDING]}
                  reversed
                  allowDataOverflow={true}
                  axisLine={false}
                  tick={false}
                  scale="linear"
                  type="number"
                />

                <YAxis
                  yAxisId="size"
                  orientation="right"
                  domain={[targetSizeRange.min, targetSizeRange.max]}
                  reversed
                  allowDataOverflow={true}
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

                {/* Legendはplot areaに影響させないため外部に移動 */}

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
