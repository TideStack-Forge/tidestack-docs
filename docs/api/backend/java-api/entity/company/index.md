# Company

`Company` 表示组织架构中的公司节点。它本身没有额外扩展方法，主要复用 `OrganizationNode` 的通用字段；在脚本上下文里，`OrganizationHolder.getCompany()` 返回的就是这个接口。

## 什么时候看这页

- 你在脚本或表达式里拿到了公司对象，想确认它有哪些稳定字段
- 你在看组织链路，不确定公司节点和部门节点的共同边界
- 你想判断某个字段是不是公司对象直接提供的

## 核心字段

| 方法                      | 返回值类型 | 说明 |
| ------------------------- | ---------- | ---- |
| `getId()`                 | `String`   | 公司 ID |
| `getName()`               | `String`   | 公司名称 |
| `getType()`               | `String`   | 组织节点类型 |
| `getLeaderEmployee()`     | `String`   | 负责人员工 ID |
| `getLeaderEmployeeDetail()` | `Employee?` | 负责人详情 |
| `getDescription()`        | `String`   | 描述信息 |
| `getParent()`             | `String`   | 上级节点 ID |
| `getParentDetail()`       | `OrganizationNode?` | 上级节点详情 |
| `getAdminLevel()`         | `String?`  | 行政级别，可为空 |
| `getCategory()`           | `NodeCategory` | 节点分类 |

## 怎么理解这几个字段

- `getParent()` / `getParentDetail()` 用来表达公司在组织树中的层级关系，适合多法人、多集团场景
- `getLeaderEmployee()` 和 `getLeaderEmployeeDetail()` 只是组织负责人信息，不等于登录账号或角色定义
- `getCategory()` 是组织节点分类，默认是结构性节点

## 一个常见读取方式

```javascript
var company = OrganizationHolder.getCompany()
if (company != null) {
  logger.info('company={}, leader={}', company.getName(), company.getLeaderEmployee())
}
```

顶层公司节点的 `getParentDetail()` 可能为 `null`，这类场景要记得判空。

## 这页不包含什么

`Company` 不直接提供员工列表、部门列表或岗位列表。如果你要处理这些关系，通常要继续结合：

- [Department](../department/)
- [Employee](../employee/)
- [组织架构管理](../../../../../guide/module/organization/)

## 下一步看哪里

- 想看部门对象：看 [Department](../department/)
- 想看员工对象：看 [Employee](../employee/)
- 想看脚本里怎么拿公司：看 [脚本上下文](../../../script-context/)
