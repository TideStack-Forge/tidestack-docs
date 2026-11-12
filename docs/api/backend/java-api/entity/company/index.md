# Company

公司组织节点，Java 类型为 `com.ouroboros.organizationstructure.Company`。脚本通过 `OrganizationHolder.getCompany()` 获取当前公司，未绑定时为 `null`。

## 方法

| 方法 | 返回值 | 含义 |
| --- | --- | --- |
| `getId()` / `getName()` | `String` | 公司 ID、名称 |
| `getType()` | `String` | 组织节点类型 |
| `getDescription()` | `String` | 说明 |
| `getLeaderEmployee()` / `getLeaderEmployeeDetail()` | `String?` / `Employee?` | 负责人员工 ID 和详情 |
| `getParent()` / `getParentDetail()` | `String?` / `OrganizationNode?` | 上级组织 |
| `getAdminLevel()` / `getCategory()` | `String?` / `NodeCategory` | 行政级别、节点分类 |

## 脚本示例

```groovy
def company = OrganizationHolder.getCompany()
if (company == null) {
    Exceptions.business('当前用户未绑定公司')
}
def companyId = company.getId()
def leader = company.getLeaderEmployeeDetail()
logger.info('公司={}，负责人已设置={}', company.getName(), leader != null)
```

顶层公司没有上级组织，负责人详情也可能为空。公司 ID、员工 ID 和登录用户 ID 属于不同对象，应按目标接口要求传入。

部门和员工方法见 [Department](../department/) 与 [Employee](../employee/)，维护组织数据见 [组织架构管理](../../../../../guide/module/organization/)。
