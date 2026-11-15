---
title: 融合开发
sidebar_position: 1
---

# 融合开发

融合开发让业务模型、页面、流程和代码共同构成一个应用。你可以在开发平台或 IDE 中维护模型，用 Java 实现业务服务，用微前端定制交互，也可以让 AI 协助完成这些工作。它们使用同一套模型、权限和运行机制。

第一次开发时，先选定工程模式，让应用和运行环境启动起来，再完成一项具体功能。已有项目只需进入对应技术专题；按需求查找入口可使用 [开发任务导航](../guide/advance/)。

## 工程准备

先确定谁提供启动程序、模型和代码放在哪里、最终交付哪些产物。由开发平台创建应用并补充代码时，可从标准基座扩展模式开始；已有 Spring Boot 工程需要自行装配基座时，选择内嵌基座模式。

| 要完成的事 | 指导文档 |
| --- | --- |
| 比较启动入口、依赖和交付责任 | [选择工程模式](./project-modes/) |
| 使用标准基座，准备应用元数据、扩展包与前端工程 | [标准基座扩展模式](./project-modes/standard-runtime) |
| 建立自己的启动程序并装配基座能力 | [内嵌基座模式](./project-modes/embedded-runtime) |
| 安装 IDE 工具，配置模型编译、依赖过滤与校验 | [开发工具](./development-tools) |
| 创建并装配后端业务 JAR | [后端扩展包](./backend-extension-packages) |
| 确认模型源码、构建输出与 JAR 内资源目录 | [模型资源与打包](../guide/advance/authoring-metadata-conventions/) |

## 开始开发

先选一个具体业务行为，找到现有模型、页面和接口，确认所需改动与验收结果。首次实现宜先贯通一个可操作的入口，再逐步增加规则和交互。

| 当前任务 | 阅读入口 |
| --- | --- |
| 了解模型与代码怎样配合完成应用 | [融合开发总览](./overview) |
| 将需求拆成模型、页面、流程和代码的改动 | [从需求确定实现范围](./when-to-use-code) |
| 从数据模型、Java 接口做到页面、菜单和角色授权 | [完成第一个融合开发功能](./first-feature)，含完整示例工程 |
| 已有明确需求，寻找适合的实现方式 | [开发任务导航](../guide/advance/) |
| 让 AI 读取已有资产、完成修改并验证 | [用 AI 完成功能开发](./ai-assisted-development) |

## 后端开发

从已有数据和普通 Service 入手，再把业务行为接入动作、流程和接口。需要消息处理或后台执行时，继续使用消息与任务能力。

| 要完成的事 | 教程 |
| --- | --- |
| 在 Java 中读写已有模型、注入类型化模型 | [数据模型](./backend-development/data-model) |
| 声明字段、主键、关联、唯一约束及模型插件 | [用注解定义数据模型](./backend-development/data-model-annotations) |
| 编写普通业务服务与 HTTP 接口 | [Controller 与 Service](./backend-development/spring-beans-and-controllers) |
| 划定事务，传播异常，安排后台执行身份 | [事务、异常与后台身份](./backend-development/transactions-and-execution-context) |
| 实现和调用业务动作，监听业务事件 | [业务模型](./backend-development/business-model) |
| 让 Java 与可视化编排互相调用 | [逻辑流模型](./backend-development/logicflow-model) |
| 将动作或流程暴露为 HTTP 接口 | [WebAPI 模型](./backend-development/webapi-model) |
| 调用外部服务并复用参数、认证和接口定义 | [RPC 模型](./backend-development/rpc-model) |
| 发送、消费消息，编写后台任务 | [消息队列](./backend-development/message-queue)、[计划任务](./backend-development/scheduled-tasks) |
| 使用配置、字典、通知、实时通信、上传与组织服务 | [平台支撑能力](./backend-development/supporting-resources) |
| 随模块或应用补齐基础数据 | [数据初始化](./backend-development/data-initialization) |

各入口的选择与调用关系见 [后端开发总览](./backend-development/)。

## 前端开发

