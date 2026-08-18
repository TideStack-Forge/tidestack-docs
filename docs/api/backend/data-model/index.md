---
sidebar_position: 2
---

import DocCardList from '@theme/DocCardList';

# 数据模型 API

本专题说明如何在运行时读取、查询和加工模型数据。

如果你只是想理解什么是数据模型，先回到 [数据模型](../../../concepts/data-model/)；如果你已经开始写脚本、表达式或 Java 代码，这页就是后续下钻入口。

## 你通常会和这页一起看什么

- 想查查询表达：看 [查询 DSL](../data-query-dsl/)
- 想查脚本里怎么拿数据模型：看 [脚本上下文](../script-context/)
- 想查表达式里能用哪些上下文对象：看 [表达式上下文](../expression-context/)
- 想先统一数据模型概念：看 [数据模型](../../../concepts/data-model/)

## 这页解决什么问题

- 当前运行时如何识别和获取数据模型
- 数据模型查询相关能力应该从哪里下钻
- 数据模型 API 和脚本、表达式、WebAPI 之间的关系

## 先分清这四层

数据模型文档最容易混的是“元数据对象”和“运行时对象”。可以先按下面四层理解：

| 层次 | 代表对象 | 适用场景 |
| ---- | ---- | ---- |
| 模型元数据 | [DataModelMeta](./data-model-meta/) | 我想知道模型定义长什么样 |
| 字段元数据 | [DataModelFieldMeta](./data-model-field-meta/) | 我想知道字段定义长什么样 |
| 运行时弱结构模型 | [DataModel](./data-model/) | 我想用 `Map` / `Record` 读写数据 |
| 运行时强类型模型 | [TypedDataModel](./typed-data-model/) | 我想在 Java 里直接读写领域对象 |

把这四层分清，后面看 `DataModelCenter`、`TypedDataModelCenter` 和查询 DSL 时会容易很多。

## 当前已整理的核心接口

| 类型 | 说明 |
| ---- | ---- |
| [DataModel](./data-model/) | 运行时数据模型读写接口 |
| [DataModelField](./data-model-field/) | 运行时字段对象 |
| [DataModelMeta](./data-model-meta/) | 模型元数据定义 |
| [DataModelFieldMeta](./data-model-field-meta/) | 字段元数据定义 |
| [DataModelCenter](./data-model-center/) | 运行时模型注册中心 |
| [TypedDataModel](./typed-data-model/) | 面向强类型对象的模型接口 |
| [TypedDataModelCenter](./typed-data-model-center/) | 强类型模型获取入口 |
| [PluginDescriptor](./plugin-descriptor/) | 模型插件描述对象 |

## 常见使用路径

### 路径 A：脚本里动态拿模型

适合模型名在运行时才知道的场景。

1. 在脚本中通过 `DataModelCenter.get("crm.Order")` 取模型。
2. 调用 `query(...)`、`get(...)`、`insert(...)` 等方法。
3. 复杂筛选条件再结合 [查询 DSL](../data-query-dsl/)。

### 路径 B：Java 代码里按类型拿模型

适合你已经有领域对象类的场景。

1. 通过 [TypedDataModelCenter](./typed-data-model-center/) 获取模型。
2. 直接用 `TypedDataModel<PK, M>` 读写对象。
3. 需要底层弱结构能力时，再从 `getDataModel()` 取回原始模型。

### 路径 C：只读元数据

适合做建模检查、动态页面生成、字段推导或运行时装饰时。

1. 从 `DataModel` 或 `DataModelCenter` 拿模型。
2. 读取 `DataModelMeta`、字段列表、插件描述等结构信息。

## 阅读建议

如果你当前目标是：

- 写复杂查询条件：优先看 [查询 DSL](../data-query-dsl/)
- 在脚本中读写模型数据：优先看 [脚本上下文](../script-context/)
- 理解模型与页面、流程、接口的协作：优先回到 [核心概念](../../../concepts/)

## 使用提醒

- `DataModel` 和 `TypedDataModel` 的读写方法大多返回 `Try`，不要把它们当成直接抛异常的同步 API 去理解。
- `DataModelCenter` 是按名称取模型，`TypedDataModelCenter` 是按 Java 类型取模型，两者解决的问题不同。
- 插件相关方法更适合做运行时装饰，不适合把模型定义本身当作可变对象随意改写。

## 目录

<DocCardList />
