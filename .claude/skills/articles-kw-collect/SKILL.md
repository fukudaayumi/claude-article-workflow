---
name: articles-kw-collect
description: Phase 1 of keyword selection for a service blog. Asks for the service/genre type, reads competitor URLs from CLAUDE.md and existing article keywords from all_keywords.md, fetches organic keywords from competitors via Ahrefs, filters/deduplicates based on the service type, and outputs new keyword candidates to new-keywords.md.
---

# フェーズ1：キーワード収集・選定

競合サイトのオーガニックキーワードを収集し、既存記事との重複チェックを経て新規キーワード候補を `new-keywords.md` に出力する。

---

## 開始時の確認事項

以下を確認する（未指定の場合はユーザーに質問する）：

1. **サービス・ジャンル**：CLAUDE.md の **Service Configuration「サービスジャンル」** を参照する
   - フィルタリング基準（不適切なKWの判断）に使用する

2. **取得キーワード数**：何件の新規キーワード候補が欲しいか（例：30件、50件）
   - 指定がない場合は「何件取得しますか？」と聞く

---

## 入出力ファイル

```
.claude/
└── CLAUDE.md         # 入力：競合URLリスト（Service Configuration「競合ブログURL」）
keywords/
├── all_keywords.md   # 入力：既存記事キーワード（重複チェック用）
└── new-keywords.md   # 出力
```

---

## ステップ1：入力ファイルを読み込む

### 競合URLの取得

`Grep` ツールで `.claude/CLAUDE.md` の **Service Configuration「競合ブログURL」** を読み込み、競合ブログのURL一覧を取得する。

### 既存記事キーワードの取得（重複チェック用）

`Grep` ツールで `keywords/all_keywords.md` から `★` が付いた行のみを抽出し、メインキーワード（クエリ列）の一覧を取得する。
ファイル全体を Read で読み込まないこと。

---

## ステップ2：競合サイトのオーガニックキーワードを収集する

### Ahrefs パラメータ設定

```
ツール: site-explorer-organic-keywords
必須パラメータ:
  - target: ドメイン（パス付きの場合はパスも含む）
  - mode: "subdomains"（ドメイン全体）または "prefix"（パス配下）
  - date: 今日の日付（YYYY-MM-DD形式）
  - country: "jp"
  - select: "keyword,volume,keyword_difficulty,position"
  - order_by: "volume:desc"
  - where: 'volume > 500 AND position <= 10'
  - limit: 25
```

### 注意事項
- `difficulty` ではなく `keyword_difficulty` を使う（カラム名エラーに注意）
- パス付きURLは `mode=prefix`、0件の場合はドメインのみで `mode=subdomains` に切り替える
- 1回25件上限のため、次バッチは `where: 'volume < [前回最小値] AND position <= 10'` で取得
- 複数サイトは並列で実行して効率化

### 収集の目安

指定されたキーワード数の **3〜5倍** を目安に収集し、フィルタリング後に必要数に絞る。

---

## ステップ3：フィルタリングと重複チェック

### 除外するもの
- 既存記事と**完全に同じトピック・角度**のもの（❌除外）
- 指定された**[サービス・ジャンル]のブログ**として不適切なもの（競合他社名、無関係トピック等）
- ネガティブワードを含むもの（やめとけ、やばい、最悪、ブラック 等）

### 残すもの
- 既存記事に**全くない**新規トピック（✅新規）
- 既存記事と似たトピックだが**訴求角度が異なる**もの（🔄別角度）

### 判定例
- 既存に「javaの配列」があり「java とは」は未対応 → 🔄別角度で採用
- 既存に「AWS資格」があり「Azure」は未対応 → ✅新規で採用

---

## ステップ4：new-keywords.md に出力する

出力先：`./keywords/new-keywords.md`

```markdown
# 競合サイトから発掘した新規キーワード候補

既存[N]記事と照合し、未カバー or 角度が異なるキーワードを抽出。

## 判定基準
- ❌除外：既存記事と同じトピック・角度のもの
- ✅新規：まったく未カバー
- 🔄別角度：既存記事と似たトピックだが訴求角度が異なるもの

---

## 新規キーワード候補一覧

| # | キーワード | 月間ボリューム | カテゴリ | 判定 | 備考 |
|---|-----------|--------------|---------|------|------|
| 1 | [KW] | [Vol] | [カテゴリ] | [✅/🔄] | [備考] |

---

## スプレッドシート出力用（タブ区切り）

キーワード	月間ボリューム	カテゴリ	備考
[KW]	[Vol]	[カテゴリ]	[備考]
```

---

## エラー対処

| エラー | 原因 | 対処 |
|--------|------|------|
| `difficulty` カラムエラー | カラム名が違う | `keyword_difficulty` を使う |
| 0件返却 | パス付きURLにprefix使用 | `mode=subdomains` に変更 |
| ネガティブKW混入 | 自動選定の限界 | 手動で差し替え |
| 25件上限 | APIの制限 | `where: volume < [前回最小]` で次バッチ取得 |
