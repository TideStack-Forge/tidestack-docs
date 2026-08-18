---
sidebar_position: 4
---

# 请求与认证

适用对象：需要在微前端里发请求、获取当前用户和 token，或接入本地 / LDAP / 外部认证登录流程的开发者。

## 使用场景

- 你想发普通 HTTP 请求
- 你想做登录、登出、读取用户态
- 你在实现自定义登录页，或接外部认证提供方

## request

基于 Axios 实现的网络请求方法，用于向服务器发起 HTTP 请求并处理响应数据。用法同 Axios 一致。

**示例**

```js
import { request } from 'ouroboros-sdk'

const res = await request({
  url: 请求地址,
  method: 请求方法,
})
```

## login(loginParams)

登录方法。

**参数说明**

| 参数名      | 类型                        | 必填 | 说明     |
| ----------- | --------------------------- | ---- | -------- |
| loginParams | [loginParams](#loginparams) | 是   | 登录参数 |

### loginParams {#loginparams}

| 参数名   | 类型               | 说明                                                                                                                                                  |
| -------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| username | string             | 用户名                                                                                                                                                |
| password | string             | 密码                                                                                                                                                  |
| success  | string \| function | 登录成功后的自定义处理逻辑；当类型为 `string` 时，可指定登录成功后的跳转地址；当类型为 `function` 时，可配合本页的 `openMenu(...)` 方法跳转到指定页面 |
| error    | function           | 登录失败后的自定义处理逻辑                                                                                                                            |

**返回值**

返回一个 Promise 对象,登录结果。返回格式如下：

```js
{
    success: true/false,
    data: {
       ...其他字段
    },
    msg: ""
}
```

- success: 返回布尔值，表示登录成功还是失败；
- data： 登录成功的返回信息；
- msg： 登录不成功的错误信息；

**示例**

```js
import { login } from 'ouroboros-sdk'
const result = await login({
  username: '用户名',
  password: '密码',
  success: (data) => {
    // data 参数包含 userInfo 和 token
    const { userInfo, token } = data
    // 自定义逻辑
  },
})
```

## logout

退出登录。

**示例**

```js
import { logout } from 'ouroboros-sdk'

await logout()
```

## getUserInfo

获取当前用户信息。

**返回值**

返回一个 Promise 对象，解析后为当前登录用户信息。

**示例**

```js
import { getUserInfo } from 'ouroboros-sdk'

const userInfo = await getUserInfo()
console.log(userInfo)
```

## getToken

获取平台当前最新 token。

**返回值**

返回一个 Promise 对象，解析后为最新 token；当平台正在刷新 token 时，会等待刷新完成后再返回。

:::warning
对于自定义登录页微前端，`props.token` 仍然会继续传递以兼容历史实现，但它是挂载时快照。如果需要拿到刷新后的 token，请使用 `getToken()`。
:::

**示例**

```js
import { getToken } from 'ouroboros-sdk'

const token = await getToken()
console.log(token?.accessToken)
```

## listExternalProviders

获取当前应用配置的外部登录提供方列表。

**返回值**

返回一个 Promise 对象，解析后为提供方数组。

**示例**

```js
import { listExternalProviders } from 'ouroboros-sdk'

const providers = await listExternalProviders()
console.log(providers)
```

## isLocalPasswordLoginEnabled

判断当前应用是否启用了本地账号密码登录。

**返回值**

启用时返回 `true`，否则返回 `false`。

**示例**

```js
import { isLocalPasswordLoginEnabled } from 'ouroboros-sdk'

const localEnabled = isLocalPasswordLoginEnabled()
```

## startRedirectLogin(provider,returnUrl)

发起跳转式外部登录，适用于 `CAS`、`OAuth2`（含 `OIDC`）等登录方式。

**参数说明**

| 参数名    | 类型   | 必填 | 说明                 |
| --------- | ------ | ---- | -------------------- |
| provider  | object | 是   | 外部登录提供方对象   |
| returnUrl | string | 否   | 登录成功后的回跳地址 |

**返回值**

返回实际发起跳转的地址；如果提供方无法生成跳转地址，则返回 `null`。

**示例**

```js
import {
  listExternalProviders,
  resolveReturnUrl,
  startRedirectLogin,
} from 'ouroboros-sdk'

const providers = await listExternalProviders()
const oidcProvider = providers.find((item) => item.type === 'oauth2')

if (oidcProvider) {
  startRedirectLogin(oidcProvider, resolveReturnUrl('/'))
}
```

## loginWithLdap(params)

使用 LDAP 目录账号密码登录。

**参数说明**

| 参数名 | 类型   | 必填 | 说明                                                           |
| ------ | ------ | ---- | -------------------------------------------------------------- |
| params | object | 是   | LDAP 登录参数对象，通常包含 `provider`、`username`、`password` |

**返回值**

返回一个 Promise 对象，解析后为 LDAP 登录结果。

**示例**

```js
import { loginWithLdap } from 'ouroboros-sdk'

await loginWithLdap({
  provider: 'ldap-default',
  username: 'directory-user',
  password: 'directory-password',
})
```

## exchangeLoginCode(loginCode)

将登录回调中的 `loginCode` 换成平台登录结果。

**参数说明**

| 参数名    | 类型   | 必填 | 说明           |
| --------- | ------ | ---- | -------------- |
| loginCode | string | 是   | 平台回调登录码 |

**返回值**

返回一个 Promise 对象，解析后为换取结果。

## bindExternalAccount(params)

绑定外部认证账号。

**参数说明**

| 参数名 | 类型   | 必填 | 说明             |
| ------ | ------ | ---- | ---------------- |
| params | object | 是   | 绑定所需参数对象 |

**返回值**

返回一个 Promise 对象，解析后为绑定结果。

## resolveReturnUrl(input)

标准化并清洗登录回跳地址。

**参数说明**

| 参数名 | 类型 | 必填 | 说明         |
| ------ | ---- | ---- | ------------ |
| input  | any  | 否   | 原始回跳地址 |

**返回值**

返回清洗后的相对地址字符串。

## mapAuthError(code)

将认证错误码映射为前端统一错误标识。

**参数说明**

| 参数名 | 类型             | 必填 | 说明       |
| ------ | ---------------- | ---- | ---------- |
| code   | string \| number | 否   | 认证错误码 |

**返回值**

返回前端可展示或进一步翻译的错误标识字符串。
