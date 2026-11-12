---
sidebar_position: 15
title: RPC 模型
---

# RPC 模型

RPC 模型定义应用主动调用的外部服务。调用方引用稳定的 RPC 名称并传入参数，运行时按协议构建请求、应用认证凭据并返回调用结果。地址、参数映射和认证可以集中维护，多条逻辑流无需重复拼装相同的远程请求。

## 一次调用怎样完成

1. 调用方按名称取得已启用的 RPC 定义，传入本次参数和调用选项。
2. 协议调用器读取 `request`，解析地址与参数表达式，构建请求。
3. 如配置了 `authCredential`，凭据机制查找对应认证定义并处理请求。
4. 协议调用器发送请求，将响应或错误交回执行链，再由逻辑流或代码继续处理。

当前内置 `OpenAPI` 类型按 HTTP 方式调用外部服务。这里的名称是协议类型，不意味着填入一份 OpenAPI 文档就会自动导入所有接口。其他协议由已注册的定义构建器和调用器支持。

## 固定配置与本次参数

HTTP 请求支持两类替换：`#{配置键}` 读取统一配置，找不到时再读取 Spring 环境配置；`${表达式}` 根据调用参数求值。这样可以把环境地址留在配置中，把每次变化的业务输入留在调用参数中。

```json
{
  "group": "external",
  "name": "external.echo",
  "title": "提交外部处理",
  "type": "OpenAPI",
  "isEnabled": true,
  "timeout": 5000,
  "retry": 0,
  "request": {
    "url": "#{external.baseUrl}/echo",
    "method": "POST",
    "parameters": [
      { "name": "text", "in": "body", "value": "${text}", "required": true }
    ]
  }
}
```

调用时传入 `text`，并为 `external.baseUrl` 配置目标服务地址。这个示例展示参数构建，不要求目标服务具备平台接口格式。`body` 参数按名称放入请求体，不应误写为 WebAPI 的 `requestBody` 契约。

## 凭据单独维护

需要认证时，`authCredential` 引用 RPC 认证资源的名称。调用器找不到凭据或认证处理失败时，会报告调用错误，不会将其视为匿名调用继续发送。

多个 RPC 可以引用同一凭据，环境间也可以保留 RPC 名称而切换凭据内容。密钥不应写入逻辑流示例、公开前端配置或普通请求参数；认证类型所需字段由对应凭据构建器解释。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `group` | 服务分组 | 按外部系统或用途组织 RPC 定义。 |
| `name` | 调用标识 | 逻辑流和代码引用的 RPC 名称。 |
| `title` | 调用标题 | 开发界面中的显示名称。 |
| `type` | 协议类型 | 选择对应的协议执行器。 |
| `description` | 调用说明 | 解释用途及外部系统的职责。 |
| `isEnabled` | 启用状态 | 控制该定义是否可用于调用。 |
| `authCredential` | 认证凭据引用 | 引用独立 RPC 认证资源，由凭据机制完成认证。 |
| `request` | 请求配置 | 保存所选协议要求的地址、参数和请求约定，具体属性随协议类型变化。 |
| `timeout` | 调用超时 | `OpenAPI` 类型使用的毫秒数，默认 3000；作为扩展属性平铺。 |
| `retry` | 重试次数 | `OpenAPI` 类型默认 0；作为扩展属性平铺。 |
| `extraProps` | 扩展属性 | 保存调用器约定的附加配置，JSON 中按属性名展开。 |

### HTTP 请求定义

HTTP 调用使用以下请求属性；其他协议使用各自的请求契约。

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `request.url` | 请求地址 | 指定远程接口地址。 |
| `request.method` | 请求方法 | 指定 GET、POST 等 HTTP 方法。 |
| `request.parameters` | 请求参数 | 声明参数的位置、名称和值。 |
| `request.parameters[].name` | 参数名称 | 远程接口使用的参数名。 |
| `request.parameters[].in` | 参数位置 | 支持 `path`、`query`、`header`、`cookie` 和 `body`。 |
| `request.parameters[].value` | 参数值 | 提供请求构建时使用的值或表达式。 |
| `request.parameters[].required` | 必填标记 | 声明参数是否必须有值。 |


## 超时、重试与结果处理

`OpenAPI` 调用器默认超时为 3000 毫秒，默认不重试。定义中的 `timeout` 和 `retry` 可以调整默认策略，本次调用提供 `timeoutOverrideMs`、`retryOverride` 时优先使用调用选项。

| 调用选项 | 含义 | 适用范围 |
| --- | --- | --- |
| `timeoutOverrideMs` | 覆盖本次超时毫秒数 | 当前 HTTP 协议调用器。 |
| `retryOverride` | 覆盖本次重试次数 | 当前 HTTP 协议调用器。 |

重试会重新发送请求。对于写入、扣款或触发流程等有副作用的接口，应先确认对方的幂等约定，再决定是否启用。参数构建、认证和远程响应失败也需要分别定位；业务上成功与否，还要继续检查响应内容，不能只看 HTTP 调用完成。

逻辑流通过 RPC 节点调用并映射输出，代码通过正式 RPC 执行入口调用。新增协议或认证方式沿用定义构建器、调用器和凭据扩展，不必在业务节点中另建一套客户端。

## 常见问题

### 换环境必须逐条修改 RPC 地址吗？

地址中使用配置引用时，可以集中调整配置值。RPC 名称和参数映射保持稳定，调用方无需跟着改动。

### 定义里已经有 `authCredential`，为什么仍报凭据不存在？

该属性保存的是引用名称，凭据资源本身还必须加载并可用。检查名称、启用状态和相应认证实现。

### 外部返回了 200，为什么业务仍然失败？

外部系统可能在响应体中携带自己的业务状态。应按对方契约判断内容，并在逻辑流或代码中处理失败结果。

## 继续阅读

- [外部接口管理](../../low-code/development-platform-menus/external-api)：定义请求并测试调用。
- [逻辑流模型](../logicflow-model/)：RPC 节点和结果映射。
- [配置模型](../configuration-model/)：环境地址和运行参数。
- [平台支撑资源](../supporting-resources/)：RPC 认证资源。
- [JSON Schema 参考](../../reference/jsonschema/)：`rpc.schema.json`、`rpc-auth.schema.json`。
