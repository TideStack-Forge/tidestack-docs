---
title: 认证接入
---

# 认证接入

应用可以使用本地账号登录，也可以接入企业目录、统一认证服务或企业协作平台。接入外部认证后，外部系统负责核验用户身份，平台根据外部身份与平台账号的绑定关系完成登录，再按平台账号的角色和数据权限控制业务访问。

后端认证配置决定哪些身份来源可用；登录页负责展示入口和发起认证。需要调整品牌、布局、登录按钮或语言切换时，使用 [自定义登录页](./custom-login-page-and-auth-integration)。

## 选择适配指南

先确认企业已有的身份来源与接入协议，再按对应指南准备配置和凭据。

| 身份来源 | 当前接入方式与适用范围 | 指南 |
| --- | --- | --- |
| AD 企业目录 | 输入 AD 用户名和密码，由后端执行 LDAP 绑定认证；不包含 Kerberos、NTLM 或 SPNEGO 桌面集成认证 | [AD 域认证方式适配指南](./ad-domain-auth-adaptation-guide) |
| OpenID Connect 服务 | 使用内置 OAuth2 provider 接入 OIDC，显式配置授权、Token、JWKS 和用户信息端点 | [OIDC 认证接入适配指南](./oidc-auth-adaptation-guide) |
| CAS 服务 | 跳转至 CAS 登录页，由后端通过 CAS XML 响应验证 service ticket | [CAS 认证接入适配指南](./cas-auth-adaptation-guide) |
| 钉钉 | 通过企业协作连接接入，支持企业内部应用和第三方企业应用 | [钉钉认证接入适配指南](./dingtalk-auth-adaptation-guide) |
| 企业微信 | 通过企业协作连接接入第三方应用的服务端网页授权 | [企业微信认证接入适配指南](./wecom-auth-adaptation-guide) |
| 飞书 | 通过内部应用凭据接入用户 OAuth 登录，以 `open_id` 标识用户 | [飞书认证接入适配指南](./feishu-auth-adaptation-guide) |

已有协议能够通过内置实现接入时，直接配置相应身份来源。内置实现无法处理目标协议或身份来源时，再按 [认证方式插件](./plugin-extensions/backend/authentication)扩展后端，并为登录页补齐相应入口。

## 配置认证来源

### 静态认证配置

AD / LDAP、CAS 和通用 OAuth2 / OIDC 使用 `ouroboros.security.external-auth` 配置。每个 provider 使用稳定的 `key`，定义协议参数、展示名称、启用状态和外部身份字段；后端按目标环境解析密钥引用并创建 provider。

前端通过 SDK `listExternalProviders()` 读取已加载的静态 provider。宿主已有预加载信息时使用该信息，否则请求 `/api/auth/providers`。返回项包括 `key`、`type`、`displayName`、`loginUrl` 和 `availability`，供登录页组织入口。LDAP 使用凭据表单，`loginUrl` 为空仍可正常登录；CAS 和 OAuth2 使用跳转入口。OIDC 的类型仍为 `oauth2`。

本地账号登录独立受统一配置 `security.auth.login.localPassword.enabled` 控制，默认开启。关闭本地登录前，先验证外部认证可用以及管理员的登录方式；自定义登录页通过 `isLocalPasswordLoginEnabled()` 同步入口显示。

### 企业协作连接

钉钉、企业微信和飞书使用统一配置中的 `enterprise.connections`。连接以 `connectionId` 标识，通过 `credentialRef` 引用完整凭据，由 `auth.enabled` 控制是否启用登录。目标应用还需装配相应的企业协作连接运行时与厂商适配模块。

连接级认证配置由已发布的连接派生，不需要再复制一份静态 OAuth2 provider，也不会自动出现在静态 `/api/auth/providers` 列表中。登录页根据已启用连接增加按钮，使用以下入口发起认证：

```text
/api/auth/oauth2/{connectionId}/authorize?returnUrl=%2F
```

前端只使用连接标识和展示信息；密钥解析、授权码交换和身份校验由后端执行。各厂商的凭据结构、应用类型和回调要求见上表中的适配指南。

## 登录与账号绑定

### 凭据登录

用户在登录页选择本地账号或 LDAP，输入用户名和密码。登录页分别调用 `login()` 或 `loginWithLdap()`；LDAP 凭据由平台后端交给目录服务验证。

外部认证成功后，平台查找该外部身份绑定的账号。尚未绑定时，登录结果携带 `bindingRequired` 和 `bindingToken`，登录页进入基座的 `/login/bind` 完成绑定；已有绑定时，平台继续执行账号登录。具体返回值和页面处理见 [自定义登录页](./custom-login-page-and-auth-integration#绑定与错误结果)。

### 跳转式登录

1. 用户点击登录按钮。静态 CAS / OAuth2 provider 使用 `startRedirectLogin()`，企业协作连接使用连接级 authorize 入口。
2. 平台生成并保存本次认证状态，将浏览器重定向至外部认证服务。
3. 用户在外部服务完成认证，浏览器回到平台后端 callback。后端校验状态，验证票据或交换授权码，取得外部身份。
4. 基座的 `/login/callback` 或 `/login/bind` 处理平台登录结果与首次绑定，完成后进入合法的业务回跳地址。

外部身份服务登记的是**后端回调地址**，例如 `/api/auth/oauth2/{key}/callback` 或 CAS 的 `/api/auth/cas/{key}/callback`；前端 `/login/callback` 是处理平台登录结果的页面，两者用途不同。反向代理后的协议、域名和路径应与 `ouroboros.security.external-auth.public-base-url` 一致，CAS 还要允许 service 中的动态 state 参数。

外部身份需要稳定标识，例如 AD 的 `objectGUID`、OIDC 的 `sub` 或飞书的 `open_id`。provider key 或 connectionId 参与区分身份来源，变更它们或更换身份字段前，需要评估已有账号绑定。展示名称、邮箱、企业成员 ID 和平台主体各有用途，不应直接视为同一个身份。

## 接入步骤与验证

1. **准备身份来源**：确认协议或企业应用类型、登录人员范围、稳定身份字段，以及浏览器和平台后端所需的网络访问。
2. **登记客户端与回调**：按对应指南注册应用或服务，使用目标环境实际的外部地址，确认代理、HTTPS 和回调路径一致。
3. **配置后端**：静态 provider 写入外部认证配置；企业协作登录发布连接及凭据引用，并确认适配模块已装配。
4. **核对外部身份与平台账号的绑定**：用测试用户完成首次绑定，再次登录时应定位到同一平台账号。
5. **接入登录页**：确认入口显示、凭据提交或跳转、错误提示和业务回跳；需要定制时按 [自定义登录页](./custom-login-page-and-auth-integration)实现多认证方式与多语言。
6. **验证业务访问**：分别检查账号启用状态、角色、接口和数据范围，按 [权限与访问控制](./authority-subject-and-access-control-design)完成授权。

除正常登录外，还应验证错误凭据、外部服务不可用、状态过期或重复回调，以及登录期间配置变更。多实例部署需检查认证状态和一次性登录结果的缓存共享。排查时保留 provider key 或 connectionId、时间、错误码与脱敏日志，不记录密码、授权码或访问 Token。
