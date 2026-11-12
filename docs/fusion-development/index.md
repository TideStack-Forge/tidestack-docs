---
title: 融合开发
sidebar_position: 1
---

# 融合开发

融合开发将业务建模、AI 辅助实现和平台能力接入用于同一个应用。开发者明确业务规则，通过可视化编辑器维护模型，也可以让 AI 协助修改模型、页面、流程和代码，再在目标应用中验证结果。各类实现沿用平台的权限、加载和运行机制。

已有具体需求但不确定阅读顺序时，先看 [开发任务导航](../guide/advance/)。

## 开始融合开发

| 阅读顺序 | 要完成的事 |
| --- | --- |
| [融合开发总览](./overview) | 理解模型、AI 与程序能力如何共同交付应用 |
| [从需求确定实现范围](./when-to-use-code) | 查已有资产，列出模型、页面、流程及实现的必要改动 |
| [用 AI 完成功能开发](./ai-assisted-development) | 提供上下文，实施并按运行反馈修正 |
| [任务协作与交付验收](./high-low-code-collaboration) | 确认责任、业务验收、版本与产物交接 |

AI 助手的文档上下文见 [AI 入口](../ai/)，具体机制定位见 [平台扩展点总表](./extension-points)。

## 前端开发

从 [前端开发总览](./frontend-extension-paths)选择页面、布局与交互的实现位置。

| 任务 | 教程 |
| --- | --- |
| 接入工程、资源路径和宿主生命周期 | [应用改造](../guide/advance/extend-frontend/application-transformation) |
| 独立页面或子应用 | [微前端应用](../guide/advance/extend-frontend/micro-app/) |
| 定制顶栏、侧栏与导航 | [布局组件](../guide/advance/extend-frontend/layout-component/) |
| 组合首页、看板与可配置内容 | [工作台与 Widget](./workbench-widgets-and-component-libraries) |
| 上传和更新构建包 | [微前端包管理](../guide/advance/extend-frontend/) |
| 编写 Schema 与事件动作 | [PrismUI 开发参考](../guide/advance/amis-reference/) |

## 后端开发

[后端开发总览](./backend-development/)介绍普通 Java / Spring Boot 代码与模型的配合方式。

| 任务 | 教程 |
| --- | --- |
| 创建工程，装配 Bean、SPI 与资源 | [后端扩展包](./backend-extension-packages) |
| 用注解注册模型，从 Java 读写模型 | [数据模型](./backend-development/data-model) |
| 实现业务动作、调用动作并监听业务事件 | [业务模型](./backend-development/business-model) |
| Java 与可视化编排互调 | [逻辑流模型](./backend-development/logicflow-model) |
| 复用外部接口和提供 HTTP 入口 | [RPC 模型](./backend-development/rpc-model)、[WebAPI 模型](./backend-development/webapi-model) |
| 编写普通接口、Service、消息与任务 | [Controller 与 Service](./backend-development/spring-beans-and-controllers)、[MQ](./backend-development/message-queue)、[计划任务](./backend-development/scheduled-tasks) |
| 调用配置、字典、通知、实时通信与上传 | [平台支撑能力](./backend-development/supporting-resources) |

## 插件扩展

[插件扩展](./plugin-extensions/)集中介绍可重复使用的能力及正式注册方式。

| 方向 | 内容 |
| --- | --- |
| [前端插件](./plugin-extensions/frontend/) | [平台组件库（带 manifest）](./plugin-extensions/frontend/platform-component-library)、[普通组件包（不带 manifest）](../guide/advance/extend-frontend/amis-component/) |
| [后端插件](../guide/advance/extend-backend/) | 逻辑流节点、脚本与表达式上下文、字段类型、脚本语言、数据字段类型、模型插件与装饰器、文件存储、数据权限和认证方式 |

## 认证与权限

| 任务 | 教程 |
| --- | --- |
| 从页面工程到认证调用、绑定与国际化 | [自定义登录页与认证接入](./custom-login-page-and-auth-integration) |
| 接入企业目录 | [AD 域认证方式适配指南](./ad-domain-auth-adaptation-guide) |
| 接入跳转式统一认证 | [OIDC](./oidc-auth-adaptation-guide)、[CAS](./cas-auth-adaptation-guide) |
| 接入企业协作平台登录 | [钉钉](./dingtalk-auth-adaptation-guide)、[企业微信](./wecom-auth-adaptation-guide)、[飞书](./feishu-auth-adaptation-guide) |
| 规划主体、Claims、接口与数据范围 | [权限与访问控制](./authority-subject-and-access-control-design) |

## 集成、联调与交付

| 任务 | 教程 |
| --- | --- |
| 组合外部接口、消息、任务与实时反馈 | [集成、自动化与实时能力](./integration-automation-and-realtime) |
| 在平台测试实例断点调试 | [本地 IDE 与线上平台联调](./local-ide-and-platform-debugging) |
| 核对实例、版本与安装恢复方式 | [开发平台辅助能力](./development-platform-support-capabilities) |

尚未建立基础业务资产时，从 [低代码开发](../low-code/)开始；已有目标任务时，通过 [开发任务导航](../guide/advance/)找到具体教程与验收点。
