# 通常成績データ登録ガイド

## 概要

このドキュメントでは、大弓場の通常成績データを登録する手順とノウハウをまとめています。

## データ構造

### 個別月次ファイル (`/data/seiseki/{YEAR}/{MM}.json`)

```json
{
  "year": 2025,
  "month": 10,
  "entries": [
    {
      "id": "uuid-string",
      "rank": 1,
      "name": "名前",
      "rankTitle": "段級位",
      "targetSize": "的のサイズ",
      "updatedDate": "",
      "expiryDate": ""
    }
  ],
  "publishedAt": "2025-12-09T10:54:02.478Z",
  "updatedAt": "2025-12-09T10:54:02.478Z"
}
```

### インデックスファイル (`/data/seiseki/index.json`)

```json
{
  "archives": [
    {
      "year": 2025,
      "month": 10,
      "entryCount": 10,
      "publishedAt": "2025-12-09T10:54:02.478Z"
    }
  ],
  "lastUpdated": "2025-12-09T10:54:02.478Z"
}
```

## データ登録の基本ルール

### 1. エントリ数
- **標準**: 各月10名まで
- **例外**: データが不完全な場合は6〜10名の範囲で変動あり
  - 例: 2021年6月は6名、2021年3月は9名

### 2. 必須フィールド
- `id`: UUID (crypto.randomUUID()で自動生成)
- `rank`: 順位 (1〜10)
- `name`: 氏名
- `rankTitle`: 段級位 (例: "初段", "二級", "三段")
- `targetSize`: 的のサイズ (例: "1寸2分", "2寸", "3寸4分")
- `updatedDate`: 空文字列 `""`
- `expiryDate`: 空文字列 `""`

### 3. 段級位の表記
- **段**: "初段", "二段", "三段", "四段", "五段"
- **級**: "一級", "二級", "三級", "四級", "五級"
- **空白許可**: rankTitleが空文字列 `""` の場合もあり

### 4. 的のサイズ表記
- **形式**: "X寸Y分" または "X寸" または "Y分"
- **例**:
  - "6分" (1寸未満)
  - "1寸2分"
  - "2寸"
  - "3寸6分"

## 新規年度データ登録手順

### ステップ1: データ変換スクリプト作成

**テンプレート**: `/tmp/convert_seiseki_data_{YEAR}.js`

```javascript
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ユーザー提供データ（例: 令和7年 = 2025年）
const monthlyData = {
  1: [ // 1月
    { rank: 1, targetSize: "1寸2分", name: "名前", rankTitle: "二段" },
    // ... 10位まで
  ],
  // 2月〜12月
};

// JSONに変換する関数
function convertToJSON(month, entries) {
  const limitedEntries = entries.slice(0, 10); // 10名に制限

  return {
    year: 2025, // ← 対象年を指定
    month: month,
    entries: limitedEntries.map(entry => ({
      id: crypto.randomUUID(),
      rank: entry.rank,
      name: entry.name,
      rankTitle: entry.rankTitle,
      targetSize: entry.targetSize,
      updatedDate: "",
      expiryDate: ""
    })),
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ファイル保存
function saveFiles() {
  const baseDir = '/path/to/project/data/seiseki/2025';

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  for (let month = 1; month <= 12; month++) {
    const data = convertToJSON(month, monthlyData[month]);
    const fileName = `${String(month).padStart(2, '0')}.json`;
    const filePath = path.join(baseDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✓ Saved: ${fileName} (${data.entries.length} entries)`);
  }

  console.log('\n✅ All files saved successfully!');
  console.log(`📁 Location: ${baseDir}`);
}

saveFiles();
```

### ステップ2: スクリプト実行

```bash
node /tmp/convert_seiseki_data_2025.js
```

**期待される出力**:
```
✓ Saved: 01.json (10 entries)
✓ Saved: 02.json (10 entries)
...
✓ Saved: 12.json (10 entries)

✅ All files saved successfully!
📁 Location: /path/to/project/data/seiseki/2025
```

### ステップ3: index.json更新（重要：グラフ反映に必須）

⚠️ **重要**: `index.json` を更新しないと、成績推移グラフに新しいデータが反映されません。
月次JSONファイル（`/data/seiseki/{YEAR}/{MM}.json`）を作成・更新した場合は、**必ず** `index.json` も更新してください。

**方法1: スクリプトで一括更新**

```javascript
const fs = require('fs');
const path = require('path');

