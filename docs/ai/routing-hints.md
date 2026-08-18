---
title: 路由提示
sidebar_position: 3
---

# 路由提示

AI Agent 应先判断用户要解决的问题类型，再读取最小必要上下文。

## 首选入口

| 用户意图 | 读取顺序 |
| --- | --- |
| 第一次安装或演示 | `docs/getting-started/index.md` → 安装/首个应用文档 |
| 用内建能力交付业务 | `docs/low-code/index.md` → 对应对象、页面、流程、权限或集成文档 |
| 判断是否要写代码 | `docs/fusion-development/when-to-use-code.md` → `docs/fusion-development/extension-points.md` |
| 做前端扩展 | `docs/fusion-development/frontend-extension-paths.md` → `docs/api/frontend/index.md` |
| 做后端扩展 | `docs/fusion-development/backend-extension-packages.md` → `docs/api/backend/index.md` |
| 查 SDK / Java API / DSL | `docs/api/index.md` → 对应 API 子页 |
| 查模型概念或判断模型关系 | `docs/concepts/index.md` → 对应模型页或 `docs/concepts/supporting-resources/index.md` |
| 部署、升级、排障 | `docs/operations/index.md` → 对应 runbook |
| 元数据格式或 schema 校验 | `docs/ai/reference-sources.md` → `docs/reference/jsonschema/metadata/` |

## Context7 使用

Context7 适合回答稳定公开问题：API 用法、SDK 示例、元数据格式、模板契约、概念说明、迁移说明。检索时优先使用精确主题词，例如 `TideStack UI Model metadata schema`、`TideStack ouroboros-sdk request`。

## MCP 使用

MCP 适合执行需要当前项目或平台状态的问题：

- 扫描当前模块 metadata；
- 校验 JSON 文件；
- 生成 app module、menu、authority、UI Model 或 UI Schema bundle；
- 调用模板库创建项目；
- 启动本地联调；
- 控制开发平台 UI 或读取运行态注册结果。

如果只需要解释 API，不调用 MCP tool；如果需要改变项目或验证当前状态，使用 MCP tool 或本地项目脚本。
