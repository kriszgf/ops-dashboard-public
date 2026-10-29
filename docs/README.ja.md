# プロセス ダッシュボード（サンプル）

> **このリポジトリのデータはすべて架空のサンプルデータです**（`data/sample-processes.json`）。実在のボット、人物、システムは含まれません。
>
> 機械翻訳です。

自動化プロセス向けの React + TypeScript（Vite）製シングルページ ダッシュボードです。担当ボット、スケジュール、状態、最終実行、問題、カテゴリ、詳細に加え、Obsidian ノートパネルを表示します。データはすべてソース内に静的に含まれ、ページはネットワーク通信を行いません。

## クイックスタート
```bash
npm ci && npm start      # ビルド後 http://localhost:4173 で配信
```
Node 18 以上が必要です。開発サーバー：`npm run dev`。

## インストール手順

_◐ machine translation, pending review._
**前提条件：** Node.js 18 以降（npm 付き）と Git。

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # 依存関係を正確なバージョンでインストール
npm run dev   # ホットリロード付き開発サーバー（通常 http://localhost:5173）
npm test      # Vitest テストを実行
npm run build # 型チェックして dist/ にビルド
npm start     # ビルド後、http://localhost:4173 で dist/ を配信
```

サンプルデータの編集：プロセスは `data/sample-processes.json`、プロジェクトは `data/sample-projects.json`（`what`・`why`・`status`・`next` は **詳細** を押すと表示）、Obsidian の抜粋は `src/obsidian-adapter.ts`。実名、メール、IP、ログ、キーは絶対にコミットしないでください。

## 操作
- ヘッダー：言語選択（9 言語、◐ = 一部機械翻訳）、テーマ（自動 / ライト / ダーク）、README。
- 赤と黄色のバナーから該当カードへ移動できます。
- 表示：24 時間時計、ボット–プロセス ネットワーク、メトロ路線。ズーム、全体表示、全画面（Esc）。
- カード：「説明 / コマンド」を もっと見る / 閉じる で開閉。
- 停止 / 再開 は `Stop: <プロセス> (Bot A/<id>)` のようなメッセージをコピーします。QR bot のチャットに貼り付けてください。何も送信されません。

## なぜ Obsidian か / なぜ Vault リーダーか
Obsidian の Vault はチームの共有ナレッジベースです。決定事項、手順、背景情報がシンプルな Markdown ノートとして保存されています。Vault リーダーは読み取り専用でアクセスするため、ボットは改めて質問する代わりに、既に書かれた内容を検索して活用できます。これにより時間とエネルギーを節約でき、オーナーが同じことを何度も説明する必要がなくなります。

**原則：まずナレッジベース、次にオーナーへ。** ボットはオーナーに質問する前に、共有ナレッジベースを読み取り専用で検索し、答えが見つからない場合にのみ質問します。

## Obsidian の設定
1. 読みたいコンピューターに Obsidian（obsidian.md）をインストールします。
2. 「example vault」ボールトを開きます（Open folder as vault）。ボールトのホストは設定（`vaultHost`）から取得されます。
3. 別のコンピューターでは、フォルダーを同期し（Syncthing、SMB 共有、Obsidian Sync）、同じボールト名で開きます。
4. Obsidian パネルで「更新」を押します。

自分の Vault を接続する（プレースホルダーのみ）：
- Vault 名: `<your-vault-name>`
- マシン: `<host where the vault lives>`
- 同期方式: Obsidian Sync / iCloud / git / local only
- 接続方法: git で無視される `.env` に `VAULT_PATH` を設定し、`tools/vault-read` を実行
  `VAULT_PATH=/path/to/<your-vault-name>`

リンクは `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(.md を除いたパス)>` の形式で、新しいタブで開きます。サンドボックス化された iframe は同じフレーム内でのカスタムプロトコルをブロックするためです。

## Vault 書き込みモード (v1.6.0)

**キルスイッチ (v1.6.1):** 書き込み（`create`、`append`、`--pending`、`approve`）は env または `.env` に `VAULT_WRITE_ENABLED=1` がある場合のみ動作します。既定は無効で、`pending list` は読み取り専用のままです。

`create` は新しいノートを作成し、既に存在する場合はエラーになります。`append` は既存ノートへの追記のみです。削除・上書き・名前変更はできません。`--bot <名前>` は必須で、本文は `--text` または stdin から渡します。すべての書き込みは `_bot-writes/log.md`（追記専用：時刻、ボット、コマンド、パス、先頭 200 文字、sha256）に記録され、`_bot-writes/daily/YYYY-MM-DD.md` に日次でまとめられます。`--pending` は対象を変更せず `_bot-writes/pending/` に保存し、所有者だけが `approve <id>` で反映します。除外リスト、トラバーサル／シンボリックリンクのブロック、秘密情報のマスクは書き込みにも適用され、`.obsidian` と除外パスには決して書き込みません。

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## 設定アダプター
`src/obsidian-adapter.ts` には `OBS_CFG`（`vaultHost`、`vaultName`、`source`）と読み取り専用のサンプル抜粋があります。`source` は `local`、`syncthing`、`smb`、`rest`（Local REST API の URL、プレースホルダーのみ）のいずれかです。git で除外された `.env` の `VITE_OBSIDIAN_HOST`、`VITE_OBSIDIAN_VAULT`、`VITE_OBSIDIAN_SOURCE` で上書きできます。`src/webhook.ts` はプロセスを直接制御するための無効化されたスタブです。

## 初心者ガイド：1 つのプロセスを順に追う
1. `npm ci && npm start` を実行し、http://localhost:4173 を開きます。
2. **表示** で **ボット–プロセス ネットワーク** を選び、ボットフィルターで **QR bot** を選びます。
3. **Weekly trend scan** の枠をクリックします（日本語表示でもプロセス名は英語のままです）。詳細カードには、スケジュール Monday 10:00、状態 稼働中 · OK、最終実行 10-26 10:04 が表示されます。
4. **説明 / コマンド** を **もっと見る** で開き、サンプルの指示を読みます。
5. **停止** を押します。`Stop: Weekly trend scan (QR bot/p02)` がコピーされます。QR bot のチャットに貼り付けてください。ページ自体は何も送信しません。
6. ヘッダーで言語を切り替え、**README** を押すと、このガイドをその言語で読めます。

## データ
`data/sample-processes.json` を独自のエクスポート（同じ構造）に置き換えてください。実データやキーは絶対にコミットしないでください。

Obsidian ボールト読み取り（読み取り専用）: `tools/vault-read` — メイン README を参照。
