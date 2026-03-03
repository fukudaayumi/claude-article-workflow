# claude-code-article-workflow

Claude Code を使った SEO ブログ記事制作の自動化ワークフローです。

骨子作成 → 本文生成 → レビューの一連の工程を、Claude Code のスキル（slash command）として提供します。

---

## 構成

```
claude-article-workflow/             # Claude Code をここで開く
├── .claude/
│   ├── CLAUDE.md                    # プロジェクト共通ルール
│   ├── categories.md                # カテゴリ一覧
│   └── skills/                      # スキルファイル群（自動認識）
│       ├── articles-outline/        # /articles-outline
│       ├── articles-write/          # /articles-write
│       ├── articles-create/         # /articles-create
│       └── articles-review/         # /articles-review
└── articles/                        # 記事ファイルの出力先
    └── {記事No}/
        ├── {記事No}_outline.md          # 骨子ファイル
        ├── {記事No}_index.md            # 本文下書き
        └── {記事No}_index_revised.md    # レビュー済み修正版
```

---

## セットアップ

### 1. リポジトリをクローン

`{your-username}` を自分の GitHub ユーザー名に置き換えてください。

```bash
git clone https://github.com/{your-username}/claude-article-workflow.git
cd claude-article-workflow
```

### 2. リポジトリのルートで Claude Code を起動する

```bash
claude
```

### 3. レビュースキルをカスタマイズする（任意）

`/articles-review` はブログサイト固有の情報をもとにレビューします。
`.claude/skills/articles-review/SKILL.md` の 🗂️前提セクションを、あなたのブログサイトの情報に書き換えてください。

- サイト URL
- ブログの目的・ターゲット読者

---

## スキル一覧

### `/articles-outline` — 骨子作成

競合記事を分析し、SEOに最適化された記事構成（H2/H3設計・検索意図・5W1H）を生成します。

- 記事No・キーワード・競合URLをインタラクティブに1つずつ入力
- 出力：`articles/{記事No}/{記事No}_outline.md`

### `/articles-write` — 本文生成

骨子ファイルをもとに、3,000〜5,000字のブログ記事本文を生成します。

- 骨子の見出しに一字一句準拠
- Markdownフォーマット・frontmatter付き
- 出力：`articles/{記事No}/{記事No}_index.md`

### `/articles-review` — レビュー

厳格な編集者として記事をレビューし、修正版ファイルを出力します。

- 構成・文章・SEO・ブランドカラーをチェック
- 優先度付き（🔴重大 / 🟡改善が必要 / 🟢軽微）で指摘
- 出力：`articles/{記事No}/{記事No}_index_revised.md`

### `/articles-create` — 一括実行

骨子作成 → 本文生成 → レビューを一連の流れで実行します。

- フェーズ1・2はメインセッションで実行
- フェーズ3（レビュー）はサブエージェントが独立した視点で実行

---

## 使い方

### パターン A：一括実行

```
/articles-create
```

記事No・キーワード・競合URLを順番に入力すると、骨子 → 本文 → レビューまで自動で進みます。

### パターン B：工程ごとに個別実行

```
/articles-outline       # 骨子だけ作る
/articles-write         # 本文だけ書く
/articles-review  # レビューだけ行う
```

---

## 動作要件

- [Claude Code](https://claude.ai/claude-code) がインストール済みであること
- インターネット接続（競合記事の取得に WebFetch を使用）
