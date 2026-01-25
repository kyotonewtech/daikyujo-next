import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data", "seiseki");
const PERSONS_FILE = path.join(process.cwd(), "data", "persons", "persons.json");

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
  console.log("=== persons.json 初回生成スクリプト ===\n");

  const files = getAllDataFiles();
  const personMap = new Map<string, PersonEntry>();

  console.log(`処理対象ファイル数: ${files.length}`);
  console.log("全JSONファイルをスキャンしています...\n");

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data: SeisekiMonth = JSON.parse(content);

      for (const entry of data.entries) {
        // 空エントリーまたはpersonIdが未設定の場合はスキップ
        if (entry.isEmpty || !entry.personId) continue;

        if (!personMap.has(entry.personId)) {
          // 新規person登録
          personMap.set(entry.personId, {
            personId: entry.personId,
            name: entry.name,
            personKey: entry.personKey || null,
            firstAppearance: { year: data.year, month: data.month },
            lastAppearance: { year: data.year, month: data.month },
            appearanceCount: 1,
            createdAt: new Date().toISOString(),
            note: "",
          });
        } else {
          // 既存personの統計更新
          const person = personMap.get(entry.personId)!;
          person.appearanceCount++;

          // 最終登場を更新（年月が後の場合）
          if (
            data.year > person.lastAppearance.year ||
            (data.year === person.lastAppearance.year && data.month > person.lastAppearance.month)
          ) {
            person.lastAppearance = { year: data.year, month: data.month };
          }
        }
      }
    } catch (error) {
      console.error(`エラー: ${filePath}`, error);
    }
  }

  console.log(`収集したperson数: ${personMap.size}\n`);

  // 最大personId番号を取得
  let maxPersonId = 0;
  for (const [personId] of personMap) {
    if (personId.startsWith("person_")) {
      const idNum = parseInt(personId.replace("person_", ""), 10);
      if (!Number.isNaN(idNum) && idNum > maxPersonId) {
        maxPersonId = idNum;
      }
    }
  }

  // persons.json を生成
  const registry: PersonRegistry = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    nextPersonId: maxPersonId + 1,
    persons: Array.from(personMap.values()).sort((a, b) => {
      const aNum = parseInt(a.personId.replace("person_", ""), 10);
      const bNum = parseInt(b.personId.replace("person_", ""), 10);
      return aNum - bNum;
    }),
  };

  // personKey を使用している人に自動でnoteを追加
  for (const person of registry.persons) {
    if (person.personKey) {
      person.note = `personKey="${person.personKey}" で同名の別人と区別`;
    }
  }

  // ファイル保存
  fs.writeFileSync(PERSONS_FILE, JSON.stringify(registry, null, 2), "utf-8");

  console.log("=== 生成完了 ===");
  console.log(`出力先: ${PERSONS_FILE}`);
  console.log(`登録人数: ${registry.persons.length}名`);
  console.log(`次のpersonId: person_${String(registry.nextPersonId).padStart(3, "0")}`);
  console.log(`最終更新: ${registry.lastUpdated}`);

  // 統計情報
  const withPersonKey = registry.persons.filter((p) => p.personKey).length;
  const maxAppearances = Math.max(...registry.persons.map((p) => p.appearanceCount));
  const topPerson = registry.persons.find((p) => p.appearanceCount === maxAppearances);

  console.log("\n=== 統計 ===");
  console.log(`personKey使用: ${withPersonKey}名`);
  console.log(`最多登場: ${topPerson?.name} (${maxAppearances}回)`);
}

main();
