import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "seiseki");
const PERSONS_FILE = path.join(process.cwd(), "data", "persons", "persons.json");

interface SeisekiEntry {
  id: string;
  personId?: string;
  personKey?: string; // 同名の別人を区別するためのキー（任意）
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

// persons.json を読み込み
function loadPersonRegistry(): PersonRegistry {
  if (!fs.existsSync(PERSONS_FILE)) {
    console.error(`エラー: ${PERSONS_FILE} が見つかりません`);
    console.error("先に migrate-persons.ts を実行してください");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(PERSONS_FILE, "utf-8"));
}

// persons.json を保存
function savePersonRegistry(registry: PersonRegistry): void {
  registry.lastUpdated = new Date().toISOString();
  fs.writeFileSync(PERSONS_FILE, JSON.stringify(registry, null, 2), "utf-8");
}

// 名前とpersonKeyから一意のキーを生成
function getUniqueKey(name: string, personKey?: string): string {
  return personKey ? `${name}_${personKey}` : name;
}

// registryから名前→personIdのマップを構築
function buildNameToPersonIdMap(registry: PersonRegistry): Map<string, string> {
  const map = new Map<string, string>();
  for (const person of registry.persons) {
    const key = getUniqueKey(person.name, person.personKey || undefined);
    map.set(key, person.personId);
  }
  return map;
}

// 年月の昇順でファイルパスを取得
function getAllDataFiles(): string[] {
  const files: string[] = [];
  const years = fs
    .readdirSync(DATA_DIR)
    .filter((name) => !name.includes(".json") && !Number.isNaN(Number(name)))
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of years) {
    const yearDir = path.join(DATA_DIR, String(year));
    if (!fs.existsSync(yearDir)) continue;

    const months = fs
      .readdirSync(yearDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => parseInt(name.replace(".json", ""), 10))
      .sort((a, b) => a - b);

    for (const month of months) {
      files.push(path.join(yearDir, `${String(month).padStart(2, "0")}.json`));
    }
  }

  return files;
}

function main() {
  console.log("=== personId 割り当てスクリプト ===\n");

  // persons.json を読み込み
  const registry = loadPersonRegistry();
  const nameToPersonId = buildNameToPersonIdMap(registry);

  console.log(`読み込み: ${PERSONS_FILE}`);
  console.log(`既存の登録人数: ${registry.persons.length}名`);
  console.log(`次のpersonId: person_${String(registry.nextPersonId).padStart(3, "0")}\n`);

  const files = getAllDataFiles();
  let nextPersonId = registry.nextPersonId;
  let processedFiles = 0;
  let processedEntries = 0;
  const newPersons: PersonEntry[] = [];

  console.log(`処理対象ファイル数: ${files.length}`);
  console.log("personId割り当てを開始します...\n");

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data: SeisekiMonth = JSON.parse(content);

      let modified = false;
      for (const entry of data.entries) {
        // 空エントリーはスキップ
        if (entry.isEmpty) continue;

        // personIdがない、または空文字の場合のみ処理
        if (!entry.personId || entry.personId === "") {
          const uniqueKey = getUniqueKey(entry.name, entry.personKey);

          if (!nameToPersonId.has(uniqueKey)) {
            // 新規person登録
            const newPersonId = `person_${String(nextPersonId).padStart(3, "0")}`;
            nameToPersonId.set(uniqueKey, newPersonId);

            const newPerson: PersonEntry = {
              personId: newPersonId,
              name: entry.name,
              personKey: entry.personKey || null,
              firstAppearance: { year: data.year, month: data.month },
              lastAppearance: { year: data.year, month: data.month },
              appearanceCount: 1,
              createdAt: new Date().toISOString(),
              note: entry.personKey ? `personKey="${entry.personKey}" で同名の別人と区別` : "",
            };

            newPersons.push(newPerson);

            const displayKey = entry.personKey ? `${entry.name} (${entry.personKey})` : entry.name;
            console.log(`新規割り当て: ${displayKey} → ${newPersonId}`);

            nextPersonId++;
          }

          entry.personId = nameToPersonId.get(uniqueKey)!;
          modified = true;
          processedEntries++;
        }
      }

      if (modified) {
        // updatedAtを更新
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        processedFiles++;
      }
    } catch (error) {
      console.error(`エラー: ${filePath}`, error);
    }
  }

  console.log("\n=== 処理完了 ===");
  console.log(`処理ファイル数: ${processedFiles}`);
  console.log(`処理エントリー数: ${processedEntries}`);
  console.log(`新規割り当て人数: ${newPersons.length}`);

  // persons.json を更新（新規personがいる場合のみ）
  if (newPersons.length > 0) {
    registry.persons.push(...newPersons);
    registry.nextPersonId = nextPersonId;
    savePersonRegistry(registry);
    console.log(`\npersons.json を更新しました`);
    console.log(`新しい次のpersonId: person_${String(nextPersonId).padStart(3, "0")}`);
  } else {
    console.log("\n新規personはありません。persons.json は変更されませんでした。");
  }

  if (newPersons.length > 0) {
    console.log("\n=== 新規登録者一覧 ===");
    for (const person of newPersons) {
      const displayKey = person.personKey ? `${person.name} (${person.personKey})` : person.name;
      console.log(`${person.personId}: ${displayKey}`);
    }
  }
}

main();
