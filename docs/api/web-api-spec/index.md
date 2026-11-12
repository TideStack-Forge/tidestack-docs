---
sidebar_position: 2
---

# WebAPI 规范

本页约定应用 HTTP 接口的路径、请求与响应格式，用于新增接口和前后端联调。既有接口按其已发布契约调用，示例中的订单接口需由应用自行定义。

## 请求方法与路径

| 操作 | 方法与路径示例 |
| --- | --- |
| 列表查询 | `GET /api/sales/order` |
| 查询一条 | `GET /api/sales/order/{id}` |
| 创建 | `POST /api/sales/order` |
| 完整替换 | `PUT /api/sales/order/{id}` |
| 部分更新 | `PATCH /api/sales/order/{id}` |
| 删除 | `DELETE /api/sales/order/{id}` |
| 业务动作 | `POST /api/sales/order/{id}/approve` |
| 查询关联对象 | `GET /api/sales/order/{id}/items` |

新增资源路径使用名词单数、小写及连字符，如 `purchase-order`；查询参数使用小驼峰，如 `customerId`。既有路径保持兼容，不能只为统一命名修改已发布地址。

`GET` 不修改业务数据。`PATCH` 只更新传入字段，省略与显式 `null` 的含义须在接口中约定；`PUT` 的完整替换语义与 `PATCH` 区分。审批、提交等业务动作用 `POST`，并定义重复调用的结果。

路径参数、查询参数均需正确编码；业务参数放在路径、查询或请求体中。请求头用于认证、语言和内容类型等通用信息。

## 请求示例

假设已设置平台地址和令牌：

```bash
export API_BASE='https://app.example.com'
# ACCESS_TOKEN 由当前环境的认证流程取得。
curl --get "$API_BASE/api/sales/order" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  --data-urlencode 'status=OPEN' \
  --data-urlencode 'page=1' \
  --data-urlencode 'perPage=20'
```

`page/perPage` 只是示例接口的分页参数，实际名称以目标接口声明为准。

```bash
curl -i -X POST "$API_BASE/api/sales/order" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"customerId":"customer-001","amount":100}'
```

令牌格式由目标环境的认证配置决定。微前端使用 SDK `request` 时由平台处理登录态，见 [请求与认证](../frontend/sdk/completion-methods/request-and-authentication)。

## JSON 响应体

普通 JSON 接口使用以下结构：

| 字段 | 含义 |
| --- | --- |
| `code` | `0` 成功，非 `0` 失败；`-1` 为通用业务失败 |
| `msg` | 可展示的结果或错误信息，成功时可为空 |
| `data` | 业务数据，建议用对象承载；列表放在 `items` |
| `errors` | 可选字段错误，具体形态由接口声明 |

列表响应：

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "items": [{ "id": "order-001", "status": "OPEN", "amount": 100 }],
    "total": 1
  }
}
```

业务条件不满足：

```json
{
  "code": -1,
  "msg": "订单已取消，不能审核",
  "data": null
}
```

错误消息说明可采取的行动，避免向调用方返回堆栈、SQL 或内部连接信息。需要让程序区分的业务错误应分配稳定错误码，并记录其含义。

## HTTP 状态与业务错误

调用方同时处理 HTTP 状态和响应体 `code`，不能将 HTTP 200 直接视为业务成功。

| HTTP 状态 | 使用场景 |
| --- | --- |
| `200` | 普通成功响应；通用业务拒绝也可能返回 200，需检查 `code` |
| `201` | 创建完成，可以携带响应体；可用 `Location` 标识新资源 |
| `202` | 已接受异步任务；响应应提供任务标识或查询入口 |
| `204` | 成功且无响应体，不再附加 JSON |
| `400` / `405` | 请求格式错误 / 请求方法不支持 |
| `401` / `403` | 未认证或登录过期 / 当前身份无访问权限 |
| `404` | 路径或资源不存在 |
| `422` | 可识别的请求未通过参数或字段校验，按接口约定使用 |
| `500` | 服务端执行异常 |
| `502` / `503` / `504` | 上游错误、暂不可用、上游超时 |

平台标准结果在未显式指定 HTTP 状态时，会按错误码映射状态：如 `401` 或 `40101` 对应 401，`50000` 对应 500；`0` 和 `-1` 对应 200。具体错误码与响应以目标接口为准，网关错误还可能没有标准 JSON 响应体。

HTTP 401 处理登录或令牌刷新；403 检查授权。非幂等创建或审批请求遇到超时时，先确认操作结果，再决定是否重试。

## 前端处理示例

```js
import { request } from 'ouroboros-sdk'

try {
  const response = await request.post('/api/sales/order/order-001/approve', {
    comment: '同意',
  })
  const result = response.data
  if (result.code !== 0) throw new Error(result.msg || '审核失败')
  console.log('审核结果', result.data)
} catch (error) {
  const result = error.response?.data
  console.error(result?.msg || error.message)
}
```

文件下载按二进制响应处理，声明内容类型及文件名；不要在成功文件外再套 JSON。自定义分页、校验错误和异步结果应给出请求与响应样例，联调时覆盖成功、无效输入、未登录、无权限和重复操作。

## 相关资料

WebAPI 的配置见 [WebAPI 模型](../../concepts/webapi-model/)，平台 SDK 见 [请求与认证](../frontend/sdk/completion-methods/request-and-authentication)。HTTP 语义参考 [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)，接口设计参考 [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines)。
