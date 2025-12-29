import fs from 'fs';
import path from 'path';

const PERSONS_FILE = path.join(process.cwd(), 'data', 'persons', 'persons.json');
const OUTPUT_FILE = path.join(process.cwd(), 'data', 'persons', 'persons.md');

interface PersonEntry {
  personId: string;
  name: string;
  personKey: string | null;
  firstAppearance: { year: number; month: number };
  lastAppearance: { year: number; month: number };
  appearanceCount: number;
  createdAt: string;
  note: string;
}

interface PersonRegistry {
  version: string;
  lastUpdated: string;
  nextPersonId: number;
  persons: PersonEntry[];
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}

function formatYearMonth(year: number, month: number): string {
  return `${year}/${String(month).padStart(2, '0')}`;
}

function main() {
  console.log('=== persons.md 生成スクリプト ===\n');

  // persons.json を読み込み
  if (!fs.existsSync(PERSONS_FILE)) {
    console.error(`エラー: ${PERSONS_FILE} が見つかりません`);
    console.error('先に migrate-persons.ts を実行してください');
    process.exit(1);
  }

  const registry: PersonRegistry = JSON.parse(fs.readFileSync(PERSONS_FILE, 'utf-8'));

  console.log(`読み込み: ${PERSONS_FILE}`);
  console.log(`登録人数: ${registry.persons.length}名\n`);

  // 統計計算
  const withPersonKey = registry.persons.filter(p => p.personKey).length;
  const totalAppearances = registry.persons.reduce((sum, p) => sum + p.appearanceCount, 0);
  const maxAppearances = Math.max(...registry.persons.map(p => p.appearanceCount));
  const topPerson = registry.persons.find(p => p.appearanceCount === maxAppearances);

  // Markdown生成
  const lines: string[] = [];

  // ヘッダー
  lines.push('# PersonID 一覧');
  lines.push('');
  lines.push('> このファイルは `persons.json` から自動生成されています。');
  lines.push('> 直接編集せず、`npm run generate-persons-md` で再生成してください。');
  lines.push('');
  lines.push(`**最終更新**: ${formatDate(registry.lastUpdated)}`);
  lines.push(`**次のpersonId**: person_${String(registry.nextPersonId).padStart(3, '0')}`);
  lines.push(`**登録人数**: ${registry.persons.length}名`);
  lines.push('');

  // 一覧テーブル
  lines.push('## 一覧');
  lines.push('');
  lines.push('| personId | 名前 | personKey | 初登場 | 最終登場 | 回数 | 備考 |');
  lines.push('|----------|------|-----------|--------|---------|------|------|');

  for (const person of registry.persons) {
    const personKey = person.personKey || '-';
    const firstAppearance = formatYearMonth(person.firstAppearance.year, person.firstAppearance.month);
    const lastAppearance = formatYearMonth(person.lastAppearance.year, person.lastAppearance.month);
    const note = person.note || '';

    lines.push(
      `| ${person.personId} | ${person.name} | ${personKey} | ${firstAppearance} | ${lastAppearance} | ${person.appearanceCount} | ${note} |`
    );
  }

  lines.push('');

  // 統計情報
  lines.push('## 統計');
  lines.push('');
  lines.push(`- 総登録人数: ${registry.persons.length}名`);
  lines.push(`- personKey使用: ${withPersonKey}名`);
  lines.push(`- 総登場回数: ${totalAppearances}回`);
  lines.push(`- 最多登場: ${topPerson?.name} (${maxAppearances}回)`);
  lines.push('');

  // personKey使用者の詳細
  if (withPersonKey > 0) {
    lines.push('## personKey 使用者');
    lines.push('');
    lines.push('同名の別人を区別するために personKey を使用している人の一覧:');
    lines.push('');
    lines.push('| personId | 名前 | personKey | 備考 |');
    lines.push('|----------|------|-----------|------|');

    for (const person of registry.persons.filter(p => p.personKey)) {
      lines.push(`| ${person.personId} | ${person.name} | ${person.personKey} | ${person.note} |`);
    }

    lines.push('');
  }

  // フッター
  lines.push('---');
  lines.push('');
  lines.push(`*生成日時: ${formatDate(new Date().toISOString())}*`);
  lines.push('');

  // ファイル保存
  const markdown = lines.join('\n');
  fs.writeFileSync(OUTPUT_FILE, markdown, 'utf-8');

  console.log('=== 生成完了 ===');
  console.log(`出力先: ${OUTPUT_FILE}`);
  console.log(`行数: ${lines.length}行`);
}

main();
