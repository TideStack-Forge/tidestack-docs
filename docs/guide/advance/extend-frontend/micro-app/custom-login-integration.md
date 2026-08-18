---
sidebar_position: 3
---

# 平台自定义登录页集成指南

本文档是潮汐栈平台自定义登录页的统一接入指南，用于替代分散在主应用目录中的历史说明。它覆盖以下内容：

- 自定义登录页微前端的接入边界
- 本地登录、LDAP 登录、CAS/OAuth2/OIDC 跳转登录的组织方式
- token、provider、i18n 等运行时能力的获取方式
- 推荐的语言 key、示例代码和上线配置方式

## 适用范围

适用于通过 `loginEntry` 微前端替换平台默认 `/login` 页的场景。

:::info
当前平台默认只把 `/login` 页面交给自定义微前端。`/login/callback` 和 `/login/bind` 仍由基座负责，因此大多数自定义登录页只需要负责发起登录，不需要自己实现 OAuth2/CAS/OIDC 回调页。
:::

## 接入前提

1. 创建一个微前端应用，推荐使用单组件模式，不注入自己的路由。
2. 按照 [应用改造](../application-transformation) 完成 qiankun 接入。
3. 在平台“高级 -> 微前端”中上传微前端包。
4. 在“应用配置”中将该微前端设置为自定义登录页入口。

## 宿主注入的运行时能力

自定义登录页微前端挂载时会收到基座传入的 `props`，同时也可以直接从 `ouroboros-sdk` 导入同一批能力。

| 能力         | 推荐入口                        | 说明                                                       |
| ------------ | ------------------------------- | ---------------------------------------------------------- |
| `token`      | `props.token`                   | 历史兼容字段，仅代表登录页挂载时的 token 快照              |
| 最新 token   | `getToken()`                    | 始终返回最新 token；如果平台正在刷新 token，会等待刷新完成 |
| 应用信息     | `props.appInfo`                 | 可能包含预加载的 `authProviders`、应用名、logo 等          |
| 配置信息     | `props.config`                  | 可读取登录开关等运行配置                                   |
| 认证提供方   | `listExternalProviders()`       | 返回最终可用的 provider 列表                               |
| 本地登录开关 | `isLocalPasswordLoginEnabled()` | 判断是否允许本地账号密码登录                               |
| 本地登录     | `login()`                       | 账号密码登录；基座会负责后续默认跳转                       |
| LDAP 登录    | `loginWithLdap()`               | 目录账号密码登录                                           |
| 跳转式登录   | `startRedirectLogin()`          | 发起 `cas` / `oauth2` provider 的跳转                      |
| 回跳地址清洗 | `resolveReturnUrl()`            | 统一清洗并规范化 `returnUrl`                               |
| 错误映射     | `mapAuthError()`                | 将错误码转换为可直接展示的文案                             |
| 国际化       | `props.i18n`                    | 获取语言、切换语言、按 namespace 翻译                      |

:::warning
`props.token` 会继续保留，但它是一次性快照。只要你的登录页需要在 token 刷新后继续读取 token，就应使用 `getToken()`，不要再依赖 `props.token`。
:::

## 推荐的登录方式组织模型

建议将登录页拆成两个区域：

- 账号密码登录区：承载“本地账号密码”和“LDAP 目录账号密码”两种模式。
- 跳转式单点登录区：承载 `cas` 和 `oauth2` 类型的 provider。

这样可以避免把 LDAP 登录按钮和 SSO 按钮混在一起，用户能明确知道当前输入框对应的是哪种认证方式。

推荐交互规则：

1. 当本地登录和 LDAP 同时可用时，默认选中本地登录。
2. 当只有 LDAP 可用时，直接显示 LDAP 账号密码表单，不显示模式切换器。
3. 当同时存在账号密码登录和跳转式登录时，在两者之间放一条清晰分割线。
4. `cas` 与 `oauth2` provider 应作为按钮列表展示，不应复用账号密码表单。

## Provider 类型与处理方式

