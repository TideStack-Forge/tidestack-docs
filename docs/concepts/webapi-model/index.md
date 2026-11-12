---
sidebar_position: 12
title: WebAPI 模型
---

# WebAPI 模型

WebAPI 模型描述应用向调用方提供的 HTTP 接口，包括方法、路径、输入、响应以及负责执行的处理器。业务模型投影的接口、独立低代码接口和代码中的 Spring MVC 接口，都可以汇集到同一接口目录，并导出 OpenAPI 文档。

## 接口契约与执行处理器

接口契约回答调用方应怎样请求、会得到什么结果。处理器回答收到请求后执行什么。两部分相互关联，但修改文档描述不会自动实现业务逻辑，声明响应结构也不会替处理器完成所有业务校验。

| 处理器类型 | 定义来源或用途 | 执行位置 |
| --- | --- | --- |
| `RequestMapping` | 从 Spring MVC Controller 提取的代码接口 | 已注册的 Controller 方法。 |
| `RouterFunction` | 函数式路由接口 | 已注册的路由处理函数。 |
| `LogicFlow` | 将 HTTP 请求交给逻辑流 | `logicFlow` 引用的逻辑流。 |
| `BusinessAction` | 将 HTTP 输入映射给业务动作 | `businessModel` 与 `action` 指定的动作运行时。 |

代码接口的模型由注册过程抽取。仅填写 `className` 和 `methodName`，不会把任意 Java 方法变成可调用接口。低代码接口应选择其支持的处理器并提供有效绑定。

## 地址和接口范围

接口由 HTTP 方法与路径共同识别，`GET /sample` 与 `POST /sample` 是两个接口。范围 `scope` 决定路由所在的接入区域：

| 范围 | 接入前缀 | 使用时关注 |
| --- | --- | --- |
| `internal` | `/api` | 应用内部接口的身份与权限。 |
| `open` | `/open-api` | 对外开放接口的凭据与授权。 |
| `public` | `/public-api` | 公开入口的输入限制及暴露内容。 |

定义中的 `path` 不应重复拼入接入前缀。`scope` 和 OpenAPI 的 `security` 描述都不能代替实际安全规则；开放接口也需要按对应接入机制控制调用。

## 请求数据怎样进入业务动作

业务动作接口使用 `actionInputMapping` 显式声明输入来源。映射目标位于动作的 `params` 或 `data` 下，来源使用平台表达式。下面仅展示一个路径参数和请求体如何交给已经存在的动作：

```json
{
  "method": "POST",
  "path": "/sample/{id}/confirm",
  "scope": "internal",
  "handlerType": "BusinessAction",
  "businessModel": "sample",
  "action": "confirm",
  "formatVersion": "2.0",
  "actionInputMapping": {
    "params.id": "${request.pathVariables.id}",
    "data": "${request.body}"
  },
  "parameters": [
    { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
  ],
  "requestBody": {
    "required": true,
    "content": { "application/json": { "schema": { "type": "object" } } }
  }
}
```

示例要求业务模型 `sample` 已定义 `confirm` 动作，并接受这里的输入。映射不是新增动作的声明。没有输入时仍要提供空的 `actionInputMapping`；同一接口不能同时绑定业务动作与逻辑流。

动作运行时继续执行动作契约、权限及业务规则。WebAPI 通过处理器访问业务能力，不直接绑定数据模型；需要读写数据时由动作、逻辑流或代码处理器调用数据访问能力。

## 核心属性

### 接口契约

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `method` | 请求方法 | 指定 GET、POST 等 HTTP 方法。 |
| `path` | 接口路径 | 声明当前作用范围内的路由路径。 |
| `api` | 接口标识 | 运行时由请求方法与路径组合得到的只读标识。 |
| `scope` | 接口范围 | `public` 对应 `/public-api`，`open` 对应 `/open-api`，`internal` 对应 `/api`。 |
| `handlerType` | 处理器类型 | 支持 `RequestMapping`、`RouterFunction`、`LogicFlow` 和 `BusinessAction`。 |
| `summary` | 接口摘要 | 供接口列表和 OpenAPI 文档展示的简要说明。 |
| `description` | 接口说明 | 描述用途、约束及调用注意事项。 |
| `operationId` | 操作标识 | 供接口文档和客户端生成工具识别操作。 |
| `tags` | 接口分组 | 按标签组织接口文档。 |
| `parameters` | 请求参数 | 描述路径、查询、请求头等位置的参数。 |
| `requestBody` | 请求体 | 描述请求体的媒体类型和数据结构。 |
| `responses` | 响应契约 | 按状态码描述响应内容。 |
| `deprecated` | 废弃标记 | 标识不建议继续使用的接口。 |
| `security` | 认证契约 | 声明接口文档中的认证要求；实际授权由安全机制执行。 |
| `servers` | 服务地址 | 提供接口服务地址及其变量定义。 |
| `externalDocs` | 外部文档 | 关联额外的接口说明文档。 |
| `extraProps` | 扩展属性 | 承载处理器及接口扩展约定，JSON 中可按属性名直接展开。 |

