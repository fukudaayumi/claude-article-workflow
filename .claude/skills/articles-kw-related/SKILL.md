---
name: articles-kw-related
description: Phase 2 of keyword selection for a service blog. Reads new-keywords.md, searches for 3 related keywords per keyword via Ahrefs, filters based on the service/genre type specified in Phase 1, and outputs results to related-keywords.md in both markdown table and tab-separated formats.
---

# フェーズ2：関連キーワード取得

`new-keywords.md` の各キーワードに対して関連KWを3つずつ取得し、`related-keywords.md` に出力する。

---

## 入出力ファイル

```
keywords/
├── new-keywords.md      # 入力：フェーズ1の出力
└── related-keywords.md  # 出力
```

---

## ステップ5：関連キーワードを検索する

`./keywords/new-keywords.md` から全キーワードを読み込み、Ahrefsで関連KWを検索する。

### Ahrefs パラメータ設定

```
ツール: keywords-explorer-matching-terms
必須パラメータ:
  - keywords: "[メインKW]"
  - country: "jp"
  - select: "keyword,volume"
  - order_by: "volume:desc"
  - limit: 10
  - where: 'volume > 0'
```

### 関連KW選定基準
- メインキーワードと**完全に同じではない**こと
- CLAUDE.md の **Service Configuration「サービスジャンル」** のブログ記事として違和感がないこと
- ネガティブワードを含まないこと（やめとけ、やばい、最悪、ブラック 等）
- ボリュームが大きいものから優先して3つ選ぶ
- データなしの場合は検索意図から類推して補完し、Vol を空欄とする

### 効率化
- 5〜10キーワードをバッチにして並列実行する

---

## ステップ6：related-keywords.md に出力する

出力先：`./keywords/related-keywords.md`

### セクション1：マークダウン表

```markdown
# 新規キーワード候補 関連KW一覧

各メインKWにつき関連KWを3つずつ記載（ボリューム順）。
ボリューム空欄はAhrefsデータなし（検索意図から類推）。

| # | メインKW | 月間Vol | 関連KW① | Vol | 関連KW② | Vol | 関連KW③ | Vol |
|---|---------|--------|---------|-----|---------|-----|---------|-----|
| 1 | [KW] | [Vol] | [関連①] | [Vol] | [関連②] | [Vol] | [関連③] | [Vol] |
```

### セクション2：スプレッドシート出力用①（グループ形式）

メインKWの次にサブKWを並べる。ボリュームなしは空欄（タブのみ）。

```
KW	月間Vol
メインKW	10,000
サブKW①	5,000
サブKW②	3,000
サブKW③
```

### セクション3：スプレッドシート出力用②（フラット形式）

メイン・サブ関係なくキーワードと月間ボリュームをフラットに並べる。
形式はセクション2と同じだがグルーピングの意味合いが異なる。