| Provider 类型 | 处理方式               | 说明                                  |
| ------------- | ---------------------- | ------------------------------------- |
| `ldap`        | `loginWithLdap()`      | 使用当前表单中的账号密码直接提交      |
| `cas`         | `startRedirectLogin()` | 跳转到企业认证中心                    |
| `oauth2`      | `startRedirectLogin()` | 包含 OIDC 在内的 OAuth2/OIDC 跳转登录 |

## 推荐接入代码

下面的示例演示了如何同时接入本地登录、LDAP 登录、跳转式登录和 i18n。

```ts
import {
  getToken,
  isLocalPasswordLoginEnabled,
  listExternalProviders,
  login,
  loginWithLdap,
  mapAuthError,
  resolveReturnUrl,
  startRedirectLogin,
} from 'ouroboros-sdk'

const REDIRECT_PROVIDER_TYPES = new Set(['cas', 'oauth2'])

export async function createLoginContext(props: any) {
  const tLogin = props.i18n.useNamespace('/login')
  const tCommon = props.i18n.useNamespace('common')

  const localEnabled = isLocalPasswordLoginEnabled()
  const providers = await listExternalProviders()
  const latestToken = await getToken()

  const ldapProviders = providers.filter((provider: any) => provider.type === 'ldap')
  const redirectProviders = providers.filter((provider: any) =>
    REDIRECT_PROVIDER_TYPES.has(provider.type)
  )

  const credentialModes = [
    ...(localEnabled
      ? [
          {
            key: 'local',
            type: 'local',
            label: tLogin('credential.local', '本地账号'),
          },
        ]
      : []),
    ...ldapProviders.map((provider: any) => ({
      key: `ldap:${provider.key}`,
      type: 'ldap',
      provider,
      label: provider.displayName || tLogin('credential.ldap', 'LDAP 目录'),
    })),
  ]

  return {
    tLogin,
    tCommon,
    latestToken,
    credentialModes,
    redirectProviders,
  }
}

export async function submitLocalLogin(username: string, password: string) {
  return login({
    username,
    password,
  })
}

export async function submitLdapLogin(
  providerKey: string,
  username: string,
  password: string
) {
  const result = await loginWithLdap({
    provider: providerKey,
    username,
    password,
  })

  if (result?.bindingRequired && result?.bindingToken) {
    const returnUrl = resolveReturnUrl(window.location.pathname + window.location.search)
    const search = new URLSearchParams({ token: result.bindingToken })
    if (returnUrl !== '/') {
      search.set('returnUrl', returnUrl)
    }
    window.location.assign(`/login/bind?${search.toString()}`)
  }

  return result
}

export function submitRedirectLogin(provider: any) {
  return startRedirectLogin(
    provider,
    resolveReturnUrl(window.location.pathname + window.location.search)
  )
}

export function resolveLoginError(code?: string | number) {
  return mapAuthError(code)
}
```

## 国际化接入

### Namespace

推荐至少使用两个 namespace：

- `/login`：登录页专用文案
- `common`：平台通用按钮、加载文案、应用名等

### 推荐的 `/login` Key

| Key                    | 默认值                                                | 用途                            |
| ---------------------- | ----------------------------------------------------- | ------------------------------- |
| `welcome`              | 欢迎使用                                              | 登录页欢迎语                    |
| `username.label`       | 用户名                                                | 用户名标签                      |
| `username.placeholder` | 请输入用户名                                          | 用户名输入框占位符              |
| `password.label`       | 密码                                                  | 密码标签                        |
| `password.placeholder` | 请输入密码                                            | 密码输入框占位符                |
| `button.submit`        | 登录                                                  | 通用提交按钮                    |
| `button.submitLocal`   | 本地登录                                              | 本地登录按钮                    |
| `button.submitLdap`    | LDAP 登录                                             | LDAP 登录按钮                   |
| `credential.local`     | 本地账号                                              | 本地模式标签                    |
| `credential.localHint` | 请输入平台账号密码进行本地登录                        | 本地模式说明                    |
| `credential.ldap`      | LDAP 目录                                             | LDAP 模式默认名称               |
| `credential.ldapHint`  | `请输入 {{provider}} 的账号密码进行目录认证`          | LDAP 模式说明                   |
| `divider.sso`          | 单点登录                                              | 账号密码区与 SSO 区的分割线标题 |
| `sso.title`            | 单点登录                                              | 纯 SSO 页面下的区块标题         |
| `sso.description`      | 通过 OAuth2、CAS 或 OIDC 跳转到企业认证系统完成登录。 | SSO 区描述                      |
| `validation.required`  | `请输入{{field}}`                                     | 必填校验                        |
| `validation.invalid`   | `请输入有效的{{field}}`                               | 格式校验                        |

