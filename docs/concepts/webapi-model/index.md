---
sidebar_position: 12
title: WebAPI 模型
---

# WebAPI 模型

WebAPI 模型统一描述 HTTP 接口契约，把“接口长什么样”和“接口由谁执行”分开管理。低代码接口和高代码 Spring MVC 接口都可以汇聚到同一套 API 目录和 OpenAPI 输出中。

## 作用

- 定义 HTTP 方法、路径、请求参数、请求体和响应结构。
- 统一低代码处理器、逻辑流和高代码 Controller 的接口发现方式。
- 为页面、外部系统、SDK 和权限体系提供稳定 API 边界。
- 支持从接口模型导出 OpenAPI 3.1 文档。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `method` / `path` | HTTP 契约 | 定义请求方法和路由路径。 |
| `scope` | 作用范围 | 区分应用、平台或其他 API 作用域。 |
| `handlerType` | 处理方式 | 标识逻辑流、代码处理器或其他运行时适配。 |
| `summary` / `description` | API 说明 | 面向调用方和 OpenAPI 文档的说明。 |
| `operationId` / `tags` | API 标识与分组 | 用于 SDK、文档和接口检索。 |
| `parameters` | 路径/查询参数 | 描述参数名称、位置、类型和校验。 |
| `requestBody` | 请求体 | 描述 JSON 或其他请求内容结构。 |
| `responses` | 响应契约 | 描述状态码、响应体和错误结构。 |
| `security` | 安全要求 | 描述接口所需的认证和权限约束。 |
| `deprecated` / `extraProps` | 生命周期与扩展 | 标记废弃接口并承载受约束的扩展属性。 |

## 与其他模型的关系

- [业务模型](../business-model/) 可以生成标准增删改查 API，也可以声明业务操作 API。
- [UI Schema](../ui-schema/) 和微前端页面通常调用 WebAPI。
- [逻辑流模型](../logicflow-model/) 可以作为接口的执行处理器。
- [权限模型](../authority-model/) 决定接口是否可调用；WebAPI 本身只描述契约。
- 外部系统调用使用 [RPC 模型](../rpc-model/)，不要把外部凭据直接写入 WebAPI 参数。

## 高代码与低代码的统一

当前实现会在 Spring MVC `RequestMapping` 注册时抽取高代码接口，结合参数、请求体、响应、Swagger 注解和常见验证约束形成 WebAPI 模型。统一后的契约可通过 `/api/sys/webapi/openapi.json` 导出，具体过滤条件和格式见 Web API 规范。

## 使用入口与契约

- 操作入口：[后端接口菜单](../../low-code/development-platform-menus/backend-api) · [集成与定时自动化](../../low-code/integration-and-scheduled-automation)
- API 参考：[Web API 规范](../../api/web-api-spec/) · [API 总览](../../api/)
- Schema：`webapi.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
