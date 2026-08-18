# OuroborosAuthentication

`OuroborosAuthentication` 是平台的认证信息接口。它基于 Spring Security 的 `Authentication`，并补充了更适合平台业务使用的用户、角色和数据权限方法。

在脚本或表达式里，`AuthenticationHolder.getAuthentication()` 返回的就是这个对象。

## 什么时候看这页

- 你在脚本里拿到了认证对象，想确认它能直接提供什么
- 你需要从当前登录态拿用户详情、角色或数据权限
- 你在区分 `principal`、`userDetail`、`roles` 这几个概念

## 核心方法

| 方法                                 | 返回值类型 | 说明 |
| ------------------------------------ | ---------- | ---- |
| `getPrincipal()`                     | `String`   | 获取当前认证主体标识 |
| `getUserDetail()`                    | `User`     | 获取当前用户详情 |
| `getRoles()`                         | `List<? extends Role>` | 获取当前角色列表 |
| `getAccessControlParams()`           | `AccessControlParams` | 获取当前请求的数据权限参数 |
| `getAccessControlParams(String authorityName)` | `AccessControlParams` | 获取指定权限点的数据权限参数 |
| `getAuthorities()`                   | `List<? extends OuroborosGrantedAuthority>` | 获取聚合后的权限列表 |

## 它和 Spring Authentication 的区别

除了继承自 Spring Security 的标准能力之外，`OuroborosAuthentication` 额外强调了三类信息：

- 当前用户对象
- 当前角色集合
- 当前请求对应的数据权限参数

这也是为什么在潮汐栈里，大多数业务逻辑不会只停留在 `principal`，而会继续看用户详情和访问控制参数。

## 怎么理解这几个高频字段

### `getPrincipal()`

它回答的是“当前是谁在认证”，通常是用户标识字符串。

### `getUserDetail()`

它回答的是“当前这个认证主体对应的用户对象是什么”。如果你需要继续拿邮箱、手机号、显示名等信息，通常从这里往下走。

### `getRoles()`

它回答的是“当前用户拥有哪些角色”。这比直接看账号本身更适合做权限判断。

### `getAccessControlParams()`

它回答的是“当前请求带着什么数据访问控制参数”。如果你在做字段过滤、数据过滤或权限下推，这个方法非常关键。

## 一个常见读取方式

```javascript
var auth = AuthenticationHolder.getAuthentication()
var params = auth.getAccessControlParams('order.read')
```

如果指定权限点没有对应结果，当前实现会返回空的 `AccessControlParams`，而不是 `null`。

## 使用提醒

- `getAuthorities()` 会按权限名聚合角色权限，而不是简单原样返回每个角色的明细
- `getAccessControlParams(String authorityName)` 更适合精确查看某个权限点对应的数据范围
- 如果你在业务脚本里只是想快速拿用户 ID、过滤条件或字段范围，直接用 [脚本上下文](../../../script-context/) 里的 `AuthContext` 通常会更顺手

## 下一步看哪里

- 想看脚本里怎么拿这个对象：看 [脚本上下文](../../../script-context/)
- 想理解访问控制参数：看 [权限与访问控制](../../../../../guide/advance/authority-and-access-control)
- 想理解账号、角色和员工的关系：看 [用户角色权限](../../../../../guide/module/rbac/)
