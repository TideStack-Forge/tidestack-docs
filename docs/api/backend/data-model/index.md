---
sidebar_position: 2
title: 数据模型 API
---

# 数据模型 API

通过数据模型读取和写入应用数据。脚本或动态模型使用 `DataModel`；Java 中已有模型类时使用 `TypedDataModel<PK, M>`。

## 选择接口

| 需求 | 接口 |
| --- | --- |
| 按模型名称取模型 | [DataModelCenter](./data-model-center/) |
| 按 Java 模型类取模型 | [TypedDataModelCenter](./typed-data-model-center/) |
| 用 Map 写入、读取 Record | [DataModel](./data-model/) |
| 用 Java 对象读写 | [TypedDataModel](./typed-data-model/) |
| 检查运行时字段或计算默认值 | [DataModelField](./data-model-field/) |
| 读取或构建模型定义 | [DataModelMeta](./data-model-meta/) · [DataModelFieldMeta](./data-model-field-meta/) |
| 声明模型插件 | [PluginDescriptor](./plugin-descriptor/) |

## 脚本示例

假设当前应用已加载 `crm.Order` 模型，并包含 `id`、`status` 和 `amount` 字段：

```groovy
def orders = DataModelCenter.get('crm.Order')
if (orders == null) {
    Exceptions.business('订单模型尚未加载')
}
def rows = orders.query([
    select: ['id', 'amount'],
    where: [status: 'OPEN'],
    limit: 20
]).get()
rows
```

脚本中的 `DataModelCenter.get(...)` 返回模型或 `null`；Java 的 `DataModelCenter.getDataModel(...)` 返回 `Optional`。多数据站中有同名模型时，使用 `数据站名:模型全名`。

## Java 示例

```java
import java.util.Map;
import com.ouroboros.data.model.DataModelCenter;

var orders = DataModelCenter.getDataModel("crm.Order")
    .orElseThrow(() -> new IllegalStateException("订单模型尚未加载"));
var rows = orders.query(Map.of(
    "where", Map.of("status", "OPEN"),
    "limit", 20
)).get();
```

读写结果通常是 `Try<T>`，`.get()` 会在失败时抛出异常。查询 DSL 的字段名使用模型字段名；筛选、分页、排序和关联写法见 [查询 DSL](../data-query-dsl/)。

模型定义和运行时数据是不同对象：修改 `DataModelMeta` 不会直接修改已加载模型或数据库。建模方式见 [数据模型](../../../concepts/data-model/)，接口授权和数据权限见 [权限与访问控制](../../../fusion-development/authority-subject-and-access-control-design)。
