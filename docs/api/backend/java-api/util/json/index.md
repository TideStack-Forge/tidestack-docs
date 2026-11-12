# Json

Java JSON 解析与序列化工具，导入 `com.ouroboros.util.Json`。需要保留错误原因时，使用 `tryTo*` 方法。

## 方法与失败行为

| 便捷方法 | 失败结果 | 保留错误的方法 |
| --- | --- | --- |
| `toJsonString(Object)` | 空字符串 | `tryToJsonString` → `Try<String>` |
| `toPrettyJsonString(Object)` | 空字符串 | `tryToPrettyJsonString` → `Try<String>` |
| `toMap(CharSequence)` | 空 Map | `tryToMap` → `Try<Map<String, Object>>` |
| `toList(CharSequence)` | 空 List | `tryToList` → `Try<List<Object>>` |
| `toJsonBag(CharSequence)` | `JsonBag.empty()` | `tryToJsonBag` → `Try<JsonBag>` |
| `toBean(Class<T>, CharSequence)` | `null` | `tryToBean` → `Try<T>` |

便捷方法的空结果不能区分“解析失败”和“合法空数据”。接口输入、模型资源或配置校验应使用 `tryTo*` 并处理失败，或通过 `.get()` 抛出异常。

## 解析与序列化

```java
import java.util.Map;
import com.ouroboros.util.Json;

Map<String, Object> order = Json.tryToMap("{\"id\":\"order-001\",\"amount\":100}").get();
String text = Json.tryToJsonString(order).get();
String formatted = Json.tryToPrettyJsonString(order).get();
```

默认反序列化忽略 Bean 中未声明的 JSON 属性；字段类型不正确仍可能失败。需要拒绝未知字段时使用明确的 [JSON Schema](../json-schemas/) 约束。

## Bean 和泛型

```java
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;

record OrderInput(String id, int amount) {}

OrderInput order = Json.tryToBean(
    OrderInput.class, "{\"id\":\"order-001\",\"amount\":100}"
).get();
List<OrderInput> orders = Json.tryToList(
    new TypeReference<List<OrderInput>>() {},
    "[{\"id\":\"order-001\",\"amount\":100}]"
).get();
```

`toBean/tryToBean` 还支持 `TypeReference<T>`、`java.lang.reflect.Type` 和 `Class<T> + InputStream`。流的生命周期由调用方管理。结构可能是对象、数组或标量时，见 [JsonBag](../json-bag/)。
