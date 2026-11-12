---
title: 飞书认证接入适配指南
---

# 飞书认证接入适配指南

通过企业协作连接接入飞书用户 OAuth 登录。当前飞书连接使用内部应用凭据，由连接派生固定的 `oauth2` 认证配置，登录身份使用用户 `open_id`。

## 1. 准备应用与回调

目标应用装配 `ouroboros-approval-workflow-external-integration-runtime`、`ouroboros-approval-workflow-external-integration-feishu` 和平台外部认证运行时，保持版本一致。

在飞书开放平台准备内部应用，配置可用人员范围、用户授权权限及重定向地址。例如连接标识为 `feishu-main` 时，登记后端回调：

```text
https://apps.example.com/api/auth/oauth2/feishu-main/callback
```

平台 `ouroboros.security.external-auth.public-base-url` 使用实际外部地址。检查浏览器到授权页、平台后端到 token 和用户信息端点的连通性。

## 2. 保存凭据并配置连接

将以下结构化 JSON 存入安全存储：

```json
{
  "appId": "replace-with-app-id",
  "appSecret": "replace-with-app-secret",
  "verificationToken": "replace-with-verification-token"
}
```

`verificationToken` 属于共享连接凭据中的必填字段，`encryptKey` 为可选字段，按实际应用配置提供。不要用 app access token 或 tenant access token 替代用户登录凭据。

在统一配置的 `enterprise.connections` 中增加：

```json
[
  {
    "connectionId": "feishu-main",
    "provider": "feishu",
    "credentialRef": "env:FEISHU_MAIN_CREDENTIAL",
    "auth": { "enabled": true }
  }
]
```

已有连接时合并到原数组。飞书应用 ID 来自凭据，无需在连接顶层再放 `appId`，也不要求添加钉钉、企业微信的 `corpId`。`credentialRef` 指向完整凭据 JSON，不附带 `#/appId` 或 `#/appSecret`，字段引用由认证配置派生器生成。

保存后确认目标应用已加载有效连接。修订号由平台计算；停用登录使用 `auth.enabled: false`，不混同整个连接停用。

## 3. 使用派生的认证链路

登录页为连接增加入口，导航到：

```text
/api/auth/oauth2/feishu-main/authorize?returnUrl=%2F
```

连接级配置不会自动出现在静态 provider 列表，入口实现见 [企业协作连接登录入口](./custom-login-page-and-auth-integration#企业协作连接登录入口)。回调、一次性登录结果和绑定由基座处理。

派生配置使用以下固定协议规则：

| 内容 | 当前值 |
| --- | --- |
| authorize | `https://accounts.feishu.cn/open-apis/authen/v1/authorize` |
| token | `https://accounts.feishu.cn/oauth/v3/token` |
| userinfo | `https://open.feishu.cn/open-apis/authen/v1/user_info` |
| userinfo 数据层 | 响应中的 `data` |
| 稳定身份与成员标识 | `open_id` |
| PKCE | 启用 S256 |
| scopes | 派生配置为空列表，不套用 OIDC 的 `openid profile email` |

虽然运行时类型是 `oauth2`，这里也不需要复制一份静态 OAuth2 provider 或手工改成 OIDC。身份来源、端点、凭据字段和连接修订都由正式连接配置生成。

`connectionId + open_id` 决定平台外部账号绑定；飞书 `open_id` 具有应用范围，切换应用凭据或连接标识前应评估现有绑定。登录成功后另行安排平台角色及数据权限。

## 4. 验证与排查

| 场景 | 检查结果 |
| --- | --- |
| 正常授权 | 实际应用 ID、回调、PKCE 和用户信息解析正确 |
| 第一次登录与再次登录 | 首次绑定平台账号，后续使用相同外部身份 |
| 缺少凭据或应用权限 | 连接或认证明确失败，不用租户 token 冒充用户身份 |
| 用户信息缺少 `data.open_id` | 不能建立有效外部身份 |
| state 失效、重复或连接中途变化 | 拒绝旧结果，重新发起 |
| 应用或连接更换 | 核查身份范围及绑定迁移，避免误绑定 |
| 认证后访问受限 | 按平台主体、角色及数据范围检查 |

在真实飞书应用中验收登录可用范围和完整绑定流程。排查保留连接 ID、平台版本、时间和脱敏错误，检查配置是否发布、密钥引用是否可解析及企业应用权限是否生效。
