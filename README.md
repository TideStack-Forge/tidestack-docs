# TideStack Handbook

TideStack Handbook 是潮汐栈面向人类读者和 AI Agent 的统一知识源。它既是产品/开发手册，也是可被 Context7、MCP Server、IDE 插件和 coding agent 读取的结构化参考库。

> 兼容说明：TideStack / 潮汐栈是当前公开名称；代码包名、Maven 坐标、Docker 镜像、SDK 名称和运行时路径仍保留 legacy `Ouroboros / ouroboros` 标识，除非另有迁移说明，不要把运行时标识改成 TideStack。

## 内容定位

| 读者或系统 | 入口 | 用途 |
| --- | --- | --- |
| 新用户 | `docs/getting-started/` | 安装、创建应用、交付第一个业务功能 |
| 低代码实施 | `docs/low-code/` | 从需求拆解到对象、页面、规则、权限、集成和发布 |
| 融合开发者 | `docs/fusion-development/` | 模型与 AI 协同实施、前后端能力接入、联调和交付验收 |
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
npm run check:capabilities
npm run check:diagrams
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

### 能力目录

`static/capabilities/catalog.json` 是能力地图和机器目录共用的数据源。更新条目时核对源码、接入条件、限制和指南覆盖程度，保留稳定 ID，然后运行：

```bash
npm run sync:capabilities
npm run check:capabilities
```

`index.json` 从完整目录生成，不能单独编辑。`catalog.schema.json` 定义导入格式。校验会检查 Schema、唯一 ID、能力关系、文档路径及精简索引；在本项目完整检出中还检查源码和模块路径，独立发布手册时会明确提示无法检查源码。通过这些校验不代表能力已在部署实例中启用。

目录采用可复用能力的粒度，不按类、方法或第三方依赖计数。新增能力需要记录真实入口；设计器专用、占位实现和旧兼容别名应在范围说明中交代，避免误列成运行能力。

### 架构图样式与主题

手册图表采用与线上官网协调的冷调多色、微渐变、细边框、小圆角、线性图标与局部点阵。共享样式定义在 `src/css/diagrams.css`，以 `--diagram-<色系>-surface/rule/ink` 分别表示面板、边框与文字。`--diagram-canvas` 表示画布，`--diagram-paper` 表示卡片底色。SVG 根节点使用 `class="ts-diagram"`，图形通过语义类选择颜色和层次，例如：

```xml
<rect class="diagram-wash-blue diagram-border-blue" ... />
<rect class="diagram-card" ... />
<text class="diagram-label-blue" ...>前端基座</text>
<path class="diagram-line" ... />
```

修改共享配色后运行：

```bash
npm run build:diagrams
npm run check:diagrams
```

同步命令把 CSS、渐变定义和点阵定义嵌入 SVG 和配套 HTML，图表离线打开仍能显示；`check:diagrams` 会检查这些内容是否一致。密集架构图以淡色区域承载中性卡片，图标配小底板，点阵只用于少数贯穿全图的侧栏。手册通过 `html[data-theme]` 设置 `color-scheme`，外部 SVG 中的 `prefers-color-scheme` 据此切换亮暗配色；直接打开 SVG 或 HTML 时跟随系统主题。页面 CSS 无法直接选择外部 SVG 的内部节点，新增样式应放在共享文件中再同步。

可编辑的 `.drawio` 图稿集中在项目级 `docs/diagrams/`，按架构、模型、理念和开发指南分组。运行 `npm run build:diagrams` 会生成 `docs/.assets/diagrams/` 下的 SVG、独立预览 HTML 和校验清单。架构设计页与宣传资料共用生成结果。图稿维护流程见项目级说明，宣传介绍和能力对照保存在市场文档中。[图稿维护](../diagrams/README.md) · [市场文档](../marketing/tidestack-foundation-architecture.md)