### 推荐的 `common` Key

| Key           | 默认值    | 用途         |
| ------------- | --------- | ------------ |
| `app.appName` | 潮汐栈    | 应用名       |
| `save`        | 保存      | 通用按钮     |
| `cancel`      | 取消      | 通用按钮     |
| `loading`     | 加载中... | 加载态       |
| `error`       | 操作失败  | 通用错误提示 |

### i18n 使用示例

```ts
export function bindI18n(props: any) {
  const tLogin = props.i18n.useNamespace('/login')
  const tCommon = props.i18n.useNamespace('common')

  const currentLocale = props.i18n.getLocale()
  const languages = props.i18n.getLanguages()

  const unsubscribe = props.i18n.onLocaleChange((locale: string) => {
    console.log('locale changed to', locale)
  })

  return {
    currentLocale,
    languages,
    welcomeText: tLogin('welcome', '欢迎使用'),
    usernameLabel: tLogin('username.label', '用户名'),
    ssoTitle: tLogin('divider.sso', '单点登录'),
    loadingText: tCommon('loading', '加载中...'),
    unsubscribe,
  }
}
```

### 语言包示例

```json
{
  "/login": {
    "welcome": "欢迎使用",
    "username.label": "用户名",
    "username.placeholder": "请输入用户名",
    "password.label": "密码",
    "password.placeholder": "请输入密码",
    "button.submit": "登录",
    "button.submitLocal": "本地登录",
    "button.submitLdap": "LDAP 登录",
    "credential.local": "本地账号",
    "credential.localHint": "请输入平台账号密码进行本地登录",
    "credential.ldap": "LDAP 目录",
    "credential.ldapHint": "请输入 {{provider}} 的账号密码进行目录认证",
    "divider.sso": "单点登录",
    "sso.title": "单点登录",
    "sso.description": "通过 OAuth2、CAS 或 OIDC 跳转到企业认证系统完成登录。",
    "validation.required": "请输入{{field}}",
    "validation.invalid": "请输入有效的{{field}}"
  },
  "common": {
    "app.appName": "潮汐栈",
    "save": "保存",
    "cancel": "取消",
    "loading": "加载中...",
    "error": "操作失败"
  }
}
```

## 语言切换与资源释放

无论你使用 Vue、React 还是其他框架，都建议：

1. 挂载时读取 `props.i18n.getLocale()` 和 `props.i18n.getLanguages()`。
2. 通过 `props.i18n.switchLanguage(locale)` 切换语言。
3. 使用 `props.i18n.onLocaleChange()` 监听语言变化。
4. 组件卸载时取消订阅，避免内存泄漏。

## 处理 LDAP 绑定与外部登录错误

### LDAP 首次绑定

当 `loginWithLdap()` 返回：

```json
{
  "success": false,
  "bindingRequired": true,
  "bindingToken": "..."
}
```

说明当前 LDAP 账号需要先绑定平台账号。推荐直接跳转到基座提供的 `/login/bind` 页面，并透传 `token` 与 `returnUrl`。

### 错误展示

如果登录失败，可以直接展示 `mapAuthError(code)` 返回的文案；常见错误包括：

- `40104`：平台账号或密码错误
- `40301`：本地账号密码登录已禁用
- `40901`：首次使用该外部账号登录，需要绑定平台账号
- `50201`：外部认证服务当前不可用

## 打包与上线

1. 构建并打包登录页微前端。
2. 在平台“高级 -> 微前端”中上传 zip 包。
3. 微前端类型选择“微前端应用”。
4. 配置正确的 `publicPath` / 微前端路径。
5. 在“应用配置”中将其设为自定义登录页入口。

## 相关文档

- [微前端应用](./)
- [应用改造](../application-transformation)
- [前端基座 SDK 功能方法](../../../../api/frontend/sdk/completion-methods)
