---
title: 按任务选择上下文
sidebar_position: 2
---

# 按任务选择上下文

先按用户要完成的任务选择文档，再补充相关模型、API 或 Schema。无需在每次任务中读取整本手册。

## 按任务查文档

下表按阅读顺序列出入口；打开专题后，再按问题读取其中的细节。

| 用户任务 | 先读 | 按需补充 |
| --- | --- | --- |
| 安装平台、演示第一个应用 | [快速上手](../getting-started/index.md) | [Docker Compose 部署](../operations/deployment-methods/docker-compose.md)、[部署架构](../operations/deployment-architecture.md) |
| 用内建能力交付业务功能 | [从需求到交付](../low-code/from-requirement-to-delivery.md) | [业务模型操作](../low-code/development-platform-menus/business-model.md)、[业务模型概念](../concepts/business-model/index.md) |
| 设计页面或定位页面问题 | [前端页面](../low-code/development-platform-menus/frontend-page.md) | [UI 模型](../concepts/ui-model/index.md)、[UI Schema](../concepts/ui-schema/index.md) |
| 实现自动业务动作或人工审批 | [流程、规则与自动化](../low-code/workflow-rules-and-automation.md) | [逻辑流](../concepts/logicflow-model/index.md)、[审批流](../concepts/approval-workflow-model/index.md) |
| 配置角色和访问范围 | [组织、权限、配置与通知](../low-code/organization-permissions-configuration-and-notification.md) | [权限模型](../concepts/authority-model/index.md)、[权限、主体与访问控制](../fusion-development/authority-subject-and-access-control-design.md) |
| 拆解业务需求与实现范围 | [从需求确定实现范围](../fusion-development/when-to-use-code.md) | [平台扩展点总表](../fusion-development/extension-points.md) |
| 让 AI 协同修改模型、页面、流程与实现 | [用 AI 完成功能开发](../fusion-development/ai-assisted-development.md) | [任务协作与交付验收](../fusion-development/high-low-code-collaboration.md)、当前任务的技术专题 |
| 开发微前端、布局或组件 | [前端开发](../fusion-development/frontend-extension-paths.md) | [前端 API](../api/frontend/index.md)、[SDK](../api/frontend/sdk/index.md) |
| 创建后端扩展或开发态模块 | [创建后端扩展包](../fusion-development/backend-extension-packages.md) | [平台扩展点总表](../fusion-development/extension-points.md)、[开发模块与 Maven 脚手架](../fusion-development/development-module-scaffold-and-maven-skeleton.md) |
| 在本地 IDE 调试平台测试实例 | [本地 IDE 与线上平台联调](../fusion-development/local-ide-and-platform-debugging.md) | [运行实例](../low-code/development-platform-menus/runtime-instance.md)、[环境与版本准备](../fusion-development/development-platform-support-capabilities.md) |
| 编写或校验元数据文件 | [模型资源与打包](../guide/advance/authoring-metadata-conventions/index.md) | [JSON Schema](../reference/jsonschema/index.md)、对应模型概念页 |
| 查 SDK、Java API、DSL 或脚本用法 | [API 参考](../api/index.md) | 对应 API 子页；不要用其他版本的示例替代目标版本契约 |
| 判断模型职责与关系 | [建模体系](../concepts/modeling/index.md) | [架构设计](../concepts/architecture/index.md)、[支撑资源](../concepts/supporting-resources/index.md) |
| 部署、发布、升级或排障 | [运维管理](../operations/index.md) | [应用发布与回滚](../operations/application-release-and-rollback.md)、[故障排查](../operations/troubleshooting.md) |
| 在 Java 中注册或调用平台模型，编写 Controller、Service、MQ 和定时任务 | [后端开发](../fusion-development/backend-development/) | 按数据、业务动作、流程、RPC 或普通 Spring 教程选择入口 |
| 增加可复用组件、字段、节点、上下文和适配器 | [插件扩展](../fusion-development/plugin-extensions/) | 前端区分平台组件库与普通组件包；后端按扩展点确定装配机制 |

## 补齐当前任务的上下文

读完入口后，先确认以下信息：

1. **版本与位置**：目标平台版本、应用、模块和工作区。按专题声明判断文档是否适用。
2. **现有定义**：目标业务模型、资源名称、引用关系、扩展注册或 API 契约。
3. **预期行为**：输入、输出、操作角色、失败结果和权限边界。
4. **验证入口**：项目已有的测试、构建、调试实例或可用工具。

例如，“增加合同审批”通常要先读业务模型和审批流；当需求进一步包含外部电子签章时，再补充[集成、自动化与实时能力](../fusion-development/integration-automation-and-realtime.md)。是否需要后端代码扩展，由内建能力和正式扩展点决定。

## 信息不足时如何继续

- 不知道某项能力是否内建：从[平台能力地图](../reference/platform-capability-map.md)定位，再查具体专题。
- 没有目标项目文件：可以解释机制、列出方案和待确认项；不能声称已经修改或验证了当前应用。
- 文档版本与目标版本不一致：核对目标项目的定义、依赖和测试；没有证据时先澄清差异。
- 检索不到所需 API 或字段：说明缺口，继续查对应参考与项目定义，不根据相似产品编造。
- 需要读取运行状态或执行操作：按[知识来源与工具边界](./reference-sources.md)选择当前环境已有的工具或项目脚本。
