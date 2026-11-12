# Department

部门组织节点，Java 类型为 `com.ouroboros.organizationstructure.Department`。脚本通过 `OrganizationHolder.getDepartment()` 获取，未绑定时为 `null`。

## 方法

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `getId()` / `getName()` / `getType()` | `String` | ID、名称、节点类型 |
| `getDescription()` | `String` | 说明 |
| `getLeaderEmployee()` / `getLeaderEmployeeDetail()` | `String?` / `Employee?` | 负责人 ID、详情 |
| `getParent()` / `getParentDetail()` | `String?` / `OrganizationNode?` | 上级组织，可为公司或部门 |
| `getParentDepartmentDetail()` | `Department?` | 上级为部门时返回部门，否则为 `null` |
| `getCompanyDetail()` | `Company?` | 所属公司 |
| `getAdminLevel()` / `getCategory()` | `String?` / `NodeCategory` | 行政级别、节点分类 |

## 脚本示例

```groovy
def department = OrganizationHolder.getDepartment()
if (department == null) {
    Exceptions.business('当前用户未绑定部门')
}
def parent = department.getParentDepartmentDetail()
def company = department.getCompanyDetail()
def parentName = parent == null ? null : parent.getName()
```

部门直接挂在公司下时，`getParentDepartmentDetail()` 返回 `null`。遍历完整组织树使用 `getParentDetail()`，只处理部门层级时使用 `getParentDepartmentDetail()`。

负责人是员工身份，不能直接替代权限角色。相关对象见 [Company](../company/) 和 [Employee](../employee/)。
