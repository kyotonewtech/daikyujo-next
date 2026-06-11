// クライアント・サーバー両用のエントリーユーティリティ
// lib/seiseki.ts は Node.js の fs を使うため別ファイルに分離
import type { SeisekiEntry } from "@/types/seiseki";

/** 空エントリーを生成（10件未満の場合に埋めるため） */
export function createEmptyEntry(rank: number): SeisekiEntry {
  return {
    id: `empty-${rank}`,
    personId: "",
    rank,
    name: "該当なし",
    rankTitle: "",
    targetSize: "-",
    updatedDate: "",
    expiryDate: "",
    isEmpty: true,
  };
}

/** エントリーを10件に揃える */
export function padEntriesToTen(entries: SeisekiEntry[]): SeisekiEntry[] {
  if (entries.length >= 10) return entries.slice(0, 10);

  const padded = [...entries];
  for (let i = entries.length; i < 10; i++) {
    padded.push(createEmptyEntry(i + 1));
  }
  return padded;
}
