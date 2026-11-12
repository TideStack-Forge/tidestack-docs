---
sidebar_position: 1
title: 后端 API
---

# 后端 API

在业务脚本或 Java 扩展中调用平台能力时，按下表查找接口。示例中的模型名、字段名和资源名需要替换为应用内的实际定义。

| 使用场景 | 参考 | 调用方式 |
| --- | --- | --- |
| 字段默认值、规则和模板计算 | [表达式上下文](./expression-context/) | `${...}` 单个表达式 |
| 多步校验、查询和业务处理 | [脚本上下文](./script-context/) | JavaScript 或 Groovy |
| 动态读取、写入模型数据 | [数据模型 API](./data-model/) | `DataModel`，返回 `Record` |
| 在 Java 中读写领域对象 | [TypedDataModel](./data-model/typed-data-model/) | `TypedDataModel<PK, M>` |
| 筛选、排序、分页和关联查询 | [查询 DSL](./data-query-dsl/) | Map/List 或 Java 查询构建器 |
| 日期、转换、JSON 和组织对象 | [Java API](./java-api/) | Java 工具类和实体方法 |

## 返回值约定

- `Optional<T>`：可能不存在，调用前处理空值。
- `Try<T>`：包含执行结果或失败原因；`.get()` 在失败时重新抛出异常，也可以用 `map`、`flatMap` 组合处理。
- `T?`：本手册用来表示可能返回 `null`，不是 Java 类型语法。

完整扩展包的创建与安装步骤见 [创建后端扩展包](../../fusion-development/backend-extension-packages)。HTTP 接口约定见 [WebAPI 规范](../web-api-spec/)。
