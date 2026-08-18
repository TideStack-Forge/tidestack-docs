---
displayed_sidebar: referenceSidebar
sidebar_position: 1
---

# API 参考

适用对象：已经确定自己要查哪类技术对象、接口或上下文的开发者。

这里收录潮汐栈的查阅型技术资料，重点是“按对象、能力和规范查资料”，而不是带你走完整业务交付流程。

文档中的产品名称统一使用“潮汐栈”，但涉及实际代码、包名、SDK 名称时，仍会保留 `Ouroboros / ouroboros` 这类技术标识。

除专题另有版本声明外，本区内容适用于 `2.0.0-rc.1-SNAPSHOT`；专题有独立声明时以专题为准。

## 你通常会来这里查什么

| 当前问题                                     | 推荐入口                                             |
| -------------------------------------------- | ---------------------------------------------------- |
| 想查脚本里能直接用哪些对象和方法             | [脚本上下文](./backend/script-context/)              |
| 想查 `${...}` 表达式里能直接用哪些变量和工具 | [表达式上下文](./backend/expression-context/)        |
| 想查数据模型、查询 DSL 和后端运行时对象      | [后端 API](./backend/)                               |
| 想查微前端 SDK、初始化方式和前端能力         | [前端 API](./frontend/)                              |
| 想统一接口命名、状态码和响应结构约定         | [Web API 规范](./web-api-spec/)                      |
| 想先看“平台到底已经有哪些能力”               | [平台能力地图](../reference/platform-capability-map) |

## 后端

- [数据模型](./backend/data-model/)
- [查询 DSL](./backend/data-query-dsl/)
- [表达式上下文](./backend/expression-context/)
- [脚本上下文](./backend/script-context/)
- [Java API](./backend/java-api/)

## 前端

- [内置组件](./frontend/buildin-comps/)
- [SDK 自动补全方法](./frontend/sdk/completion-methods/)

## 规范

- [Web API 规范](./web-api-spec/)

## 当前覆盖重点

- 后端：数据模型、查询 DSL、表达式上下文、脚本上下文、Java API
- 前端：基座内建组件、微前端 SDK 初始化与补全方法
- 规范：Web API 风格约定

## 使用建议

- 如果你还不确定该看哪一类资料，先回到 [参考资料](../reference/)
- 如果你现在需要的是操作流程，而不是接口细节，请优先看 [低代码开发](../low-code/) 或 [融合开发](../fusion-development/)
- 如果你需要先统一模型和术语，再回来查接口，请先看 [核心概念](../concepts/)