平台介绍中的功能全景以 `docs/diagrams/architecture/platform-functional-architecture.drawio` 为编辑源，配套 SVG 用于手册展示，HTML 用于独立预览。图按开发平台、配套工具、前端基座、后端基座和插件部署支持组织功能。draw.io 节点的 `capabilityIds` 对应能力目录中的稳定 ID，分组的 `sourceRefs` 指向功能依据，更新时保留这些属性并重新生成产物。[功能架构图](docs/.assets/diagrams/architecture/platform-functional-architecture.svg)

Markdown 继续以图片方式引用 SVG，现有 `external-svg-images` 插件与 `SvgViewer` 负责原图加载、放大、滚轮缩放和拖拽。维护图表时修改 `docs/diagrams/` 下的 `.drawio` 源文件，然后运行 `npm run build:diagrams`。生成脚本负责导出 SVG、保留语义锚点并写入独立预览 HTML，随后同步共享主题；`npm run check:diagrams` 会检查源文件和生成产物是否一致。

普通手册构建会先生成图稿。独立发布 handbook 时携带 `docs/.assets/diagrams/` 的全部生成产物，构建命令会按 `manifest.json` 校验文件完整性，可以在没有项目级图稿目录的环境中完成打包。渲染器固定为 `@dskripchenko/drawio@0.1.0`，由 npm 锁文件安装，运行时离线生成。

### 教程示例工程

`examples/material-registration/` 是融合开发入门教程使用的独立 Maven 工程。修改示例后，先在该目录运行 `mvn verify`，再回到手册根目录重新生成下载包：

```bash
npm run package:examples
```

下载包写入 `static/examples/material-registration.zip`，只包含源码与说明，不包含 `target/`。真实基座权限检查需要另行装配测试应用、准备普通测试账号，按“自动化测试”页面执行。

## 元数据 JSON Schema

Handbook 作为独立开源仓库发布时，必须自带可公开消费的 JSON Schema，不能依赖 monorepo 里的其他目录。当前 schema 放在：

```text
docs/reference/jsonschema/metadata/<type>.schema.json
docs/reference/jsonschema/metadata/index.json
```

更新 Schema 时，在平台仓库维护公共 `metadata-schema/`，运行 `python3 scripts/skills/sync_distribution.py` 生成本目录及 IDE、Skills 和模板副本，添加 `--check` 检查漂移。发布后的 handbook 校验只读取自身目录；引用文件也随包分发。

## AI 入口

- [开始使用](docs/ai/index.md)：提供手册上下文，并填写可复制的任务描述模板。
- [按任务选择上下文](docs/ai/routing-hints.md)：从业务功能、元数据、扩展、API 或运维任务定位文档。
- [任务执行与验收](docs/ai/task-recipes.md)：明确任务输入、实施顺序和验收结果。
- [知识来源与工具边界](docs/ai/reference-sources.md)：区分手册、项目、运行状态、Schema 与已有 Context7/MCP 接入。
- [术语与兼容命名](docs/ai/terminology.md)：统一产品名称，保留真实运行时标识。

`llms.txt` 和 `llms-full.txt` 分别提供简要与扩展路由索引，均不包含全站正文。其中的路径相对于 Handbook 仓库根目录，仓库资产不一定有对应的站点下载地址。Context7 文档库与 MCP 服务以使用环境实际配置为准。

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

导航栏的“官网”默认链接到 `https://www.tidestackforge.com`。国内站和国际站可在构建时通过 `OFFICIAL_SITE_URL` 指定各自的官网地址，例如（将示例地址替换为实际域名）：

```bash
OFFICIAL_SITE_URL=https://cn.example.com npm run build
```

Windows PowerShell：

```powershell
$env:OFFICIAL_SITE_URL = 'https://cn.example.com'
npm run build
```

GitHub Pages 部署可设置仓库或 `github-pages` Environment 的同名 Actions 变量 `OFFICIAL_SITE_URL`；未设置或为空时使用默认官网。该地址在构建时写入静态页面，修改后需要重新构建。本地预览也可通过同一环境变量运行 `npm start`。
