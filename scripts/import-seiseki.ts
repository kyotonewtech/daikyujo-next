#!/usr/bin/env node
/**
 * 元サイトから成績データを取得して自動的にJSONファイルに変換するスクリプト
 *
 * 使い方:
 *  1. オンライン版（ローカル環境で実行）:
 *     npx tsx scripts/import-seiseki.ts --fetch --year 2025 --month 12
 *
 *  2. HTMLファイルから（保存済みHTMLを使用）:
 *     npx tsx scripts/import-seiseki.ts --file tmp/seiseki.html --year 2025 --month 12
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { execSync } from 'child_process';

const SEISEKI_URL = 'https://daikyujyo.com/seiseki.html';
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'seiseki');

interface SeisekiEntry {
  id: string;
  rank: number;
  name: string;
  rankTitle: string;
  targetSize: string;
  updatedDate: string;
  expiryDate: string;
  personId?: string;
}

interface SeisekiMonth {
  year: number;
  month: number;
  entries: SeisekiEntry[];
  publishedAt: string;
  updatedAt: string;
}

/**
 * コマンドライン引数をパース
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options: any = {
    fetch: false,
    file: null,
    year: null,
    month: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fetch') {
      options.fetch = true;
    } else if (args[i] === '--file' && args[i + 1]) {
      options.file = args[++i];
    } else if (args[i] === '--year' && args[i + 1]) {
      options.year = parseInt(args[++i], 10);
    } else if (args[i] === '--month' && args[i + 1]) {
      options.month = parseInt(args[++i], 10);
    }
  }

  if (!options.year || !options.month) {
    console.error('Error: --year and --month are required');
    console.log('\nUsage:');
    console.log('  npx tsx scripts/import-seiseki.ts --fetch --year 2025 --month 12');
    console.log('  npx tsx scripts/import-seiseki.ts --file tmp/seiseki.html --year 2025 --month 12');
    process.exit(1);
  }

  if (!options.fetch && !options.file) {
    console.error('Error: Either --fetch or --file must be specified');
    process.exit(1);
  }

  return options;
}

/**
 * URLからHTMLを取得
 */
async function fetchHTML(): Promise<string> {
  console.log('Fetching page:', SEISEKI_URL);

  const response = await axios.get(SEISEKI_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
    },
  });

  console.log('✓ Page fetched successfully');
  return response.data;
}

/**
 * ファイルからHTMLを読み込み
 */
function loadHTML(filePath: string): string {
  console.log('Loading HTML from file:', filePath);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  console.log('✓ HTML loaded successfully');
  return html;
}

/**
 * HTMLから成績データを抽出
 *
 * 注: この関数は元サイトの実際の構造に応じて調整が必要です。
 * まずはHTMLを調査して、適切なセレクタを見つける必要があります。
 */
function parseSeisekiData(html: string, year: number, month: number): SeisekiEntry[] {
  const $ = cheerio.load(html);
  const entries: SeisekiEntry[] = [];

  // 元サイトの構造を想定したパース処理
  // TODO: 実際のHTML構造に合わせて調整が必要

  // パターン1: テーブル形式の場合
  const tables = $('table');

  if (tables.length > 0) {
    console.log(`Found ${tables.length} table(s)`);

    // 最も大きいテーブル（またはメインのテーブル）を探す
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mainTable: any = null;
    let maxRows = 0;

    tables.each((_, table) => {
      const rowCount = $(table).find('tr').length;
      if (rowCount > maxRows) {
        maxRows = rowCount;
        mainTable = $(table);
      }
    });

    if (mainTable) {
      console.log(`Using table with ${maxRows} rows`);

      // ヘッダー行をスキップして、データ行を処理
      const rows = mainTable.find('tr').slice(1); // 最初の行（ヘッダー）をスキップ

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows.each((_i: number, row: any) => {
        const cells = $(row).find('td');

        if (cells.length >= 4) {
          // セルの内容を取得
          const rankText = $(cells[0]).text().trim();
          const name = $(cells[1]).text().trim();
          const rankTitle = $(cells[2]).text().trim();
          const targetSize = $(cells[3]).text().trim();

          // 順位を数値に変換
          const rank = parseInt(rankText.replace(/[^0-9]/g, ''), 10);

          if (rank && name) {
            // 日付を計算（仮の実装）
            const updatedDate = calculateUpdatedDate(year, month, rank);
            const expiryDate = calculateExpiryDate(updatedDate);

            entries.push({
              id: uuidv4(),
              rank,
              name,
              rankTitle,
              targetSize,
              updatedDate,
              expiryDate,
            });
          }
        }
      });
    }
  }

  // パターン2: divやリスト形式の場合の処理も追加可能

  console.log(`Extracted ${entries.length} entries`);
  return entries;
}

/**
 * 更新日を計算（仮の実装）
 * 実際のサイトからこの情報を取得する場合は、パース処理を調整
 */
function calculateUpdatedDate(year: number, month: number, rank: number): string {
  // 前月の24日を仮定（過去のパターンから）
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;

  return `${prevYear}-${String(prevMonth).padStart(2, '0')}-24`;
}

