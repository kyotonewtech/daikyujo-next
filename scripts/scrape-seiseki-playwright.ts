#!/usr/bin/env node

/**
 * Playwrightを使って元サイトから成績データをスクレイピングするスクリプト
 * Usage: npx tsx scripts/scrape-seiseki-playwright.ts [year] [month]
 */

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const SEISEKI_URL = "https://daikyujyo.com/seiseki.html";
const _OUTPUT_DIR = path.join(process.cwd(), "data", "seiseki");
const TMP_DIR = path.join(process.cwd(), "tmp");

interface SeisekiEntry {
  rank: number;
  name: string;
  rankTitle: string;
  targetSize: string;
  updatedDate: string;
  expiryDate: string;
}

/**
 * メイン処理
 */
async function main() {
  // tmpディレクトリ作成
  fs.mkdirSync(TMP_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    console.log("Opening page:", SEISEKI_URL);
    await page.goto(SEISEKI_URL, { waitUntil: "networkidle" });

    // スクリーンショット取得
    const screenshotPath = path.join(TMP_DIR, "seiseki-page.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log("Screenshot saved:", screenshotPath);

    // ページのHTMLを取得
    const html = await page.content();
    const htmlPath = path.join(TMP_DIR, "seiseki.html");
    fs.writeFileSync(htmlPath, html, "utf-8");
    console.log("HTML saved:", htmlPath);

    // ページタイトルを取得
    const title = await page.title();
    console.log("Page title:", title);

    // テーブル構造を調査
    console.log("\n=== Analyzing page structure ===");

    // すべてのテーブルを検索
    const tables = await page.locator("table").all();
    console.log(`Found ${tables.length} tables`);

    for (let i = 0; i < tables.length; i++) {
      console.log(`\n--- Table ${i + 1} ---`);

      // テーブルのヘッダーを取得
      const headers = await tables[i].locator("th").allTextContents();
      console.log("Headers:", headers);

      // 最初の数行のデータを取得
      const rows = await tables[i].locator("tr").all();
      console.log(`Total rows: ${rows.length}`);

      if (rows.length > 0) {
        console.log("First 3 rows:");
        for (let j = 0; j < Math.min(3, rows.length); j++) {
          const cells = await rows[j].locator("td, th").allTextContents();
          console.log(`  Row ${j}:`, cells);
        }
      }
    }

    // 月別のリンクやボタンを探す
    console.log("\n=== Looking for month navigation ===");
    const links = await page.locator("a").all();
    console.log(`Found ${links.length} links`);

    // 月に関連するリンクを抽出
    for (const link of links.slice(0, 20)) {
      // 最初の20個を確認
      const text = await link.textContent();
      const href = await link.getAttribute("href");
      if (text && (text.includes("月") || text.includes("令和") || text.includes("年"))) {
        console.log(`  - "${text}" -> ${href}`);
      }
    }

    // セレクトボックスを探す
    const selects = await page.locator("select").all();
    console.log(`\nFound ${selects.length} select elements`);

    for (let i = 0; i < selects.length; i++) {
      const options = await selects[i].locator("option").allTextContents();
      console.log(`Select ${i + 1} options:`, options.slice(0, 10)); // 最初の10個
    }

    console.log("\n=== Next steps ===");
    console.log("1. Check tmp/seiseki-page.png to see the page layout");
    console.log("2. Check tmp/seiseki.html to inspect the HTML structure");
    console.log("3. Based on the structure above, implement the parsing logic");
  } catch (error) {
    console.error("Error during scraping:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Scraping failed:", error);
  process.exit(1);
});