在现有页面上调整 Schema，或将定制界面作为微前端接入宿主。前端开发先确认生命周期、资源路径和接口，再扩展布局与工作台。

| 要完成的事 | 教程 |
| --- | --- |
| 选择页面、布局和组件的实现位置 | [前端开发总览](./frontend-extension-paths) |
| 接入工程、构建资源和宿主生命周期 | [应用改造](../guide/advance/extend-frontend/application-transformation) |
| 接入独立页面或子应用 | [微前端应用](../guide/advance/extend-frontend/micro-app/) |
| 编写 Schema、事件和动作 | [PrismUI 开发参考](../guide/advance/amis-reference/) |
| 定制顶栏、侧栏与导航 | [布局组件](../guide/advance/extend-frontend/layout-component/) |
| 组合首页、看板与可配置内容 | [工作台与 Widget](./workbench-widgets-and-component-libraries) |
| 上传和更新构建包 | [微前端包管理](../guide/advance/extend-frontend/) |

## 认证与权限

开发业务入口时就要明确谁可以访问、能够操作哪些数据。已有平台账号可以先配置授权；需要企业身份登录或品牌登录页时，再增加相应接入。

| 要完成的事 | 教程 |
| --- | --- |
| 规划主体、Claims、接口权限与数据范围 | [权限与访问控制](./authority-subject-and-access-control-design) |
| 定义数据权限参数、授权表单与查询约束 | [数据权限参数的定义与使用](./data-access-control-parameters) |
| 接入企业目录、统一认证服务或企业协作平台 | [认证接入](./authentication-integration)：AD、OIDC、CAS、钉钉、企业微信、飞书 |
| 定制登录交互、多种认证入口与语言切换 | [自定义登录页](./custom-login-page-and-auth-integration) |

## 集成、自动化与实时能力

外部调用、消息处理、任务触发和页面推送需要共同完成一个业务时，按 [集成、自动化与实时能力](./integration-automation-and-realtime)安排各阶段的输入、状态、重试和最终结果。单个接口或任务可直接使用对应后端教程。

## 测试与调试

先用 [自动化测试](./automated-testing)检查业务规则、真实模型读写、回滚和权限，再从目标应用的真实入口联调。断点调试方式按代码运行位置选择：

| 代码运行位置 | 调试方法 |
| --- | --- |
| 开发平台管理的测试实例 | [平台测试实例调试](./local-ide-and-platform-debugging) |
| 本机的标准基座容器 | [本地基座容器调试](./local-runtime-container-debugging) |
| 工程自己的 Spring Boot 进程 | [内嵌基座调试](./embedded-runtime-debugging) |

## 插件扩展

一项实现需要被多个模型或应用复用时，可以进一步整理为组件、节点、上下文或模型插件。先查 [平台扩展点总表](./extension-points)，确定对应能力的注册与调用机制。

| 要扩展的能力 | 阅读入口 |
| --- | --- |
| Schema 中复用的普通组件包 | [普通组件包](../guide/advance/extend-frontend/amis-component/) |
| 跨应用管理、带清单的平台组件库 | [平台组件库](./plugin-extensions/frontend/platform-component-library) |
| 脚本与表达式上下文、逻辑流节点、字段、模型插件及适配器 | [后端插件](../guide/advance/extend-backend/) |
| 开发平台中的新模型编辑与管理功能 | [开发模块与 Maven 脚手架](./development-module-scaffold-and-maven-skeleton) |

插件的实现、注册和验证顺序见 [插件扩展总览](./plugin-extensions/)。

## 开发实践与交付

| 当前任务 | 指导文档 |
| --- | --- |
| 排查资源未生效、装配、依赖、配置及后台调用问题 | [开发实践](./development-practices) |
| 保留已有数据，调整模型并安排迁移、升级和恢复 | [模型变更与应用升级](./model-evolution-and-upgrade) |
| 评审变更、安排业务验收、交接版本与验证记录 | [任务协作与交付验收](./high-low-code-collaboration) |
| 安装应用、检查配套版本并准备恢复 | [应用发布与回滚](../operations/application-release-and-rollback) |
