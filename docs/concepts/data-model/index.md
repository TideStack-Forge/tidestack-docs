---
sidebar_position: 5
title: 数据模型
---

# 数据模型

数据模型描述数据结构、字段关系、持久化和查询语义。它是运行时数据访问的契约，也是业务模型、逻辑流、WebAPI 和权限数据范围的共同基础。

## 作用

- 定义数据模型的名称、来源、字段和主键。
- 统一数据校验、CRUD、查询、分页和排序行为。
- 通过 DataStation、DataAdapter 和插件链适配不同数据源。
- 支持运行时动态模型和编译期类型化模型两种使用方式。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `formatVersion` | 元数据版本 | 识别数据模型定义格式。 |
| `source` | 模型来源 | 区分平台、应用、代码或其他来源。 |
| `name` / `fullName` | 模型标识 | `fullName` 通常由命名空间和名称组成。 |
| `namespace` | 命名空间 | 避免不同来源的模型名称冲突。 |
| `label` / `description` | 模型说明 | 面向开发和管理页面的描述。 |
| `fields` | 字段元数据 | 包含字段类型、必填、默认值和查询能力。 |
| `primaryKeys` | 主键定义 | 决定记录身份和更新、删除定位方式。 |
| `uniqueConstraints` | 唯一约束 | 保证业务唯一性并支持校验。 |
| `primaryKeyGenerator` | 主键生成器 | 定义 UUID、自增、编码等生成方式。 |
| `migrationStrategy` | 迁移策略 | 描述模型变化如何同步到数据源结构。 |
| `extraProps` | 扩展属性 | 承载经过约定的模型扩展信息。 |

## 与其他模型的关系

- [业务模型](../business-model/) 可以投射数据模型，业务模型负责语义，数据模型负责数据访问。
- [字段定义](../field-define/) 为数据模型提供可复用字段类型；[数据字典模型](../data-dict-model/) 提供字段值域。
- [逻辑流模型](../logicflow-model/) 通过数据模型读写记录；[WebAPI 模型](../webapi-model/) 通过接口契约暴露读写能力。
- [权限模型](../authority-model/) 可以参与数据范围和访问判断，但不应把授权规则硬编码进字段元数据。

## DataModel、DataStation 与 DataAdapter

运行时 API 中三者职责不同：`DataModel` 面向业务级记录和模型元数据；`DataStation` 管理一组数据模型及其数据源；`DataAdapter` 执行具体数据访问和查询转译。上层代码应优先使用 DataModel，不应绕过正式接口直接操作数据库或 DataAdapter。

## 使用入口与契约

- 操作入口：[数据模型菜单](../../low-code/development-platform-menus/data-model) · [数据模型 API](../../api/backend/data-model/) · [查询 DSL](../../api/backend/data-query-dsl/)
- 扩展入口：[扩展字段](../../guide/advance/extend-backend/extend-field/)
- 当前 handbook 没有独立的 `data-model.schema.json`；数据模型运行时契约以 API 参考和模块实现为准，其他 metadata Schema 见 [JSON Schema 参考](../../reference/jsonschema/)。
