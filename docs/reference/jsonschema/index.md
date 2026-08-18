---
title: JSON Schema
sidebar_position: 3
---

# JSON Schema

本目录收录随 TideStack Handbook 一起开源发布的 JSON Schema。它们是 handbook 的文档资产，发布后不得依赖 monorepo 或平台实现仓库中的其他目录。

## 元数据 Schema

位置：`docs/reference/jsonschema/metadata/`

| 文件 | 用途 |
| --- | --- |
| `index.json` | 元数据类型与 schema 文件索引 |
| `*.schema.json` | 各类 TideStack/Ouroboros 元数据资源的 JSON Schema |

使用这些 schema 时，先根据元数据文件后缀或类型查 `index.json`，再读取对应的 `<type>.schema.json`。

## 维护规则

- schema 必须提交在 handbook 仓库内，不能要求读者访问 handbook 外的项目路径。
- schema 可以由平台主仓库生成，但生成结果必须作为文档资产复制到本目录后再发布。
- 更新 schema 后运行 `npm run check:structure`，确认索引、文件数量和 JSON 解析都通过。
