"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { PersonHistory } from '@/types/seiseki';

interface HistoryChartProps {
  personHistory: PersonHistory;
}

type ViewMode = 'all' | 'year';

export default function HistoryChart({ personHistory }: HistoryChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showHint, setShowHint] = useState(true);
  const chartRef = useRef<ReactECharts>(null);

  // ヒントを5秒後に自動で消す
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  // データを整形
  const chartData = useMemo(() => {
    return personHistory.history.map(h => ({
      period: `${h.year}/${String(h.month).padStart(2, '0')}`,
      rank: h.rank,
      targetSize: h.targetSizeNumeric,
      rankTitle: h.rankTitle,
      year: h.year,
      month: h.month,
    }));
  }, [personHistory.history]);

  // EChartsのオプション設定
  const option: EChartsOption = useMemo(() => {
    // 期間データ（X軸用）
    const periods = chartData.map(d => d.period);
    const ranks = chartData.map(d => d.rank);
    const targetSizes = chartData.map(d => d.targetSize);

    // 的のサイズの最大値を計算（null値を除外）
    const validTargetSizes = targetSizes.filter((size): size is number => size !== null);
    const maxTargetSize = validTargetSizes.length > 0 ? Math.max(...validTargetSizes) : 10;

    // dataZoomの設定（パン/ズーム機能）
    const dataZoomConfig = viewMode === 'year'
      ? [
          {
            type: 'slider', // スライダー
            xAxisIndex: 0,
            start: Math.max(0, ((chartData.length - 12) / chartData.length) * 100), // 直近12ヶ月
            end: 100,
            height: 30,
            bottom: 10,
            handleSize: '120%',
            textStyle: {
              fontSize: 10,
            },
            brushSelect: false, // ブラシ選択無効化
          },
          {
            type: 'inside', // グラフ内でのドラッグ/ピンチ
            xAxisIndex: 0,
            start: Math.max(0, ((chartData.length - 12) / chartData.length) * 100),
            end: 100,
            zoomOnMouseWheel: true, // マウスホイールでズーム
            moveOnMouseMove: false, // マウス移動では動かない
            moveOnMouseWheel: false, // マウスホイールでは移動しない
            preventDefaultMouseMove: true, // デフォルトのマウス移動を防止
          },
        ]
      : [];

    return {
      // グリッド設定
      grid: {
        top: 40,
        right: 100,
        bottom: viewMode === 'year' ? 100 : 80,
        left: 80,
        containLabel: true,
      },

      // ツールチップ
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross', // 十字カーソル
          crossStyle: {
            color: '#999',
          },
        },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const period = params[0].axisValue;
          let result = `<strong>${period}</strong><br/>`;

          params.forEach((param: any) => {
            if (param.seriesName === '順位') {
              result += `${param.marker} 順位: ${param.value}位<br/>`;
            } else if (param.seriesName === '的の大きさ') {
              result += `${param.marker} 的の大きさ: ${param.value ?? 'データなし'}<br/>`;
            }
          });

          return result;
        },
      },

      // 凡例
      legend: {
        data: ['順位', '的の大きさ'],
        top: 10,
      },

      // X軸（期間）
      xAxis: {
        type: 'category',
        data: periods,
        axisLabel: {
          rotate: 45,
          fontSize: 11,
        },
        axisPointer: {
          type: 'shadow',
        },
      },

      // Y軸（左）: 順位（1位が上）
      yAxis: [
        {
          type: 'value',
          name: '順位',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            fontSize: 14,
            fontWeight: 'normal',
          },
          min: 1,
          max: 11,
          inverse: true, // 反転（1位が上）
          axisLabel: {
            formatter: (value: number) => value === 11 ? '圏外' : `${value}位`,
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        // Y軸（右）: 的の大きさ（小さい値が上）
        {
          type: 'value',
          name: '的の大きさ',
          nameLocation: 'middle',
          nameGap: 50,
          nameTextStyle: {
            fontSize: 14,
            fontWeight: 'normal',
          },
          min: 'dataMin',
          max: maxTargetSize,
          inverse: true, // 反転（小さい値が上）
          axisLabel: {
            fontSize: 11,
          },
          splitLine: {
            show: false,
          },
        },
      ],

      // データ系列
      series: [
        {
          name: '順位',
          type: 'line',
          yAxisIndex: 0,
          data: ranks,
          lineStyle: {
            color: '#8B0000',
            width: 2,
          },
          itemStyle: {
            color: '#8B0000',
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: false,
        },
        {
          name: '的の大きさ',
          type: 'line',
          yAxisIndex: 1,
          data: targetSizes,
          lineStyle: {
            color: '#4A90E2',
            width: 2,
          },
          itemStyle: {
            color: '#4A90E2',
          },
          symbol: 'circle',
          symbolSize: 6,
          smooth: false,
        },
      ],

      // dataZoom（パン/ズーム）
      dataZoom: dataZoomConfig,

      // アニメーション設定
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut',
    };
  }, [chartData, viewMode]);

  return (
    <div className="w-full space-y-4">
      {/* 期間選択トグルボタン */}
      <div className="flex justify-center items-center gap-4">
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('all')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            全期間
          </button>
          <button
            onClick={() => setViewMode('year')}
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

      {/* 操作ヒント（初回のみ表示） */}
      {viewMode === 'year' && showHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 text-center">
          <p className="font-medium">💡 操作方法</p>
          <p className="text-xs mt-1">
            グラフ上で左右にスワイプ/ドラッグで期間移動 | ピンチ/ホイールでズーム | スライダーでも操作可能
          </p>
          <button
            onClick={() => setShowHint(false)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-2 underline"
          >
            閉じる
          </button>
        </div>
      )}

      {/* グラフ */}
      <div className="w-full">
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: '550px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
          lazyUpdate={false}
        />
      </div>
    </div>
  );
}
