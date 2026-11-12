---
title: 权限与访问控制
sidebar_position: 11
---

# 权限与访问控制

先确定谁能执行什么操作、能访问哪些记录和字段，再将规则接入平台权限链路。认证、业务主体、角色和数据范围分别承担不同职责；隐藏前端菜单或按钮不能代替后端授权。

普通账号、组织和角色配置见 [组织、权限、配置与通知](../low-code/organization-permissions-configuration-and-notification)，本页说明应用实现如何消费和扩展这些规则。

## 1. 明确授权用例

| 输入 | 需要确定的内容 |
| --- | --- |
| 用户与业务身份 | 用户绑定哪类主体，角色和 Claims 来自哪里 |
| 受控资源 | 权限名及关联菜单、页面、API 和业务动作 |
| 数据范围 | 允许访问的记录、允许与禁止的字段 |
| 预期行为 | 同角色不同主体、无角色、未绑定和禁用账号分别如何响应 |
| 当前实现 | 权限定义、查询入口、Controller、动作或逻辑流 |

例如，“只能查看所属部门订单”需要明确部门从哪里取得、接口绑定哪个权限、查询如何落实部门过滤及字段裁剪。验收同时检查页面入口和直接 API 请求。

## 2. 理解身份与权限对象

| 对象 | 职责 |
| --- | --- |
| `User` | 暴露 `getUserIdentity()`、`getClaims()`、`getRoles()`、`getSubject()` 与 `isEnabled()` |
| `SubjectCenter` | 按主体类型和 ID 读取业务主体 |
| `UserSubjectCenter` | 管理平台用户与主体的绑定关系 |
| `Authority` | 统一描述权限名、标题、API、UI 视图、菜单和 `AccessControlDefine` |
| `AuthorityCenter` | 聚合 `AuthorityProvider` 提供的权限定义 |
| `AccessControlDefine` | 描述可配置的字段和数据过滤规则 |
| `AccessControlParams` | 表示当前用户计算得到的字段与行访问范围 |

认证确定登录身份，主体表示用户在业务中代表谁，角色与权限决定可执行的动作。AD / OIDC 外部身份绑定平台账号后，也不自动获得业务角色。

新增代码通过 `Subject`、`SubjectCenter` 和 `UserSubjectCenter` 处理主体关系。Claims 中的 `subject_type`、`subject_id` 用于兼容既有消费者，不代替正式主体接口。

## 3. 将接口关联到权限项

普通 Spring MVC Controller 可以在方法上使用 `@Authority("权限名")`，关联到平台统一鉴权。完整注册示例见 [Controller 与 Service](./backend-development/spring-beans-and-controllers)。

同一权限项可聚合多个 API、视图与菜单。仍需让权限定义进入 `AuthorityCenter` 并配置角色授权，注解本身不会给用户授予权限。`@Anonymous` 用于明确的匿名接口，不应作为排查鉴权失败的临时绕过。

业务模型动作和低代码 WebAPI 通过各自正式绑定与权限配置接入。自定义登录页只替换登录展示，见 [自定义登录页与认证接入](./custom-login-page-and-auth-integration)。

## 4. 在业务执行中落实数据范围

从当前认证对象取得：

- `OuroborosAuthentication.getAccessControlParams()`：当前入口的访问控制结果。
- `OuroborosAuthentication.getAccessControlParams(String authorityName)`：指定权限点的访问控制结果。

这些是认证对象实例的方法。业务查询继续消费 `getAllowedFields()`、`getDisallowedFields()` 与 `getRowConstraint()`；查询过滤、count、分页、导出和返回字段都要符合授权用例。

行约束区分 ALL、FILTER、NONE。NONE 不等价于空过滤条件；`getFilters()` 遇到无可访问数据行会拒绝访问，不能捕获后改成不受限查询。规则计算成功后仍需要实际查询入口消费，读取结果不代表自动过滤所有自定义代码。

逻辑流中使用 `authFilter`、`authAllowedFields`、`authDisallowedFields` 取得相应结果，并映射到后续查询与字段处理节点。只放置节点而不使用其输出，数据范围不会凭空生效。

## 5. 增加新的规则来源

| 要增加的能力 | 正式入口 |
| --- | --- |
| 权限定义来源 | `AuthorityProvider` |
| 员工、设备或外部成员等主体 | `SubjectProvider`、`UserSubjectProvider` |
| 当前用户的扩展身份信息 | `ClaimsProvider`，由 `ClaimsAggregator` 聚合 |
| 可复用的数据范围规则解析 | `AccessControlFilterBuilder` 与行约束 |

按接口实际装配机制增加实现；行约束解析、SPI、参数消费和拒绝语义见 [数据权限扩展插件](./plugin-extensions/backend/data-permissions)。已有角色配置足够时直接配置，不增加一套平行权限表。

## 6. 验证与交付

1. 确认权限、主体与 Claims 来源已加载，测试用户的绑定、角色和启用状态正确。
2. 对照权限名核对 API 方法和路径、UI、菜单引用，用有权限与无权限账号分别调用。
3. 用同角色不同主体访问同一批数据，比较行范围与允许、禁止字段，并验证 count、分页和导出。
4. 覆盖主体未绑定、Claims 缺失、未知规则、禁用用户与执行失败，确认拒绝结果可定位。
5. 如果从 MQ 或计划任务执行，明确后台执行身份；不假设存在当前 HTTP 用户。

交付授权规则、资源引用和实际验证记录。给 AI 的排查上下文包含账号角色、主体类型、权限名、脱敏访问控制结果及请求结果。概念定义见 [权限模型](../concepts/authority-model/)，业务实现接入见 [后端开发](./backend-development/)。