/**
 * 有効期限を計算
 * 更新日の3ヶ月後の1日
 */
function calculateExpiryDate(updatedDate: string): string {
  const date = new Date(updatedDate);
  date.setMonth(date.getMonth() + 3);
  date.setDate(1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * JSONファイルを保存
 */
function saveJSON(data: SeisekiMonth, year: number, month: number): string {
  const dir = path.join(OUTPUT_DIR, String(year));
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${String(month).padStart(2, '0')}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');

  console.log('✓ JSON saved:', filePath);
  return filePath;
}

/**
 * personIDを割り当て
 */
function assignPersonIds(filePath: string): void {
  console.log('\nAssigning person IDs...');
  try {
    execSync('npm run add-person-ids', { stdio: 'inherit' });
    console.log('✓ Person IDs assigned');
  } catch (error) {
    console.error('⚠ Failed to assign person IDs:', error);
  }
}

/**
 * persons.jsonを更新
 */
function updatePersonRegistry(): void {
  console.log('\nUpdating person registry...');
  try {
    execSync('npm run migrate-persons', { stdio: 'inherit' });
    console.log('✓ Person registry updated');
  } catch (error) {
    console.error('⚠ Failed to update person registry:', error);
  }
}

/**
 * persons.mdを生成
 */
function generatePersonsMd(): void {
  console.log('\nGenerating persons.md...');
  try {
    execSync('npm run generate-persons-md', { stdio: 'inherit' });
    console.log('✓ persons.md generated');
  } catch (error) {
    console.error('⚠ Failed to generate persons.md:', error);
  }
}

/**
 * index.jsonを更新
 */
function updateIndex(year: number, month: number, entryCount: number): void {
  console.log('\nUpdating index.json...');

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  let index: any;

  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  } else {
    index = {
      archives: [],
      lastUpdated: null,
    };
  }

  // 既存のエントリを削除（重複防止）
  index.archives = index.archives.filter(
    (entry: any) => !(entry.year === year && entry.month === month)
  );

  // 新しいエントリを追加（先頭に）
  const publishedAt = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}T00:00:00.000Z`;

  index.archives.unshift({
    year,
    month,
    entryCount,
    publishedAt,
  });

  // lastUpdatedを更新
  index.lastUpdated = publishedAt;

  // 保存
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  console.log('✓ index.json updated');
}

/**
 * メイン処理
 */
async function main() {
  const options = parseArgs();

  console.log('=== Import Seiseki Data ===');
  console.log(`Year: ${options.year}, Month: ${options.month}\n`);

  try {
    // HTMLを取得
    let html: string;

    if (options.fetch) {
      html = await fetchHTML();
    } else {
      html = loadHTML(options.file);
    }

    // データを抽出
    console.log('\nParsing seiseki data...');
    const entries = parseSeisekiData(html, options.year, options.month);

    if (entries.length === 0) {
      console.error('\n⚠ Warning: No entries extracted!');
      console.log('The HTML structure might not match the expected format.');
      console.log('Please check the HTML and adjust the parseSeisekiData function.');

      // HTMLをデバッグ用に保存
      const tmpDir = path.join(process.cwd(), 'tmp');
      fs.mkdirSync(tmpDir, { recursive: true });
      const debugPath = path.join(tmpDir, 'debug-seiseki.html');
      fs.writeFileSync(debugPath, html, 'utf-8');
      console.log(`\nHTML saved for debugging: ${debugPath}`);

      process.exit(1);
    }

    // JSONデータを作成
    const publishedDate = new Date(
      options.year,
      options.month - 1,
      new Date(options.year, options.month, 0).getDate()
    );

    const data: SeisekiMonth = {
      year: options.year,
      month: options.month,
      entries,
      publishedAt: publishedDate.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // JSONを保存
    console.log('\nSaving JSON file...');
    const filePath = saveJSON(data, options.year, options.month);

    // personIDを割り当て
    assignPersonIds(filePath);

    // person registryを更新
    updatePersonRegistry();

    // persons.mdを生成
    generatePersonsMd();

    // index.jsonを更新
    updateIndex(options.year, options.month, entries.length);

    console.log('\n=== Import completed successfully! ===');
    console.log(`\nNext steps:`);
    console.log(`1. Review the generated file: ${filePath}`);
    console.log(`2. Run validation: npm run validate-person-ids`);
    console.log(`3. Commit and push the changes`);

  } catch (error: any) {
    if (error.response) {
      console.error('\nHTTP Error:', error.response.status, error.response.statusText);
    } else {
      console.error('\nError:', error.message);
    }

    console.log('\n=== Import failed ===');
    console.log('\nTroubleshooting:');
    console.log('1. If fetching fails, save the HTML manually:');
    console.log('   - Visit https://daikyujyo.com/seiseki.html in your browser');
    console.log('   - Save the page as HTML');
    console.log('   - Run: npx tsx scripts/import-seiseki.ts --file path/to/saved.html --year YYYY --month MM');
    console.log('2. Check network connectivity');
    console.log('3. Check if the site structure has changed');

    process.exit(1);
  }
}

main();
