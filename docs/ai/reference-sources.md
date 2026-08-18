---
title: 事实源地图
sidebar_position: 5
---

# 事实源地图

本页定义 handbook、平台仓库、生成物、Context7 和 MCP Server 的职责边界。

## Handbook 内事实源

| 事实 | 位置 | 用途 |
| --- | --- | --- |
| 人类阅读主文档 | `docs/` | 教程、指南、解释、参考 |
| AI 短入口 | `llms.txt` | 首轮上下文选择 |
| AI 完整索引 | `llms-full.txt` | Context7/长上下文路由 |
| AI 路由规则 | `docs/ai/` | Agent 如何读 handbook 和调用 MCP |
| 公开 metadata schema | `docs/reference/jsonschema/metadata/` | JSON 校验和外部集成 |
| OpenAPI 归档 | `openapi/` | HTTP API 合同发布位置 |

## Handbook 内自包含资产

| 事实 | 位置 | 维护方式 |
| --- | --- | --- |
| 元数据 Schema 索引 | `docs/reference/jsonschema/metadata/index.json` | 随 handbook 提交，不依赖外部仓库路径 |
| 元数据 JSON Schema | `docs/reference/jsonschema/metadata/*.schema.json` | 作为文档资产发布；更新时从平台主仓库整理后提交结果 |
| 项目模板契约 | `docs/reference/` 或专题指南 | 以公开文档承载，不引用未发布目录 |
| 前端 SDK API | `docs/api/frontend/` | 以公开 API 文档承载 |
| 后端 Java API | `docs/api/backend/` | 以公开 API 文档承载 |

Handbook 开源发布后必须可独立阅读、索引和校验。文档正文可以说明 schema 来自平台实现，但不能要求读者或 AI Agent 访问 handbook 仓库外的项目目录。

## Context7 边界

Context7 应索引稳定、公开、版本化的文档和示例。它不负责读取用户当前项目状态，也不执行校验或生成。

适合放入 Context7 的内容：

- API reference；
- SDK 示例；
- 元数据 schema；
- 模板契约；
- 概念解释；
- 迁移指南和常见错误。

## MCP 边界

MCP Server 应把 handbook 暴露为 resources，把需要当前环境和副作用的能力暴露为 tools。

| MCP primitive | 应承载 | 不应承载 |
| --- | --- | --- |
| resources | handbook 文档、schema、OpenAPI、项目索引、模板清单 | 有副作用的操作 |
| tools | 校验、生成、扫描、启动、平台 UI 控制、运行态查询 | 长篇静态文档 |

工具必须有输入 JSON Schema；涉及写入、启动、发布、删除或平台控制时，要提供 dry-run、确认、审计和错误恢复方式。
