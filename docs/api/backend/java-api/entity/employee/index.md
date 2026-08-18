# Employee

`Employee` 表示组织架构中的员工实体，也是脚本、审批、通知和组织上下文里最常遇到的业务身份对象之一。

它不等于登录账号本身，但经常会和用户账号关联使用。

## 什么时候看这页

- 你在脚本里拿到了员工对象，想确认有哪些稳定字段
- 你需要区分“员工身份”和“用户账号”
- 你要处理员工所属部门、公司、任职或主岗位

## 基础属性

| 方法          | 返回值类型 | 说明 |
| ------------- | ---------- | ---- |
| `getId()`     | `String`   | 员工 ID |
| `getName()`   | `String`   | 员工姓名 |
| `getType()`   | `String`   | 员工类型，默认返回 `employee` |
| `getGender()` | `String`   | 性别 |
| `getMobile()` | `String`   | 手机号 |
| `getEmail()`  | `String`   | 邮箱 |
| `getBirthday()` | `String` | 生日 |

## 和用户账号的关系

| 方法              | 返回值类型 | 说明 |
| ----------------- | ---------- | ---- |
| `getUser()`       | `String?`  | 关联的用户标识，没有关联时返回 `null` |
| `getUserDetail()` | `User?`    | 关联的用户详情，没有关联时返回 `null` |

这也是为什么“员工”和“用户”要分开理解：

- 员工：业务身份
- 用户：登录账号

一个员工通常会关联一个用户，但这不是强制关系。

## 组织关系

| 方法                  | 返回值类型 | 说明 |
| --------------------- | ---------- | ---- |
| `getDepartment()`     | `String?`  | 当前主部门 ID；默认从主岗位推导 |
| `getDepartmentDetail()` | `Department?` | 当前主部门详情 |
| `getCompanyDetail()`  | `Company`  | 所属公司详情 |
| `getOrgChain()`       | `List<OrganizationNode>` | 当前员工沿组织树向上的链路 |

如果你只是想知道员工当前挂在哪个部门，优先看 `getDepartment()` 或 `getDepartmentDetail()`；如果你要做“逐级向上找组织节点”的逻辑，再看 `getOrgChain()`。

## 任职与岗位

`Employee` 当前模型同时兼容“直接挂部门”和“通过任职关联岗位”两种组织方式。

| 方法                      | 返回值类型 | 说明 |
| ------------------------- | ---------- | ---- |
| `getAppointments()`       | `List<Appointment>` | 获取全部任职，默认可为空列表 |
| `getCurrentAppointments()` | `List<Appointment>` | 获取当前有效任职 |
| `getPrimaryAppointment()` | `Appointment?` | 获取主岗任职 |
| `getPrimaryPosition()`    | `Position?` | 获取主岗位 |

如果你的项目只是简单按部门管理人员，很多时候只会用到部门相关方法；如果你们已经引入了岗位、代理岗、多任职，这组方法就会更重要。

## 一个常见读取方式

```javascript
var employee = OrganizationHolder.getEmployee()
if (employee != null) {
  logger.info('employee={}, department={}', employee.getName(), employee.getDepartment())
}
```

如果你要沿组织树逐级向上找部门和公司，可以直接从 `getOrgChain()` 下手。

## 使用提醒

- `getDepartment()` 是一个便捷计算结果，不一定是底层独立存储字段
- `getUserDetail()` 可能为空，脚本里不要默认它一定存在
- `getAppointments()`、`getPrimaryPosition()` 这类方法更适合高级组织场景，不是每个项目都会用到

## 下一步看哪里

- 想看用户和权限对象：看 [OuroborosAuthentication](../ouroboros-authentication/)
- 想看部门对象：看 [Department](../department/)
- 想看组织管理操作层说明：看 [组织架构管理](../../../../../guide/module/organization/)
- 想看脚本里怎么拿当前员工：看 [脚本上下文](../../../script-context/)
