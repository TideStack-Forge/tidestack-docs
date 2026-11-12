# DataModel

`com.ouroboros.data.model.DataModel` 用 Map 写入模型数据，并返回 `Record` 或 `RecordList`。通过 [DataModelCenter](../data-model-center/) 获取实例。

## 数据读写

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `insert(Map<String, Object> data)` | `Try<Record>` | 插入单条 |
| `insertOrUpdate(Map<String, Object> data)` | `Try<Record>` | 插入或更新 |
| `batchInsert(List<Map<String, Object>> rows)` | `Try<RecordList>` | 批量插入 |
| `batchInsertOrUpdate(List<Map<String, Object>> rows)` | `Try<RecordList>` | 批量插入或更新 |
| `update(id / ids / where, Map<String, Object> data)` | `Try<Long>` | 更新字段，返回影响行数 |
| `delete(id / ids / where)` | `Try<Long>` | 删除，返回影响行数 |
| `get(Object id)` | `Try<Record>` | 按主键读取 |
| `get(Object id, Map<String, Object> statement)` | `Try<Record>` | 按主键读取并指定查询选项 |
| `count(Map<String, Object> where)` | `Try<Long>` | 统计符合条件的记录 |
| `query(List<?> ids)` | `Try<RecordList>` | 按主键列表查询 |
| `query(Map<String, Object> statement)` | `Try<RecordList>` | 按完整 DSL 查询 |
| `query()` | `DataModelQuery` | 创建 Java 查询构建器 |

`where` 表示条件本身，例如 `Map.of("status", "OPEN")`；`statement` 表示包含 `where/select/order/skip/limit` 等键的查询语句。二者不能混用。

还支持 `query(select, where[, orderBy[, offset, limit]])`，其中 `select` 是 `List<String>`，`orderBy` 是 `Map<String, Object>`。复杂查询见 [查询 DSL](../../data-query-dsl/)。

## 查询与更新示例

假设 `crm.Order` 已加载，且含有 `id/status/amount` 字段：

```java
import java.util.List;
import java.util.Map;
import com.ouroboros.data.model.DataModelCenter;

var orders = DataModelCenter.getDataModel("crm.Order")
    .orElseThrow(() -> new IllegalStateException("订单模型不可用"));
var rows = orders.query(Map.of(
    "select", List.of("id", "amount"),
    "where", Map.of("status", "OPEN"),
    "order", Map.of("id", "ASC"),
    "skip", 0,
    "limit", 20
)).get();
long updated = orders.update("order-001", Map.of("status", "CLOSED")).get();
```

`.get()` 在失败时抛出异常。若需要组合多次调用，可使用 `Try.map/flatMap`；不要忽略失败后继续执行后续业务。条件更新和删除须传入明确的目标条件，避免使用空条件。

## 模型和字段信息

| 方法 | 返回值 |
| --- | --- |
| `getNamespace()` / `getName()` / `getFullName()` | `String`，名称空间、模型名和全名 |
| `getLabel()` / `getDescription()` | `String`，标题和说明 |
| `getFormatVersion()` / `getSource()` / `getRawName()` | `String`，格式、来源和原始名称 |
| `getFields()` / `getField(String name)` | `List<DataModelField>` / `Optional<DataModelField>` |
| `getPrimaryKeys()` | `List<DataModelField>` |
| `getUniqueConstraints()` | `List<DataModelUniqueConstraintMeta>` |
| `getExtraProps()` / `getExtraProp(String name)` | `Map<String, Object>` / `Optional<Object>` |
| `getExtraProp(Class<T> type, String name)` | `Optional<T>` |

迁移、适配器和主键扩展还可读取 `getMigrationStrategy()`、`getAdapter()`、`getDataStation()` 和 `getPrimaryKeyGenerator()`。常规业务读写无需直接操作这些对象。

## 插件

`withPlugins(...)` 返回附加插件后的模型，`hasPlugin(name)` 检查插件。`withoutPlugins(...)` 和无参 `withoutPlugins()` 分别移除指定或全部插件；移除校验、权限或删除策略插件会改变读写行为，仅在明确了解影响的扩展场景使用。

插件声明见 [PluginDescriptor](../plugin-descriptor/)，强类型读写见 [TypedDataModel](../typed-data-model/)。
