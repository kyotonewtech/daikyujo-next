import fs from 'fs';
import path from 'path';
import type { SeisekiMonth, ArchiveIndex, ArchiveMetadata, PersonHistory, PersonHistoryEntry } from '@/types/seiseki';
import { parseTargetSize } from './utils';

const DATA_DIR = path.join(process.cwd(), 'data', 'seiseki');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

/**
 * 年月のバリデーション（パストラバーサル対策）
 */
function validateYearMonth(year: number, month: number): void {
  if (year < 2000 || year > 2100) {
    throw new Error('Invalid year');
  }
  if (month < 1 || month > 12) {
    throw new Error('Invalid month');
  }
}

/**
 * ファイルパスを取得
 */
function getFilePath(year: number, month: number): string {
  validateYearMonth(year, month);
  const yearDir = path.join(DATA_DIR, year.toString());
  const fileName = `${month.toString().padStart(2, '0')}.json`;
  return path.join(yearDir, fileName);
}

/**
 * アーカイブ一覧を取得
 */
export function getArchiveList(): ArchiveIndex {
  try {
    if (!fs.existsSync(INDEX_FILE)) {
      return { archives: [], lastUpdated: new Date().toISOString() };
    }
    const content = fs.readFileSync(INDEX_FILE, 'utf-8');
    return JSON.parse(content) as ArchiveIndex;
  } catch (error) {
    console.error('Error reading archive index:', error);
    return { archives: [], lastUpdated: new Date().toISOString() };
  }
}

/**
 * 月次データを取得
 */
export function getSeisekiData(year: number, month: number): SeisekiMonth | null {
  try {
    const filePath = getFilePath(year, month);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as SeisekiMonth;
  } catch (error) {
    console.error(`Error reading seiseki data for ${year}/${month}:`, error);
    return null;
  }
}

/**
 * 月次データを保存し、index.jsonを自動更新
 */
export function saveSeisekiData(year: number, month: number, entries: any[]): void {
  validateYearMonth(year, month);

  console.log('saveSeisekiData called with:', { year, month, entries });

  // entriesの検証
  if (!Array.isArray(entries)) {
    console.error('entries is not an array:', entries);
    throw new Error('entries must be an array');
  }

  // 年ディレクトリを作成
  const yearDir = path.join(DATA_DIR, year.toString());
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }

  // データを保存
  const filePath = getFilePath(year, month);
  const now = new Date().toISOString();

  // 既存データを読み込んでpublishedAtを保持
  const existingData = getSeisekiData(year, month);

  const dataToSave: SeisekiMonth = {
    year,
    month,
    entries,
    updatedAt: now,
    publishedAt: existingData?.publishedAt || now,
  };

  console.log('dataToSave:', JSON.stringify(dataToSave, null, 2));

  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2), 'utf-8');

  // index.jsonを更新
  updateArchiveIndex(year, month, dataToSave);
}

/**
 * 月次データを削除し、index.jsonを自動更新
 */
export function deleteSeisekiData(year: number, month: number): void {
  validateYearMonth(year, month);

  const filePath = getFilePath(year, month);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // index.jsonから削除
  removeFromArchiveIndex(year, month);
}

/**
 * index.jsonを更新（新規追加・更新）
 */
