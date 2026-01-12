# 成績データ自動インポートガイド

元サイト（https://daikyujyo.com/seiseki.html）から最新の成績データを自動的に取得してJSONファイルに変換するツールの使用方法です。

## 概要

このツールは以下の処理を自動化します：

1. 元サイトからHTMLを取得（または保存済みHTMLを使用）
2. 成績データを抽出
3. JSONファイルに変換
4. personIDを自動割り当て
5. persons.jsonを更新
6. index.jsonを更新（グラフ表示に必要）

## 使い方

### 方法1: オンライン取得（推奨）

ローカル環境で実行する場合、直接サイトからデータを取得できます：

```bash
npx tsx scripts/import-seiseki.ts --fetch --year 2025 --month 12
```

**注意**: Claude Codeの実行環境ではネットワーク制限のため、この方法は使用できません。方法2を使用してください。

### 方法2: 保存済みHTMLから取得

1. ブラウザで https://daikyujyo.com/seiseki.html を開く
2. 成績が表示された状態で、ページを保存：
   - Chrome: `Ctrl+S` (Windows/Linux) または `Cmd+S` (Mac)
   - 「完全なウェブページ」として保存
3. 保存したHTMLファイルを使用：

```bash
npx tsx scripts/import-seiseki.ts --file path/to/seiseki.html --year 2025 --month 12
```

例:
```bash
# tmpディレクトリに保存した場合
npx tsx scripts/import-seiseki.ts --file tmp/seiseki.html --year 2026 --month 1
```

## 処理内容

スクリプトは以下の処理を自動実行します：

### 1. データ抽出
- HTMLからテーブルを検出
- 順位、名前、段位級位、的サイズを抽出

### 2. JSONファイル生成
- `/data/seiseki/YYYY/MM.json` を生成
- UUID、日付などを自動設定

### 3. PersonID割り当て
- `npm run add-person-ids` を自動実行
- 新しい人物に person_XXX を割り当て

### 4. レジストリ更新
- `npm run migrate-persons` を自動実行
- persons.json の統計を更新

### 5. Markdown生成
- `npm run generate-persons-md` を自動実行
- persons.md を再生成

### 6. インデックス更新
- index.json に新しい月のデータを追加
- **これにより成績推移グラフに反映されます**

## 完了後の確認

1. **生成されたファイルを確認**:
   ```bash
   cat data/seiseki/2025/12.json
   ```

2. **バリデーション実行**:
   ```bash
   npm run validate-person-ids
   ```

3. **変更をコミット**:
   ```bash
   git add data/
   git commit -m "成績データ追加: 2025年12月"
   git push
   ```

## トラブルシューティング

### エラー: "No entries extracted"

HTMLの構造が想定と異なる場合、データが抽出できません。

**対処法**:
1. デバッグ用に保存された `tmp/debug-seiseki.html` を確認
2. `scripts/import-seiseki.ts` の `parseSeisekiData` 関数を調整
3. テーブルのセレクタや列の順序を実際の構造に合わせる

### ネットワークエラー: 403 Forbidden

Claude Code環境では外部サイトへのアクセスが制限されています。

**対処法**:
- 方法2（保存済みHTMLから取得）を使用

### PersonID の重複

既存の人物に新しいIDが割り当てられた場合。

**対処法**:
1. `data/persons/persons.json` を確認
2. 重複を見つけて手動で修正
3. `npm run migrate-persons` を再実行

## HTMLの構造調査

元サイトの構造を調査するには：

```bash
# 方法1: オンライン（ローカル環境のみ）
npx tsx scripts/scrape-seiseki-simple.ts

# 方法2: 保存済みHTMLを調査
# scripts/import-seiseki.ts を --file オプションで実行すると
# 自動的に構造を分析してデバッグ情報を出力します
```

## 現在の制限事項

1. **HTMLパーサーは汎用的な実装**
   - 元サイトの実際の構造に応じて調整が必要な場合があります
   - `parseSeisekiData` 関数を必要に応じてカスタマイズしてください

2. **日付の推測**
   - 更新日と有効期限は過去のパターンから推測して生成されます
   - 元サイトに正確な日付情報がある場合は、パース処理を調整してください

3. **月の切り替え**
   - 現在は1つの月のデータのみを想定
   - 元サイトに月選択機能がある場合は、対応する処理を追加する必要があります

## 次のステップ

このツールを使用する前に：

1. 元サイトのHTML構造を確認
2. 必要に応じて `parseSeisekiData` 関数をカスタマイズ
3. テストデータで動作確認
4. 本番データで実行

## 参考

- 手動での成績登録: [seiseki-registration-guide.md](./seiseki-registration-guide.md)
- PersonID管理: `data/persons/persons.md`
