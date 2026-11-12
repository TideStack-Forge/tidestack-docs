# Converter

将 `Object` 转为明确的 Java 类型。Java 导入 `com.ouroboros.util.Converter`；脚本和表达式可直接使用 `Converter`。

## 方法与失败结果

| 方法 | 返回类型 | 转换失败时 |
| --- | --- | --- |
| `toByte` / `toShort` / `toInteger` / `toLong` | 对应数字包装类型 | `null` |
| `toFloat` / `toDouble` | `Float` / `Double` | `null` |
| `toBigInteger` / `toBigDecimal` | `BigInteger` / `BigDecimal` | `null` |
| `toString(Object value)` | `String` | 输入为空时返回 `null` |
| `toBoolean(Object value)` | `Boolean` | 无法识别时通常为 `false` |

数字转换接受 `Number` 和字符串；字符串中的逗号会在解析前移除。输入格式要求严格时，应在转换前校验，避免把宽松转换当作格式校验。

```java
import java.math.BigDecimal;
import com.ouroboros.util.Converter;

Integer pageSize = Converter.toInteger("20");
Long count = Converter.toLong("1,234"); // 1234
BigDecimal amount = Converter.toBigDecimal("99.50");
Integer invalid = Converter.toInteger("abc"); // null
```

数字类型之间转换可能截断小数或超出目标类型范围；金额计算使用 `BigDecimal`，不要依赖整数转换检测范围是否合法。

## 布尔转换

| 输入 | 结果 |
| --- | --- |
| `null`、数字 `0`、空字符串 | `false` |
| `Boolean` | 原值 |
| 非零数字 | `true` |
| 字符串 `"true"`，不区分大小写 | `true` |
| 字符串 `"1"`、`"yes"` 或其他字符串 | `false` |

```java
boolean enabled = Converter.toBoolean("TRUE"); // true
boolean numericText = Converter.toBoolean("1"); // false
boolean numericValue = Converter.toBoolean(1); // true
```

配置使用 `"1"/"0"` 时，先按该约定校验，再转换为数字或显式比较。

## 字符串转换

`LocalDate`、`LocalDateTime` 和 `Date` 使用日期格式转换；其他非空对象转换为字符串。需要指定日期格式时使用 [Dates](../dates/)。

```groovy
def pageSize = Converter.toInteger(Config.get('orders.pageSize'))
if (pageSize == null || pageSize <= 0) {
    Exceptions.validation('每页条数必须为正整数')
}
```
