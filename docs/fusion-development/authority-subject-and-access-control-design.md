---
title: 权限、主体与访问控制设计
sidebar_position: 11
---

# 权限、主体与访问控制设计

本专题用于改动权限模型边界、接入外部身份来源，或把访问控制下沉到代码和运行时。标准账号、角色、菜单、接口和基础数据权限使用 [组织、权限、配置与通知](../low-code/organization-permissions-configuration-and-notification)。

## 什么时候应该进入这条线

- 需要把外部人员、设备或其他业务主体接入当前安全体系
- 需要在后端代码里定义新的权限点，并让接口、菜单或页面统一受控
- 需要做字段级、数据级访问控制，而不只是勾选功能权限
- 需要把权限结果带进逻辑流、查询过滤或运行时上下文
- 需要在自定义登录页、外部认证和平台授权模型之间理清边界

## 先分清四个边界

### 1. 登录入口与认证方式

这层解决的是“用户怎么完成登录”。

当前平台已经支持本地登录、LDAP、CAS、OAuth2 / OIDC 等认证方式；如果只是要替换登录体验，通常优先看 [自定义登录页与认证接入](./custom-login-page-and-auth-integration)，而不是先改权限模型。

### 2. 用户、角色与授权

这层解决的是“谁拥有哪些权限”。

当前代码中，`User` 暴露用户标识、`Claims`、角色列表、主体对象和启用状态；角色再关联到 `Authority`，形成统一授权入口。

### 3. 主体与组织身份

这层解决的是“登录身份在业务上代表谁”。

当前运行时不是把主体类型直接硬编码在 `User` 抽象里，而是通过 `UserSubjectCenter` 和 `SubjectCenter` 把用户与员工、设备或其他主体类型关联起来。组织架构模块则继续负责公司、部门、岗位和员工等组织语义。

### 4. 访问控制参数

这层解决的是“拿到权限之后，具体能看到哪些字段、哪些数据”。

当前访问控制的运行时结果主要表现为：

- `allowedFields`
- `disallowedFields`
- `filters`

也就是说，权限不仅能控制接口是否可调，还能继续下沉到字段可见性和数据过滤条件。

## 当前代码里已经确认存在的关键能力

这部分内容已按当前仓库代码核对，不直接照搬旧设计稿。

### 权限定义与聚合

- `Authority` 负责统一描述权限名、标题、接口列表、UI 视图、菜单项和 `AccessControlDefine`
- `AuthorityCenter` 会从多个 `AuthorityProvider` 聚合权限定义
- `@Authority` 和 `@Anonymous` 注解可直接标注接口访问边界

### 用户、主体与 Claims

- `UserCenter` 提供统一用户查询入口
- `SubjectCenter` 提供主体查询入口
- `UserSubjectCenter` 负责用户与主体绑定关系
- `ClaimsAggregator` / `ClaimsProvider` 负责把头像、角色、主体等信息聚合到当前用户 Claims

这意味着如果你要接外部身份体系，通常不是只改登录接口，而是要同时考虑用户、主体绑定和 Claims 聚合。

### 字段级与数据级访问控制

- `AccessControlDefine` 定义“这个权限可以控制什么”
- `AccessControlParams` 表达“当前用户实际拿到了什么控制结果”
- `AccessControlParams` 当前支持字段放行、字段禁用和过滤条件三类结果

### 与逻辑流联动

当前安全模块还提供了可直接接入逻辑流的节点：

- `authFilter`
- `authAllowedFields`
- `authDisallowedFields`

这适合把当前用户的数据过滤条件或字段可见范围直接带入流程执行链路。

## 常见场景怎么选

| 当前问题                                       | 更适合的入口                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| 只是给业务角色配页面、菜单、接口和基础数据权限 | [低代码权限配置](../low-code/organization-permissions-configuration-and-notification) |
| 需要维护用户、角色和授权关系                   | [用户角色权限](../guide/module/rbac/)                                                 |
| 需要把员工、设备等业务主体接入授权链路         | 本页 + 自定义 `SubjectProvider` / `UserSubjectProvider`                               |
| 需要在代码中声明新的权限点并控制接口访问       | 本页 + `AuthorityProvider` / `@Authority`                                             |
| 需要做字段级、数据级过滤                       | 本页 + `AccessControlDefine` / `AccessControlParams`                                  |
| 需要替换登录页但不想自己重写整套认证回调       | [自定义登录页与认证接入](./custom-login-page-and-auth-integration)                    |

## 三种常见组合方式

### 组合一：组织架构 + 标准 RBAC

适合大多数标准业务系统。

重点是先用组织架构维护员工与岗位，再在角色里配置功能权限和基础数据权限，不要过早引入自定义主体类型。

### 组合二：外部主体接入 + Claims 聚合

适合用户不只是“系统账号”，而是需要映射员工、设备、合作方身份等场景。

这时更关键的是把主体来源、用户绑定关系和 Claims 输出先定义清楚，再让前后端消费统一的用户信息。

### 组合三：权限定义 + 运行时过滤

适合你已经不满足“能不能访问”，而要进入“能看到哪些字段、能查哪些数据”的场景。

这时权限设计就不能只停留在菜单和按钮层，而要把 `AccessControlDefine` 与查询、流程、脚本或接口逻辑一起考虑。

## 一个很容易踩坑的点

旧资料中有一部分仍沿用“`User` 直接携带 `subjectType` / `subjectId`”的描述，但当前代码的公开抽象已经更偏向：

- `User`
- `Claims`
- `UserSubjectCenter`
- `SubjectCenter`

因此如果你现在要做新扩展，建议优先按当前接口和运行时实现理解，而不是继续围绕旧字段假设做设计。

## 推荐阅读顺序

1. [权限模型](../concepts/authority-model/)
2. [组织、权限、配置与通知](../low-code/organization-permissions-configuration-and-notification)
3. [用户角色权限](../guide/module/rbac/)
4. [权限与访问控制](../guide/advance/authority-and-access-control)

## 下一步看哪里

- 想看详细扩展与实现抓手：看 [权限与访问控制](../guide/advance/authority-and-access-control)
- 想先把登录入口接起来：看 [自定义登录页与认证接入](./custom-login-page-and-auth-integration)
- 想继续判断是否真的要写代码：看 [何时用低代码，何时写代码](./when-to-use-code)
