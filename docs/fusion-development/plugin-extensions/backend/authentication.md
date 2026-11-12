---
title: 认证方式插件
---

# 认证方式插件

已有 LDAP、CAS、OAuth2/OIDC 优先配置内置 provider。只有协议或外部身份来源不受支持时，才增加认证方式插件；登录页样式独立按 [自定义登录页](../../custom-login-page-and-auth-integration)实现。

## 1. 区分配置来源与协议实现

| 变化 | 正式接口 |
| --- | --- |
| provider 配置来自新来源 | `ExternalAuthProviderSpecSource` |
| 新 provider 协议类型 | `ExternalAuthProviderBuilder` |
| 输入用户名密码直接认证 | `DirectAuthProvider` |
| 跳转认证、回调与交换 | `RedirectAuthProvider` |

接口位于 `com.ouroboros.security.externalauth`，配置来源在其 `config` 包。配置来源返回 ProviderSpec 列表，并可提供 revision 让运行时发现变更；需要接入既有配置源装配策略，避免再添加一个冲突来源。

## 2. 提供协议构建器

```java
String type();
Optional<ExternalAuthProvider> build(
    ProviderSpec spec, ExternalAuthProviderBuildContext context);
```

`type()` 对应配置类型，必须唯一。当前工厂通过 Spring 注入 `List<ExternalAuthProviderBuilder>`；构建器按 Bean 装配，通过 [扩展包自动配置](../../backend-extension-packages)导入，不能假定写一个 Java SPI 文件就会被发现。

构建器读取类型对应配置并使用 BuildContext 中的基础能力。需要自定义 ProviderSpec 时，同步接入正式配置源的解析与校验，不能只返回一个后端认识、配置源却无法生成的类型。

## 3. 实现认证与身份结果

直接认证实现 `authenticate(username, password)`，返回 `Either<AuthError, ExternalIdentity>`。跳转认证实现授权 URL、回调及交换方法，由平台处理状态与结果链路。

身份结果包含 provider key、稳定 externalId、展示名和属性，随后进入平台账号绑定与 token 链路。登录身份不等于员工标识、主体或业务权限；不要用可变邮箱替代稳定主键，也不根据外部属性直接绕过平台授权。

新 provider 类型需要同时核对服务端路由和前端 SDK 的分发支持。现有自定义登录页按 `ldap`、`cas`、`oauth2` 分类，不保证新增任意 type 后自动显示并完成登录。

## 验证

检查配置解析、Bean 装配、provider key/type 唯一性和不可用状态。覆盖成功、无效凭据、回调异常、首次绑定、再次登录及业务无权限场景。外部服务断开时应返回可定位的认证错误，不签发本地成功结果。

内置接入教程：[AD 域](../../ad-domain-auth-adaptation-guide)、[OIDC](../../oidc-auth-adaptation-guide)。
