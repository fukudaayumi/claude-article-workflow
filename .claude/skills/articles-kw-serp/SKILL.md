---
name: articles-kw-serp
description: Phase 3 of keyword selection for a service blog. Reads new-keywords.md and competitor URLs from CLAUDE.md, fetches the best-ranking competitor URL for each keyword via Ahrefs site-explorer-organic-keywords, and outputs results to competitor-serp.md.
---

# フェーズ3：競合SERP分析

`new-keywords.md` の全キーワードについて、競合サイトの最上位ランキングURLを取得し `competitor-serp.md` に出力する。

---

## 入出力ファイル

```
.claude/
└── CLAUDE.md           # 入力：競合URLリスト（Service Configuration「競合ブログURL」）
keywords/
├── new-keywords.md     # 入力：フェーズ1の出力
└── competitor-serp.md  # 出力
```

---

## ステップ7：各キーワードの競合最上位URLを取得する

### 事前準備

- `Grep` ツールで `.claude/CLAUDE.md` の **Service Configuration「競合ブログURL」** から競合サイトのURLを取得する
- `./keywords/new-keywords.md` の末尾にある「キーワード一覧（番号・キーワード・ボリュームのみ）」テーブルから全キーワードを取得する

### Ahrefs パラメータ設定

```
ツール: site-explorer-organic-keywords
必須パラメータ:
  - target: 競合ドメイン
  - mode: "subdomains"
  - date: 今日の日付（YYYY-MM-DD形式）
  - country: "jp"
  - select: "keyword,best_position,best_position_url,volume"
  - where: 全キーワードのOR条件（positionフィルターなし）
  - limit: キーワード数と同数
```

### where 条件の組み立て方

全キーワードを `or` でまとめた JSON フィルター（position制限なし）：

```json
{"or": [
  {"field": "keyword", "is": ["eq", "キーワード1"]},
  {"field": "keyword", "is": ["eq", "キーワード2"]},
  ...
]}
```

### 実行方法

- 競合サイト全てを**並列で同時実行**する（1サイト = 1回のAPI呼び出し）
- 各サイトに対して上記のOR条件を渡す

### 集計方法

各キーワードについて、全サイトの結果を比較し `best_position` が最も小さいサイトのURLを採用する。

---

## ステップ8：competitor-serp.md に出力する

出力先：`./keywords/competitor-serp.md`

```markdown
# 新規KW候補[N]件 × 競合SERP分析

取得方法：`site-explorer-organic-keywords` の `best_position_url`（全競合サイト中の最上位を採用）

**調査対象の競合サイト:**
- [サイト1]
- [サイト2]

---

## サマリー

- 競合URLあり：**[N]件**
- 競合データなし（全サイトともランク圏外）：**[N]件**

---

## 全[N]件一覧

| # | キーワード | 月間Vol | 競合サイト | 順位 | 競合URL |
|---|-----------|--------|-----------|------|---------|
| 1 | [KW] | [Vol] | [サイト] | [順位] | [URL] |
| 2 | [KW] | [Vol] | ー | ー | ー |

---

## スプレッドシート出力用（タブ区切り）

キーワード	月間Vol	競合サイト	順位	競合URL
[KW]	[Vol]	[サイト]	[順位]	[URL]
[KW]	[Vol]
```

### 注意事項
- 競合データなしのキーワードは「ー」で表記し、URLは空欄にする
- スプレッドシート用では競合なし行はキーワードと月間Volのみ記載

---

## エラー対処

| エラー | 原因 | 対処 |
|--------|------|------|
| 件数が少ない | 旧バージョンでposition制限をかけていた | whereからpositionフィルターを除去して再取得 |
| 0件返却 | ドメイン指定が間違っている | `mode=subdomains` でドメインのみ指定 |
