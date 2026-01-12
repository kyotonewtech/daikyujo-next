#!/usr/bin/env node
/**
 * 元サイトから成績データをスクレイピングするスクリプト
 * Usage: npx tsx scripts/scrape-seiseki.ts [year] [month]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SEISEKI_URL = 'https://daikyujyo.com/seiseki.html';
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'seiseki');

interface SeisekiEntry {
  rank: number;
  name: string;
  rankTitle: string;
  targetSize: string;
  updatedDate: string;
  expiryDate: string;
}

/**
 * agent-browserコマンドを実行
 */
function runBrowser(command: string): string {
  try {
    const result = execSync(`agent-browser ${command}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return result;
  } catch (error: any) {
    console.error(`Browser command failed: ${command}`);
    console.error(error.stderr || error.message);
    throw error;
  }
}

/**
 * ブラウザを開いてページをロード
 */
function openPage(): void {
  console.log('Opening page:', SEISEKI_URL);
  runBrowser(`open "${SEISEKI_URL}"`);

  // ページ読み込み待機
  runBrowser('wait 2000');
}

/**
 * スクリーンショットを取得（デバッグ用）
 */
function takeScreenshot(filename: string): void {
  const screenshotPath = path.join(process.cwd(), 'tmp', filename);
  fs.mkdirSync(path.dirname(screenshotPath), { recursive: true });
  runBrowser(`screenshot "${screenshotPath}"`);
  console.log('Screenshot saved:', screenshotPath);
}

/**
 * ページのHTMLを取得
 */
function getPageHTML(): string {
  const html = runBrowser('get html body');
  return html;
}

/**
 * アクセシビリティスナップショットを取得
 */
function getSnapshot(): string {
  const snapshot = runBrowser('snapshot');
  return snapshot;
}

/**
 * HTMLから成績データを抽出
 */
function parseSeisekiData(html: string): SeisekiEntry[] {
  // TODO: HTMLパースロジックを実装
  // 現時点では構造を確認するためにHTMLを出力
  const tmpPath = path.join(process.cwd(), 'tmp', 'seiseki.html');
  fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
  fs.writeFileSync(tmpPath, html, 'utf-8');
  console.log('HTML saved to:', tmpPath);

  return [];
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('Starting scraper...');

    // ページを開く
    openPage();

    // スクリーンショット取得
    takeScreenshot('seiseki-page.png');

    // スナップショット取得
    console.log('\nAccessibility Snapshot:');
    const snapshot = getSnapshot();
    const snapshotPath = path.join(process.cwd(), 'tmp', 'snapshot.txt');
    fs.writeFileSync(snapshotPath, snapshot, 'utf-8');
    console.log('Snapshot saved to:', snapshotPath);

    // HTML取得
    console.log('\nFetching HTML...');
    const html = getPageHTML();
    const entries = parseSeisekiData(html);

    console.log(`Found ${entries.length} entries`);

    // ブラウザを閉じる
    runBrowser('close');

    console.log('\nScraping completed!');
    console.log('Next steps:');
    console.log('1. Check tmp/seiseki-page.png to see the page');
    console.log('2. Check tmp/seiseki.html to see the HTML structure');
    console.log('3. Check tmp/snapshot.txt to see accessibility tree');

  } catch (error) {
    console.error('Scraping failed:', error);

    // エラー時もブラウザを閉じる
    try {
      runBrowser('close');
    } catch (e) {
      // ignore
    }

    process.exit(1);
  }
}

main();
