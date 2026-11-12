# TypedDataModelCenter

在 Java 中按模型类获取 [TypedDataModel](../typed-data-model/)。导入 `com.ouroboros.data.model.TypedDataModelCenter`。

## 方法

| 方法 | 返回值 |
| --- | --- |
| `getDataModel(Class<M> modelClass)` | `Optional<TypedDataModel<PK, M>>` |
| `getDataModel(Class<PK> pkClass, Class<M> modelClass)` | `Optional<TypedDataModel<PK, M>>` |
| `getDeferredDataModel(Class<M> modelClass)` | `DeferredTypedDataModel<PK, M>` |
| `getDeferredDataModel(Class<PK> pkClass, Class<M> modelClass)` | `DeferredTypedDataModel<PK, M>` |

模型类声明了非空 `@Model(fullName = "crm.Order")` 时按该全名查找，否则使用类的简单名称 `Order`。类上的注解负责名称映射，模型仍需在当前运行时加载。

## 获取已加载模型

以下示例假设应用已有 `Order` 类，主键类型为 `String`：

```java
import com.ouroboros.data.model.TypedDataModelCenter;

var orders = TypedDataModelCenter.getDataModel(String.class, Order.class)
    .orElseThrow(() -> new IllegalStateException("订单模型尚未加载"));
var order = orders.get("order-001").get();
```

在 Spring 服务中依赖固定模型时，也可以直接 [构造器注入 TypedDataModel](../typed-data-model/#spring-注入)。

## 模型稍后才可用

```java
import com.ouroboros.data.model.DeferredTypedDataModel;
import com.ouroboros.data.model.TypedDataModelCenter;

DeferredTypedDataModel<String, Order> orders =
    TypedDataModelCenter.getDeferredDataModel(String.class, Order.class);
```

延迟模型要求类型化模型运行时已初始化。模型就绪前，同步 `get/query/insert` 等方法抛出 `IllegalStateException`；对应的 `*Async` 方法返回 `CompletableFuture`，可等待模型就绪。不要在构造器中立即调用延迟模型的同步读写方法。

需要按动态名称获取模型时，使用 [DataModelCenter](../data-model-center/)。
