/**
 * 的のサイズ文字列を数値に変換（寸単位）
 * 分は寸の1/10として計算
 * @param targetSize - 的のサイズ文字列（例: "1寸2分"）
 * @returns 寸単位の数値（例: 1.2）、変換できない場合はnull
 * @example
 * parseTargetSize("1寸2分") // => 1.2
 * parseTargetSize("2寸4分") // => 2.4
 * parseTargetSize("1寸") // => 1.0
 * parseTargetSize("8分") // => 0.8
 * parseTargetSize("-") // => null
 */
export function parseTargetSize(targetSize: string): number | null {
  // "1寸2分" → 1.2寸
  const match = targetSize.match(/(\d+)寸(\d+)分/);
  if (match) {
    const sun = parseInt(match[1], 10);
    const bu = parseInt(match[2], 10);
    return sun + bu * 0.1;
  }

  // "1寸" → 1.0寸
  const singleMatch = targetSize.match(/(\d+)寸/);
  if (singleMatch) {
    return parseInt(singleMatch[1], 10);
  }

  // "8分" → 0.8寸（寸なし）
  const buOnlyMatch = targetSize.match(/^(\d+)分$/);
  if (buOnlyMatch) {
    return parseInt(buOnlyMatch[1], 10) * 0.1;
  }

  return null;
}

/**
 * 的のサイズ数値を文字列に変換（寸・分単位）
 * @param value - 寸単位の数値（例: 0.9, 1.3）
 * @returns 単位付き文字列（例: "9分", "1寸3分"）
 * @example
 * formatTargetSize(0.9) // => "9分"
 * formatTargetSize(1.0) // => "1寸"
 * formatTargetSize(1.3) // => "1寸3分"
 */
export function formatTargetSize(value: number): string {
  const sun = Math.floor(value);
  const bu = Math.round((value - sun) * 10);
  if (sun === 0) return `${bu}分`;
  if (bu === 0) return `${sun}寸`;
  return `${sun}寸${bu}分`;
}
