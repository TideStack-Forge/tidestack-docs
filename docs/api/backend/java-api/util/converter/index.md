# Converter

`Converter` 是一个轻量的数据类型转换工具类，适合在脚本、表达式、模型投影或后端代码里把“来源不稳定的值”转成更明确的 Java 类型。

Maven 包: `com.ouroboros:ouroboros-util`

Java 包: `com.ouroboros.util`

## 什么时候看这页

- 你拿到的是 `Object`、表单值、配置值或 JSON 反序列化后的值
- 你想在脚本里快速把字符串转数字、布尔或日期字符串
- 你想确认转换失败时返回什么

## 先理解它的风格

`Converter` 的整体风格是“尽量转换，失败返回 `null` 或默认布尔值”，而不是大量抛异常。

这意味着：

- 数字类转换失败通常返回 `null`
- `toString(null)` 返回 `null`
- `toBoolean(null)` 返回 `false`

如果你的业务对“转换失败”很敏感，最好在调用后继续显式判空。

## 方法总览

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `toByte(Object value)` | `Byte?` | 转为 `Byte` |
| `toShort(Object value)` | `Short?` | 转为 `Short` |
| `toInteger(Object value)` | `Integer?` | 转为 `Integer` |
| `toLong(Object value)` | `Long?` | 转为 `Long` |
| `toFloat(Object value)` | `Float?` | 转为 `Float` |
| `toDouble(Object value)` | `Double?` | 转为 `Double` |
| `toBigInteger(Object value)` | `BigInteger?` | 转为 `BigInteger` |
| `toBigDecimal(Object value)` | `BigDecimal?` | 转为 `BigDecimal` |
| `toString(Object value)` | `String?` | 转为字符串 |
| `toBoolean(Object value)` | `Boolean` | 转为布尔值 |

## 数字转换

### 支持的常见输入

数字相关方法通常支持：

- 已经是目标数字类型
- 任意 `Number`
- 字符串或其他 `CharSequence`

对于字符串输入，当前实现会先去掉逗号再解析，因此像 `"1,234"` 这类值也能被正常转换。

```java
Integer i = Converter.toInteger("123");
Long l = Converter.toLong("1,234");
BigDecimal amount = Converter.toBigDecimal("99.50");
```

### 转换失败时会怎样

如果不能成功解析，通常返回 `null`。

```java
Integer value = Converter.toInteger("abc"); // null
```

## toString(Object value)

`toString` 除了做普通对象转字符串，还对日期类型做了额外处理：

- `LocalDateTime`
- `LocalDate`
- `Date`

这些值会通过 `Dates` 工具类格式化，而不是直接走默认 `toString()`。

```java
String text = Converter.toString(LocalDate.now());
```

如果你需要更精确控制日期格式，建议直接看 [Dates](../dates/)。

## toBoolean(Object value)

`toBoolean` 是这里最值得单独注意的方法。

### 当前行为可以这样理解

- `null` -> `false`
- `Boolean` -> 原值
- 数字 `0` -> `false`
- 非 `0` 数字 -> `true`
- 空字符串 -> `false`
- `"true"` / `"false"` -> 按布尔语义解析
- `"0"` / `"1"` -> 按数字语义解析
- 其他非空字符串 -> `true`

这意味着下面这种结果是符合当前实现的：

```java
Converter.toBoolean(null)     // false
Converter.toBoolean(0)        // false
Converter.toBoolean(1)        // true
Converter.toBoolean("false")  // false
Converter.toBoolean("abc")    // true
```

如果你对布尔语义要求非常严格，不建议把任意非空字符串都直接交给 `toBoolean`。

## 使用建议

- 表单值、配置值、脚本入参是 `Object` 时，优先先过一层 `Converter`
- 做金额、数量、编码这类敏感字段时，转换后要显式判空
- 要处理日期显示时，`Converter.toString` 适合快速输出；要指定格式时改用 [Dates](../dates/)

## 下一步看哪里

- 想看日期工具：看 [Dates](../dates/)
- 想看 Map 工具：看 [Maps](../maps/)
- 想看脚本里怎么直接使用 `Converter`：看 [脚本上下文](../../../script-context/)
