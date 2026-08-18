---
title: 任务配方
sidebar_position: 4
---

# 任务配方

这些配方给 AI Agent 提供最小上下文读取顺序和验收口径。执行时仍以当前仓库文件和测试为准。

## 创建一个低代码业务功能

1. 读 `docs/low-code/from-requirement-to-delivery.md`。
2. 按对象、页面、流程、权限、集成拆解。
3. 需要 metadata 时查 `docs/reference/jsonschema/metadata/` 和对应概念页。
4. 验收：业务入口、权限、页面、数据、流程和发布路径都能闭环。

## 创建融合开发扩展

1. 读 `docs/fusion-development/when-to-use-code.md` 判断边界。
2. 读 `docs/fusion-development/extension-points.md` 选择正式扩展点。
3. 前端读 `docs/fusion-development/frontend-extension-paths.md`；后端读 `docs/fusion-development/backend-extension-packages.md`。
4. 验收：没有绕过主运行链路，扩展点注册、metadata、测试和回滚说明齐全。

## 查 API 或 SDK 用法

1. 读 `docs/api/index.md` 定位类别。
2. 后端查 `docs/api/backend/`，前端查 `docs/api/frontend/`。
3. 涉及旧标识时读 `docs/ai/terminology.md`。
4. 验收：示例中的包名、导入名、路径和版本与当前代码一致。

## 校验 metadata 文件

1. 根据文件后缀识别类型。
2. 使用 `docs/reference/jsonschema/metadata/<type>.schema.json` 校验 JSON 结构。
3. 再检查跨资源引用，例如菜单 URL、权限 `uiViews`、UI Model path、API route。
4. 验收：schema 通过，引用目标真实存在，运行时标识未被错误改名。

## 设计 MCP 能力

1. 读 `docs/ai/reference-sources.md` 区分 resources 和 tools。
2. resources 暴露 handbook、schema、OpenAPI、项目索引等只读上下文。
3. tools 执行校验、生成、扫描、联调和平台控制。
4. 验收：工具输入有 JSON Schema，副作用有 dry-run/确认/审计，长文档不复制进 tool description。
