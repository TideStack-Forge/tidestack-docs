---
title: CAS 认证接入适配指南
---

# CAS 认证接入适配指南

使用平台内置 CAS provider 对接企业单点登录。浏览器进入 CAS 登录页，平台后端验证 service ticket，并将 CAS 身份绑定到平台账号。已有兼容的 CAS 服务通常通过配置接入，无需新增插件。

## 1. 确认服务与身份字段

收集 CAS 基础地址、票据验证路径、服务登记规则，以及返回的用户与属性字段。当前实现解析 CAS XML 的 `authenticationSuccess/user` 和 attributes，命名空间为 `http://www.yale.edu/tp/cas`，默认验证路径为 `/serviceValidate`。

平台后端需要访问 CAS 验证端点，浏览器需要访问登录页和平台回调。企业使用其他验证协议或特殊响应格式时，先核对内置实现，不直接假定兼容。

## 2. 配置 provider

通过目标实例现有配置加载机制提供：

```yaml
ouroboros:
  security:
    external-auth:
      public-base-url: https://apps.example.com
      cas:
        - key: corporate-cas
          type: cas
          display-name: 企业 CAS
          enabled: true
          cas-base-url: https://sso.example.com/cas
          validate-path: /serviceValidate
          external-id-field: employeeNumber
          attribute-mapping:
            displayName: displayName
            email: mail
```

将地址和属性名替换为真实服务信息。`attribute-mapping` 左侧是平台字段 `displayName` / `email`，右侧是 CAS 属性名。本例使用 CAS 的 `mail` 作为平台邮箱。

`external-id-field` 指定稳定身份属性；未配置时使用 CAS `user`，指定的属性缺少时当前实现也回退到 `user`。如果企业要求必须存在员工编号，应在身份服务侧保证该属性并纳入验收，不能把配置字段当作“缺少就拒绝”的开关。修改 provider key 或稳定身份来源会影响已有绑定。

## 3. 登记正确的 service

平台每次发起登录时生成 state，发送给 CAS 的 service 形如：

```text
https://apps.example.com/api/auth/cas/corporate-cas/callback?state=<每次生成的值>
```

CAS 服务注册规则必须允许该后端回调及动态 state。按企业的服务登记机制配置匹配规则，限定到真实域名和回调路径；不能只登记前端 `/login/callback`，也不要让代理删除 state。

平台跳转到 `${casBaseUrl}/login?service=...`，并缓存完整 service URL。回调验证票据时使用同一个缓存值，查询参数也是 service 一致性的一部分。反向代理后的域名、协议和路径都应与 `public-base-url` 一致。

## 4. 登录页接入与账号绑定

静态 CAS provider 可通过 `listExternalProviders()` 发现，其类型为 `cas`。自定义登录页使用 SDK：

```ts
import {
  listExternalProviders,
  resolveReturnUrl,
  startRedirectLogin,
} from 'ouroboros-sdk'

export async function loginWithCas() {
  const provider = (await listExternalProviders())
    .find((item) => item.key === 'corporate-cas' && item.type === 'cas')
  if (!provider) throw new Error('CAS 登录入口不可用')
  return startRedirectLogin(provider, resolveReturnUrl('/'))
}
```

平台登录入口是 `/api/auth/cas/corporate-cas/login`，不是 OAuth2 authorize 路径。SDK 根据 provider 构建入口。CAS 回到后端 callback 后，由基座 `/login/callback` 或 `/login/bind` 完成平台登录与首次账号绑定，见 [自定义登录页与认证接入](./custom-login-page-and-auth-integration)。

平台账号的启用状态、角色及数据权限单独生效。接通 CAS 登录也不代表已实现企业级单点登出，退出范围需要按实际部署另行验收。

## 5. 验证与排查

| 场景 | 检查结果 |
| --- | --- |
| 正常登录 | CAS 登录与票据验证使用完全一致的 service |
| 首次绑定及后续登录 | 同一 provider 和稳定身份定位同一平台账号 |
| 自定义身份属性缺失 | 观察实际回退到 `user` 的结果，符合企业身份要求 |
| service 域名、协议或查询参数不符 | CAS 拒绝票据，修正登记或代理配置 |
| ticket 无效、过期，或重复回调 | 不产生新的有效平台登录结果 |
| state 缺失、过期或重复 | 请求失败，重新从登录入口发起 |
| 配置在登录途中改变 | 旧结果拒绝，重新发起使用新配置 |
| CAS 服务不可用 | 展示可理解错误，恢复后可以重新登录 |
| 登录成功但业务无权访问 | 继续按平台角色、权限与主体绑定检查 |

多实例部署还需验证 state 和一次性登录结果缓存的共享行为。排查保留 provider key、时间、脱敏错误与 correlation ID，不公开 ticket、一次性登录码和平台 token。
