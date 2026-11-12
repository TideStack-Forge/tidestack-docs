---
title: 后端开发
---

# 后端开发

后端扩展 JAR 可以包含普通 Java、Spring Bean、Controller 和声明式模型资源。代码可以调用平台模型，模型也可以通过动作绑定、脚本上下文或节点调用 Java 能力。先确定业务入口和调用契约，再选择实现方式。

## 按任务开始

| 任务 | 教程 |
| --- | --- |
| 创建工程并装配代码、Bean 和资源 | [后端扩展包](../backend-extension-packages) |
| 调用平台数据模型，或用注解注册 Java 模型 | [数据模型](./data-model) |
| 实现与调用业务动作，监听模型事件 | [业务模型](./business-model) |
| 从 Service 执行逻辑流，让流程调用 Java | [逻辑流模型](./logicflow-model) |
| 在 Java 与流程中复用外部接口定义 | [RPC 模型](./rpc-model) |
| 将动作或逻辑流暴露为 HTTP 接口 | [WebAPI 模型](./webapi-model) |
| 写普通 Spring MVC 接口和业务服务 | [Controller 与 Service](./spring-beans-and-controllers) |
| 直接在 Java 发送、消费消息 | [消息队列](./message-queue) |
| 编写 Java 定时任务，或安排逻辑流执行 | [计划任务](./scheduled-tasks) |
| 使用配置、字典、通知、实时通信、上传与组织 | [平台支撑能力](./supporting-resources) |
| 随 JAR 交付模型、菜单、权限和页面 | [模型资源与打包](../../guide/advance/authoring-metadata-conventions/) |

为其他应用和模型提供可复用的字段、节点、上下文、插件或认证适配时，进入 [插件扩展](../plugin-extensions/)。普通业务 Service 无需为了使用平台能力而改写为插件。

## 开发顺序

1. 确认目标应用、平台版本、已有模型全名、依赖和权限用例。
2. 创建扩展包，通过自动配置导入 Bean，按所用能力增加 SPI 或模型资源。
3. 明确输入、结果、事务、执行身份和失败传播；让 AI 对照同类实现编写最小改动。
4. 构建并安装到测试应用，从真实入口检查模型发现、Bean 装配和业务结果。
5. 使用不同权限账号以及后台执行场景复验，按 [联调指南](../local-ide-and-platform-debugging)定位失败环节。

HTTP 请求、Java 方法、消息消费和计划任务拥有不同的执行环境。后台调用需要显式安排业务身份与事务，不能假定存在当前浏览器用户。数据访问继续使用平台数据模型 API。
