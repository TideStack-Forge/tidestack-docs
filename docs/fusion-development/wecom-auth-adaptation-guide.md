---
title: 企业微信认证接入适配指南
---

# 企业微信认证接入适配指南

平台的 `wecom-enterprise` 认证桥支持企业微信**第三方应用服务端网页授权**，从企业协作连接派生登录配置。本指南对应这一模式；自建应用 JS-SDK 免登和其他授权形态需要另行核对支持范围。

## 1. 准备第三方应用

目标应用装配 `ouroboros-approval-workflow-external-integration-runtime`、`ouroboros-approval-workflow-external-integration-wecom` 和平台外部认证运行时，版本与平台一致。

在企业微信完成第三方应用及企业授权，准备套件凭据、当前 `suiteTicket`、企业永久授权码与企业 `corpId`。按该应用的网页授权要求配置可用范围及回调域名，实际后端回调为：

```text
https://apps.example.com/api/auth/oauth2/wecom-main/callback
```

将平台 `ouroboros.security.external-auth.public-base-url` 设为实际外部访问地址。后端必须能访问企业微信套件 token 与授权用户信息接口。

## 2. 保存凭据并配置连接

安全存储中的凭据 JSON 必须包含以下字段：

```json
{
  "suiteId": "replace-with-suite-id",
  "suiteSecret": "replace-with-suite-secret",
  "suiteTicket": "replace-with-current-suite-ticket",
  "permanentCode": "replace-with-permanent-code",
  "callbackToken": "replace-with-callback-token",
  "encodingAesKey": "replace-with-encoding-aes-key"
}
```

这些字段是当前连接凭据契约，不能用一对自建应用 `corpId/secret` 替代。`suiteTicket` 需要持续更新，永久授权码应属于当前授权企业；完整 JSON 通过引用提供给连接。

在统一配置 `enterprise.connections` 中增加：

```json
[
  {
    "connectionId": "wecom-main",
    "provider": "wecom",
    "credentialRef": "env:WECOM_MAIN_CREDENTIAL",
    "corpId": "replace-with-corp-id",
    "auth": { "enabled": true }
  }
]
```

已有连接时保留原数组其他项。`corpId` 位于顶层，密钥引用不带 JSON 字段 fragment，也不填写普通 token。运行时计算连接修订号，无需手写。

保存并确认目标应用已发布有效连接。`auth.enabled: false` 仅停用此连接登录，不代表停用审批和其他业务能力。

## 3. 接入登录页

为 `wecom-main` 配置登录按钮，浏览器进入：

```text
/api/auth/oauth2/wecom-main/authorize?returnUrl=%2F
```

连接级入口不会自动出现在静态 `/api/auth/providers`，具体代码见 [企业协作连接登录入口](./custom-login-page-and-auth-integration#企业协作连接登录入口)。后端回调完成后，由基座处理登录或账号绑定，不在自定义登录页交换授权码。

当前桥的协议与身份规则如下：

| 环节 | 当前行为 |
| --- | --- |
| 授权端点 | `https://open.weixin.qq.com/connect/oauth2/authorize` |
| 授权参数 | `appid` 使用凭据 `suiteId`，固定 `scope=snsapi_base`，不发送 `agentid` |
| 授权码 | 从回调读取 `code` |
| 服务端交换 | 取得 suite token，调用 `/cgi-bin/service/auth/getuserinfo3rd` |
| 企业校验 | 响应小写 `corpid` 必须等于连接 `corpId` |
| 登录稳定标识 | `open_userid`，缺少时拒绝认证 |
| 企业成员标识 | 保留同一响应的 `userid`，缺少时同样拒绝建立绑定 |

`open_userid`、企业内 `userid`、平台 User 和组织员工 ID 各有用途。不要互相替换，也不要把 suite token 当作用户登录结果。外部身份绑定账号后，业务角色和数据权限继续由平台管理。

## 4. 验证与排查

| 场景 | 检查结果 |
| --- | --- |
| 已授权企业正常登录 | 网页授权使用 suiteId，企业和成员身份正确 |
| 首次账号与已绑定账号 | 绑定后再次登录使用同一稳定身份 |
| suiteTicket 过期或凭据缺失 | 明确失败，修复凭据后重新发起 |
| 企业不符、缺少 `open_userid` 或 `userid` | 拒绝身份结果 |
| state 失效、重复或连接配置中途变化 | 旧回调拒绝，不降级到其他同名 provider |
| 停用 `auth.enabled` | 登录入口不可用，单独检查其他连接能力仍符合配置 |
| 登录后访问业务 | 继续检查账号状态、角色和数据范围 |

“能取得企业 access token”不能证明用户登录链路可用。联调需记录实际应用模式、授权企业、回调、脱敏错误和版本，在真实企业环境验证完整跳转与绑定。
