---
title: 钉钉认证接入适配指南
---

# 钉钉认证接入适配指南

通过已发布的企业协作连接接入钉钉登录。平台已有连接级 `dingtalk-enterprise` 认证桥，支持企业内部应用和第三方企业应用，由凭据内容区分应用形态。

## 1. 准备应用与依赖

目标应用需要装配企业协作连接 runtime、钉钉适配模块和平台外部认证运行时。对应 Maven 模块为 `ouroboros-approval-workflow-external-integration-runtime`、`ouroboros-approval-workflow-external-integration-dingtalk`；依赖版本与目标平台保持一致。

在钉钉侧准备应用、可登录人员范围、企业 `corpId` 及登录所需权限，登记平台后端回调，例如：

```text
https://apps.example.com/api/auth/oauth2/dingtalk-main/callback
```

平台 `ouroboros.security.external-auth.public-base-url` 设置为浏览器实际访问的外部地址。本例连接标识是 `dingtalk-main`，需要在配置、登录入口及回调中一致使用。

## 2. 保存凭据

将结构化 JSON 存入目标环境已支持的安全存储。内部应用使用：

```json
{
  "appKey": "replace-with-app-key",
  "appSecret": "replace-with-app-secret",
  "callbackToken": "replace-with-callback-token",
  "encodingAesKey": "replace-with-encoding-aes-key"
}
```

第三方企业应用使用另一组凭据：

```json
{
  "suiteKey": "replace-with-suite-key",
  "suiteSecret": "replace-with-suite-secret",
  "suiteTicket": "replace-with-current-suite-ticket",
  "callbackToken": "replace-with-callback-token",
  "encodingAesKey": "replace-with-encoding-aes-key"
}
```

两组选一，不能混填，也不能只填部分字段。`callbackToken` 与 `encodingAesKey` 属于共享连接凭据契约，即使本次先验证登录，也需提供。第三方应用还要按已有连接运维方式维护有效的 `suiteTicket`。

假设 JSON 通过环境密钥引用 `env:DINGTALK_MAIN_CREDENTIAL` 读取。引用指向完整 JSON，不是用户 access token；普通连接配置中不保存密钥。

## 3. 配置企业连接

在统一配置的“企业协作连接”中设置 `enterprise.connections`。以下是该配置值的数组示例，已有其他连接时合并到原数组：

```json
[
  {
    "connectionId": "dingtalk-main",
    "provider": "dingtalk",
    "credentialRef": "env:DINGTALK_MAIN_CREDENTIAL",
    "corpId": "replace-with-corp-id",
    "auth": { "enabled": true }
  }
]
```

`corpId` 位于连接顶层。应用形态由凭据决定，无需另填 `applicationType`。`credentialRef` 不带 `#/字段名`；修订号由运行时计算，不手填 `revision` 或 `fingerprint`。保存后确认目标应用已发布并加载有效连接。

关闭该连接登录使用 `auth.enabled: false`，不因此关闭审批等其他连接能力。

## 4. 发起登录并绑定账号

连接级认证不会自动加入静态 `/api/auth/providers` 列表。自定义登录页为已启用连接增加入口，浏览器导航到：

```text
/api/auth/oauth2/dingtalk-main/authorize?returnUrl=%2F
```

站内回跳参数处理和入口代码见 [企业协作连接登录入口](./custom-login-page-and-auth-integration#企业协作连接登录入口)。后端完成授权码交换后，由基座 `/login/callback` 或 `/login/bind` 处理登录结果。

当前认证桥固定使用钉钉用户授权链路：

| 环节 | 当前行为 |
| --- | --- |
| 授权 | `https://login.dingtalk.com/oauth2/auth`，scope 为 `openid corpid`，携带连接 `corpId` 与 `prompt=consent` |
| 回调 | 读取 `authCode`，不是要求登录页改写为通用 `code` |
| 交换与用户信息 | 调用用户 access token 和 `/v1.0/contact/users/me` 接口 |
| 企业边界 | 校验 token 响应中的 `corpId` 与连接一致 |
| 稳定身份 | 优先 `unionId`，缺少时使用 `openId`；企业成员标识另行解析 |

不要把应用 access token、suiteTicket 或员工 userId 当作用户登录凭据。外部身份以连接标识和稳定外部 ID 绑定平台账号；认证成功后仍需配置平台角色及数据权限。

## 5. 验证与排查

| 场景 | 检查结果 |
| --- | --- |
| 内部或第三方应用正常授权 | 使用所选凭据形态，回调与企业一致，取得稳定身份 |
| 首次登录与再次登录 | 首次进入绑定流程，后续使用同一绑定 |
| 缺少凭据字段或套件票据过期 | 连接或认证明确失败，不签发成功结果 |
| 回调缺少 `authCode`、state 失效或重复 | 认证拒绝，重新发起 |
| 返回其他企业身份 | `corpId` 校验拒绝 |
| 认证期间连接改变或被停用 | 旧授权结果不能继续完成登录 |
| 平台登录成功但缺少业务权限 | 页面、接口及数据访问仍受平台授权控制 |

入口不可用时检查模块装配、连接发布、`auth.enabled` 与密钥引用。记录连接 ID、平台版本、时间和脱敏错误，再核对钉钉应用权限及回调域名。上线前在真实企业与应用形态下执行上述验收。