function updateArchiveIndex(year: number, month: number, data: SeisekiMonth): void {
  const index = getArchiveList();

  // 既存のエントリを探す
  const existingIndex = index.archives.findIndex(
    (a) => a.year === year && a.month === month
  );

  // データの検証
  if (!data || !data.entries || !Array.isArray(data.entries)) {
    console.error('Invalid data structure in updateArchiveIndex:', data);
    throw new Error('Invalid data structure: entries must be an array');
  }

  const metadata: ArchiveMetadata = {
    year,
    month,
    entryCount: data.entries.length,
    publishedAt: data.publishedAt,
  };

  if (existingIndex >= 0) {
    // 更新
    index.archives[existingIndex] = metadata;
  } else {
    // 新規追加
    index.archives.push(metadata);
  }

  // 年月で降順ソート（新しいものが先）
  index.archives.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  index.lastUpdated = new Date().toISOString();

  // DATA_DIRが存在しない場合は作成
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * index.jsonから削除
 */
function removeFromArchiveIndex(year: number, month: number): void {
  const index = getArchiveList();

  index.archives = index.archives.filter(
    (a) => !(a.year === year && a.month === month)
  );

  index.lastUpdated = new Date().toISOString();

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

/**
 * 最新の成績データを取得
 */
export function getLatestSeisekiData(): SeisekiMonth | null {
  const index = getArchiveList();
  if (index.archives.length === 0) {
    return null;
  }

  // 最新のアーカイブを取得（すでにソート済み）
  const latest = index.archives[0];
  return getSeisekiData(latest.year, latest.month);
}

/**
 * 指定年の全月データを取得（データがある月のみ、12月→1月降順）
 */
export function getYearSeisekiData(year: number): SeisekiMonth[] {
  const months: SeisekiMonth[] = [];

  // 12月から1月まで降順でチェック
  for (let month = 12; month >= 1; month--) {
    const data = getSeisekiData(year, month);
    if (data && data.entries.length > 0) {
      months.push(data);
    }
  }

  return months;
}

/**
 * アーカイブに含まれる全年のリストを取得（降順）
 */
export function getAvailableYears(): number[] {
  const index = getArchiveList();
  const years = [...new Set(index.archives.map(a => a.year))];
  return years.sort((a, b) => b - a); // 降順
}

/**
 * 指定されたpersonIdの成績推移を取得
 * 個人の最初のデータがある月から最後のデータがある月までの期間を対象
 * データがない月はnull値として記録
 */
export function getPersonHistory(personId: string): PersonHistory | null {
  console.log('[getPersonHistory] Called with personId:', personId);

  const index = getArchiveList();
  console.log('[getPersonHistory] Total archives:', index.archives.length);

  let personName = '';
  const dataPoints: Array<{ year: number; month: number; entry: SeisekiEntry }> = [];

  // 1. まず全期間でデータがある月を収集
  const sortedArchives = [...index.archives].reverse();
  console.log('[getPersonHistory] Searching through archives...');

  for (const archive of sortedArchives) {
    const monthData = getSeisekiData(archive.year, archive.month);
    if (!monthData) continue;

    const entry = monthData.entries.find(e => e.personId === personId);
    if (entry) {
      personName = entry.name;
      dataPoints.push({ year: archive.year, month: archive.month, entry });
      console.log(`[getPersonHistory] Found data: ${archive.year}/${archive.month} - ${entry.name}`);
    }
  }

  console.log('[getPersonHistory] Total data points found:', dataPoints.length);

  if (dataPoints.length === 0) {
    console.log('[getPersonHistory] No data found for personId:', personId);
    return null;
  }

  // 2. 最初と最後の年月を特定
  const firstData = dataPoints[0];
  const lastData = dataPoints[dataPoints.length - 1];

  // 3. 最初〜最後の期間の全ての月を生成
  const history: PersonHistoryEntry[] = [];
  let currentYear = firstData.year;
  let currentMonth = firstData.month;

  while (
    currentYear < lastData.year ||
    (currentYear === lastData.year && currentMonth <= lastData.month)
  ) {
    // その月のデータを探す
    const found = dataPoints.find(
      dp => dp.year === currentYear && dp.month === currentMonth
    );

    if (found) {
      // データあり
      history.push({
        year: currentYear,
        month: currentMonth,
        rank: found.entry.rank,
        targetSize: found.entry.targetSize,
        targetSizeNumeric: parseTargetSize(found.entry.targetSize) ?? 0,
        rankTitle: found.entry.rankTitle,
      });
    } else {
      // データなし（null値として追加）
      history.push({
        year: currentYear,
        month: currentMonth,
        rank: null,
        targetSize: '-',
        targetSizeNumeric: null,
        rankTitle: '',
      });
    }

    // 次の月へ
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return {
    personId,
    name: personName,
    history,
  };
}
