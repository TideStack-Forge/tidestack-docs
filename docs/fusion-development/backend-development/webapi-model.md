---
title: WebAPI 模型
---

# WebAPI 模型

WebAPI 将 HTTP 输入交给业务动作、逻辑流或普通代码处理器。页面可以调用这些入口；RPC 则负责应用主动调用外部系统。

## 1. 选择实现入口

| 需要提供的能力 | 入口 |
| --- | --- |
| 已有业务动作 | `BusinessAction` 处理器，声明输入映射 |
| 已有可视化流程 | `LogicFlow` 处理器，绑定 `logicFlow` |
| 普通 Java 接口 | 注册 Spring MVC Controller，由平台提取接口定义 |

代码接口在 Bean 与路由注册后进入平台接口目录。填写 `className`、`methodName` 不能把未注册方法变成可调用接口。

## 2. 给业务动作绑定 HTTP 输入

先完成 [业务动作实现](./business-model)，再创建接口：

```json
{
  "method": "POST",
  "path": "/orders/{id}/remark",
  "scope": "internal",
  "handlerType": "BusinessAction",
  "businessModel": "sales.Order",
  "action": "setRemark",
  "formatVersion": "2.0",
  "actionInputMapping": {
    "params.orderId": "${request.pathVariables.id}",
    "data": "${request.body}"
  }
}
```

请求 `POST /api/orders/ORDER-001/remark`，JSON 请求体为 `{"remark":"已核对"}`。`path` 不重复写 `/api` 前缀；内部范围由接入机制添加前缀。无输入动作仍需显式提供空的 `actionInputMapping`。

## 3. 处理权限与接口文档

将实际 HTTP 方法和路径关联到权限项，配置角色授权，再验证动作自身的约束。`scope` 或 OpenAPI `security` 描述不能代替运行时鉴权。

补齐参数、请求体和响应契约。当前 OpenAPI 导出入口为 `/api/sys/webapi/openapi.json`，导出的是已注册接口，不代表所有示例资源都已加载。字段说明见 [WebAPI 模型](../../concepts/webapi-model/)，普通接口注解见 [Controller 与 Service](./spring-beans-and-controllers)。

## 验证

从真实页面和直接 HTTP 请求调用，检查路径参数、请求体与动作输入一致。覆盖缺少参数、无权限、业务拒绝和运行失败。核对接口目录、OpenAPI 与实际响应，区分 HTTP 状态、平台封装和业务返回值。
