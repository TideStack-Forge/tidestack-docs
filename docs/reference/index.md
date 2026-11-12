---
title: 参考资料
sidebar_position: 1
---

# 参考资料

本栏目提供开发应用时使用的方法、参数、数据格式和排查说明。代码示例中的模型全名、页面路径、接口地址和字典名，需要替换为目标应用已定义的资源。

## 查阅入口

| 要查的内容 | 入口 | 收录范围 |
| --- | --- | --- |
| 平台有哪些现成能力 | [平台能力地图](./platform-capability-map) | 业务需求、内建能力、操作入口与扩展边界 |
| 运行时对象和方法 | [API 参考](../api/) | 后端 API、前端 SDK 与基座内建组件 |
| HTTP 接口约定 | [WebAPI 规范](../api/web-api-spec/) | URL、HTTP 动词、状态码与响应结构 |
| 元数据文件结构 | [JSON Schema](./jsonschema/) | 资源类型、文件后缀与 Schema 文件索引 |
| 具体症状和常见判断 | [常见问题](../faq/) | 前端、后端与运维问题 |

## 常用接口

| 使用场景 | 直接查阅 |
| --- | --- |
| 编写 `${...}` 表达式 | [表达式上下文](../api/backend/expression-context/) |
| 编写业务脚本 | [脚本上下文](../api/backend/script-context/) |
| 读取或写入模型数据 | [数据模型 API](../api/backend/data-model/) · [查询 DSL](../api/backend/data-query-dsl/) |
| 查 Java 类型和工具方法 | [Java API](../api/backend/java-api/) |
| 接入微前端、布局组件或组件库 | [SDK 初始化方法](../api/frontend/sdk/initialization-methods/) |
| 调用导航、请求、认证、事件或实时通信能力 | [SDK 运行时方法](../api/frontend/sdk/completion-methods/) |
| 操作菜单树、徽标和用户菜单 | [菜单扩展 API](../api/frontend/sdk/menu-extension/) |
| 编写 AMIS 页面 Schema | [基座内建组件](../api/frontend/buildin-comps/) |

## 示例约定

Java 示例使用平台支持的 Java 21 环境；业务脚本示例标明 Groovy 或 JavaScript；前端 API 示例从 `ouroboros-sdk` 导入。JSON 示例保持合法 JSON，动态取值通过平台对应的表达式语法声明。示例中的资源名用于说明调用方式，不会自动创建模型、接口或权限。

## 相关手册

需要操作步骤时，查 [低代码开发](../low-code/)、[融合开发](../fusion-development/) 或 [运维管理](../operations/)；需要理解模型职责和关系时，查 [概念与设计](../concepts/)。平台目标和设计原则见 [平台介绍](../overview)。

产品名称使用“潮汐栈”；代码包名、SDK 导入和运行时路径保留 `Ouroboros / ouroboros` 技术标识。接口适用版本以各专题声明和所用平台版本为准。
