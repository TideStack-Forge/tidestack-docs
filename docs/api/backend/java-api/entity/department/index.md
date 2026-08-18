# Department

`Department` 表示组织架构中的部门节点。它继承 `OrganizationNode` 的通用字段，并额外补充了“所属公司”和“上级部门”两个更适合部门场景的便捷方法。

## 什么时候看这页

- 你在脚本里拿到了部门对象，想确认当前部门能直接取哪些关系
- 你想区分 `getParentDetail()` 和 `getParentDepartmentDetail()` 的差别
- 你在写按部门处理的业务逻辑

## 核心字段

| 方法                        | 返回值类型 | 说明 |
| --------------------------- | ---------- | ---- |
| `getId()`                   | `String`   | 部门 ID |
| `getName()`                 | `String`   | 部门名称 |
| `getType()`                 | `String`   | 组织节点类型 |
| `getLeaderEmployee()`       | `String`   | 部门负责人员工 ID |
| `getLeaderEmployeeDetail()` | `Employee?` | 部门负责人详情 |
| `getDescription()`          | `String`   | 描述信息 |
| `getParent()`               | `String`   | 上级节点 ID |
| `getParentDetail()`         | `OrganizationNode?` | 上级节点详情，可能是公司也可能是部门 |
| `getAdminLevel()`           | `String?`  | 行政级别，可为空 |
| `getCategory()`             | `NodeCategory` | 节点分类 |

## Department 额外提供的方法

| 方法                        | 返回值类型 | 说明 |
| --------------------------- | ---------- | ---- |
| `getParentDepartmentDetail()` | `Department?` | 仅当上级也是部门时返回上级部门，否则返回 `null` |
| `getCompanyDetail()`        | `Company`  | 获取所属公司详情 |

## 什么时候用哪个“父级”方法

- 你只是想顺着组织树往上走：用 `getParentDetail()`
- 你明确只关心“上级部门”而不想处理公司节点：用 `getParentDepartmentDetail()`
- 你要找部门归属的公司主体：用 `getCompanyDetail()`

## 一个常见读取方式

```javascript
var department = OrganizationHolder.getDepartment()
var parentDepartment = department == null ? null : department.getParentDepartmentDetail()
```

如果当前部门直接挂在公司下面，`getParentDepartmentDetail()` 会返回 `null`，这是预期行为。

## 使用提醒

- 部门负责人信息来自组织数据，不直接等同于权限角色
- 如果你在审批、通知或数据权限逻辑里依赖部门关系，最好先确认组织架构数据已经维护完整

## 下一步看哪里

- 想看公司对象：看 [Company](../company/)
- 想看员工对象：看 [Employee](../employee/)
- 想看部门对象在脚本里怎么取：看 [脚本上下文](../../../script-context/)
