---
title: OIDC 认证接入适配指南
---

# OIDC 认证接入适配指南

本指南通过平台内置 OAuth2 provider 接入支持 OpenID Connect 的身份提供方。浏览器跳转至企业认证系统，平台后端交换授权码、验证身份，再按外部身份与平台账号的绑定关系完成登录。

已有 OIDC 服务通常只需配置，不需要开发新的认证插件。协议不受内置实现支持时，才进入 [认证方式插件](./plugin-extensions/backend/authentication)。

## 1. 收集身份提供方信息

| 信息 | 用途 |
| --- | --- |
| issuer | ID Token 签发者，必须与真实 `iss` 一致 |
| authorization endpoint | 浏览器跳转认证 |
| token endpoint | 后端交换授权码 |
| JWKS URI | 取得签名公钥并验证 ID Token |
| userinfo endpoint | 在相应身份获取路径中读取用户属性 |
| client ID 与客户端密钥 | 标识平台客户端并完成后端交换 |
| 平台外部访问地址 | 生成身份提供方回调地址 |
| scopes 与稳定身份字段 | 请求身份权限，通常使用 `openid profile email` 和 `sub` |

可以读取企业身份提供方的 discovery 文档取得端点，但当前 provider 配置需要显式填写这些地址，不能只填 issuer 并假定平台自动发现。

平台后端必须能访问 token、JWKS 和按需使用的 userinfo 地址；浏览器必须能访问授权端点与平台回调。反向代理、HTTPS 域名和证书需要与最终部署一致。

## 2. 注册客户端与回调

在身份提供方注册客户端，使用授权码流程，配置精确回调地址。假设平台外部地址为 `https://apps.example.com`、provider key 为 `corporate-oidc`：

```text
https://apps.example.com/api/auth/oauth2/corporate-oidc/callback
```

这是后端接收身份提供方回调的地址。前端 `/login/callback` 是后续基座处理平台登录结果的页面，两者不能混用。

确认服务端客户端认证方式、是否支持 PKCE S256、允许 scopes 和用户范围。跨环境分别注册或配置允许地址，避免把 localhost 测试回调带到生产。

## 3. 配置平台 provider

通过目标实例已有配置加载机制提供：

```yaml
ouroboros:
  security:
    external-auth:
      public-base-url: https://apps.example.com
      oauth2:
        - key: corporate-oidc
          type: oauth2
          display-name: 企业统一认证
          enabled: true
          authorization-uri: https://id.example.com/authorize
          token-uri: https://id.example.com/token
          user-info-uri: https://id.example.com/userinfo
          jwks-uri: https://id.example.com/jwks
          issuer: https://id.example.com
          client-id: tidestack-app
          client-secret-ref: env:OIDC_CLIENT_SECRET
          scopes:
            - openid
            - profile
            - email
          external-id-field: sub
          pkce-enabled: true
          pkce-method: S256
      external-call:
        oauth2:
          connect-timeout: 5s
          read-timeout: 10s
```

地址都是示例，应替换为身份提供方实际端点。密钥通过目标环境的 secret resolver 注入；`client-id` 与 `client-id-ref` 二选一。OIDC 使用配置列表 `oauth2` 和类型 `oauth2`，不新增 `type: oidc`。

### 身份校验与属性

在授权码回调链路中，平台保存并校验一次性 state；请求包含 `openid` 时生成 nonce，启用 PKCE 时关联 verifier。state 还绑定 provider 与配置版本，认证途中配置改变后需要重新发起登录。

返回 `id_token` 且配置 JWKS 时，平台验证签名及客户端、issuer 等约束，并匹配缓存 nonce。验证失败会拒绝认证，不降级成信任未验证的 Token。Token 响应没有可用的 ID Token 分支时，内置实现可使用 access token 请求已配置的 userinfo；该路径需要按企业要求单独验收，不能声称它已经执行 ID Token 校验。

`external-id-field` 默认 `sub`，用于稳定外部身份；展示名、邮箱来自 `name`、`email`。缺少稳定标识应拒绝认证。provider key 与 externalId 一起决定绑定关系，修改 key 或身份字段前应评估既有用户。

`member-id-field` 仅在企业成员标识与身份来源确定同源时配置。登录 `sub`、员工标识与平台主体不是天然同一个值，认证成功也不会自动获得业务角色。

## 4. 接入登录页

1. 调用 `listExternalProviders()`，确认出现 `corporate-oidc`，类型为 `oauth2`，状态和登录地址符合目标配置。
2. 在单点登录区显示该入口，用 `startRedirectLogin(provider, returnUrl)` 发起；回跳目标先经 `resolveReturnUrl()` 处理。
3. 身份提供方回到后端 callback，后端认证后进入基座登录回调或账号绑定页面。
4. 外部身份未绑定时，由 `/login/bind` 完成平台账号绑定，再验证同一用户后续正常登录。

SDK、错误映射、国际化和完整页面实现见 [自定义登录页与认证接入](./custom-login-page-and-auth-integration)。登录页不自行交换授权码、验证 ID Token 或重新实现回调。

## 5. 按链路验证

| 场景 | 应观察的结果 |
| --- | --- |
| 正常授权 | 授权地址、client ID、scope 和回调正确，后台交换成功 |
| 首次身份 | 进入平台账号绑定，绑定后再次登录不重复绑定 |
| state 过期、重复或属于其他 provider | 请求被拒绝，需重新发起授权 |
| 错误 issuer、签名、客户端或 nonce | 身份校验拒绝，不签发平台成功结果 |
| JWKS、token 或 userinfo 不可用 | 可定位到外部认证依赖失败 |
| 配置在认证途中变更 | 旧授权结果被拒绝，重新发起后使用新配置 |
| 登录成功但缺少业务权限 | 菜单、接口和数据访问仍按平台授权限制 |
| 带业务回跳目标 | 登录或绑定完成后到达合法站内目标 |

在多实例部署验证 state 和一次性登录结果的缓存可用性，不仅验证单实例。排查时保留 provider key、时间、脱敏错误和 correlation ID，密钥、授权码、Token 不作为公开日志或 AI 上下文。

## 常见问题

| 现象 | 先检查 |
| --- | --- |
| 身份提供方拒绝 redirect URI | 外部地址、代理前缀、provider key 与注册回调是否完全一致 |
| 平台未显示入口 | provider 是否加载、启用和构建成功，SDK 是否按 oauth2 分类 |
| ID Token 校验失败 | issuer、客户端、JWKS、公钥轮换与 nonce |
| 每次要求绑定 | provider key、稳定身份字段或外部标识是否变化 |
| 认证成功但访问业务失败 | 平台账号启用状态、主体绑定、角色及数据范围 |

上线交付 provider 配置、客户端登记信息、登录页版本、绑定与授权说明和实际测试记录。保留经过验证的管理员恢复方式，升级时连同回调和密钥引用一起核对。
