# Json

`Json` 是平台里的统一 JSON 工具类，负责序列化、反序列化，以及在字符串、Map、List、`JsonBag` 和 Java Bean 之间做转换。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 先理解它的风格

当前实现有两个重要特点：

1. 内部统一基于一个静态 `ObjectMapper`
2. 默认关闭了 `FAIL_ON_UNKNOWN_PROPERTIES`

另外，这个 `ObjectMapper` 还会加载 `ObjectMapperConfigurator` SPI，因此项目里可以继续往里加统一序列化配置。

这意味着一个很实用的结果：

- 反序列化到 Bean 时，JSON 里多出来的字段默认不会直接报错
- 如果项目里又注册了额外 `ObjectMapperConfigurator`，最终行为还会叠加这些全局配置

## 最常用的几类能力

| 类别 | 代表方法 | 说明 |
| ---- | -------- | ---- |
| 输出 JSON | `toJsonString`、`toPrettyJsonString` | 对象序列化 |
| 解析结构 | `toMap`、`toList`、`toJsonBag` | 转为弱结构对象 |
| 解析 Bean | `toBean` | 转为指定类型对象 |
| Try 版本 | `tryToJsonString`、`tryToMap`、`tryToList`、`tryToBean` | 保留失败原因 |

## 序列化

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `toJsonString(Object any)` | `String` | 普通 JSON 字符串；失败时返回空串 |
| `tryToJsonString(Object any)` | `Try<String>` | 保留失败信息 |
| `toPrettyJsonString(Object any)` | `String` | 格式化 JSON 字符串；失败时返回空串 |
| `tryToPrettyJsonString(Object any)` | `Try<String>` | 保留失败信息 |

## 解析为弱结构

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `toMap(CharSequence jsonString)` | `Map<String, Object>` | 解析失败时返回空 Map |
| `tryToMap(CharSequence jsonString)` | `Try<Map<String, Object>>` | 保留失败信息 |
| `toList(CharSequence jsonString)` | `List<Object>` | 解析失败时返回空 List |
| `toList(TypeReference<List<T>>, CharSequence)` | `List<T>` | 带泛型列表解析 |
| `toJsonBag(CharSequence jsonString)` | `JsonBag` | 解析失败时返回 `JsonBag.empty()` |

## 解析为 Bean

| 方法族 | 说明 |
| ------ | ---- |
| `toBean(Class<T>, CharSequence)` | JSON 字符串转 Bean；失败返回 `null` |
| `toBean(TypeReference<T>, CharSequence)` | JSON 字符串转复杂泛型对象 |
| `toBean(Type, CharSequence)` | 按 `Type` 转换 |
| `toBean(Class<T>, InputStream)` | 从流读取并转换 |
| `tryToBean(...)` | 对应 `Try` 版本，适合保留错误信息 |

```java
Map<String, Object> payload = Json.toMap(rawJson);
OrderDTO dto = Json.toBean(OrderDTO.class, rawJson);
```

## 什么时候用 `to*`，什么时候用 `tryTo*`

这是 `Json` 最需要先分清的一组边界：

| 方法风格 | 失败时行为 | 适合场景 |
| ---- | ---- | ---- |
| `to*` | 吞掉异常，返回空串 / 空集合 / `null` / `JsonBag.empty()` | 宽松读取、容错转换 |
| `tryTo*` | 返回 `Try`，保留失败原因 | 接口校验、模型解析、需要明确失败原因的流程 |

如果你的场景里“解析失败”和“解析成功但结果为空”语义不同，优先用 `tryTo*`，不要直接用 `to*`。

## 常见使用方式

### 快速转成弱结构

适合透传配置、脚本参数、动态表单载荷这类结构不稳定的数据。

```java
var map = Json.toMap(rawJson);
var bag = Json.toJsonBag(rawJson);
```

### 转成强类型对象

适合接口 DTO、配置对象、模型元数据等结构较稳定的数据。

```java
var result = Json.tryToBean(OrderDTO.class, rawJson);
```

### 处理复杂泛型

适合 `List<OrderDTO>`、`Map<String, List<Item>>` 这类泛型结构。

```java
var list = Json.toList(new TypeReference<List<OrderDTO>>() {}, rawJson);
```

## 使用建议

- 只想快速拿结果时，用 `to*`
- 需要保留异常细节时，用 `tryTo*`
- 需要处理“对象 / 数组 / 标量”混合 JSON 时，优先看 [JsonBag](../json-bag/)

## 使用提醒

- `toMap(...)`、`toList(...)`、`toBean(...)` 这一类便捷方法会吞掉解析异常，不适合作为高约束校验入口。
- `toPrettyJsonString(...)` 使用的是统一的两空格缩进风格，适合生成持久化 JSON 或开发态文件。
- `toBean(...)` 默认对未知字段宽容，但这并不等于字段类型错误也会被自动修正。

## 下一步看哪里

- 想看 JSON 包装器：看 [JsonBag](../json-bag/)
- 想看 JSON Schema 校验：看 [JsonSchemas](../json-schemas/)
