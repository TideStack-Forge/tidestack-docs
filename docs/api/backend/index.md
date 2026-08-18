---
sidebar_position: 4
---

import DocCardList from '@theme/DocCardList';

# 后端 API

适用对象：正在查后端运行时对象、脚本上下文、表达式能力和 Java 接口的开发者。

这部分文档关注的是“运行时能直接拿到什么、接口怎么用、扩展点从哪里接”，不是业务概念介绍，也不是 HTTP 接口规范。

## 从哪里开始查

- 想查脚本里能直接拿到哪些对象：看 [脚本上下文](./script-context/)
- 想查表达式 `${...}` 能直接用哪些变量和工具：看 [表达式上下文](./expression-context/)
- 想查模型查询、字段读取和结构化访问：看 [数据模型 API](./data-model/)
- 想查 Java 实体接口和工具类：看 [Java API](./java-api/)
- 想查复杂查询表达：看 [查询 DSL](./data-query-dsl/)

## 按问题类型快速定位

| 你现在的问题 | 建议先看哪里 |
| ---- | ---- |
| 我在写 `${...}`，不知道能直接用什么 | [表达式上下文](./expression-context/) |
| 我在写脚本，需要用户、组织、模型、日志、配置对象 | [脚本上下文](./script-context/) |
| 我想按名称或类型拿数据模型，再做查询或写入 | [数据模型 API](./data-model/) |
| 我想确认 Java 工具类或实体对象有哪些稳定方法 | [Java API](./java-api/) |
| 我在查筛选、分页、排序、关联等 DSL 结构 | [查询 DSL](./data-query-dsl/) |
| 我其实不是在查 API，而是在决定怎么扩展平台 | [扩展后端](../../guide/advance/extend-backend/) |

## 相关概念

- [数据模型](../../concepts/data-model/)
- [业务模型](../../concepts/business-model/)
- [权限模型](../../concepts/authority-model/)
- [WebAPI 模型](../../concepts/webapi-model/)

## 使用提醒

- 表达式上下文和脚本上下文都属于“运行时可直接使用的对象”，但脚本上下文通常更完整
- 如果你当前在做的是扩展入口选择，而不是查具体接口，请先回到 [融合开发](../../fusion-development/)
- 如果你当前要看的是接口风格和返回约定，而不是运行时对象，请转到 [Web API 规范](../web-api-spec/)

## 一条推荐阅读路径

如果你是第一次接触潮汐栈的后端运行时，通常按下面顺序最顺：

1. 先看 [脚本上下文](./script-context/) 和 [表达式上下文](./expression-context/)，建立“平台已经给了我什么”的基本认知。
2. 再看 [数据模型 API](./data-model/)，理解运行时如何读写模型数据。
3. 需要确认具体 Java 类型或工具类时，再进入 [Java API](./java-api/)。
4. 要处理更复杂的查询语句时，最后下钻到 [查询 DSL](./data-query-dsl/)。

## 这部分不解决什么

- 不讲业务模型、菜单、页面等概念建模过程。
- 不讲应用部署、升级和运维问题。
- 不讲前端 SDK 或组件能力。

如果你当前卡的是这些问题，更适合回到：

- [低代码开发](../../low-code/)
- [融合开发](../../fusion-development/)
- [运维管理](../../operations/)

## 目录

<DocCardList />
