---
name: ranking-main-keywords
description: all_keywords.md に記載された全記事のメインキーワードの現在の検索順位をAhrefsで取得し、CSVで出力する。
---

# メインキーワード検索順位取得

`keywords/all_keywords.md` に記載されたすべての記事のメインキーワードについて、現在の検索順位を取得し `keywords/main_keyword_ranking_YYYYMMDD.csv` に出力する。

---

## 入出力ファイル

```
.claude/
└── CLAUDE.md                                 # 入力：サービスURL・ブログURL
keywords/
├── all_keywords.md                           # 入力：全記事キーワード一覧
└── main_keyword_ranking_YYYYMMDD.csv         # 出力（日付は実行日）
```

---

## ステップ1：メインキーワード一覧を取得する

`keywords/all_keywords.md` の `★` 行（メインKW行）をすべて読み込み、記事Noとメインキーワードの対応表を作成する。

---

## ステップ2：ブログ全体のオーガニックキーワードを一括取得する

### Ahrefs パラメータ

```
ツール: site-explorer-organic-keywords
必須パラメータ:
  - target: ブログのドメインパス（例: webmasters.ysinc.co.jp/blog）
  - mode: "prefix"
  - date: 今日の日付（YYYY-MM-DD形式）
  - country: "jp"
  - select: "keyword,best_position,best_position_url,volume"
  - limit: 1000
  - order_by: "best_position:asc"
```

これにより、ブログ全体で現在ランキングしているすべてのキーワードを一括取得する。

---

## ステップ3：メインキーワードと照合する

ステップ2で取得したキーワードリストと、ステップ1のメインキーワード一覧を照合する。

- **完全一致するものは順位を記載**
- **一致しないものは「圏外」と記載**
- 完全一致はないが関連キーワードが取得できた場合は、備考欄に `[関連KW] [順位]位で一部表示` と記載する

---

## ステップ4：CSV に出力する

出力先：`./keywords/main_keyword_ranking_YYYYMMDD.csv`（例：`main_keyword_ranking_20260312.csv`）

### フォーマット

```csv
記事No,メインキーワード,検索順位,備考
1,javascript とは,圏外,
56,border-radius,28位,
75,css background,25位,
```

- **検索順位** は数値 + 「位」（例：`25位`）または `圏外`
- **備考** は関連KWで部分的にランキングしている場合のみ記載

---

## ステップ5：サマリーをユーザーに伝える

出力後、以下のサマリーをユーザーに報告する：

- 順位あり：N記事（内訳：上位10位以内/11〜30位/31〜100位）
- 圏外：N記事
- CSV保存先：`keywords/main_keyword_ranking_YYYYMMDD.csv`

---

## エラー対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `column 'position' not found` | カラム名の誤り | `best_position` を使用する（`position` は存在しない） |
| 取得件数が少ない | ブログの掲載ページ数・順位が少ない | 正常。圏外の記事はまだ公開されていないか、100位以下の状態 |
| 0件返却 | ブログにオーガニック流入がない | `mode: prefix` と target のパスを確認する |
