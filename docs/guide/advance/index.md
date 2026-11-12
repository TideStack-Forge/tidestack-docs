---
title: 开发任务导航
sidebar_position: 100
---

# 开发任务导航

按要完成的业务任务选择起点，再补齐实现、注册与运行验证。无需按目录顺序读完所有技术文档。

## 我要改页面或交互

| 当前问题 | 先做什么 | 继续阅读 |
| --- | --- | --- |
| 标准页面少字段、少按钮或展示不合适 | 检查业务模型视图与 UI 模型，确定配置来源 | [页面交付](../../low-code/page-delivery-with-dynamic-forms-and-ui-schema)、[PrismUI 开发参考](./amis-reference/) |
| Schema 缺一个可复用控件 | 约定属性、type、值变化和编辑器需求 | [普通组件包](./extend-frontend/amis-component/) |
| 多个应用共用控件并管理清单 | 制作组件库与 manifest，平台安装后由应用导入 | [平台组件库](../../fusion-development/plugin-extensions/frontend/platform-component-library) |
| 页面需要复杂状态或独立路由 | 确定微前端边界，接入宿主生命周期 | [应用改造](./extend-frontend/application-transformation)、[微前端应用](./extend-frontend/micro-app/) |
| 要调整导航、首页或登录体验 | 分别选择布局、Widget 或登录页入口 | [前端开发](../../fusion-development/frontend-extension-paths) |

## 我要写业务逻辑或接入外部系统

| 当前问题 | 先做什么 | 继续阅读 |
| --- | --- | --- |
| Java 中要查询平台数据 | 确认模型全名和权限，使用数据模型 API | [数据模型](../../fusion-development/backend-development/data-model) |
| 扩展包需要声明自己的数据模型 | 用注解声明并注册扫描，避免重复声明投影模型 | [注解注册](../../fusion-development/backend-development/data-model#2-用注解声明新模型) |
| 平台页面调用我的 Java 业务方法 | 确认业务动作契约并绑定实现 | [业务模型](../../fusion-development/backend-development/business-model) |
| 订单提交后由 Java 处理业务事件 | 声明订阅、消费身份及同步监听实现 | [业务事件监听](../../fusion-development/backend-development/business-model#5-监听业务事件) |
| Java 使用配置、字典、通知或文件能力 | 装配正式服务，准备资源后逐项调用 | [平台支撑能力](../../fusion-development/backend-development/supporting-resources) |
| 代码需要执行已有可视化流程 | 明确输入顺序，通过执行 Facade 调用 | [逻辑流模型](../../fusion-development/backend-development/logicflow-model) |
| Java 与流程共用外部服务配置 | 定义 RPC、参数与凭据，再从各自入口调用 | [RPC 模型](../../fusion-development/backend-development/rpc-model) |
| 要提供一个普通 HTTP 接口 | 注册 Controller 与 Service，并绑定权限项 | [Controller 与 Service](../../fusion-development/backend-development/spring-beans-and-controllers) |
| 要把动作或流程暴露给页面 | 显式配置 WebAPI 绑定及输入映射 | [WebAPI 模型](../../fusion-development/backend-development/webapi-model) |
| 要异步处理或定时运行 Java 业务 | 使用 Java 消息消费、发送或定时任务 | [MQ](../../fusion-development/backend-development/message-queue)、[计划任务](../../fusion-development/backend-development/scheduled-tasks) |

## 我要增加可复用的平台能力

| 使用位置 | 阅读入口 |
| --- | --- |
| 建模字段、可视化节点 | [字段类型](./extend-backend/extend-field/)、[逻辑流节点](./extend-backend/extend-logicflow/) |
| 表达式、脚本中的公共对象 | [表达式上下文](./extend-backend/extend-expression/)、[脚本上下文](./extend-backend/extend-script/) |
| 新脚本语言、数据类型或模型通用行为 | [后端插件扩展](./extend-backend/) |
| 文件存储、新数据权限、认证协议 | [后端插件扩展](./extend-backend/)中的对应专题，先核对装配条件 |
| 新模型管理界面与版本管理 | [开发模块脚手架](../../fusion-development/development-module-scaffold-and-maven-skeleton) |

## 我要处理登录或权限

| 身份来源或任务 | 指南 |
| --- | --- |
| 企业目录 | [AD 接入](../../fusion-development/ad-domain-auth-adaptation-guide) |
| 统一认证协议 | [OIDC](../../fusion-development/oidc-auth-adaptation-guide)、[CAS](../../fusion-development/cas-auth-adaptation-guide) |
| 企业协作平台 | [钉钉](../../fusion-development/dingtalk-auth-adaptation-guide)、[企业微信](../../fusion-development/wecom-auth-adaptation-guide)、[飞书](../../fusion-development/feishu-auth-adaptation-guide) |
| 修改登录体验、增加认证按钮 | [自定义登录页与认证接入](../../fusion-development/custom-login-page-and-auth-integration) |
| 登录成功但业务访问受限 | [权限与访问控制](../../fusion-development/authority-subject-and-access-control-design) |

## 我要构建、联调和交付

先按 [后端扩展包](../../fusion-development/backend-extension-packages)或 [微前端包管理](./extend-frontend/)检查产物，再按 [本地 IDE 联调](../../fusion-development/local-ide-and-platform-debugging)观察目标实例。模型资源目录、后缀及引用问题查 [模型资源与打包](./authoring-metadata-conventions/)。

交付至少核对实现结果、打包与发现、真实业务入口三层。需要 AI 协助时提供版本、已有实现、输入输出、失败证据与验收场景，见 [用 AI 完成功能开发](../../fusion-development/ai-assisted-development)。
