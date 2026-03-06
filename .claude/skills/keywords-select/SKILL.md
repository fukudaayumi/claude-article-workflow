---
name: keywords-select
description: キーワード選定フル実行スキル。articles-kw-collect → articles-kw-related → articles-kw-serp の3フェーズを順番に実行し、all_keywords.md に自動追記する。その後ユーザーが不要なキーワードを指定すれば削除・再採番まで行う。
---

# キーワード選定フル実行スキル

`articles-kw-collect` → `articles-kw-related` → `articles-kw-serp` の3フェーズを順番に実行し、`all_keywords.md` へ自動追記する。追記後はユーザーが確認し、不要なキーワードを削除できる。

---

## 事前確認

`.claude/CLAUDE.md` の **Service Configuration「競合ブログURL」** に競合サイトのURLが記載されているか確認する。
未記入の場合はユーザーに記入を依頼してから開始する。

---

## フェーズ1：キーワード収集・選定

`.claude/skills/articles-kw-collect/SKILL.md` の全ステップを実行する。

- 入力：`.claude/CLAUDE.md`（競合URL）、`keywords/all_keywords.md`（既存記事KW）
- 出力：`keywords/new-keywords.md`

---

## フェーズ2：関連キーワード取得

フェーズ1完了後、`.claude/skills/articles-kw-related/SKILL.md` の全ステップを実行する。

- 入力：`keywords/new-keywords.md`
- 出力：`keywords/related-keywords.md`

---

## フェーズ3：競合SERP分析

フェーズ2完了後、`.claude/skills/articles-kw-serp/SKILL.md` の全ステップを実行する。

- 入力：`keywords/new-keywords.md`、`.claude/CLAUDE.md`（競合URL）
- 出力：`keywords/competitor-serp.md`

---

## フェーズ4：all_keywords.md への追記

フェーズ3完了後、以下の手順で3つの中間ファイルを統合し `keywords/all_keywords.md` の末尾に追記する。

### ステップ1：現在の最大記事Noを取得する

`Grep` ツールで `keywords/all_keywords.md` から `★` が付いた行を抽出し、記事No列の最大値を確認する。
新規キーワードの記事Noは `最大値 + 1` から採番する。

### ステップ2：追記データを組み立てる

`new-keywords.md`・`related-keywords.md`・`competitor-serp.md` の内容を統合し、以下のフォーマットに変換する。

```
★	{記事No}	{メインKW}	{検索ボリューム}	{KD}	{競合URL}
	{記事No}	{サブKW1}	{検索ボリューム}
	{記事No}	{サブKW2}	{検索ボリューム}
	{記事No}	{サブKW3}	{検索ボリューム}
```

- **メインKW行（★）**：`new-keywords.md` のキーワード・ボリューム・KD、`competitor-serp.md` の競合URL
- **サブKW行**：`related-keywords.md` の関連KW①②③とそれぞれのボリューム
- **KD・競合URL**：サブKW行は空欄のままにする
- **競合URLがない場合**：空欄のままにする

### ステップ3：all_keywords.md に追記する

`Edit` ツールで `keywords/all_keywords.md` の末尾に、ステップ2で組み立てたデータを追記する。

追記後、今回追加した記事Noの範囲（{開始No}〜{終了No}）を記録しておく。フェーズ5で使用する。

---

## フェーズ5：不要キーワードの削除・No再採番（任意）

フェーズ4完了後、追記した内容をユーザーに確認してもらい、削除したいNoがあればこのフェーズを実行する。

### 事前確認

ユーザーに以下を提示する：

```
フェーズ4で追加した記事No：{開始No}〜{終了No}

削除したいNoがあれば指定してください（複数・範囲指定可）。
不要なければ n を入力してスキップします。
```

### 入力の処理

| 入力 | 処理 |
|------|------|
| `n` または `N` | 削除なしとしてスキップし、完了報告へ進む |
| No指定（例：`3`、`5, 8`、`12〜15`） | 削除可能かバリデーションを行う |

### 削除可能なNoの制限

- 今回のセッションでフェーズ4が追加した記事No（{開始No}〜{終了No}）のみ削除可能
- 範囲外のNoが含まれていた場合は、エラーを表示してから**再度入力を求める**（中断しない）

```
❌ エラー：No {N} は今回追加したキーワードではありません。
削除できるのは今回追加した No {開始No}〜{終了No} のみです。

再度、削除したいNoを指定してください（不要なければ n）。
```

全指定Noが範囲内であれば `.claude/skills/articles-kw-delete/SKILL.md` のステップに従い、削除と再採番を実行する。

---

## 完了時の報告

全フェーズ完了後、以下を報告する：

```
✅ キーワード選定が完了しました

- 追記件数：{N}件（記事No {開始No}〜{終了No}）
- 削除件数：{N}件（※フェーズ5を実行した場合）
- 更新ファイル：keywords/all_keywords.md

中間ファイル（参照用）：
- keywords/new-keywords.md
- keywords/related-keywords.md
- keywords/competitor-serp.md
```
