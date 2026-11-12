# OuroborosAuthentication

当前认证信息接口，Java 类型为 `com.ouroboros.security.authentication.OuroborosAuthentication`。脚本和表达式通过 `AuthenticationHolder.getAuthentication()` 获取。

## 方法

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `getPrincipal()` / `getName()` | `String` | 当前认证主体标识 |
| `isAuthenticated()` | `boolean` | 是否已认证 |
| `getUserDetail()` | `User?` | 用户详情 |
| `getRoles()` | `List<? extends Role>` | 角色 |
| `getAuthorities()` | `List<? extends OuroborosGrantedAuthority>` | 有效权限 |
| `getAccessControlParams()` | `AccessControlParams` | 当前请求的数据权限参数 |
| `getAccessControlParams(String authorityName)` | `AccessControlParams` | 指定权限点的数据范围；被拒绝时抛出授权异常 |
| `getAuthorizationDecision()` / `getAuthorizationDecision(String)` | `AuthorizationDecision` | 当前或指定权限点的允许 / 拒绝结果 |

无登录态时获取到匿名认证对象，不能仅用对象非空判断已登录。用户详情可能为空。

## 脚本示例

```groovy
def auth = AuthenticationHolder.getAuthentication()
if (!auth.isAuthenticated()) {
    Exceptions.business('请先登录')
}
def operatorId = auth.getPrincipal()
def params = auth.getAccessControlParams('orders.read')
```

示例要求已定义并授予 `orders.read` 权限。读取指定权限的数据范围时，授权失败会抛出异常；空字段列表或空过滤条件不能作为“拥有权限”的判断依据。

## Java 中区分允许和拒绝

```java
import com.ouroboros.security.authorize.AuthorizationDecision;

var decision = authentication.getAuthorizationDecision("orders.read");
if (decision instanceof AuthorizationDecision.Permit permit) {
    var params = permit.params();
    // 按当前接口契约使用字段范围和过滤条件。
} else if (decision instanceof AuthorizationDecision.Deny deny) {
    throw new IllegalStateException("授权被拒绝：" + deny.reason());
}
```

`authentication` 是调用方取得的认证对象。普通业务脚本只读用户 ID 或过滤条件时，也可使用 [AuthContext](../../../script-context/#authenticationholder)。权限配置见 [权限与访问控制](../../../../../fusion-development/authority-subject-and-access-control-design)。
