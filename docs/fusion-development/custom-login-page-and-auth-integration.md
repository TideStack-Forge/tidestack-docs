---
title: 自定义登录页
---

# 自定义登录页

自定义登录页可以调整应用的品牌、布局和交互，在同一个页面中提供本地账号、企业目录或单点登录入口，并随用户选择切换语言。应用通过 `loginEntry` 引用登录页微前端，由它接管 `/login` 的展示和登录操作；`/login/callback` 与 `/login/bind` 继续由基座处理。

开始接入前，先完成后端认证配置，确认目标环境启用了哪些登录方式。各身份来源的配置与适配指南见 [认证接入](./authentication-integration)。

## 准备并接入登录页工程

1. 创建单组件微前端，使用 `initSingleComponent` 接入挂载、更新和卸载生命周期。工程入口与构建配置见 [应用改造](../guide/advance/extend-frontend/application-transformation)，登录页不注入独立路由。
2. 对齐目标基座和 `ouroboros-sdk` 版本，确定品牌素材、支持的语言与认证入口。
3. 构建工程，通过 [微前端包管理](../guide/advance/extend-frontend/index.md#configuration) 上传构建包，在应用配置中设置自定义登录入口 `loginEntry`。
4. 从应用 `/login` 进入，确认页面、脚本和样式加载正常，挂载参数中可取得宿主能力，再测试真实登录。

独立预览可用于调整布局；认证、账号绑定、回跳和语言切换需要在宿主中验证。重复进入页面时，检查组件是否正确卸载，避免事件和订阅重复注册。

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

## 适配多种认证方式

### 组织登录入口

先用 `listExternalProviders()` 读取静态 provider，再用 `isLocalPasswordLoginEnabled()` 判断是否提供本地账号入口。将本地账号与 LDAP 放在凭据登录区，CAS / OAuth2 / OIDC 放在单点登录区；企业协作连接单独增加按钮。

| 当前可用方式 | 页面行为 |
| --- | --- |
| 本地与 LDAP 均可用 | 展示模式切换，默认本地账号；明确当前 LDAP provider |
| 只有一个 LDAP | 直接显示该目录的用户名密码表单 |
| 多个 LDAP | 按 provider 展示名称并明确选中项 |
| 只有跳转式认证 | 展示可用的单点登录按钮 |
| 已启用企业协作连接 | 按已配置的连接标识增加钉钉、企业微信或飞书按钮 |
| provider 不可用 | 说明状态并限制该入口，保留其他可用方式 |

provider 的 `key` 用于提交，`displayName` 用于展示；`availability` 为 `healthy` 时可用。静态列表不会返回被停用或启动时构建失败的 provider，也不能用它判断企业协作连接是否启用。

提交期间显示加载态并防止重复提交，失败后恢复操作。用户切换模式时，处理旧错误与凭据状态，避免将同一组凭据提交给错误 provider。

### 使用 SDK 发起登录

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

登录页只需要连接标识及展示名称，不读取 `credentialRef` 或凭据内容。连接配置、凭据和后端适配见 [认证接入](./authentication-integration#企业协作连接)。

连接停用后同步隐藏或禁用相应按钮。连接配置在认证途中改变时，旧结果会被拒绝，页面应允许重新发起。前端 `/login/callback`、`/login/bind` 继续由基座处理。

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

## 适配多语言

登录页尚未取得用户身份，应从宿主的 `props.i18n` 读取可用语言和当前语言。语言选择器使用 `getLanguages()` 返回的列表，以语言项的 `value` 调用 `switchLanguage(locale)`，切换后重新渲染文案。

### 准备语言资源

在应用的 **基础配置 / 多语言** 中维护各语言的登录文案，启用所需语言并确定默认语言。管理操作见 [多语言](../low-code/development-platform-menus/i18n)。把登录表单标签、占位符、按钮、校验提示、加载和错误提示都纳入语言资源；新增认证方式时，同步补充相关文案。

`/login` 用于登录页文案，`common` 用于通用按钮和加载提示。语言文件的 `messages` 可以采用以下结构，各语言保留相同的键，只翻译值：

```json
{
  "/login": {
    "welcome": "欢迎使用",
    "button.submit": "登录",
    "error.40104": "平台账号或密码错误",
    "credential.ldapHint": "请输入 {{provider}} 的账号密码进行目录认证"
  },
  "common": { "loading": "加载中..." }
}
```

对应的英文文案：

```json
{
  "/login": {
    "welcome": "Welcome",
    "button.submit": "Sign in",
    "error.40104": "Incorrect platform username or password",
    "credential.ldapHint": "Enter your {{provider}} username and password"
  },
  "common": { "loading": "Loading..." }
}
```

### 登录页文案键

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

### 通用文案键

| Key           | 默认值    | 用途         |
| ------------- | --------- | ------------ |
| `app.appName` | 潮汐栈    | 应用名       |
| `save`        | 保存      | 通用按钮     |
| `cancel`      | 取消      | 通用按钮     |
| `loading`     | 加载中... | 加载态       |
| `error`       | 操作失败  | 通用错误提示 |

### 读取文案与切换语言

```ts
export function bindLoginI18n(props: any, onLocaleChange: () => void) {
  const tLogin = props.i18n.useNamespace('/login')
  const tCommon = props.i18n.useNamespace('common')
  const dispose = props.i18n.onLocaleChange(onLocaleChange)

  return {
    readTexts: (providerName: string) => ({
      welcome: tLogin('welcome', '欢迎使用'),
      submit: tLogin('button.submit', '登录'),
      loading: tCommon('loading', '加载中...'),
      ldapHint: tLogin(
        'credential.ldapHint',
        '请输入 {{provider}} 的账号密码进行目录认证',
        { provider: providerName }
      ),
    }),
    readError: (code?: string | number) =>
      tLogin(`error.${code || 'unknown'}`, mapAuthError(code)),
    languages: props.i18n.getLanguages(),
    getLocale: () => props.i18n.getLocale(),
    switchLanguage: (locale: string) => props.i18n.switchLanguage(locale),
    dispose,
  }
}
```

页面挂载时调用 `bindLoginI18n()`，用 `languages` 渲染语言选择器，用 `getLocale()` 取得当前选中值。用户选择后等待 `switchLanguage(locale)` 完成；加载失败时显示错误并恢复选择器操作。

`onLocaleChange` 回调中重新调用 `readTexts(providerName)` 并更新组件，同时重新读取当前语言。组件卸载时调用 `dispose()` 取消订阅。字段校验提示和已经显示的错误也应随语言变化重新取值，避免页面中混用两种语言。

`mapAuthError(code)` 当前返回中文提示，不会自动随语言切换。多语言页面应保留错误码，在 `/login` 中维护 `error.40104` 等翻译，再用 `readError(code)` 取值；示例以 SDK 提示作为缺少翻译时的回退。为实际可能出现的错误码补齐各语言文案，切换语言时重新读取。

`{{provider}}` 等插值保留在翻译文本中，由参数替换，避免把固定中文和 provider 名称直接拼接。provider 展示名称如需翻译，可按稳定的 provider key 维护文案，提交时仍使用原 key。

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
| 未登录时切换语言 | 表单、登录方式、校验和错误文案更新，语言选择与宿主一致 |
| 切换语言后离开再进入 | 当前语言正确，卸载后无重复订阅 |
| 长翻译文本或 RTL 语言 | 按钮与提示不被截断，布局与文本方向可用 |
| 新包安装与恢复 | 资源路径和版本正确，基座回调及绑定页可访问 |

认证成功但业务页面或数据不可访问时，继续检查 [权限与访问控制](./authority-subject-and-access-control-design)中的账号、主体和授权配置。