### 执行绑定

执行绑定随处理器类型变化。业务动作接口通过动作运行时校验并执行。

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `logicFlow` | 逻辑流引用 | 逻辑流处理器使用的流程名称。 |
| `className` | 处理器类型名 | 代码接口映射使用的 Java 处理器类型。 |
| `methodName` | 处理方法 | 代码接口映射使用的方法描述。 |
| `businessModel` | 业务动作模型 | `BusinessAction` 处理器引用的业务模型全名。 |
| `action` | 业务动作名称 | `BusinessAction` 处理器调用的动作。 |
| `formatVersion` | 绑定格式版本 | 新建业务动作接口使用 `2.0`，输入映射采用平台表达式语法。 |
| `actionInputMapping` | 动作输入映射 | 将 HTTP 请求数据映射到业务动作输入；业务动作接口必须声明，无输入时填空对象。 |

### 请求参数

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `parameters[].name` | 参数名称 | 请求中使用的参数名。 |
| `parameters[].in` | 参数位置 | 指定参数来自路径、查询、请求头或 Cookie。 |
| `parameters[].description` | 参数说明 | 解释参数用途和取值要求。 |
| `parameters[].required` | 必填标记 | 声明调用方是否必须提供参数。 |
| `parameters[].deprecated` | 废弃标记 | 标识不建议继续使用的参数。 |
| `parameters[].allowEmptyValue` | 允许空值 | 声明参数是否允许空值。 |
| `parameters[].schema` | 参数结构 | 描述参数的数据类型、格式和约束。 |
| `parameters[].example` | 单个示例 | 提供参数示例值。 |
| `parameters[].examples` | 示例集合 | 按名称提供多组参数示例。 |

### 请求体与响应

响应按 HTTP 状态码保存。表中的 `<状态码>` 表示响应集合中的键，例如 `200`。

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `requestBody.description` | 请求体说明 | 解释提交内容的含义。 |
| `requestBody.required` | 请求体必填 | 声明是否必须提交请求体。 |
| `requestBody.content` | 请求体内容 | 按媒体类型保存数据结构与示例，例如 `application/json`。 |
| `responses.<状态码>.description` | 响应说明 | 解释该状态码代表的结果。 |
| `responses.<状态码>.headers` | 响应头定义 | 描述返回的响应头。 |
| `responses.<状态码>.content` | 响应内容 | 按媒体类型保存返回数据的结构与示例。 |
| `responses.<状态码>.links` | 后续操作链接 | 描述如何利用当前响应调用其他操作。 |

请求体与响应的 `content` 均以媒体类型为键，每项内容具有以下属性。

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `schema` | 数据结构 | 描述该媒体类型下的数据结构和校验约束。 |
| `example` | 单个示例 | 提供一份请求或响应示例。 |
| `examples` | 示例集合 | 按名称提供多份示例。 |
| `encoding` | 编码规则 | 描述表单或多部分内容的字段编码。 |


## 契约如何用于接口文档

`parameters` 描述路径、查询、请求头和 Cookie 参数；`requestBody` 描述请求体；`responses` 按状态码描述响应。字段类型、必填条件和示例应与真实处理器保持一致，尤其要区分 HTTP 状态码、平台结果封装和业务结果。

当前导出器输出 OpenAPI **3.1.0**，入口为 `/api/sys/webapi/openapi.json`。它汇总当前已注册的接口模型；未加载或未成功注册的定义不会因为文件存在就进入导出结果。代码接口的注解和参数约束也会参与契约提取。

## 常见问题

### 接口已经写了响应 Schema，为什么实际返回内容不同？

响应契约供描述和工具消费，实际内容由处理器返回。核对动作、逻辑流或 Controller 的输出及平台封装，再修正契约或实现。

### 菜单隐藏后，这个接口还可以直接调用吗？

菜单可见性和接口授权分别控制。应为接口配置正确权限，不能以隐藏入口代替鉴权。

### 调用外部接口也写在这里吗？

平台提供给调用方的 HTTP 入口使用 WebAPI；平台主动调用外部系统使用 RPC 模型。WebAPI 处理器可以继续通过 RPC 执行外部调用。

## 继续阅读

- [后端接口管理](../../low-code/development-platform-menus/backend-api)：维护接口定义。
- [业务模型](../business-model/)：业务动作与输入输出契约。
- [逻辑流模型](../logicflow-model/)：逻辑流处理器。
- [Web API 规范](../../api/web-api-spec/)：请求、响应和接口文档细节。
- [JSON Schema 参考](../../reference/jsonschema/)：`webapi.schema.json`。
