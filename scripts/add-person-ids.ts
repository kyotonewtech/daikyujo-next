import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'seiseki');

interface SeisekiEntry {
  id: string;
  personId?: string;
  rank: number;
  name: string;
  rankTitle: string;
  targetSize: string;
  updatedDate: string;
  expiryDate: string;
  isEmpty?: boolean;
}

interface SeisekiMonth {
  year: number;
  month: number;
  entries: SeisekiEntry[];
  publishedAt: string;
  updatedAt: string;
}

// 年月の昇順でファイルパスを取得
function getAllDataFiles(): string[] {
  const files: string[] = [];
  const years = fs.readdirSync(DATA_DIR)
    .filter(name => !name.includes('.json') && !isNaN(Number(name)))
    .map(Number)
    .sort((a, b) => a - b); // 2010→2025

  for (const year of years) {
    const yearDir = path.join(DATA_DIR, String(year));
    if (!fs.existsSync(yearDir)) continue;

    const months = fs.readdirSync(yearDir)
      .filter(name => name.endsWith('.json'))
      .map(name => parseInt(name.replace('.json', '')))
      .sort((a, b) => a - b); // 1→12

    for (const month of months) {
      files.push(path.join(yearDir, `${String(month).padStart(2, '0')}.json`));
    }
  }

  return files;
}

function main() {
  const files = getAllDataFiles();
  const nameToPersonId = new Map<string, string>();
  let nextPersonId = 1;
  let processedFiles = 0;
  let processedEntries = 0;

  console.log(`処理対象ファイル数: ${files.length}`);
  console.log('データ移行を開始します...\n');

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data: SeisekiMonth = JSON.parse(content);

      let modified = false;
      for (const entry of data.entries) {
        // 空エントリーはスキップ
        if (entry.isEmpty) continue;

        // personIdがない、または空文字の場合のみ処理
        if (!entry.personId || entry.personId === '') {
          if (!nameToPersonId.has(entry.name)) {
            const newPersonId = `person_${String(nextPersonId).padStart(3, '0')}`;
            nameToPersonId.set(entry.name, newPersonId);
            console.log(`新規割り当て: ${entry.name} → ${newPersonId}`);
            nextPersonId++;
          }
          entry.personId = nameToPersonId.get(entry.name)!;
          modified = true;
          processedEntries++;
        }
      }

      if (modified) {
        // updatedAtを更新
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        processedFiles++;
      }
    } catch (error) {
      console.error(`エラー: ${filePath}`, error);
    }
  }

  console.log('\n=== 処理完了 ===');
  console.log(`処理ファイル数: ${processedFiles}`);
  console.log(`処理エントリー数: ${processedEntries}`);
  console.log(`割り当てたpersonId数: ${nameToPersonId.size}`);

  console.log('\n=== 名前 → personId マッピング ===');
  const sortedMapping = Array.from(nameToPersonId.entries())
    .sort((a, b) => a[1].localeCompare(b[1]));

  for (const [name, personId] of sortedMapping) {
    console.log(`${personId}: ${name}`);
  }
}

main();
