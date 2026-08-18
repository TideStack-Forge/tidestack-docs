---
sidebar_position: 1
---

# 权限与访问控制

这页保留为“详细实现参考”，适合已经确认要在代码层处理权限、主体和访问控制的开发者。

如果你还在判断是否真的需要进入专业开发，建议先回到 [融合开发](../../fusion-development/) 中的 [权限、主体与访问控制设计](../../fusion-development/authority-subject-and-access-control-design)。

## 先确认这页讨论的不是哪一层

- 不是普通业务角色配置操作；那部分优先看 [用户角色权限](../../guide/module/rbac/)
- 不是组织结构维护；那部分优先看 [组织架构管理](../../guide/module/organization/)
- 也不是单纯替换登录页视觉；那部分优先看 [自定义登录页与认证接入](../../fusion-development/custom-login-page-and-auth-integration)

这页真正讨论的是：当你需要在代码里定义权限、接入主体、计算访问控制结果，并把这些结果继续带入接口、流程和运行时逻辑时，该从哪里下手。

## 当前实现里已经核对过的核心抽象

### `Authority`

当前 `Authority` 接口统一描述：

- 权限唯一名
- 标题
- API 列表
- UI 视图列表
- 菜单项列表
- `AccessControlDefine`

这说明平台里的权限点并不是只服务后端接口，也可以同时关联页面和菜单入口。

### `AuthorityCenter` 与 `AuthorityProvider`

当前权限定义由 `AuthorityProvider` 提供，再通过 `AuthorityCenter` 聚合。

如果你要补新的权限来源或权限定义装配方式，通常这里才是真正的扩展入口，而不是直接在业务代码里散落字符串常量。

### `User`、`Claims`、`UserCenter`

当前 `User` 抽象已经包含：

- `getUserIdentity()`
- `getClaims()`
- `getRoles()`
- `getSubject()`
- `isEnabled()`

也就是说，当前安全模型已经不只是“账号 + 角色”，还把 Claims 聚合作为正式运行时能力的一部分。

### `SubjectCenter` 与 `UserSubjectCenter`

主体相关能力当前通过两个中心对象协同：

- `SubjectCenter`：根据主体类型和 ID 读取主体
- `UserSubjectCenter`：管理用户与主体的绑定关系

如果你要把员工、设备、外部成员等业务身份带进授权链路，通常需要围绕 `SubjectProvider` 和 `UserSubjectProvider` 扩展，而不是假设 `User` 自己就永久持有主体字段。

### `AccessControlDefine` 与 `AccessControlParams`

当前访问控制能力分成两层：

- `AccessControlDefine`：描述“一个权限能控制哪些字段与过滤条件”
- `AccessControlParams`：描述“当前用户实际拿到了哪些字段与过滤条件”

`AccessControlParams` 当前至少包括：

- `getAllowedFields()`
- `getDisallowedFields()`
- `getFilters()`

## 代码层常见进入点

### 给接口绑定权限

当前可以直接使用：

- `@Authority`
- `@Anonymous`

这适合把接口访问边界直接挂到控制器方法上，并交给统一安全链路处理。

### 为平台补新的权限定义

如果你要让新模块拥有自己的权限点，通常应该从 `AuthorityProvider` 入手，把权限定义统一纳入 `AuthorityCenter` 可发现范围。

### 把主体体系接进来

如果登录用户在业务上还需要映射为员工、设备或其他主体类型，通常要扩展：

- `SubjectProvider`
- `UserSubjectProvider`

然后再让 Claims、角色和访问控制消费这些绑定结果。

### 把权限结果带进业务运行时

当前安全模块已经提供：

- `OuroborosAuthentication.getAccessControlParams()`
- `OuroborosAuthentication.getAccessControlParams(String authorityName)`

这意味着你可以在运行时直接读取当前请求或某个权限点对应的访问控制结果。

## 与逻辑流的集成入口

如果你要把当前权限结果继续带入逻辑流，当前模块已经提供了这些节点：

- `authFilter`
- `authAllowedFields`
- `authDisallowedFields`

这类节点适合在流程里继续拼接数据过滤、字段裁剪和后续业务判断，而不需要自己重复解析权限参数。

## 用户与主体的运行时契约

当前代码使用以下契约：

- `User` 暴露 `Subject`
- 用户与主体的绑定关系由 `UserSubjectCenter` 管理
- 兼容用的 `subject_type` / `subject_id` 会被写入 Claims

`subject_type` 和 `subject_id` 用于兼容既有 Claims 消费方；新增代码应通过 `Subject` 和 `UserSubjectCenter` 访问主体关系。

## 推荐搭配阅读

1. [权限模型](../../concepts/authority-model/)
2. [权限、主体与访问控制设计](../../fusion-development/authority-subject-and-access-control-design)
3. [用户角色权限](../../guide/module/rbac/)
4. [自定义登录页与认证接入](../../fusion-development/custom-login-page-and-auth-integration)
