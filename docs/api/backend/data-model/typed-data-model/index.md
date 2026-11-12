# TypedDataModel

`com.ouroboros.data.model.TypedDataModel<PK, M>` 在 Java 中直接读写模型对象。`PK` 是主键类型，`M` 是模型类；查询返回 `M` 或 `List<M>`。

## 方法

| 方法 | 返回值 |
| --- | --- |
| `getDataModel()` | `DataModel` |
| `insert(M data)` | `Try<M>` |
| `batchInsert(Collection<M> rows)` | `Try<List<M>>` |
| `get(PK id)` / `get(PK id, Map<String, Object> statement)` | `Try<M>` |
| `query(Collection<PK> ids)` | `Try<List<M>>` |
| `query(Map<String, Object> statement)` | `Try<List<M>>` |
| `query()` | `TypedDataModelQuery<PK, M>` |
| `count(Map<String, Object> where)` | `Try<Long>` |
| `update(PK id, M data)` | `Try<Long>` |
| `update(id / ids / where, Map<String, Object> patch)` | `Try<Long>` |
| `delete(id / ids / where)` | `Try<Long>` |

支持 `query(select, where[, orderBy[, offset, limit]])`：`select` 为 `Collection<String>`，`where` 为 Map，`orderBy` 为字符串，例如 `"id ASC"`。这与 `DataModel` 便捷重载使用 Map 排序的形式不同。

## Spring 注入

模型类被 `@DataModelScan` 扫描且恰有一个 `@PrimaryKey` 字段时，可按泛型注入。示例假设应用已有 `Order` 模型类，主键为 `String`：

```java
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.ouroboros.data.model.TypedDataModel;

@Service
public class OrderService {
    private final TypedDataModel<String, Order> orders;

    public OrderService(TypedDataModel<String, Order> orders) {
        this.orders = orders;
    }

    public List<Order> findOpenOrders() {
        return orders.query(Map.of(
            "where", Map.of("status", "OPEN"), "limit", 20
        )).get();
    }

    public long closeOrder(String id) {
        return orders.update(id, Map.of("status", "CLOSED")).get();
    }
}
```

注入时模型可以尚未就绪；此时同步读写方法会抛出 `IllegalStateException`，应在模型就绪后调用。没有主键或有多个主键字段的类不能通过上述方式精确注入。

## 返回结果与插件

读写操作返回 `Try`。示例使用 `.get()`，失败时抛出原异常；需要自行处理失败时保留错误原因。字段局部修改使用 Map patch，避免把无意变更的对象字段一起提交。

`withPlugins(...)`、`withoutPlugins(...)`、`withoutPlugins()` 和 `hasPlugin(name)` 与 [DataModel](../data-model/) 对应；插件会影响校验和读写策略，不能仅为绕过错误而移除。

在非 Spring 代码中按类获取模型，见 [TypedDataModelCenter](../typed-data-model-center/)；动态结构访问见 [DataModel](../data-model/)。
