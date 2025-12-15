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
