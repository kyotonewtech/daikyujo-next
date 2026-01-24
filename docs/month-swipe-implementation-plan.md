# 月ごとの通常成績スワイプ切り替え実装計画

## 要件まとめ

### 基本仕様
- **表示形式**: カルーセル形式（1度に1ヶ月だけ表示）
- **スワイプ動作**: 左右スワイプで月を切り替え
  - 左スワイプ: 次の月（11月→10月）
  - 右スワイプ: 前の月（10月→11月）
- **年をまたぐ**: 同じ年内のみ（2025年1月で止まる）
- **対応デバイス**: モバイルのみスワイプ対応
- **アニメーション**: 横スライド

### UI構成
- **年選択**: 既存のドロップダウン（変更なし）
- **月選択**: 新規ドロップダウン追加
- **初期表示**: 選択された年の最新月
- **インジケーター**: 不要

## アーキテクチャ

### コンポーネント構成
```
SeisekiTabContent.tsx（既存 - 修正）
├── 年選択ドロップダウン（既存）
├── 月選択ドロップダウン（新規）
└── MonthCarousel.tsx（新規コンポーネント）
    ├── スワイプジェスチャー検出
    ├── 横スライドアニメーション
    └── SeisekiCard グリッド表示
```

### 技術スタック
- **アニメーション**: Framer Motion
  - `motion.div` with `drag` または `AnimatePresence` + `motion.div`
  - `variants` でアニメーション定義
- **スワイプ検出**:
  - Framer Motion の `onDragEnd` または
  - タッチイベント（`touchstart`, `touchmove`, `touchend`）
- **レスポンシブ**:
  - Tailwind の `md:` ブレークポイント
  - モバイル: カルーセル
  - デスクトップ: 従来の表示（または月選択のみ）

## データ構造

### State 管理
```typescript
// SeisekiTabContent.tsx
const [selectedYear, setSelectedYear] = useState<number>(availableYears[0]);
const [selectedMonth, setSelectedMonth] = useState<number>(latestMonth); // 新規
const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0); // 新規

// monthsData は降順（12月→1月）でソート済み
const monthsData = yearDataMap.get(selectedYear) || [];
```

### データフロー
```
1. 年選択 → monthsData更新 → 最新月を初期表示
2. 月選択 → currentMonthIndex更新 → カルーセル移動
3. スワイプ → currentMonthIndex更新 → カルーセル移動
```

## 実装ステップ

### Phase 1: MonthCarousel コンポーネント作成

**ファイル**: `/components/seiseki/MonthCarousel.tsx`

**Props**:
```typescript
interface MonthCarouselProps {
  monthsData: SeisekiMonth[];
  currentMonthIndex: number;
  onMonthChange: (index: number) => void;
  latestYear: number | null;
  latestMonth: number | null;
  selectedYear: number;
  onCardClick: (personId: string) => void;
}
```

**機能**:
- タッチイベントでスワイプ検出
- 閾値（例: 50px）を超えたら月を切り替え
- 境界チェック（インデックス 0 〜 monthsData.length - 1）
- 横スライドアニメーション（300ms）
- アニメーション中はスワイプ無効

**実装方法（2つの選択肢）**:

#### オプションA: Framer Motion Drag
```typescript
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(event, info) => {
    const threshold = 50;
    if (info.offset.x > threshold && currentMonthIndex > 0) {
      onMonthChange(currentMonthIndex - 1); // 右スワイプ
    } else if (info.offset.x < -threshold && currentMonthIndex < monthsData.length - 1) {
      onMonthChange(currentMonthIndex + 1); // 左スワイプ
    }
  }}
>
  {/* コンテンツ */}
</motion.div>
```

#### オプションB: AnimatePresence（推奨）
```typescript
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentMonthIndex}
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ duration: 0.3 }}
  >
    {/* コンテンツ */}
  </motion.div>
</AnimatePresence>

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};
```

### Phase 2: SeisekiTabContent の修正

**変更点**:
1. **月選択ドロップダウン追加**
```typescript
<div className="mb-8 flex flex-col md:flex-row justify-center gap-4">
  {/* 年選択（既存） */}
  <select value={selectedYear} onChange={handleYearChange}>
    {/* ... */}
  </select>

  {/* 月選択（新規） */}
  <select value={selectedMonth} onChange={handleMonthChange}>
    {availableMonths.map(month => (
      <option key={month} value={month}>{month}月</option>
    ))}
  </select>
</div>
```

2. **State 管理**
```typescript
const [selectedYear, setSelectedYear] = useState(availableYears[0]);
const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

// 年変更時の処理
const handleYearChange = (year: number) => {
  setSelectedYear(year);
  const newMonthsData = yearDataMap.get(year) || [];
  // 最新月のインデックスを見つける
  const latestIndex = newMonthsData.findIndex(
    m => m.year === latestYear && m.month === latestMonth
  );
  setCurrentMonthIndex(latestIndex >= 0 ? latestIndex : 0);
};

// 月変更時の処理
const handleMonthChange = (month: number) => {
  const index = monthsData.findIndex(m => m.month === month);
  if (index >= 0) {
    setCurrentMonthIndex(index);
  }
};
```

