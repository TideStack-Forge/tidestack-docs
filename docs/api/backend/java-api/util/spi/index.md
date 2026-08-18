# SPI

`SPI` 是平台里统一的 Java SPI 加载工具，用来读取 `META-INF/services` 注册的实现，并按 `@Priority` 做排序和缓存。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 什么时候看这页

- 你在做平台扩展点，例如 `ScriptContextContributor`、`NodeBuilder`、序列化器或装饰器
- 你想按优先级选择默认实现
- 你想避免反复 `ServiceLoader.load(...)`

## 先理解排序规则

当前实现按 `jakarta.annotation.Priority` 排序：

- `getSorted*`：优先级低的在前
- `getReversed*`：优先级高的在前
- `getPrimaryService` / `getCachedPrimaryService`：取优先级最高的那个

没有 `@Priority` 时，按 `0` 处理。

## 基础加载

| 方法 | 说明 |
| ---- | ---- |
| `getServiceStream(Class<T> serviceClass)` | 获取原始 SPI 实例流 |
| `getSortedServiceStream(Class<T> serviceClass)` | 按优先级升序 |
| `getReversedServiceStream(Class<T> serviceClass)` | 按优先级降序 |

## 缓存加载

| 方法 | 说明 |
| ---- | ---- |
| `getCachedServiceStream(...)` | 获取缓存后的实例流 |
| `getCachedSortedServiceStream(...)` | 缓存 + 升序 |
| `getCachedReversedServiceStream(...)` | 缓存 + 降序 |
| `getCachedPrimaryService(...)` | 直接取缓存中的最高优先级实例 |

如果某个 SPI 在运行时会频繁读取，优先用 `getCached*` 会更合适。

## 泛型过滤

`SPI` 还支持按 1~3 个泛型参数过滤实现：

| 方法形态 | 说明 |
| -------- | ---- |
| `getServiceStream(serviceClass, p1)` | 按 1 个泛型参数过滤 |
| `getServiceStream(serviceClass, p1, p2)` | 按 2 个泛型参数过滤 |
| `getServiceStream(serviceClass, p1, p2, p3)` | 按 3 个泛型参数过滤 |
| `getCachedServiceStream(...)` 的同类重载 | 缓存版本 |

当前缓存版本的泛型过滤内部会结合 `GenericTypeUtil` 判断真实泛型类型。

## 直接取主实现

| 方法 | 说明 |
| ---- | ---- |
| `getPrimaryService(Class<T> serviceClass)` | 取当前最高优先级实例 |
| `getCachedPrimaryService(Class<T> serviceClass)` | 取缓存中的最高优先级实例 |

如果没有任何实现，这两个方法都会返回 `null`。

## 常见使用方式

### 做平台扩展点加载

典型场景包括：

- `ExpressionContextContributor`
- `ScriptContextContributor`
- `NodeBuilder`
- `ObjectMapperConfigurator`

### 选默认实现

当一个扩展点允许多个实现并存，但运行时需要选出一个“主实现”时，可以配合 `@Priority` 和 `getPrimaryService(...)` 使用。

## 使用建议

- 平台扩展点优先用 `SPI` 统一加载，不要各处手写 `ServiceLoader`
- 需要默认实现时，用 `getPrimaryService`
- 需要高频调用时，用 `getCached*`

## 使用提醒

- 缓存结果会保留在当前进程内，没有单独的缓存失效接口；适合稳定扩展点，不适合指望运行时热插拔后立刻刷新。
- `getSorted*` 是低优先级在前，`getReversed*` 才是高优先级在前。
- 做扩展时，除了 Java 代码本身，还要记得补 `META-INF/services/<接口全限定名>` 注册文件。

## 下一步看哪里

- 想看数据模型插件：看 [PluginDescriptor](../../../data-model/plugin-descriptor/)
