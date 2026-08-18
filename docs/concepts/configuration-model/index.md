---
sidebar_position: 18
title: 配置模型
---

# 配置模型

配置模型定义可被平台管理的运行参数及其编辑元数据。它把“配置值是什么”和“这个值如何展示、校验、授权、修改”放在同一套契约中。

## 作用

- 统一管理会随环境、租户或应用变化的参数和开关。
- 为配置项提供值类型、默认值、可空性和编辑器 Schema。
- 区分系统级配置、应用级配置和运行实例配置的作用域。
- 让逻辑流和运行时服务通过正式配置服务读取值，而不是硬编码。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `key` | 配置键 | 运行时读取配置的稳定标识。 |
| `label` / `description` | 配置说明 | 面向管理者解释配置用途。 |
| `valueType` | 值类型 | 约束字符串、数字、布尔、列表或对象等值形态。 |
| `defaultValue` | 默认值 | 未设置覆盖值时使用的值。 |
| `modifiable` | 是否可修改 | 控制管理端是否允许修改。 |
| `nullable` | 是否允许为空 | 描述空值是否是合法配置状态。 |
| `groupPath` | 配置分组 | 将配置项放入可导航的分组层级。 |
| `scope` | 生效范围 | 区分平台、应用、租户或实例等作用域。 |
| `editorSchema` | 编辑器定义 | 描述管理页面如何编辑和校验该配置。 |

## 与其他模型的关系

- [应用模型](../application-model/) 提供应用边界，配置模型提供应用级可变参数。
- [逻辑流模型](../logicflow-model/) 可以读取配置值参与执行。
- [业务模型](../business-model/) 的固定业务属性不应随意改造成配置项。
- 配置的访问和修改仍受 [权限模型](../authority-model/) 与部署治理约束。

## 设计边界

会动态变化的环境参数放入配置模型；业务数据放入业务/数据模型；不会动态变化的系统级常量使用 Spring 配置系统。不要用配置模型保存大量业务记录。

## 使用入口与契约

- 操作入口：[配置项教程](../../guide/tutorial/configuration/) · [配置项菜单](../../low-code/development-platform-menus/config-item)
- Schema：`configuration.schema.json`、`configuration-group.schema.json`、`configuration-item.schema.json` 和 `configuration-group-item.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
