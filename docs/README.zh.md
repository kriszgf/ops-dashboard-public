# 流程仪表板（示例）

> **本仓库中的所有数据均为虚构的示例数据**（`data/sample-processes.json`）。不描述任何真实的机器人、人员或系统。
>
> 机器翻译。

一个基于 React + TypeScript（Vite）的单页仪表板，用于自动化流程：负责机器人、时间安排、状态、上次运行、问题、类别和详情，另有 Obsidian 笔记面板。所有数据都静态写在源代码中；页面不发起任何网络请求。

## 快速开始
```bash
npm ci && npm start      # 构建后在 http://localhost:4173 提供服务
```
需要 Node 18+。开发服务器：`npm run dev`。

## 分步安装

_◐ machine translation, pending review._
**前提条件：** Node.js 18 或更高版本（含 npm）和 Git。

```bash
git clone <your-repo-url> ops-dashboard
cd ops-dashboard
npm ci        # 按精确版本安装依赖
npm run dev   # 带热重载的开发服务器（通常为 http://localhost:5173）
npm test      # 运行 Vitest 测试
npm run build # 类型检查并构建到 dist/
npm start     # 构建后在 http://localhost:4173 提供 dist/
```

编辑示例数据：流程在 `data/sample-processes.json`，项目在 `data/sample-projects.json`（字段 `what`、`why`、`status`、`next` 在点击 **更多** 后显示），Obsidian 摘录在 `src/obsidian-adapter.ts`。切勿提交真实姓名、邮箱、IP、日志或密钥。

## 控件
- 页眉：语言选择（9 种语言；◐ = 部分机器翻译）、主题（自动 / 浅色 / 深色）、README。
- 红色和琥珀色横幅可跳转到相关卡片。
- 视图：24 小时时钟、机器人–流程网络、地铁线路。缩放、适应、全屏（Esc）。
- 卡片：“说明 / 指令”，可展开 更多 / 更少。
- 停止 / 重启 会复制一条消息，例如 `Stop: <流程> (Bot A/<id>)`，供粘贴到 Coordinator 聊天中。不会发送任何内容。

## 为什么用 Obsidian / 为什么用 Vault 读取器
Obsidian Vault 是团队共享的知识库：决策、流程和背景信息都以简单的 Markdown 笔记形式保存在其中。Vault 读取器以只读方式访问它，因此机器人可以搜索并使用已经写下的内容，而不必重复提问。这节省了时间和精力，所有者也无需反复解释。

**原则：先查知识库，再问所有者。** 机器人在询问所有者之前，先以只读方式搜索共享知识库，只有在找不到答案时才提问。

## 设置 Obsidian
1. 在你想阅读的电脑上安装 Obsidian（obsidian.md）。
2. 打开 “example vault” 库（Open folder as vault）。库所在主机来自配置（`vaultHost`）。
3. 在其他电脑上：同步该文件夹（Syncthing、SMB 共享或 Obsidian Sync），并用相同的库名打开。
4. 在 Obsidian 面板上点击“刷新”。

连接你自己的 Vault（仅占位符）：
- Vault 名称: `<your-vault-name>`
- 机器: `<host where the vault lives>`
- 同步方式: Obsidian Sync / iCloud / git / local only
- 连接方式: 在被 git 忽略的 `.env` 中设置 `VAULT_PATH`，然后运行 `tools/vault-read`
  `VAULT_PATH=/path/to/<your-vault-name>`

链接格式为 `obsidian://open?vault=<encodeURIComponent(vault)>&file=<encodeURIComponent(不含 .md 的路径)>`，并在新标签页中打开，因为沙盒 iframe 会阻止在同一框架内打开自定义协议。

## Vault 写入模式 (v1.6.0)

**总开关 (v1.6.1)：** 写入（`create`、`append`、`--pending`、`approve`）仅在 env 或 `.env` 中设置 `VAULT_WRITE_ENABLED=1` 时可用；默认关闭，`pending list` 仍为只读。

`create` 新建笔记，若已存在则报错；`append` 只能追加到已有笔记。不支持删除、覆盖或重命名。`--bot <名称>` 为必填；文本来自 `--text` 或 stdin。每次写入都会记录到 `_bot-writes/log.md`（仅追加：时间、机器人、命令、路径、前 200 个字符、sha256），并每日汇总到 `_bot-writes/daily/YYYY-MM-DD.md`。`--pending` 将写入保存到 `_bot-writes/pending/`，不改动目标文件；只有所有者可用 `approve <id>` 应用。排除列表、路径穿越/符号链接拦截和敏感信息遮蔽同样适用于写入；永远不会写入 `.obsidian` 或被排除的路径。

```sh
tools/vault-read --json create "Inbox/Note.md" --bot <bot-name> --text "..."
echo "..." | tools/vault-read --json append "Inbox/Note.md" --bot <bot-name>
tools/vault-read --json append "Inbox/Note.md" --bot <bot-name> --pending --text "..."
tools/vault-read --json pending list
tools/vault-read --json approve <id>   # owner only
```

## 配置适配器
`src/obsidian-adapter.ts` 包含 `OBS_CFG`（`vaultHost`、`vaultName`、`source`）和只读示例摘录。`source` 可为 `local`、`syncthing`、`smb` 或 `rest`（Local REST API 地址，仅占位）。可在被 git 忽略的 `.env` 中用 `VITE_OBSIDIAN_HOST`、`VITE_OBSIDIAN_VAULT`、`VITE_OBSIDIAN_SOURCE` 覆盖。`src/webhook.ts` 是用于直接控制流程的已禁用存根。

## 新手指南：一步步走完一个流程
1. 运行 `npm ci && npm start`，然后打开 http://localhost:4173。
2. 在 **视图** 下选择 **机器人–流程网络**。在机器人筛选中选择 **Coordinator**。
3. 点击 **Weekly trend scan** 方框（中文界面中流程名称仍为英文）。详情卡片显示：时间 Monday 10:00，状态 活跃 · OK，上次运行 10-26 10:04。
4. 点击 **更多** 展开 **说明 / 指令**，阅读示例指令。
5. 点击 **停止**。文本 `Stop: Weekly trend scan (Coordinator/p02)` 会被复制。把它粘贴到 Coordinator 聊天中；页面本身不发送任何内容。
6. 在页眉切换语言，点击 **README** 即可用该语言阅读本指南。

## 数据
用你自己的导出文件（相同结构）替换 `data/sample-processes.json`。切勿提交真实数据或密钥。

Obsidian 库读取器（只读）：`tools/vault-read` — 见主 README。
