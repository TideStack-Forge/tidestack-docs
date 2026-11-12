---
sidebar_position: 4
title: 表达式上下文
---

# 表达式上下文

在支持表达式的配置位置使用 `${...}` 计算一个值。表达式可以读取当前用户、组织信息、日期工具和编码生成器；多步查询或写入请使用 [脚本](../script-context/)。

## 可用对象

| 对象 | 常用调用 | 结果 |
| --- | --- | --- |
| `AuthenticationHolder` | `getPrincipal()`、`getAuthentication()` | 当前认证主体或认证对象 |
| `AuthContext` | `getUserId()`、`getUserDetail()`、`getFilters()` | 当前用户和数据权限信息 |
| `OrganizationHolder` / `OrganizationContext` | `getEmployeeId()`、`getDepartmentId()`、`getCompanyId()` | 员工、部门或公司 ID；未绑定时为 `null` |
| `Dates` | 日期和时间工具方法 | 见 [Dates](../java-api/util/dates/) |
| `Converter` | 类型转换方法 | 见 [Converter](../java-api/util/converter/) |
| `codeGen` | `get(...)`、`peek(...)` | 编码字符串；生成器不可用时可能为 `null` |

认证、组织和编码能力需要在目标应用中可用。业务变量由表达式所在位置提供，例如字段默认值中的 `$record` 表示当前记录；不能假定所有表达式都能访问同一组业务变量。

```text
${AuthContext.getUserId()}
${OrganizationHolder.getDepartmentId()}
${Converter.toInteger('20')}
```

认证对象和组织对象的方法详见 [脚本上下文](../script-context/#authenticationholder) 和 [组织上下文](../script-context/#organizationholder)。

## codeGen

| 方法 | 行为 |
| --- | --- |
| `get(String template)` | 生成编码并递增序列号 |
| `get(String template, Map context)` | 使用上下文计算模板并递增序列号 |
| `peek(String template)` | 预览编码，不递增序列号 |
| `peek(String template, Map context)` | 使用上下文预览，不递增序列号 |

### 编码模板

| 写法 | 含义 |
| --- | --- |
| `{yyyyMMdd}` | 日期片段，使用 Java 日期格式 |
| `<0001>` | 四位序列号，从 1 开始，步长为 1 |
| `<0001,2>` | 四位序列号，从 1 开始，步长为 2 |
| `<order:0001>` | 使用名为 `order` 的序列器 |
| `${...}` | 使用传入上下文计算模板片段 |
| `<${...}:0001>` | 根据表达式确定序列器名 |

未指定序列器名时，模板中的其他片段共同决定序列器。日期或上下文片段变化可能使用不同序列。

字段默认值示例：

```text
${codeGen.get('ORD-{yyyyMMdd}-<0001>', $record)}
```

在日期为 2026-11-12、当日序列尚未使用时，结果形如 `ORD-20261112-0001`。重复求值会消耗序列号；页面预览应使用 `peek`，预览结果不能视为已占用的唯一编码。

## 空值处理

部分属性读取在属性不存在时会返回 `null`。涉及必填值时，应显式提供缺省值或在脚本中校验，不要仅凭表达式没有报错就判断字段存在。

```text
${OrganizationHolder.getDepartmentId() ?: 'unassigned'}
```

表达式编写步骤见 [表达式教程](../../../guide/tutorial/expression/)。
