---
displayed_sidebar: referenceSidebar
sidebar_position: 1
---

# API 参考

本区收录后端运行时接口、前端 SDK 和基座内建组件的参数、行为与示例。

除专题另有版本声明外，本区内容适用于 `2.0.0-rc.1-SNAPSHOT`；专题有独立声明时以专题为准。代码中的 `Ouroboros / ouroboros` 名称保留实际技术标识。

## 后端 API

| 专题 | 查阅内容 |
| --- | --- |
| [表达式上下文](./backend/expression-context/) | `${...}` 可访问的对象、工具与编号生成器 |
| [脚本上下文](./backend/script-context/) | 脚本中的认证、组织、模型、日志与配置对象 |
| [数据模型 API](./backend/data-model/) | 模型获取、元数据、字段和数据读写接口 |
| [查询 DSL](./backend/data-query-dsl/) | 增删改查结构、筛选条件、分页、排序与关联 |
| [Java API](./backend/java-api/) | 工具类、认证信息与组织实体接口 |

表达式和脚本可直接使用其上下文中的对象；Java 扩展按类型导入或注入。模型读写需检查 `Try` 的结果，示例中的模型名与资源名替换为应用实际定义。运行环境见 [后端 API 总览](./backend/)。

## 前端 API

| 专题 | 查阅内容 |
| --- | --- |
| [SDK 初始化方法](./frontend/sdk/initialization-methods/) | 微前端、布局组件和组件库的初始化入口与生命周期 |
| [SDK 运行时方法](./frontend/sdk/completion-methods/) | 导航、弹层、事件、请求、认证与实时通信 |
| [菜单扩展 API](./frontend/sdk/menu-extension/) | 菜单树、菜单徽标与用户菜单注册 |
| [基座内建组件](./frontend/buildin-comps/) | AMIS 组件、业务选择器、编辑器、动作与表达式函数 |

微前端从 `ouroboros-sdk` 导入方法，AMIS 页面通过 `type/actionType` 声明组件与动作。运行时 API 在页面挂载后使用，监听和订阅在卸载时清理。接口分类见 [前端 API 总览](./frontend/)。

## 相关规范

[WebAPI 规范](./web-api-spec/) 约定 HTTP 接口风格；[JSON Schema](../reference/jsonschema/) 收录元数据资源的结构。其他查阅入口见 [参考资料](../reference/)。