3. **レスポンシブ表示**
```typescript
{/* モバイル: カルーセル */}
<div className="md:hidden">
  <MonthCarousel
    monthsData={monthsData}
    currentMonthIndex={currentMonthIndex}
    onMonthChange={setCurrentMonthIndex}
    latestYear={latestYear}
    latestMonth={latestMonth}
    selectedYear={selectedYear}
    onCardClick={handleCardClick}
  />
</div>

{/* デスクトップ: 従来の表示または選択された月のみ */}
<div className="hidden md:block">
  {/* 現在の実装を維持 or 月選択で1ヶ月のみ表示 */}
</div>
```

### Phase 3: スワイプジェスチャー実装

**タッチイベント処理**:
```typescript
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);
const [isAnimating, setIsAnimating] = useState(false);

const minSwipeDistance = 50;

const onTouchStart = (e: React.TouchEvent) => {
  if (isAnimating) return;
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e: React.TouchEvent) => {
  if (isAnimating) return;
  setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
  if (!touchStart || !touchEnd || isAnimating) return;

  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe && currentMonthIndex < monthsData.length - 1) {
    setIsAnimating(true);
    onMonthChange(currentMonthIndex + 1);
    setTimeout(() => setIsAnimating(false), 300);
  }

  if (isRightSwipe && currentMonthIndex > 0) {
    setIsAnimating(true);
    onMonthChange(currentMonthIndex - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }
};
```

### Phase 4: アニメーション実装

**横スライドアニメーション**:
```typescript
const [direction, setDirection] = useState(0);

const handleMonthChange = (newIndex: number) => {
  setDirection(newIndex > currentMonthIndex ? 1 : -1);
  setCurrentMonthIndex(newIndex);
  onMonthChange(newIndex);
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};
```

## デスクトップ表示オプション

### オプション1: 従来の表示維持
- デスクトップでは全ての月を縦スクロール表示
- 月選択ドロップダウンのみ追加（スワイプなし）

### オプション2: デスクトップもカルーセル
- 矢印ボタンで月切り替え
- マウスドラッグ対応

**推奨**: オプション1（シンプル、既存の動作を維持）

## エッジケース処理

### 1. 年変更時
- 新しい年の最新月にリセット
- 月選択ドロップダウンの選択肢を更新

### 2. データがない月
- 空の状態を表示
- スワイプは動作するが「データがありません」メッセージ

### 3. アニメーション中のスワイプ
- `isAnimating` フラグで制御
- アニメーション中は新しいスワイプを無視

### 4. 境界での動作
- 最初の月（12月）で右スワイプ → 何もしない
- 最後の月（1月 or データがある最後の月）で左スワイプ → 何もしない

## パフォーマンス最適化

### 1. メモ化
```typescript
const currentMonthData = useMemo(
  () => monthsData[currentMonthIndex],
  [monthsData, currentMonthIndex]
);
```

### 2. 仮想化（必要な場合）
- 大量のカードがある場合は仮想スクロール検討
- 現状は10件固定なので不要

### 3. アニメーションの最適化
- `transform` と `opacity` のみ使用（GPUアクセラレーション）
- `will-change: transform` を追加

## テスト項目

### 機能テスト
- [ ] 左スワイプで次の月に移動
- [ ] 右スワイプで前の月に移動
- [ ] 境界での動作（最初/最後の月）
- [ ] 月選択ドロップダウンで正しく移動
- [ ] 年変更時に最新月に移動
- [ ] アニメーション中のスワイプ無効化

### UI/UX テスト
- [ ] スワイプの閾値が適切（50px程度）
- [ ] アニメーションがスムーズ（300ms）
- [ ] デスクトップで従来の表示維持
- [ ] モバイルでカルーセル表示

### パフォーマンステスト
- [ ] 連続スワイプでも遅延なし
- [ ] メモリリークなし
- [ ] 60fps維持

## ファイル変更一覧

### 新規作成
- `/components/seiseki/MonthCarousel.tsx`

### 修正
- `/components/seiseki/SeisekiTabContent.tsx`
  - 月選択ドロップダウン追加
  - State 管理追加
  - レスポンシブ表示切り替え

### 影響なし
- `/app/seiseki/page.tsx`
- `/app/seiseki/SeisekiPageClient.tsx`
- `/components/seiseki/SeisekiCard.tsx`

## 実装優先度

1. **Phase 1**: MonthCarousel 基本実装（スワイプなし、月選択のみ）
2. **Phase 2**: タッチイベント + スワイプ検出
3. **Phase 3**: アニメーション追加
4. **Phase 4**: エッジケース処理
5. **Phase 5**: パフォーマンス最適化

## 参考資料

- Framer Motion ドキュメント: https://www.framer.com/motion/
- AnimatePresence: https://www.framer.com/motion/animate-presence/
- Drag gestures: https://www.framer.com/motion/gestures/#drag
