# TypedDataModel

`TypedDataModel<PK, M>` 是 `DataModel` 的强类型版本，适合在 Java 代码里直接对领域对象 `M` 做读写，而不是手动操作 `Map<String, Object>` 和 `Record`。

## 先理解它和 DataModel 的关系

- `DataModel`：更偏弱结构、通用运行时
- `TypedDataModel`：更偏强类型、后端代码友好

两者能力范围非常接近，只是返回类型从 `Record / RecordList` 变成了 `M / List<M>`。

## 什么时候优先用它

- 你已经有领域对象类或 typed model 类
- 你在写后端 Java 代码，而不是脚本
- 你希望把查询结果直接映射成对象，而不是再自己拆 `Record`

如果模型名是动态的、结构又不固定，通常还是 [DataModel](../data-model/) 更灵活。

## 基础入口

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getDataModel()` | `DataModel` | 拿到底层原始 `DataModel` |

## 写入相关

| 方法族 | 返回值类型 | 说明 |
| ------ | ---------- | ---- |
| `insert(M data)` | `Try<M>` | 插入单条模型对象 |
| `batchInsert(Collection<M> dataList)` | `Try<List<M>>` | 批量插入 |
| `delete(id / ids / where)` | `Try<Long>` | 删除记录 |
| `update(id, M data)` | `Try<Long>` | 用完整对象更新 |
| `update(id / ids / where, Map<String, Object> data)` | `Try<Long>` | 用字段 patch 更新 |

## 查询相关

| 方法族 | 返回值类型 | 说明 |
| ------ | ---------- | ---- |
| `count(Map<String, Object> where)` | `Try<Long>` | 统计数量 |
| `get(PK id)` | `Try<M>` | 按主键取单条 |
| `get(PK id, Map<String, Object> statement)` | `Try<M>` | 按主键并附加语句 |
| `query(Collection<PK> ids)` | `Try<List<M>>` | 批量按主键查询 |
| `query(Map<String, Object> statement)` | `Try<List<M>>` | 完整语句查询 |
| `query(select, where, orderBy, offset, limit)` | `Try<List<M>>` | 便捷查询重载 |

要注意一点：当前 `TypedDataModel` 的 `orderBy` 参数是 `String`，不像 `DataModel` 的便捷重载那样使用 `Map<String, Object>`。

## 插件切换

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `withPlugins(...)` | `TypedDataModel<PK, M>` | 追加插件 |
| `withoutPlugins(...)` | `TypedDataModel<PK, M>` | 去掉插件 |
| `hasPlugin(String name)` | `boolean` | 判断插件是否启用 |

## 常见使用路径

1. 优先通过 Spring 注入 `TypedDataModel<PK, M>`，或通过 [TypedDataModelCenter](../typed-data-model-center/) 按类型获取模型。
2. 用 `get(...)`、`query(...)`、`insert(...)` 直接处理 `M`。
3. 需要底层弱结构能力时，再从 `getDataModel()` 下钻到原始模型。

## Spring 注入

被 `@DataModelScan` 扫描到的 Java `@Model` 类，如果恰好有一个 `@PrimaryKey` 字段，会自动注册成可按泛型匹配的 Spring Bean：

```java
@Service
class OrderService {
  private final TypedDataModel<String, Order> orders;

  OrderService(TypedDataModel<String, Order> orders) {
    this.orders = orders;
  }
}
```

注入阶段不要求底层 `DataModel` 已完成刷新。模型刷新前注入的是延迟代理；这时同步方法会抛出 `IllegalStateException`，刷新完成后会委托到底层模型。没有主键或多个主键字段的 typed model 不会注册为可精确注入的 `TypedDataModel<PK, M>` Bean。

## 使用提醒

- 查询、写入等方法同样大多返回 `Try`，不要忽略失败分支。
- `orderBy` 在当前接口里是 `String`，和部分弱结构 API 的写法不完全一样。
- 需要按名字动态取模型时，不要硬走强类型，直接转到 [DataModelCenter](../data-model-center/) 会更自然。
- 如果业务组件在初始化阶段就调用模型同步方法，要确认模型刷新已经完成；否则改用异步调用或延后到刷新后执行。

## 下一步看哪里

- 想看弱结构版本：看 [DataModel](../data-model/)
- 想看获取入口：看 [TypedDataModelCenter](../typed-data-model-center/)
