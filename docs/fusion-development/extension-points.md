---
title: 平台扩展点总表
sidebar_position: 4
---

# 平台扩展点总表

只有 [平台能力地图](../reference/platform-capability-map) 中的内建能力无法表达需求时，才选择扩展点。

## 前端扩展点

| 需求 | 扩展点 | 交付方式 |
| --- | --- | --- |
| 独立复杂页面或子系统 | 微前端应用 | 独立前端构建产物，通过微前端入口安装 |
| 替换顶栏或侧栏 | 布局组件 | 通过前端正式布局扩展机制注册 |
| 替换登录体验 | 登录页微前端 | 登录页入口 + 现有认证服务 |
| 在 Schema 页面复用组件 | AMIS 组件库 | 应用组件库或平台组件库 |
| 向多个应用分发组件 | 平台组件库 | 含 `components.manifest.json` 的版本化 ZIP |

选择步骤见 [前端融合开发方式](./frontend-extension-paths)，安装和版本治理见 [工作台、Widget 与平台组件库](./workbench-widgets-and-component-libraries)。

## 后端扩展点

| 需求 | 扩展点 | 必须复用的机制 |
| --- | --- | --- |
| 新字段语义和行为 | [字段扩展](../guide/advance/extend-backend/extend-field/) | 字段类型 Registry 和元数据 |
| `${...}` 中增加对象或工具 | [表达式扩展](../guide/advance/extend-backend/extend-expression/) | 表达式上下文注册 |
| 脚本中增加对象或执行能力 | [脚本扩展](../guide/advance/extend-backend/extend-script/) | 脚本上下文和执行接口 |
| 逻辑流编辑器增加节点 | [逻辑流扩展](../guide/advance/extend-backend/extend-logicflow/) | 节点 SPI、元数据和运行时 |
| 增加主体、Claims 或访问控制 | [权限、主体与访问控制](./authority-subject-and-access-control-design) | `SubjectProvider`、`AuthorityProvider`、访问控制定义 |
| 组合 Bean、SPI 和资源 | [后端扩展包](./backend-extension-packages) | Spring 自动配置、SPI 和 `META-INF/` 注册 |
| 增加开发态管理模型 | [开发模块](./development-module-scaffold-and-maven-skeleton) | 现有 `*-dev` 模块生命周期 |

## 基础能力扩展

| 需求 | 正式边界 |
| --- | --- |
| 新任务来源或调度机制 | `Scheduler`、`ScheduleTaskProvider`、`ScheduleTaskIntegrator` |
| 新消息中间件或绑定策略 | `MQBridge`、producer/consumer 抽象和中间件适配点 |
| 新实时协议或连接治理 | WebSocket 发送、订阅和拦截器链 |

具体步骤见 [集成、自动化与实时能力](./integration-automation-and-realtime)。不要在业务模块中直接创建第二套调度器、消息客户端、权限注册表或组件加载器。

## 交付检查

1. 需求明确超出内建配置能力。
2. 只选择一个主扩展点，其他能力通过正式接口组合。
3. 自动配置、SPI 和元数据资源已注册。
4. 单元测试和最小集成验证通过。
5. 兼容平台版本、安装、升级、卸载和回滚步骤已经说明。
6. 扩展安装后仍由平台模型、页面、权限和发布流程消费。
