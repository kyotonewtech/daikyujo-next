import fs from 'fs';
import path from 'path';
import type { TaikaiData, TaikaiArchiveIndex, TaikaiArchiveMetadata, PersonTaikaiHistory, PersonTaikaiHistoryEntry } from '@/types/taikai';

const DATA_DIR = path.join(process.cwd(), 'data', 'taikai');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

/**
 * Validate year (path traversal protection)
 */
function validateYear(year: number): void {
  if (year < 1900 || year > 2100) {
    throw new Error('Invalid year');
  }
}

/**
 * Get file path for a specific year
 */
function getFilePath(year: number): string {
  validateYear(year);
  return path.join(DATA_DIR, `${year}.json`);
}

/**
 * Get tournament archive list
 */
export function getTaikaiArchiveList(): TaikaiArchiveIndex {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      return { archives: [], lastUpdated: new Date().toISOString() };
    }
    const content = fs.readFileSync(INDEX_FILE, 'utf-8');
    return JSON.parse(content) as TaikaiArchiveIndex;
  } catch (error) {
    console.error('Error reading taikai archive index:', error);
    return { archives: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * Get tournament data for a specific year
 */
export function getTaikaiData(year: number): TaikaiData | null {
  try {
    const filePath = getFilePath(year);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as TaikaiData;
  } catch (error) {
    console.error(`Error reading taikai data for ${year}:`, error);
    return null;
  }
}

/**
 * Save tournament data and auto-update index.json
 */
export function saveTaikaiData(year: number, data: TaikaiData): void {
  validateYear(year);

  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Save data
  const filePath = getFilePath(year);
  const now = new Date().toISOString();

  // Load existing data to preserve publishedAt
  const existingData = getTaikaiData(year);

  const dataToSave: TaikaiData = {
    ...data,
    year,
    updatedAt: now,
    publishedAt: existingData?.publishedAt || now,
  };

  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

  // Update index.json
  updateTaikaiArchiveIndex(year, dataToSave);
}

/**
 * Delete tournament data and update index.json
 */
export function deleteTaikaiData(year: number): void {
  validateYear(year);

  const filePath = getFilePath(year);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Remove from index.json
  removeFromTaikaiArchiveIndex(year);
}

/**
 * Update index.json (add or update entry)
 */
function updateTaikaiArchiveIndex(year: number, data: TaikaiData): void {
  const index = getTaikaiArchiveList();

  // Find existing entry
  const existingIndex = index.archives.findIndex((a) => a.year === year);

  // Data validation
  if (!data || !data.participants || !Array.isArray(data.participants)) {
    console.error('Invalid data structure in updateTaikaiArchiveIndex:', data);
    throw new Error('Invalid data structure: participants must be an array');
  }

  const metadata: TaikaiArchiveMetadata = {
    year,
    taikaiName: data.taikaiName,
    participantCount: data.participants.length,
    eventDate: data.eventDate,
    publishedAt: data.publishedAt,
  };

  if (existingIndex >= 0) {
    // Update existing
    index.archives[existingIndex] = metadata;
  } else {
    // Add new
    index.archives.push(metadata);
  }

  // Sort by year (descending, newest first)
  index.archives.sort((a, b) => b.year - a.year);

  index.lastUpdated = new Date().toISOString();

  // Create data directory if it doesn't exist
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Remove from index.json
 */
function removeFromTaikaiArchiveIndex(year: number): void {
  const index = getTaikaiArchiveList();

  index.archives = index.archives.filter((a) => a.year !== year);

  index.lastUpdated = new Date().toISOString();

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * Get latest tournament data
 */
export function getLatestTaikaiData(): TaikaiData | null {
  const index = getTaikaiArchiveList();
  if (index.archives.length === 0) {
    return null;
  }

  // Get latest archive (already sorted by year descending)
  const latest = index.archives[0];
  return getTaikaiData(latest.year);
}

/**
 * 指定された参加者名の大会参加履歴を取得
 * すべての順位のデータを含む
 * 大会が開催されない年は含まれない
 */
export function getPersonTaikaiHistory(personName: string): PersonTaikaiHistory | null {
  const index = getTaikaiArchiveList();
  const historyEntries: PersonTaikaiHistoryEntry[] = [];

  // 全ての大会データを降順でチェック
  for (const archive of index.archives) {
    const taikaiData = getTaikaiData(archive.year);
    if (!taikaiData) continue;

    // 該当者を検索（全順位）
    const participant = taikaiData.participants.find(
      p => p.name === personName
    );

    if (participant) {
      historyEntries.push({
        year: archive.year,
        taikaiName: archive.taikaiName,
        rank: participant.rank,
        score1: participant.score1,
        score2: participant.score2,
        totalScore: participant.totalScore,
        rankTitle: participant.rankTitle,
      });
    }
  }

  // データが見つからない場合
  if (historyEntries.length === 0) {
    return null;
  }

  return {
    name: personName,
    history: historyEntries,  // 既に降順（index.archivesが降順のため）
  };
}
