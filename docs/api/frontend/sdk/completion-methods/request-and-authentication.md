---
sidebar_position: 4
---

# 请求与认证

通过 SDK 的 `request` 访问平台接口，通过认证方法读取用户态或完成登录。以下调用放在页面挂载后的处理函数中。

## request

`request(config)` 及其 `get/post/put/patch/delete` 方法遵循 Axios 调用形式，返回响应对象。平台 JSON 响应体位于 `response.data`，业务数据位于 `response.data.data`。

```js
import { request } from 'ouroboros-sdk'

// 示例前提：应用已定义 GET /api/orders。
const response = await request({
  url: '/api/orders',
  method: 'get',
  params: { status: 'OPEN', page: 1, perPage: 20 },
})
const result = response.data
if (result.code !== 0) throw new Error(result.msg || '查询失败')
console.log(result.data)
```

```js
const response = await request.post('/api/orders', {
  customerId: 'customer-001',
  amount: 100,
})
if (response.data.code !== 0) {
  throw new Error(response.data.msg || '创建失败')
}
```

请求会使用当前平台登录态。HTTP 错误通过 Promise 拒绝处理；业务错误仍需检查响应体的 `code`。接口的参数和响应以该 WebAPI 定义为准，约定见 [WebAPI 开发规范](../../../web-api-spec/)。

## businessActions

调用业务模型已定义的动作时，使用 `businessActions`：

```js
import { businessActions } from 'ouroboros-sdk'

const identity = { modelFullName: 'sales.Order', actionName: 'approve' }
const input = { params: { id: 'order-001' }, data: { comment: '同意' } }
const availability = await businessActions.checkAvailability(identity, input)
if (availability.status === 'EXECUTABLE') {
  const result = await businessActions.invoke(identity, input)
  console.log(result)
}
```

示例要求 `sales.Order` 已定义 `approve`，其输入与该动作契约一致。`invoke` 返回业务结果并在业务失败时抛错；可用性结果包含 `status`、`reasons` 和 `blockage`，不能替代执行时的服务端校验。文件动作使用 `invokeFile`，消费返回的 `fileContent` 等字段前应确认所部署基座对文件响应的支持。

## 当前用户、令牌与退出

| 方法 | 返回值 |
| --- | --- |
| `getUserInfo()` | Promise，当前用户信息 |
| `getToken()` | Promise，最新令牌对象或空值；刷新中会等待刷新完成 |
| `logout()` | Promise，退出当前登录态 |

```js
import { getUserInfo, getToken, logout } from 'ouroboros-sdk'

const user = await getUserInfo()
const token = await getToken()
// 仅在确有自定义传输需求时使用 token；普通平台请求直接使用 request。
console.log('当前用户', user)
// 退出按钮的处理函数中：
// await logout()
```

`props.token` 是挂载时快照，长期运行的页面不能用它代替 `getToken()`。不要把令牌输出到日志。

## 本地账号登录

`login(params)` 接收以下参数，返回 `{ success, data, msg, ... }`。失败时检查 `success`；它与普通 HTTP API 的 `code` 响应体不同。

| 参数 | 用途 |
| --- | --- |
| `username`、`password` | 用户输入的账号密码 |
| `success` | 可选回调或成功后的地址；回调接收 `userInfo`、`token` 等 |
| `error` | 可选失败回调，接收错误消息 |
| `defaultJump` | 是否使用默认跳转；SDK 登录默认启用 |

```js
import { login, openMenu, toast } from 'ouroboros-sdk'

// username/password 来自登录表单。
const result = await login({
  username,
  password,
  success: async () => { await openMenu('/orders') },
  error: (message) => toast.error(message),
})
if (!result.success) console.log('登录未完成', result.msg)
```

## 外部登录与 LDAP

| 方法 | 用途 |
| --- | --- |
| `listExternalProviders()` | Promise，当前应用提供方数组 |
| `isLocalPasswordLoginEnabled()` | 本地密码登录是否启用 |
| `startRedirectLogin(provider, returnUrl?)` | 发起 CAS / OAuth2 / OIDC 跳转，返回地址或 `null` |
| `loginWithLdap(params)` | LDAP 账号密码登录，返回登录结果 |
| `resolveReturnUrl(input?)` | 清洗回跳地址 |
| `mapAuthError(code?)` | 认证错误码转前端错误标识 |

```js
import { listExternalProviders, startRedirectLogin, resolveReturnUrl } from 'ouroboros-sdk'

const providers = await listExternalProviders()
const provider = providers.find((item) =>
  item.type === 'oauth2' && item.availability === 'healthy')
if (provider) startRedirectLogin(provider, resolveReturnUrl('/orders'))
```

提供方包含 `key`、`type`、`displayName`、`loginUrl`、`availability`；LDAP 使用其 `key`：

```js
import { loginWithLdap } from 'ouroboros-sdk'

const result = await loginWithLdap({
  provider: 'corporate-ldap',
  username,
  password,
})
if (result.bindingRequired) {
  console.log('需要绑定平台账号')
} else if (!result.success) {
  console.log(result.msg)
}
```

自定义登录页通常复用平台的回调和绑定页面。完整流程见 [自定义登录页集成](../../../../fusion-development/custom-login-page-and-auth-integration)。

## 登录码交换与绑定

只有自行接管回调 / 绑定流程时才使用：

| 方法 | 参数 | 结果 |
| --- | --- | --- |
| `exchangeLoginCode(loginCode)` | 回调携带的一次性登录码 | API 响应体 `{ code, msg, data }` |
| `bindExternalAccount(params)` | `{ bindingToken, username, password }` | API 响应体 `{ code, msg, data }` |

这两个方法返回认证接口结果，不会代替完整的登录后用户初始化。一般页面使用 `login`、`loginWithLdap` 或平台提供的外部登录流程。
