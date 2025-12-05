// 成績データの型定義

/**
 * 成績エントリー（個人の成績1件分）
 */
export interface SeisekiEntry {
  id: string;              // UUID (React key、編集時の識別子として使用)
  rank: number;            // 順位 (1, 2, 3...)
  name: string;            // 選手名
  rankTitle: string;       // 段位・称号 (例: "初段", "二段", "教士")
  targetSize: string;      // 的の大きさ (例: "1寸2分", "1寸3分")
  updatedDate: string;     // 更新日 (例: "2025年11月26日") ※年月日を含む
  expiryDate: string;      // 有効期限 (例: "2025年2月25日") ※年月日を含む
  isEmpty?: boolean;       // 空エントリーフラグ（10件未満の場合に「該当なし」で埋めるため）
}

/**
 * 月次成績データ
 */
export interface SeisekiMonth {
  year: number;            // 年 (2025)
  month: number;           // 月 (1-12)
  entries: SeisekiEntry[]; // 成績データ配列
  publishedAt: string;     // 公開日時 (ISO8601形式)
  updatedAt: string;       // 更新日時 (ISO8601形式)
}

/**
 * アーカイブメタデータ（一覧表示用）
 */
export interface ArchiveMetadata {
  year: number;            // 年
  month: number;           // 月
  entryCount: number;      // エントリー数
  publishedAt: string;     // 公開日時
}

/**
 * アーカイブインデックス（全体管理用）
 */
export interface ArchiveIndex {
  archives: ArchiveMetadata[];  // アーカイブ一覧
  lastUpdated: string;          // 最終更新日時 (ISO8601形式)
}

/**
 * 年別の全月データ（統合ページ用）
 */
export interface YearSeisekiData {
  year: number;
  months: SeisekiMonth[];  // その年のデータがある月のみ
}

/**
 * タブID（統合ページ用）
 */
export type SeisekiTabId = "seiseki" | "taikai";

/**
 * タブ定義（統合ページ用）
 */
export interface SeisekiTab {
  id: SeisekiTabId;
  label: string;
}
