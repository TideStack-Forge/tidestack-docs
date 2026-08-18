---
title: AI 入口
sidebar_position: 1
---

# AI 入口

本区面向 AI Agent、Context7 索引、MCP Server 和 IDE 助手。目标是让同一份 handbook 同时服务人类阅读和机器上下文选择。

## 先读什么

| 任务 | 入口 |
| --- | --- |
| 判断 TideStack 与 Ouroboros 如何命名 | [术语与兼容命名](./terminology) |
| 根据用户需求选择文档上下文 | [路由提示](./routing-hints) |
| 执行常见开发任务 | [任务配方](./task-recipes) |
| 判断事实源、生成物和 MCP 边界 | [事实源地图](./reference-sources) |

## 使用原则

1. 先用 handbook 获取稳定公开知识。
2. 再用项目文件确认当前版本、模块、模板、schema 和测试入口。
3. 需要读取当前项目状态、运行校验、生成资源或控制平台时，交给 MCP tools 或本地脚本。
4. 不要把 `Ouroboros / ouroboros` 运行时标识误改成 TideStack。

## 对外索引

- `llms.txt`：短上下文入口。
- `llms-full.txt`：完整 AI 路由索引。
- `docs/reference/jsonschema/metadata/`：随 handbook 开源发布的公开 JSON Schema。
- `openapi/`：面向外部集成的 OpenAPI 规范归档位置。
