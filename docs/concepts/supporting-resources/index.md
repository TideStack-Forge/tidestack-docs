---
sidebar_position: 30
title: 平台支撑资源
---

# 平台支撑资源

平台支撑资源不是独立的核心业务模型，而是附着在应用、模型或运行链路上的可配置资产。本页统一说明它们的职责，避免把“通知模板”或“逻辑流节点定义”误解成业务模型。

## 资源总表

| 资源 | 作用 | 关键属性 | 主要关系 | Schema |
| --- | --- | --- | --- | --- |
| 开发菜单 | 暴露开发平台管理入口 | `fullName`、`title`、`url`、`placement`、`stage`、`children` | 开发模块、应用配置 | `dev-menu.schema.json` |
| 逻辑流节点 | 描述逻辑流编辑器可用节点 | `type`、`label`、`group`、`portRules`、`properties`、`scaffold` | [逻辑流模型](../logicflow-model/)、表达式、脚本 | `flow-node.schema.json` |
| RPC 认证 | 描述 RPC 调用使用的认证凭据类型 | `name`、`title`、`type`、`isEnabled` | [RPC 模型](../rpc-model/)、凭据中心 | `rpc-auth.schema.json` |
| 通知模板 | 定义通知标题、负载和渠道 | `name`、`title`、`payloadSchema`、`channel`、`isEnabled` | 审批流、逻辑流、组织模型 | `notification.schema.json` |
| 业务日志模板 | 定义 HTTP 或业务操作的审计记录格式 | `name`、`httpMethod`、`url`、`operation`、`sensitiveFields` | WebAPI、权限、运行审计 | `business-log.schema.json` |
| 数据初始化 | 定义应用或模块的初始数据块 | `id`、`version`、`blocks` | 业务模型、数据模型、版本发布 | `data-init.schema.json` |
| MQ 绑定 | 描述消息生产或消费绑定 | `bindingType`、`bindingName`、`destination`、`group`、`flowName` | 逻辑流、消息队列、应用运行时 | `mq.schema.json` |
| 定时任务 | 按 Cron 触发指定逻辑流 | `name`、`cron`、`flowName`、`data` | 逻辑流、配置、运行实例 | `schedule.schema.json` |
| 国际化语言包 | 提供指定 locale 的文案资源 | `locale`、`name`、`messages`、`isDefault`、`direction` | 应用模型、UI 模型、UI Schema | `i18n.schema.json` |
| 岗位定义 | 提供岗位编码、名称和层级 | `key`、`name`、`level`、`description` | 组织模型、权限、审批流 | `position.schema.json` |
| 错误码 | 统一错误标识与对外说明 | 以错误码、标题、说明和扩展属性为核心 | WebAPI、客户端 SDK、日志 | `error-code.schema.json` |
| 模块树 Diff | 记录开发态模块树重组差异 | 变更项、目标节点和操作类型 | [模块模型](../module-model/)、版本控制 | `modules-diff.schema.json` |

## 资源如何进入运行链路

1. 资源通过应用工作区、JAR metadata 或平台管理入口提交。
2. 平台根据资源类型的 Schema 和专用校验器检查结构。
3. 资源被对应的 provider、registry 或 runtime service 发现。
4. 运行时将资源与核心模型装配，供页面、流程、接口或运维链路消费。

资源的发现、校验和运行时注册必须使用各模块的正式扩展点。不要在业务模型或页面配置里复制一份通知、定时任务或节点定义。

## 与核心模型的关系

- [应用模型](../application-model/) 和 [模块模型](../module-model/) 为资源提供归属和组织边界。
- [业务模型](../business-model/)、[数据模型](../data-model/) 和 [WebAPI 模型](../webapi-model/) 提供资源消费的业务上下文。
- [逻辑流模型](../logicflow-model/) 是定时任务、MQ 绑定、通知和 RPC 常见的执行载体。
- [组织模型](../organization-model/) 和 [权限模型](../authority-model/) 约束通知接收人、岗位、菜单和接口的可用范围。

## 使用入口与契约

- 操作入口：[开发菜单速查](../../low-code/development-platform-menu-guide) · [集成与定时自动化](../../low-code/integration-and-scheduled-automation) · [业务日志与审计](../../operations/business-logs-and-audit-traceability)
- 全部文件后缀、Schema 和 handbook 内路径见 [JSON Schema 参考](../../reference/jsonschema/)。
