import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'seiseki');
const PERSONS_FILE = path.join(process.cwd(), 'data', 'persons', 'persons.json');

interface SeisekiEntry {
  id: string;
  personId?: string;
  personKey?: string;
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

interface ValidationError {
  type: string;
  severity: 'error' | 'warning';
  message: string;
  details?: any;
}

// 年月の昇順でファイルパスを取得
function getAllDataFiles(): string[] {
  const files: string[] = [];
  const years = fs.readdirSync(DATA_DIR)
    .filter(name => !name.includes('.json') && !isNaN(Number(name)))
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of years) {
    const yearDir = path.join(DATA_DIR, String(year));
    if (!fs.existsSync(yearDir)) continue;

    const months = fs.readdirSync(yearDir)
      .filter(name => name.endsWith('.json'))
      .map(name => parseInt(name.replace('.json', '')))
      .sort((a, b) => a - b);

    for (const month of months) {
      files.push(path.join(yearDir, `${String(month).padStart(2, '0')}.json`));
    }
  }

  return files;
}

function main() {
  console.log('=== personId 整合性検証スクリプト ===\n');

  // persons.json を読み込み
  if (!fs.existsSync(PERSONS_FILE)) {
    console.error(`エラー: ${PERSONS_FILE} が見つかりません`);
    console.error('先に migrate-persons.ts を実行してください');
    process.exit(1);
  }

  const registry: PersonRegistry = JSON.parse(fs.readFileSync(PERSONS_FILE, 'utf-8'));
  const errors: ValidationError[] = [];

  console.log(`読み込み: ${PERSONS_FILE}`);
  console.log(`登録人数: ${registry.persons.length}名`);
  console.log(`次のpersonId: person_${String(registry.nextPersonId).padStart(3, '0')}\n`);

  // 1. persons.json の内部整合性チェック
  console.log('[1/5] persons.json の内部整合性をチェック中...');

  // 重複personIdチェック
  const personIdSet = new Set<string>();
  for (const person of registry.persons) {
    if (personIdSet.has(person.personId)) {
      errors.push({
        type: 'DUPLICATE_PERSON_ID',
        severity: 'error',
        message: `重複したpersonId: ${person.personId}`,
        details: { personId: person.personId, name: person.name }
      });
    }
    personIdSet.add(person.personId);
  }

  // personIdフォーマットチェック
  for (const person of registry.persons) {
    if (!person.personId.match(/^person_\d{3}$/)) {
      errors.push({
        type: 'INVALID_PERSON_ID_FORMAT',
        severity: 'error',
        message: `不正なpersonIdフォーマット: ${person.personId}`,
        details: { personId: person.personId, name: person.name }
      });
    }
  }

  // nextPersonIdチェック
  const maxPersonIdNum = Math.max(
    ...registry.persons.map(p => parseInt(p.personId.replace('person_', '')))
  );
  if (registry.nextPersonId <= maxPersonIdNum) {
    errors.push({
      type: 'INVALID_NEXT_PERSON_ID',
      severity: 'error',
      message: `nextPersonId (${registry.nextPersonId}) が既存の最大personId (${maxPersonIdNum}) 以下です`,
      details: { nextPersonId: registry.nextPersonId, maxPersonIdNum }
    });
  }

  console.log(`  ✓ 重複チェック完了 (${personIdSet.size}個のユニークID)`);
  console.log(`  ✓ フォーマットチェック完了`);
  console.log(`  ✓ nextPersonIdチェック完了\n`);

  // 2. JSONファイルとの整合性チェック
  console.log('[2/5] JSONファイルとの整合性をチェック中...');

  const files = getAllDataFiles();
  const usedPersonIds = new Set<string>();
  const actualAppearanceCounts = new Map<string, number>();

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data: SeisekiMonth = JSON.parse(content);

      for (const entry of data.entries) {
        if (entry.isEmpty || !entry.personId) continue;

        usedPersonIds.add(entry.personId);

        // persons.jsonに存在するかチェック
        const person = registry.persons.find(p => p.personId === entry.personId);
        if (!person) {
          errors.push({
            type: 'MISSING_IN_REGISTRY',
            severity: 'error',
            message: `JSONファイルにあるpersonId "${entry.personId}" がpersons.jsonに存在しません`,
            details: {
              file: filePath,
              personId: entry.personId,
              name: entry.name,
              year: data.year,
              month: data.month
            }
          });
        } else {
          // 名前の一致チェック
          if (person.name !== entry.name) {
            errors.push({
              type: 'NAME_MISMATCH',
              severity: 'warning',
              message: `personId "${entry.personId}" の名前が不一致です`,
              details: {
                file: filePath,
                personId: entry.personId,
                registryName: person.name,
                entryName: entry.name
              }
            });
          }

          // 登場回数カウント
          actualAppearanceCounts.set(
            entry.personId,
            (actualAppearanceCounts.get(entry.personId) || 0) + 1
          );
        }
      }
    } catch (error) {
      errors.push({
        type: 'FILE_READ_ERROR',
        severity: 'error',
        message: `ファイル読み込みエラー: ${filePath}`,
        details: { error }
      });
    }
  }

  console.log(`  ✓ ${files.length}ファイルをチェック完了`);
  console.log(`  ✓ ${usedPersonIds.size}個のpersonIdを確認\n`);

  // 3. 未使用personIdチェック
  console.log('[3/5] 未使用personIdをチェック中...');

  const unusedPersonIds = registry.persons.filter(
    p => !usedPersonIds.has(p.personId)
  );

  if (unusedPersonIds.length > 0) {
    for (const person of unusedPersonIds) {
      errors.push({
        type: 'UNUSED_PERSON_ID',
        severity: 'warning',
        message: `personId "${person.personId}" (${person.name}) はJSONファイルで使用されていません`,
        details: { personId: person.personId, name: person.name }
      });
    }
  }

  console.log(`  ✓ 未使用personId: ${unusedPersonIds.length}件\n`);

  // 4. 登場回数の整合性チェック
  console.log('[4/5] 登場回数の整合性をチェック中...');

  for (const person of registry.persons) {
    const actualCount = actualAppearanceCounts.get(person.personId) || 0;
    if (actualCount !== person.appearanceCount) {
      errors.push({
        type: 'APPEARANCE_COUNT_MISMATCH',
        severity: 'warning',
        message: `personId "${person.personId}" (${person.name}) の登場回数が不一致です`,
        details: {
          personId: person.personId,
          name: person.name,
          registryCount: person.appearanceCount,
          actualCount
        }
      });
    }
  }

  console.log(`  ✓ 登場回数チェック完了\n`);

  // 5. personKeyの整合性チェック
  console.log('[5/5] personKeyの整合性をチェック中...');

  const nameGroups = new Map<string, PersonEntry[]>();
  for (const person of registry.persons) {
    if (!nameGroups.has(person.name)) {
      nameGroups.set(person.name, []);
    }
    nameGroups.get(person.name)!.push(person);
  }

  for (const [name, persons] of nameGroups) {
    if (persons.length > 1) {
      // 同名の人が複数いる場合、全員がpersonKeyを持っているべき
      const withoutKey = persons.filter(p => !p.personKey);
      if (withoutKey.length > 0) {
        errors.push({
          type: 'MISSING_PERSON_KEY',
          severity: 'warning',
          message: `同名の別人「${name}」が存在しますが、一部にpersonKeyがありません`,
          details: {
            name,
            totalCount: persons.length,
            withoutKeyCount: withoutKey.length,
            personIds: persons.map(p => `${p.personId}${p.personKey ? ` (key: ${p.personKey})` : ''}`)
          }
        });
      }
    }
  }

  console.log(`  ✓ personKeyチェック完了\n`);

  // 結果出力
  console.log('='.repeat(60));
  console.log('=== 検証結果 ===\n');

  if (errors.length === 0) {
    console.log('✅ エラーは見つかりませんでした！');
    console.log('   データの整合性は正常です。\n');
    return;
  }

  const errorCount = errors.filter(e => e.severity === 'error').length;
  const warningCount = errors.filter(e => e.severity === 'warning').length;

  console.log(`🔴 エラー: ${errorCount}件`);
  console.log(`🟡 警告: ${warningCount}件\n`);

  // エラー詳細
  if (errorCount > 0) {
    console.log('--- エラー詳細 ---\n');
    errors.filter(e => e.severity === 'error').forEach((error, i) => {
      console.log(`${i + 1}. [${error.type}] ${error.message}`);
      if (error.details) {
        console.log(`   詳細:`, JSON.stringify(error.details, null, 2));
      }
      console.log();
    });
  }

  // 警告詳細
  if (warningCount > 0) {
    console.log('--- 警告詳細 ---\n');
    errors.filter(e => e.severity === 'warning').forEach((error, i) => {
      console.log(`${i + 1}. [${error.type}] ${error.message}`);
      if (error.details) {
        console.log(`   詳細:`, JSON.stringify(error.details, null, 2));
      }
      console.log();
    });
  }

  console.log('='.repeat(60));

  // エラーがある場合は終了コード1で終了
  if (errorCount > 0) {
    process.exit(1);
  }
}

main();
