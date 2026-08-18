# DataModelCenter

`DataModelCenter` 是运行时数据模型注册中心，用来按名称读取已经加载好的 `DataModel`。

它更适合解决“我已经知道模型名，接下来要拿到模型对象”的问题，而不是负责定义模型本身。

## 方法总览

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getDataModel(String name)` | `Optional<DataModel>` | 按名称读取模型 |
| `getDataModelMap()` | `Map<String, DataModel>` | 获取当前模型映射表 |
| `refresh()` | `void` | 重新扫描数据站并刷新模型注册表 |

## 名称注册规则

当前实现里，`refresh()` 会把每个模型同时注册成两类 key：

1. `模型全名`
2. `数据站名:模型全名`

例如：

- `crm.Order`
- `main:crm.Order`

如果多个数据站里出现同名模型，第二种写法更稳妥。

## 常见使用方式

### 在脚本里动态取模型

`DataModelCenter` 已被注入到脚本上下文，最常见的写法类似：

```javascript
var orderModel = DataModelCenter.get('main:crm.Order')
var orders = orderModel == null ? null : orderModel.query({ where: { status: 'OPEN' } })
```

### 在 Java 代码里按名称取模型

适合模型名来自配置、请求参数或运行时映射表的场景。

如果你已经有明确的 Java 类型，通常转向 [TypedDataModelCenter](../typed-data-model-center/) 会更顺。

## 其他实现细节

- 内部使用大小写不敏感的 `TreeMap`
- `getDataModelMap()` 返回的是只读视图
- 注册表不会自动增量刷新，只有调用 `refresh()` 后新模型映射才会生效

## 使用提醒

- `getDataModel(...)` 返回 `Optional<DataModel>`，脚本上下文里暴露的是一个更方便的 `get(String)` 包装。
- 如果你在不同数据站里维护了同名模型，尽量统一使用 `数据站名:模型全名`，比只写全名更稳。
- `refresh()` 会重新扫描 `DataStationCenter`，更适合模型刷新链路，而不是业务代码里高频调用。

## 下一步看哪里

- 想看脚本里的同名能力：看 [脚本上下文](../../script-context/)
- 想看模型接口本身：看 [DataModel](../data-model/)
