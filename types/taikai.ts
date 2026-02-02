// Tournament Results Data Types

/**
 * Tournament Participant (Individual result entry)
 */
export interface TaikaiParticipant {
  id: string; // UUID (for React key and editing identification)
  rank: number; // Ranking (1, 2, 3...)
  name: string; // Participant name
  rankTitle: string; // Rank/Title (e.g., "初段", "二段", "三段")
  score1: number | ""; // First round score (empty string allowed during input)
  score2: number | ""; // Second round score (empty string allowed during input)
  totalScore: number; // Total score (score1 + score2, auto-calculated)
}

/**
 * Tournament Data
 */
export interface TaikaiData {
  year: number; // Year (2024, 2025, etc.)
  taikaiName: string; // Tournament name (e.g., "令和7年弓術大会")
  eventDate: string; // Event year (auto-generated from year, e.g., "2025年")
  participants: TaikaiParticipant[]; // Participants list
  publishedAt: string; // Publication datetime (ISO8601 format)
  updatedAt: string; // Last update datetime (ISO8601 format)
}

/**
 * Tournament Archive Metadata (for archive listing)
 */
export interface TaikaiArchiveMetadata {
  year: number; // Year
  taikaiName: string; // Tournament name
  participantCount: number; // Number of participants
  eventDate: string; // Event date
  publishedAt: string; // Publication datetime
}

/**
 * Tournament Archive Index (for overall management)
 */
export interface TaikaiArchiveIndex {
  archives: TaikaiArchiveMetadata[]; // Archive list
  lastUpdated: string; // Last update datetime (ISO8601 format)
}

/**
 * 個人の大会参加履歴エントリー
 */
export interface PersonTaikaiHistoryEntry {
  year: number; // 開催年
  taikaiName: string; // 大会名
  rank: number; // 順位（1-10位）
  score1: number | ""; // 1回目スコア
  score2: number | ""; // 2回目スコア
  totalScore: number; // 合計スコア
  rankTitle: string; // 段位
}

/**
 * 個人の大会参加履歴
 */
export interface PersonTaikaiHistory {
  name: string; // 参加者名
  history: PersonTaikaiHistoryEntry[]; // 参加履歴（年度降順）
}
