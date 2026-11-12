# Functions

在 Java 中组合函数、固定参数或适配 Tuple。导入 `com.ouroboros.util.Functions`，组合结果通常为 Vavr `Function0`、`Function1` 等类型。

## 方法速查

| 方法族 | 用途 |
| --- | --- |
| `compose(f1, f2, ...)` | 按参数顺序组合，前一个输出传给后一个 |
| `pipe(...)` | 串联函数，可提供连接函数 |
| `through(value, ...)` | 绑定初始值，返回延迟执行的 `Function0` |
| `chain(first).next(fn).end()` | 链式构建 `Function1` |
| `partial(fn, args...)` | 固定左侧参数 |
| `partialRight(fn, args...)` | 固定右侧参数 |
| `f(...)` / `p(...)` | 适配 Vavr 函数或 Java `Predicate` |
| `tupled(...)` / `untupled2` 至 `untupled8` | 在 Tuple 与多参数函数之间转换 |
| `toEntryMapper(BiFunction)` | 适配 `Map.Entry` 的处理函数 |
| `concat(fn1, fn2)` | 依次尝试两个返回 `Optional` 的函数 |

## 组合与执行

```java
import com.ouroboros.util.Functions;

var length = Functions.compose(String::trim, String::length);
int size = length.apply(" order "); // 5

var delayed = Functions.through(" order ", String::trim, String::length);
int delayedSize = delayed.apply(); // 此时执行，得到 5
```

`through` 返回函数，不会在声明时完成计算。函数链中的异常继续向调用方传播，不会自动变为 `Try`。

```java
var normalize = Functions.chain((String value) -> value.trim())
    .next(String::toUpperCase)
    .end();
String result = normalize.apply("open"); // OPEN
```

## 固定参数

```java
import io.vavr.Function1;

Function1<String, Integer> parseDecimal =
    Functions.partialRight(Integer::parseInt, 10);
int value = parseDecimal.apply("42");
```

简单的一两步处理也可以直接使用 Java lambda。集合处理见 [Maps](../maps/) 和 [Lists](../lists/)。
