# TideStack Handbook

TideStack Handbook 是潮汐栈面向人类读者和 AI Agent 的统一知识源。它既是产品/开发手册，也是可被 Context7、MCP Server、IDE 插件和 coding agent 读取的结构化参考库。

> 兼容说明：TideStack / 潮汐栈是当前公开名称；代码包名、Maven 坐标、Docker 镜像、SDK 名称和运行时路径仍保留 legacy `Ouroboros / ouroboros` 标识，除非另有迁移说明，不要把运行时标识改成 TideStack。

## 内容定位

| 读者或系统 | 入口 | 用途 |
| --- | --- | --- |
| 新用户 | `docs/getting-started/` | 安装、创建应用、交付第一个业务功能 |
| 低代码实施 | `docs/low-code/` | 从需求拆解到对象、页面、规则、权限、集成和发布 |
| 融合开发者 | `docs/fusion-development/` | 前端/后端扩展、组件库、认证、实时能力和平台治理 |
| 运维人员 | `docs/operations/` | 部署、升级、备份、监控、排障和专项运行链路 |
| API 查询者 | `docs/api/`、`docs/reference/` | SDK、Java API、DSL、Web API 规范和能力地图 |
| AI Agent | `llms.txt`、`llms-full.txt`、`docs/ai/` | 路由任务、选择上下文、避免误改兼容标识 |
| MCP Server | `docs/ai/reference-sources.md`、`docs/reference/jsonschema/`、`openapi/` | 暴露 resources，并把校验/生成/运行能力作为 tools |

## 本地开发

环境要求：Node.js >= 20。推荐 macOS/Linux 使用 `nvm`，Windows 使用 NVM for Windows。

```bash
npm ci
npm start
```

## 构建与校验

```bash
npm run check:structure
npm run build
```

`check:structure` 会检查：

- `llms.txt`、`llms-full.txt` 和 AI 入口文档是否存在；
- Docusaurus sidebar 是否覆盖所有 `docs/**/*.md(x)`；
- `docs/reference/jsonschema/metadata/` 中的公开 metadata schema 是否完整；
- schema JSON 是否能被解析。
- `static/llms.txt` 与 `static/llms-full.txt` 是否和仓库根 `llms*.txt` 保持一致，确保发布站点根路径可被 AI 抓取。

如果修改了 `llms.txt` 或 `llms-full.txt`，同步到 Docusaurus 静态目录：

```bash
npm run sync:llms-static
```

## 元数据 JSON Schema

Handbook 作为独立开源仓库发布时，必须自带可公开消费的 JSON Schema，不能依赖 monorepo 里的其他目录。当前 schema 放在：

```text
docs/reference/jsonschema/metadata/<type>.schema.json
docs/reference/jsonschema/metadata/index.json
```

更新 schema 时，应先在平台主仓库中从 canonical 元数据类型定义生成或整理，再把结果作为 handbook 文档资产提交到上述目录；发布后的 handbook 校验只读取自身目录。

## AI 与 Context7

- `llms.txt` 是短入口，适合首次上下文选择。
- `llms-full.txt` 是完整路由索引，适合较长上下文或 Context7 索引。
- `docs/ai/terminology.md` 固化 TideStack 与 Ouroboros 的兼容命名边界。
- `docs/ai/routing-hints.md` 指导 Agent 在低代码、融合开发、API reference、schema 和 MCP tools 之间切换。
- `docs/ai/task-recipes.md` 提供常见任务的上下文读取顺序和验收口径。

## MCP 集成原则

MCP Server 不应复制 handbook 文档事实。推荐做法是：

- 将 `docs/`、`docs/reference/jsonschema/`、`openapi/`、`llms*.txt` 暴露为 MCP resources；
- 将项目扫描、schema 校验、资源 bundle 生成、模板创建、本地联调和平台 UI 控制暴露为 MCP tools；
- resources 只读，tools 可执行且必须带鉴权、审计和 dry-run/确认机制。

## 部署

```bash
npm run build
npm run serve
```

构建产物输出到 `build/`，可部署到任意静态文件服务。GitHub Pages 推荐使用 `.github/workflows/deploy.yml`。
