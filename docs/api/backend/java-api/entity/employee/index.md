# Employee

员工业务身份，Java 类型为 `com.ouroboros.organizationstructure.Employee`。脚本通过 `OrganizationHolder.getEmployee()` 获取。员工可以关联登录用户，两者的 ID 不应混用。

## 方法

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `getId()` / `getName()` | `String` | 员工 ID、姓名 |
| `getType()` | `String` | 默认 `employee` |
| `getGender()` / `getMobile()` / `getEmail()` / `getBirthday()` | `String` | 员工资料 |
| `getUser()` / `getUserDetail()` | `String?` / `User?` | 关联登录用户 |
| `getDepartment()` / `getDepartmentDetail()` | `String?` / `Department?` | 主部门 ID、详情 |
| `getCompanyDetail()` | `Company?` | 所属公司 |
| `getOrgChain()` | `List<OrganizationNode>` | 从所属部门或公司向上的组织链 |
| `getAppointments()` / `getCurrentAppointments()` | `List<Appointment>` | 全部任职 / 当前有效任职 |
| `getPrimaryAppointment()` / `getPrimaryPosition()` | `Appointment?` / `Position?` | 主任职 / 主岗位 |

## 脚本示例

```groovy
def employee = OrganizationHolder.getEmployee()
if (employee == null) {
    Exceptions.business('请先绑定员工信息')
}
def department = employee.getDepartmentDetail()
def userId = employee.getUser()
def employeeId = employee.getId()
```

通知的 `sendByEmployee` 参数使用 `employeeId`；需要登录用户的接口使用 `userId`。未关联用户、部门或任职时，对应详情和主岗位可能为 `null`。

组织树遍历示例：

```groovy
def chain = employee.getOrgChain()
def organizationNames = chain.collect { node -> node.getName() }
```

组织数据应保持有效的父子关系。维护方式见 [组织架构管理](../../../../../guide/module/organization/)，节点方法见 [Department](../department/) 和 [Company](../company/)。
