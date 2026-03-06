# claude-article-workflow

Claude Code を使った SEO ブログ記事制作の自動化ワークフローです。

キーワード選定 → 骨子作成 → 本文生成 → レビューの一連の工程を、Claude Code のスキル（slash command）として提供します。

---

## 構成

```
claude-article-workflow/             # Claude Code をここで開く
├── .claude/
│   ├── CLAUDE.md                    # プロジェクト共通ルール
│   ├── categories.md                # カテゴリ一覧
│   └── skills/                      # スキルファイル群（自動認識）
│       ├── keywords-select/         # /keywords-select（キーワード選定 一括）
│       ├── articles-kw-collect/     # /articles-kw-collect（選定 Phase 1）
│       ├── articles-kw-related/     # /articles-kw-related（選定 Phase 2）
│       ├── articles-kw-serp/        # /articles-kw-serp（選定 Phase 3）
│       ├── articles-kw-delete/      # /articles-kw-delete（KW削除・再採番）
│       ├── articles-outline/        # /articles-outline（骨子作成）
│       ├── articles-write/          # /articles-write（本文生成）
│       ├── articles-review/         # /articles-review（レビュー）
│       └── articles-create/         # /articles-create（記事制作 一括）
├── keywords/
│   ├── all_keywords.md              # キーワード管理ファイル（メイン）
│   ├── new-keywords.md              # 選定 Phase 1 の出力（自動生成）
│   ├── related-keywords.md          # 選定 Phase 2 の出力（自動生成）
│   └── competitor-serp.md           # 選定 Phase 3 の出力（自動生成）
└── articles/                        # 記事ファイルの出力先
    └── {記事No}/
        ├── {記事No}_outline.md          # 骨子ファイル
        ├── {記事No}_index.md            # 本文下書き
        └── {記事No}_index_revised.md    # レビュー済み修正版
```

---

## 動作要件

### 記事制作スキル（`/articles-*`）

- [Claude Code](https://claude.ai/claude-code) がインストール済みであること
- インターネット接続（競合記事の取得に WebFetch を使用）

### キーワード選定スキル（`/keywords-select`）

上記に加えて、以下が必要です。

- **Ahrefs MCPサーバー** が `~/.claude/mcp.json` に設定済みであること
- Ahrefs のアカウントと API アクセス権
- **Ahrefs API の利用料金が発生します**（`site-explorer-organic-keywords`・`keywords-explorer-matching-terms` を使用）

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/{your-username}/claude-article-workflow.git
cd claude-article-workflow
```

### 2. サービス情報を設定する

`.claude/CLAUDE.md` の **Service Configuration** セクションを自分のサービス情報に書き換えます。

| 項目 | 内容 |
|------|------|
| サービス名 | ブログを運営するサービス名 |
| サービスURL | サービスのトップページURL |
| ブログURL | ブログのURL |
| サービスジャンル | キーワード選定のフィルタリング基準に使用 |
| ブログの目的 | ブログの目的・ターゲット読者 |
| ブランドカラー（許容） | 記事内コードブロックで使用可能な色 |
| 競合ブログURL | キーワード選定で調査対象にする競合サイトのURL |

このセクションを書き換えるだけで、全スキルがあなたのサービス情報・競合URLを参照します。

### 3. Ahrefs MCP サーバーを設定する（キーワード選定を使う場合）

リポジトリ内の `.mcp.json.example` をコピーして `.mcp.json` を作成し、API キーを記入します。

```bash
cp .mcp.json.example .mcp.json
```

`.mcp.json` を開き、`your_api_key_here` を実際の API キーに置き換えます。

```json
{
  "mcpServers": {
    "ahrefs": {
      "command": "npx",
      "args": ["-y", "@ahrefs/mcp-server"],
      "env": {
        "AHREFS_API_KEY": "your_api_key_here"  ← ここを書き換える
      }
    }
  }
}
```

> API キーは [Ahrefs アカウント設定](https://app.ahrefs.com/account/api) から取得できます。
> `.mcp.json` は `.gitignore` に含まれているため、コミットされません。

### 4. Claude Code を起動する

```bash
claude
```

---

## スキル一覧

### キーワード選定

#### `/keywords-select` — キーワード選定 一括実行

競合サイトから新規キーワードを発掘し、`all_keywords.md` に自動追記します。

- Phase 1：競合サイトのオーガニックKWを収集・フィルタリング
- Phase 2：各キーワードに関連KWを3つ取得
- Phase 3：競合サイトの最上位ランキングURLを取得
- Phase 4：結果を `keywords/all_keywords.md` に自動追記
- Phase 5：不要なキーワードをNoで指定して削除・再採番（任意）

**必要な環境：** Ahrefs MCP サーバー

### 記事制作

#### `/articles-create` — 記事制作 一括実行

骨子作成 → 本文生成 → レビューを一連の流れで実行します。

- フェーズ1（骨子）・フェーズ2（本文）はメインセッションで実行
- フェーズ3（レビュー）はサブエージェントが独立した視点で実行

#### `/articles-outline` — 骨子作成

競合記事を分析し、SEOに最適化された記事構成（H2/H3設計・検索意図・5W1H）を生成します。

- 出力：`articles/{記事No}/{記事No}_outline.md`

#### `/articles-write` — 本文生成

骨子ファイルをもとに、3,000〜5,000字のブログ記事本文を生成します。

- 骨子の見出しに一字一句準拠
- Markdownフォーマット・frontmatter付き
- 出力：`articles/{記事No}/{記事No}_index.md`

#### `/articles-review` — レビュー

厳格な編集者として記事をレビューし、修正版ファイルを出力します。

- 構成・文章・SEO・ブランドカラーをチェック
- 優先度付き（🔴重大 / 🟡改善が必要 / 🟢軽微）で指摘
- 出力：`articles/{記事No}/{記事No}_index_revised.md`

---

## 使い方

### フル運用（キーワード選定 → 記事制作）

```
/keywords-select    # 新規キーワードを発掘して all_keywords.md に追記
/articles-create    # 骨子 → 本文 → レビューまで一括実行
```

### 記事制作のみ（all_keywords.md にキーワードが登録済みの場合）

```
/articles-create
```

### 工程ごとに個別実行

```
/keywords-select        # キーワード選定（一括）
/articles-outline       # 骨子だけ作る
/articles-write         # 本文だけ書く
/articles-review        # レビューだけ行う
```

---

## 注意事項

- Ahrefs API はキーワード数・競合サイト数によって消費量が変わります。大量取得の際はご注意ください。
- `keywords/all_keywords.md` は手動で編集することも可能です。スプレッドシートからのコピペ（タブ区切り）に対応しています。
