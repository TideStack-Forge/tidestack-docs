---
title: 自定义登录页与认证接入
---

# 自定义登录页与认证接入

自定义登录页通过应用的 `loginEntry` 引用微前端，负责 `/login` 的展示、认证方式选择和发起登录。`/login/callback` 与 `/login/bind` 由基座处理，登录页不再实现一套回调和绑定流程。

本指南覆盖登录页工程、宿主接入、认证调用、国际化和上线验证。认证后的角色、主体和数据范围见 [权限与访问控制](./authority-subject-and-access-control-design)。

## 准备工程与认证样例

1. 创建单组件微前端，按 [应用改造](../guide/advance/extend-frontend/application-transformation) 接入生命周期，不注入独立路由。
2. 提供目标基座与 SDK 版本、实际 provider 列表、本地登录开关、品牌与语言要求。
3. 为 AI 提供成功、首次绑定、凭据错误及外部服务不可用的返回样例，明确相应交互。
4. 通过 [微前端包管理](../guide/advance/extend-frontend/index.md#configuration) 上传构建包，并在应用配置中设置自定义登录入口。

按身份来源配置认证：

| 身份来源 | 适配指南 |
| --- | --- |
| 企业目录 | [AD](./ad-domain-auth-adaptation-guide) |
| 统一认证服务 | [OIDC](./oidc-auth-adaptation-guide)、[CAS](./cas-auth-adaptation-guide) |
| 企业协作连接 | [钉钉](./dingtalk-auth-adaptation-guide)、[企业微信](./wecom-auth-adaptation-guide)、[飞书](./feishu-auth-adaptation-guide) |

静态 provider 通过 SDK 列表组织入口；企业协作连接使用下文的连接级登录入口。

先在宿主中确认页面加载与 SDK 注入，再接入真实认证。独立预览缺少宿主上下文时，应使用工程已有测试方式提供样例，不据此认定平台登录可用。

## 读取宿主能力

| 内容 | 入口 | 使用约定 |
| --- | --- | --- |
| 应用信息和配置 | `props.appInfo`、`props.config` | 可含名称、logo 和预加载认证信息 |
| provider 列表 | `listExternalProviders()` | 按实际 `key`、`type` 和可用状态组织入口 |
| 本地登录开关 | `isLocalPasswordLoginEnabled()` | 关闭时不展示本地凭据登录入口 |
| 本地凭据登录 | `login()` | 由基座处理登录结果和默认跳转 |
| LDAP 凭据登录 | `loginWithLdap()` | 提交选定 provider、用户名及密码 |
| 跳转式登录 | `startRedirectLogin()` | 用于 `cas`、`oauth2`，后者包括 OIDC |
| 回跳地址 | `resolveReturnUrl()` | 对原始 `redirect` / `returnUrl` 做统一处理 |
| 错误文案 | `mapAuthError()` | 将错误码映射为用户提示 |
| 最新 token | `getToken()` | 调用时取最新值；`props.token` 是挂载快照 |
| 国际化 | `props.i18n` | 语言、namespace、切换与订阅 |

provider 类型和 SDK 签名以目标版本为准。对 LDAP 使用凭据表单，不能按跳转式 provider 处理；LDAP 的 `loginUrl` 为空不代表不可用。

## 组织认证入口

将本地账号与 LDAP 放在凭据登录区，CAS / OAuth2 / OIDC 放在跳转区。两类入口使用各自的 SDK 方法。

| 当前可用方式 | 页面行为 |
| --- | --- |
| 本地与 LDAP 均可用 | 展示模式切换，默认本地账号；明确当前 LDAP provider |
| 只有一个 LDAP | 直接显示该目录的用户名密码表单 |
| 多个 LDAP | 按 provider 展示名称并明确选中项 |
| 只有跳转式认证 | 展示可用的单点登录按钮 |
| provider 不可用 | 说明状态并限制该入口，保留其他可用方式 |

提交期间显示加载态并防止重复提交，失败后恢复操作。用户切换模式时，处理旧错误与凭据状态，避免将同一组凭据提交给错误 provider。

## 接入认证调用

下面的 TypeScript 片段提取主要调用，页面状态和事件处理按工程框架补齐。示例类型用于说明结构，落地时核对目标 SDK 的导出类型。

```ts
import {
  isLocalPasswordLoginEnabled,
  listExternalProviders,
  login,
  loginWithLdap,
  mapAuthError,
  resolveReturnUrl,
  startRedirectLogin,
} from 'ouroboros-sdk'

export async function loadLoginOptions() {
  const providers = await listExternalProviders()
  return {
    localEnabled: isLocalPasswordLoginEnabled(),
    ldapProviders: providers.filter((provider) => provider.type === 'ldap'),
    redirectProviders: providers.filter(
      (provider) => provider.type === 'cas' || provider.type === 'oauth2'
    ),
  }
}

export function readReturnUrl() {
  const query = new URLSearchParams(window.location.search)
  return resolveReturnUrl(query.get('redirect') || query.get('returnUrl') || '/')
}

export async function submitLocalLogin(username: string, password: string) {
  return login({ username, password })
}

export async function submitLdapLogin(
  providerKey: string,
  username: string,
  password: string
) {
  const result = await loginWithLdap({ provider: providerKey, username, password })
  if (result?.bindingRequired && result?.bindingToken) {
    const search = new URLSearchParams({ token: result.bindingToken })
    const returnUrl = readReturnUrl()
    if (returnUrl !== '/') search.set('returnUrl', returnUrl)
    window.location.assign(`/login/bind?${search.toString()}`)
  }
  return result
}

export function submitRedirectLogin(provider: any) {
  return startRedirectLogin(provider, readReturnUrl())
}

export function resolveLoginError(code?: string | number) {
  return mapAuthError(code)
}
```

回跳目标从查询参数取得并交给 `resolveReturnUrl()`。不要把当前 `/login?...` 页面本身作为登录后的业务目标。

### 企业协作连接登录入口

钉钉、企业微信和飞书从已发布的 `enterprise.connections` 派生认证配置，以 `connectionId` 为登录标识。它们不会自动加入静态 `/api/auth/providers` 列表，也不能仅靠上文筛选 `oauth2` 类型显示全部企业登录方式。

为部署中已配置并启用登录的连接增加独立按钮，使用平台 OAuth2 流程入口。以下函数由按钮传入应用已知的连接标识；回跳仍使用宿主规则：

```ts
export function submitEnterpriseLogin(connectionId: string) {
  const params = new URLSearchParams({ returnUrl: readReturnUrl() })
  window.location.assign(
    `/api/auth/oauth2/${encodeURIComponent(connectionId)}/authorize?${params}`
  )
}
// 例如：submitEnterpriseLogin('dingtalk-main')
```

登录页只需要连接标识及展示名称，不读取 `credentialRef` 或凭据内容。后端完成 state 校验、按连接版本派生认证配置、交换授权码及身份绑定。钉钉和企业微信使用各自的认证桥，飞书使用派生的 OAuth2 配置；前端无需识别内部桥类型或重写回调。

`auth.enabled: false` 停用该连接登录。认证过程中连接改变或被停用时，旧结果应被拒绝，重新发起。前端 `/login/callback`、`/login/bind` 继续由基座处理。

### 绑定与错误结果

LDAP 首次认证成功但尚未绑定时，SDK 可返回：

```json
{
  "success": false,
  "bindingRequired": true,
  "bindingToken": "..."
}
```

此时进入基座 `/login/bind`，携带绑定 token 与已处理的业务回跳地址。完成绑定后再次登录也需要验证。

| 错误码 | 含义与处理 |
| --- | --- |
| `40104` | 账号或密码错误，展示映射文案并允许重新输入 |
| `40301` | 本地账号密码登录已关闭，检查界面与运行开关是否一致 |
| `40901` | 外部身份需要绑定，按实际返回的绑定参数进入基座页面 |
| `50201` | 外部认证不可用，结合 provider 状态与后端日志排查 |

异常通过页面统一错误处理展示，既处理 SDK 返回的业务结果，也按项目请求层约定处理抛出的错误。登录页不保存 AD 密码，也不把平台访问 token 拼接到 URL。

## 国际化与资源释放

`/login` 用于登录页文案，`common` 用于通用按钮和加载提示。以下 key 可作为语言资源的起点，实际新增文案同步补齐各语言。

### `/login` Key

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

### 读取和更新文案

```ts
export function bindLoginI18n(props: any, onLocaleChange: () => void) {
  const tLogin = props.i18n.useNamespace('/login')
  const tCommon = props.i18n.useNamespace('common')
  const dispose = props.i18n.onLocaleChange(onLocaleChange)

  return {
    readTexts: () => ({
      welcome: tLogin('welcome', '欢迎使用'),
      submit: tLogin('button.submit', '登录'),
      loading: tCommon('loading', '加载中...'),
    }),
    languages: props.i18n.getLanguages(),
    locale: props.i18n.getLocale(),
    switchLanguage: (locale: string) => props.i18n.switchLanguage(locale),
    dispose,
  }
}
```

语言变化后重新读取文案并触发组件更新；只在挂载时生成一次字符串，不能保证后续自动刷新。组件卸载时调用 `dispose`，释放订阅。

语言资源的结构示例：

```json
{
  "/login": { "welcome": "欢迎使用", "button.submit": "登录" },
  "common": { "loading": "加载中..." }
}
```

## 上线前验证

记录基座、SDK 与微前端包版本，按实际启用方式验证：

| 场景 | 要观察的结果 |
| --- | --- |
| 本地开关与 LDAP 组合 | 可用入口和默认模式正确，选定 provider 与请求一致 |
| CAS / OAuth2 / OIDC | 正确发起认证，由基座处理回调和回跳 |
| 钉钉 / 企业微信 / 飞书连接 | 使用 connectionId 发起登录，停用和配置变更正确生效 |
| 首次绑定与再次登录 | 进入基座绑定页，绑定后可正常使用同一外部身份 |
| 凭据错误或外部服务不可用 | 错误可理解，加载态恢复，可以重试或选择其他入口 |
| 带 `redirect` 或 `returnUrl` | 参数已处理，登录与绑定后到达目标业务页面 |
| token 刷新后读取 | 需要使用 token 的操作调用 `getToken()`，不依赖旧快照 |
| 切换语言、离开再进入 | 文案更新，卸载后无重复订阅 |
| 新包安装与恢复 | 资源路径和版本正确，基座回调及绑定页可访问 |

交付代码、语言资源、入口配置和实际验证记录。失败时把触发步骤、provider key、错误码、脱敏响应和版本反馈给 AI，先定位加载、调用、认证或回调阶段，再复验。
