---
title: 平台扩展点总表
sidebar_position: 4
---

# 平台扩展点总表

本页按变化对象定位实现入口。开发者或 AI 先读取已有模型、配置和接口，再选择需要修改或补充的能力；新增程序能力仍通过平台正式扩展点加载。

## 模型与配置入口

| 任务 | 实现入口 | 实现依据 |
| --- | --- | --- |
| 新增或调整业务功能 | [业务模型](../concepts/business-model/)与现有动作 | 对象、字段、关系、状态和输入输出 |
| 调整页面结构与交互 | [UI 模型](../concepts/ui-model/)与 [UI Schema](../concepts/ui-schema/) | 页面数据域、接口和组件契约 |
| 调整业务规则与自动化 | [逻辑流](../concepts/logicflow-model/)、表达式与脚本 | 已有节点、上下文、分支和错误行为 |
| 修改模块自带元数据 | [模型资源与打包](../guide/advance/authoring-metadata-conventions/) | 类型后缀、资源标识、打包与引用 |

这些定义可以在平台编辑器中维护，也可以由 AI 根据目标项目生成或修改。现有能力及其适用范围见 [平台能力地图](../reference/platform-capability-map)。

## 前端扩展点

| 需求 | 扩展点 | 交付方式 |
| --- | --- | --- |
| 独立复杂页面或子系统 | [微前端应用](../guide/advance/extend-frontend/micro-app/) | 独立前端构建产物，通过微前端入口安装 |
| 替换顶栏或侧栏 | [布局组件](../guide/advance/extend-frontend/layout-component/) | 通过前端正式布局扩展机制注册 |
| 替换登录体验 | [登录页微前端](./custom-login-page-and-auth-integration) | 登录页入口 + 现有认证服务 |
| 在 Schema 页面复用组件 | [组件库](../guide/advance/extend-frontend/amis-component/) | 应用组件库或平台组件库 |
| 向多个应用分发组件 | [平台组件库](./plugin-extensions/frontend/platform-component-library) | 含 `components.manifest.json` 的版本化 ZIP |

选择步骤见 [前端开发](./frontend-extension-paths)，安装和版本治理见 [工作台与 Widget](./workbench-widgets-and-component-libraries)。

## 后端开发与插件扩展

应用中写业务代码、调用模型，见 [后端开发](./backend-development/)；增加可复用类型、节点或适配器，见 [后端插件扩展](../guide/advance/extend-backend/)。

| 要做的事 | 入口 | 机制 |
| --- | --- | --- |
| Java 注册和读写模型 | [数据模型](./backend-development/data-model) | typed 扫描、模型中心与数据 API |
| Java 与业务动作、流程互调 | [业务模型](./backend-development/business-model)、[逻辑流](./backend-development/logicflow-model) | 动作 Runtime、流程执行 Facade、正式实现绑定 |
| 写普通 Controller 与 Service | [Spring 开发](./backend-development/spring-beans-and-controllers) | 自动配置装配 Bean、MVC 路由和权限注解 |
| 发送和消费消息、定时执行 Java | [MQ](./backend-development/message-queue)、[计划任务](./backend-development/scheduled-tasks) | 直接 Java 调用与所属运行生命周期 |
| 增加字段、节点、上下文与语言 | [后端插件目录](../guide/advance/extend-backend/) | 各自 Registry、SPI 和宿主配置 |
| 增加数据类型、模型行为和元数据装饰 | [后端插件目录](../guide/advance/extend-backend/) | 值转换、操作链、元数据装饰和业务模型投影 |
| 增加数据范围、认证和存储适配 | [后端插件目录](../guide/advance/extend-backend/) | 具体接口与目标版本正式装配；文件存储需核对当前接入条件 |
| 新增 RPC 协议、调度来源等复用能力 | [其他扩展入口](./plugin-extensions/backend/other-extension-points) | 既有执行链、来源聚合与适配机制 |
| 为新模型增加管理界面与版本管理 | [开发模块](./development-module-scaffold-and-maven-skeleton) | 现有开发态与运行态边界 |

普通 Java 方法不要求包装成逻辑流。可复用扩展按 [后端扩展包](./backend-extension-packages)交付，所用机制决定 SPI、Spring Bean 或配置源等注册方式。

## 实现与交付

实现前，向 AI 提供对应的接口或类型、项目中的同类实现、依赖版本和一组输入输出样例。先确认现有能力能否复用；确需新增时，再进入对应教程实现并注册。新增元数据按 [模型资源与打包](../guide/advance/authoring-metadata-conventions/) 编写和打包，扩展安装后仍通过平台模型、页面和权限链路使用。

开发顺序与通用验收见 [融合开发总览](./overview)，团队交接内容见 [任务协作与交付验收](./high-low-code-collaboration)。
