---
name: articles-create
description: Execute the full article creation pipeline in sequence: outline (articles-outline) → body writing (articles-write) → independent review by a separate agent (articles-review). The reviewer runs in an isolated context with no knowledge of the creation process.
---

# 記事制作フル実行スキル

`articles-outline` → `articles-write` → `articles-review` の3フェーズを順番に実行する。
レビューは**別エージェント**が担当し、制作過程を知らない独立した目線でレビューする。

---

## フェーズ1：記事骨子の作成

`.claude/skills/articles-outline/SKILL.md` の全ステップを実行する。
完了後、使用した**記事No**を記録しておく。

---

## フェーズ2：記事本文の生成

フェーズ1と同じ記事Noを引き継ぎ、`.claude/skills/articles-write/SKILL.md` の全ステップを実行する。

---

## フェーズ3：記事レビュー（別エージェント）

フェーズ2完了後、以下の手順で Task ツールを使って別エージェントを起動する。

### 事前準備：作業ディレクトリの絶対パスを取得する

Bash ツールで `pwd` を実行し、現在の作業ディレクトリの絶対パスを取得する。
取得したパスを `{CWD}` として以下のプロンプトに代入する。

### Taskツールのパラメータ

- **subagent_type**: `general-purpose`
- **prompt**: 以下のテキストを使用する（`{記事No}` はフェーズ1の番号、`{CWD}` は取得した絶対パスに置き換える）

```
以下の2ファイルを読み込み、SKILL.mdの手順・観点に従って記事をレビューしてください。

【骨子ファイル】
{CWD}/articles/{記事No}/{記事No}_outline.md

【本文ファイル】
{CWD}/articles/{記事No}/{記事No}_index.md

【レビュー手順・観点】
{CWD}/.claude/skills/articles-review/SKILL.md

なお、修正版ファイルの出力先は以下を使用してください。
- 修正版ファイルの出力先：{CWD}/articles/{記事No}/{記事No}_index_revised.md
```

### 注意事項

- 別エージェントには制作過程の情報（どう構成を考えたか等）を一切渡さない
- エージェントから返ってきたレビュー結果をそのままユーザーに報告する
