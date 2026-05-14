---
name: ranking-top-pages
description: ブログの上位ページ一覧を取得し、各ページの上位3キーワードと順位をCSVで出力する。
---

# ブログ上位ページ × キーワード順位取得

ブログ全体のトラフィック上位ページを取得し、各ページの上位3キーワードと順位を `keywords/ranking_report_YYYYMMDD.csv` に出力する。

---

## 入出力ファイル

```
.claude/
└── CLAUDE.md                          # 入力：サービスURL・ブログURL
keywords/
└── ranking_report_YYYYMMDD.csv        # 出力（日付は実行日）
```

---

## ステップ1：ブログURLを確認する

`CLAUDE.md` の **Service Configuration「ブログURL」** からブログのドメインパスを取得する。
例：`https://webmasters.ysinc.co.jp/blog/` → target: `webmasters.ysinc.co.jp/blog`

---

## ステップ2：上位ページ一覧を取得する

### Ahrefs パラメータ

```
ツール: site-explorer-top-pages
必須パラメータ:
  - target: ブログのドメインパス（例: webmasters.ysinc.co.jp/blog）
  - mode: "prefix"
  - date: 今日の日付（YYYY-MM-DD形式）
  - country: "jp"
  - select: "url,top_keyword,top_keyword_best_position,sum_traffic,keywords"
  - limit: 100
  - order_by: "sum_traffic:desc"
```

---

## ステップ3：各ページの上位3キーワードを取得する

ステップ2で得たページのうち、**`keywords` が3以上のページ**については `site-explorer-organic-keywords` で上位3KWを取得する。

`keywords` が1〜2のページはステップ2の `top_keyword` / `top_keyword_best_position` をそのまま使用する。

### Ahrefs パラメータ

```
ツール: site-explorer-organic-keywords
必須パラメータ:
  - target: 各ページのURL（フルURL）
  - mode: "exact"
  - date: 今日の日付（YYYY-MM-DD形式）
  - country: "jp"
  - select: "keyword,best_position,volume,keyword_difficulty"
  - limit: 3
  - order_by: "best_position:asc"
```

### 実行方法

- `keywords` が3以上のページへのAPIコールはすべて**並列で同時実行**する

---

## ステップ4：CSV に出力する

出力先：`./keywords/ranking_report_YYYYMMDD.csv`（例：`ranking_report_20260312.csv`）

### フォーマット

```csv
記事No,ページ（URL末尾）,月間流入,キーワード1,順位1,キーワード2,順位2,キーワード3,順位3
```

- **記事No** は `keywords/all_keywords.md` に記載された番号と照合して付与する。対応する記事がない場合は `-`
- **ページ（URL末尾）** はブログURL以降のパス部分のみ記載する
- **月間流入** は `sum_traffic` の値
- キーワードが1〜2件しかない場合は残列を `-` で埋める

---

## エラー対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `column not found` | selectのカラム名が間違っている | `keywords` (複数形) を使用。`keywords_count` は存在しない |
| `mode: exact` で空返却 | ページURLが正確でない | URLの末尾スラッシュの有無を確認する |
| 結果が0件 | ブログにトラフィックがない | 正常。その旨をユーザーに伝える |
