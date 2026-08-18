---
sidebar_position: 15
title: RPC 模型
---

# RPC 模型

RPC 模型描述平台如何调用外部系统。它把远程服务定义、请求参数、协议和认证凭据从业务流程中分离出来，使外部调用可以被逻辑流和代码复用。

## 作用

- 统一管理外部 HTTP、OpenAPI 或其他协议调用。
- 把认证、请求参数、返回结构和调用错误纳入可查阅的契约。
- 让同一外部服务定义可以被多个业务流程复用。
- 通过协议调用器和凭据扩展支持不同集成方式。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `group` | 服务分组 | 按外部系统或业务域组织 RPC 定义。 |
| `name` / `title` | RPC 标识与标题 | `name` 用于引用，`title` 面向开发者显示。 |
| `type` | 协议类型 | 选择 HTTP、OpenAPI 或其他协议调用器。 |
| `description` | 服务说明 | 描述调用用途和外部系统边界。 |
| `isEnabled` | 是否启用 | 控制定义是否可被运行时调用。 |
| `authCredential` | 认证凭据引用 | 关联独立的 RPC 认证资源，不直接保存敏感值。 |
| `request` | 请求定义 | 描述地址、方法、参数、请求体和返回约定。 |

## 与其他模型的关系

- [逻辑流模型](../logicflow-model/) 通过 RPC 节点调用外部系统。
- [业务模型](../business-model/) 的业务动作可以依赖 RPC，但不应把外部协议字段复制成业务模型。
- `rpc-auth` 资源提供认证类型和凭据能力，见 [平台支撑资源](../supporting-resources/)。
- [配置模型](../configuration-model/) 可以提供环境相关的地址或开关，但敏感凭据必须由认证机制管理。

## 定义与执行分离

RPC 模型是声明，运行时执行器根据 `type` 选择协议调用器；凭据中心负责认证实现。新增协议或认证方式应通过 provider、builder 和 invoker 扩展点接入，不在逻辑流节点中硬编码一套 HTTP 客户端。

## 使用入口与契约

- 操作入口：[外部接口菜单](../../low-code/development-platform-menus/external-api) · [集成与定时自动化](../../low-code/integration-and-scheduled-automation)
- Schema：`rpc.schema.json`；认证资源使用 `rpc-auth.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