const indexPath = '/path/to/project/data/seiseki/index.json';
const indexData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

// 2025年の12ヶ月分を追加
const newEntries = [];
for (let month = 12; month >= 1; month--) {
  newEntries.push({
    year: 2025,
    month: month,
    entryCount: 10,
    publishedAt: new Date().toISOString()
  });
}

// 既存のarchivesの先頭に追加（降順維持）
indexData.archives = [...newEntries, ...indexData.archives];
indexData.lastUpdated = new Date().toISOString();

fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
console.log('✅ index.json updated successfully!');
```

**方法2: 手動編集**

1. `index.json`を開く
2. `archives`配列の先頭に新しいエントリを追加
3. `lastUpdated`を現在日時に更新
4. 降順ソート（新しい年月が先頭）を維持

### ステップ4: 検証

```bash
# ディレクトリ確認
ls -la /path/to/project/data/seiseki/2025/

# ファイル数確認
ls /path/to/project/data/seiseki/2025/ | wc -l
# 期待値: 12 (12ヶ月分)

# サンプルファイル内容確認
cat /path/to/project/data/seiseki/2025/01.json
```

## データ欠損がある場合の処理

### 一部の月が欠損している場合

**例**: 2016年は1〜3月のデータなし（4〜12月のみ）

```javascript
// 提供されているデータのみ保存
const availableMonths = [4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const month of availableMonths) {
  const data = convertToJSON(month, monthlyData[month]);
  const fileName = `${String(month).padStart(2, '0')}.json`;
  const filePath = path.join(baseDir, fileName);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✓ Saved: ${fileName} (${data.entries.length} entries)`);
}
```

**結果**: `04.json` 〜 `12.json` のみ生成

### 特定の月が欠損している場合

**例**: 2010年は8月のデータなし

```javascript
const availableMonths = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12];

for (const month of availableMonths) {
  // 処理
}
```

**結果**: `08.json` が生成されない

## データの特殊ケース処理

### 1. 重複順位の修正

**問題**: ユーザー提供データに重複順位が存在

```javascript
// 修正前（ユーザー提供データ）
{ rank: 4, targetSize: "2寸4分", name: "佐藤", rankTitle: "三級" },
{ rank: 5, targetSize: "2寸4分", name: "吉田", rankTitle: "四級" },
{ rank: 4, targetSize: "2寸8分", name: "津守", rankTitle: "三段" }, // 重複
{ rank: 7, targetSize: "2寸8分", name: "田川", rankTitle: "四級" },

// 修正後
{ rank: 4, targetSize: "2寸4分", name: "佐藤", rankTitle: "三級" },
{ rank: 5, targetSize: "2寸4分", name: "吉田", rankTitle: "四級" },
{ rank: 6, targetSize: "2寸8分", name: "津守", rankTitle: "三段" }, // 6位に修正
{ rank: 7, targetSize: "2寸8分", name: "田川", rankTitle: "四級" },
```

### 2. 重複エントリの削除

**問題**: 同じ人物が複数回登場

```javascript
// 修正前
{ rank: 8, targetSize: "3寸2分", name: "濱野", rankTitle: "三級" },
{ rank: 9, targetSize: "3寸2分", name: "濱野", rankTitle: "三級" }, // 重複

// 修正後（片方を削除）
{ rank: 8, targetSize: "3寸2分", name: "濱野", rankTitle: "三級" },
```

### 3. 空の段級位

**問題**: 一部の参加者に段級位がない

```javascript
// 許可される形式
{
  "id": "uuid",
  "rank": 6,
  "name": "城戸快成",
  "rankTitle": "", // 空文字列OK
  "targetSize": "4寸",
  "updatedDate": "",
  "expiryDate": ""
}
```

## 和暦→西暦変換表

| 和暦 | 西暦 | 備考 |
|------|------|------|
| 令和7年 | 2025年 | |
| 令和6年 | 2024年 | |
| 令和5年 | 2023年 | |
| 令和4年 | 2022年 | |
| 令和3年 | 2021年 | |
| 令和2年 | 2020年 | |
| 令和元年/平成31年 | 2019年 | 5月1日改元 |
| 平成30年 | 2018年 | |
| 平成29年 | 2017年 | |
| 平成28年 | 2016年 | |
| 平成27年 | 2015年 | |
| 平成26年 | 2014年 | |
| 平成25年 | 2013年 | |
| 平成24年 | 2012年 | |
| 平成23年 | 2011年 | |
| 平成22年 | 2010年 | |

## トラブルシューティング

### Q1: スクリプト実行時に「モジュールが見つからない」エラー

**エラー**:
```
Error: Cannot find module 'crypto'
```

**解決策**:
- Node.js 14.x以降を使用していることを確認
- `crypto`はNode.js標準モジュールなので、追加インストール不要

### Q2: ファイルが生成されない

**確認事項**:
1. ディレクトリのパスが正しいか
2. 書き込み権限があるか
3. `fs.mkdirSync(baseDir, { recursive: true })` が実行されているか

### Q3: index.jsonの順序が崩れた

**修正方法**:
```javascript
// 降順ソート（年月の新しい順）
indexData.archives.sort((a, b) => {
  if (a.year !== b.year) return b.year - a.year;
  return b.month - a.month;
});
```

### Q4: UUIDが重複する可能性は?

**回答**:
- `crypto.randomUUID()` は UUID v4 を生成
- 衝突確率は極めて低い（実質的に0）
- 毎回異なるUUIDが生成されるため、問題なし

## データ登録の実績

### 現在登録済みのデータ

| 年 | 月数 | 備考 |
|---|------|------|
| 2025年 | 10ヶ月 | 1月〜10月 |
| 2024年 | 12ヶ月 | 1月〜12月 |
| 2023年 | 12ヶ月 | 1月〜12月 |
| 2022年 | 10ヶ月 | 1月〜4月, 7月〜12月 (5-6月なし) |
| 2021年 | 12ヶ月 | 1月〜12月 (エントリ数可変) |
| 2020年 | 11ヶ月 | 4月なし |
| 2019年 | 12ヶ月 | 1月〜12月 |
| 2018年 | 12ヶ月 | 1月〜12月 |
| 2017年 | 12ヶ月 | 1月〜12月 |
| 2016年 | 9ヶ月 | 4月〜12月 (1-3月なし) |
| 2015年 | 12ヶ月 | 1月〜12月 |
| 2014年 | 12ヶ月 | 1月〜12月 |
| 2012年 | 12ヶ月 | 1月〜12月 |
| 2011年 | 12ヶ月 | 1月〜12月 |
| 2010年 | 11ヶ月 | 8月なし |

**総アーカイブ数**: 171件

## ベストプラクティス

### 1. 年単位で処理する

大量のデータを一度に登録する場合、年ごとに分けて処理することで:
- コンテキストオーバーフローを防ぐ
- エラー発生時の影響範囲を限定
- 進捗状況を把握しやすい

### 2. スクリプトは保存しておく

作成したスクリプトは削除せず、以下の用途で保管:
- データの再生成が必要な場合
- 他の年度のテンプレートとして利用
- データ構造の参照資料

**推奨保存先**: `/tmp/convert_seiseki_data_{YEAR}.js`

### 3. 検証を必ず実施

データ登録後、以下を必ず確認:
1. ファイル数が正しいか
2. JSON構造が正しいか
3. サンプルファイルの内容確認
4. index.jsonの更新確認

### 4. バックアップを取る

`index.json` 更新前に必ずバックアップ:
```bash
cp /path/to/index.json /path/to/index.json.backup
```

## まとめ

通常成績データの登録は以下の4ステップ:

1. **データ変換スクリプト作成** - 提供データをJSON形式に変換
2. **スクリプト実行** - 月次JSONファイルを生成
3. **index.json更新** - アーカイブインデックスに追加
4. **検証** - ファイル生成とデータ正確性を確認

データ欠損や特殊ケースに対応しながら、一貫した形式でデータを管理することが重要です。

---

**最終更新日**: 2025-12-10
**作成者**: Claude Code
**バージョン**: 1.0.0
