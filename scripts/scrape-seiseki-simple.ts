#!/usr/bin/env node

/**
 * axios + cheerioを使って元サイトから成績データをスクレイピングするスクリプト
 * Usage: npx tsx scripts/scrape-seiseki-simple.ts
 */

import fs from "node:fs";
import path from "node:path";
import axios from "axios";
import * as cheerio from "cheerio";

const SEISEKI_URL = "https://daikyujyo.com/seiseki.html";
const TMP_DIR = path.join(process.cwd(), "tmp");

/**
 * メイン処理
 */
async function main() {
  try {
    // tmpディレクトリ作成
    fs.mkdirSync(TMP_DIR, { recursive: true });

    console.log("Fetching page:", SEISEKI_URL);

    // ページ取得（User-Agentを設定）
    const response = await axios.get(SEISEKI_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    });

    console.log("Status:", response.status);
    console.log("Content-Type:", response.headers["content-type"]);

    // HTMLを保存
    const htmlPath = path.join(TMP_DIR, "seiseki.html");
    fs.writeFileSync(htmlPath, response.data, "utf-8");
    console.log("HTML saved:", htmlPath);

    // cheerioでパース
    const $ = cheerio.load(response.data);

    // ページタイトル
    const title = $("title").text();
    console.log("Page title:", title);

    // テーブルを調査
    console.log("\n=== Analyzing page structure ===");

    const tables = $("table");
    console.log(`Found ${tables.length} tables`);

    tables.each((i, table) => {
      console.log(`\n--- Table ${i + 1} ---`);

      // ヘッダー
      const headers: string[] = [];
      $(table)
        .find("th")
        .each((_, th) => {
          headers.push($(th).text().trim());
        });
      console.log("Headers:", headers);

      // 最初の3行
      const rows = $(table).find("tr");
      console.log(`Total rows: ${rows.length}`);

      if (rows.length > 0) {
        console.log("First 3 rows:");
        rows.slice(0, 3).each((j, row) => {
          const cells: string[] = [];
          $(row)
            .find("td, th")
            .each((_, cell) => {
              cells.push($(cell).text().trim());
            });
          console.log(`  Row ${j}:`, cells);
        });
      }
    });

    // リンクを調査（月別ナビゲーション）
    console.log("\n=== Looking for month navigation ===");

    const links = $("a");
    console.log(`Found ${links.length} links`);

    let monthLinks = 0;
    links.each((_, link) => {
      const text = $(link).text().trim();
      const href = $(link).attr("href");

      if (text && (text.includes("月") || text.includes("令和") || text.includes("年"))) {
        console.log(`  - "${text}" -> ${href}`);
        monthLinks++;
        if (monthLinks >= 20) return false; // 最初の20個まで
      }
    });

    // セレクトボックスを調査
    console.log("\n=== Looking for select elements ===");

    const selects = $("select");
    console.log(`Found ${selects.length} select elements`);

    selects.each((i, select) => {
      console.log(`\nSelect ${i + 1}:`);

      const id = $(select).attr("id");
      const name = $(select).attr("name");
      console.log(`  ID: ${id}, Name: ${name}`);

      const options: string[] = [];
      $(select)
        .find("option")
        .each((_, option) => {
          const value = $(option).attr("value");
          const text = $(option).text().trim();
          options.push(`${text} (value="${value}")`);
        });

      console.log(`  Options (showing first 15):`, options.slice(0, 15));
    });

    // ボタンやJavaScript関連
    console.log("\n=== Looking for buttons and scripts ===");

    const buttons = $('button, input[type="button"], input[type="submit"]');
    console.log(`Found ${buttons.length} buttons`);

    buttons.each((i, button) => {
      const text = $(button).text().trim() || $(button).attr("value");
      const onclick = $(button).attr("onclick");
      console.log(`  Button ${i + 1}: "${text}" onclick="${onclick}"`);
    });

    console.log("\n=== Next steps ===");
    console.log("1. Check tmp/seiseki.html to inspect the HTML structure");
    console.log("2. Based on the structure above, implement the parsing logic");
    console.log("3. Look for form submissions or JavaScript that loads data");
  } catch (error: any) {
    if (error.response) {
      console.error("HTTP Error:", error.response.status, error.response.statusText);
      console.error("Response data:", error.response.data?.substring(0, 200));
    } else {
      console.error("Error during scraping:", error.message);
    }
    throw error;
  }
}

main().catch((error) => {
  console.error("Scraping failed:", error.message);
  process.exit(1);
});
