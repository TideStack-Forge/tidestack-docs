# TypedDataModelCenter

`TypedDataModelCenter` 用来从 Java 类型反查对应的数据模型，并返回 `TypedDataModel` 或延迟版本的 `DeferredTypedDataModel`。

它更适合后端 Java 代码场景。当你已经有领域对象类，且不想再手动处理 `Record` 或 `Map<String, Object>` 时，这个入口会比 `DataModelCenter` 更顺手。

## 模型名如何推断

当前实现会按下面顺序确定模型名：

1. 如果类上有 `@Model(fullName = "...")`，优先用 `fullName`
2. 否则退回到类的 `simpleName`

## 立即获取

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getDataModel(Class<T> clazz)` | `Optional<TypedDataModel<PK, T>>` | 按模型类获取 |
| `getDataModel(Class<PK> pkClass, Class<T> clazz)` | `Optional<TypedDataModel<PK, T>>` | 显式带主键类型获取 |

## 延迟获取

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getDeferredDataModel(Class<T> clazz)` | `DeferredTypedDataModel<PK, T>` | 获取延迟代理 |
| `getDeferredDataModel(Class<PK> pkClass, Class<T> clazz)` | `DeferredTypedDataModel<PK, T>` | 显式带主键类型获取延迟代理 |

## DeferredTypedDataModel 的当前行为

延迟代理有两个使用特点：

1. `*Async` 方法会返回 `CompletableFuture`
2. 同步方法在模型尚未就绪时会抛出 `IllegalStateException`

当前代码里，这个代理更适合模型可能晚于调用方初始化、但你又希望先把依赖关系挂上的场景。

## 常见使用方式

### 立即获取

适合模型已经完成刷新、当前代码又希望立刻开始查询的场景。

```java
var orderModel = TypedDataModelCenter.getDataModel(Order.class);
```

如果你的模型类上写了：

```java
@Model(fullName = "crm.Order")
```

那就会优先按 `crm.Order` 查找；否则退回到类名 `Order`。

### 延迟获取

适合启动阶段存在依赖环、或者模型刷新晚于当前组件初始化的场景。

```java
DeferredTypedDataModel<String, Order> orderModel =
    TypedDataModelCenter.getDeferredDataModel(Order.class);
```

这时：

- `getAsync(...)`、`queryAsync(...)` 等异步方法会返回 `CompletableFuture`
- 同步方法只有在模型已就绪后才能安全调用

## 使用建议

- 在 Spring Bean 中依赖固定 Java `@Model` 类型时，优先用构造器注入 `TypedDataModel<PK, M>`
- 模型已经确定可用、且当前代码不在 Spring 注入链路里时，使用 `getDataModel(...)`
- 需要等待模型刷新或延迟注册时，再考虑 `getDeferredDataModel(...)`
- 如果你当前真正需要的是按名字动态查模型，而不是按类型查，继续看 [DataModelCenter](../data-model-center/)

## 常见坑

- 类上没配 `@Model(fullName = "...")`，但你又误以为它会自动映射到带命名空间的模型名。
- 使用延迟模型时直接调用同步方法，结果在模型未就绪时抛出 `IllegalStateException`。
- 已经只需要弱结构查询，却仍然强行走强类型模型，最后反而多了一层对象映射成本。

## 下一步看哪里

- 想看强类型模型接口：看 [TypedDataModel](../typed-data-model/)
- 想看原始模型中心：看 [DataModelCenter](../data-model-center/)
