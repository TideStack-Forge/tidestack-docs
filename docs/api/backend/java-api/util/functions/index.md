# Functions

`Functions` 是一组偏函数式风格的工具方法，主要围绕函数组合、链式处理、偏函数、Tuple 适配和 Vavr 风格调用展开。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 什么时候看这页

- 你在后端代码里需要把一串函数组合起来
- 你已经在用 Vavr 的 `Function0` ~ `Function8`、`Tuple` 或 `Predicate`
- 你想减少手写 lambda 适配、偏函数展开和参数拆装代码

## 先理解它的定位

`Functions` 当前更偏 Java 后端代码使用，不是脚本默认注入对象。

它最常用的不是“异常安全包装”，而是下面几类能力：

- `compose` / `pipe` / `through`：把多个函数串起来
- `partial` / `partialRight`：做偏函数
- `f` / `p`：把普通函数适配为 Vavr `Function*` 或 `Predicate`
- `tupled` / `untupled*`：在 Tuple 和普通参数之间切换
- `chain(...).next(...).end()`：用链式写法组织函数流

## 函数组合

| 方法族 | 说明 |
| ------ | ---- |
| `compose(...)` | 把多个函数从前到后组合成一个新函数 |
| `pipe(...)` | 把一组同型或可链接函数串成一条处理链 |
| `through(...)` | 以“给定一个初始值，然后顺次流过多个函数”的方式执行 |

```java
var fullName = Functions.compose(User::getProfile, Profile::getName);
var trimmed = Functions.pipe(String::trim, String::toUpperCase);
```

如果你想先定义流程，稍后再执行，优先看 `compose` / `pipe`；如果你已经有一个起始值，想顺手跑完整条链，优先看 `through`。

要注意一点：`through(...)` 返回的是 `Function0<R>`，也就是一个“稍后执行”的零参函数，而不是立刻执行后的结果。

## 偏函数

| 方法族 | 说明 |
| ------ | ---- |
| `partial(...)` | 从左侧固定一部分参数 |
| `partialRight(...)` | 从右侧固定一部分参数 |

```java
Function1<String, Integer> parseWithRadix =
    Functions.partialRight(Integer::parseInt, 10);
```

这组方法适合把多参数函数收窄成更适合流式调用的一元或二元函数。

## 适配成 Vavr 函数与谓词

| 方法 | 说明 |
| ---- | ---- |
| `f(Supplier)` / `f(Function)` / `f(BiFunction)` | 适配为 Vavr `Function0/1/2` |
| `p(...)` | 适配或组合成 `Predicate` |

如果你在项目里已经使用了 Vavr 的链式 API，这组方法能让普通 Java lambda 更容易接进去。

## Tuple 适配

| 方法族 | 说明 |
| ------ | ---- |
| `tupled(...)` | 把普通多参数函数改成接收 `Tuple` 的函数 |
| `untupled2` ~ `untupled8` | 把接收 `Tuple` 的函数展开成普通多参数函数 |
| `toEntryMapper(...)` | 把 `BiFunction<K, V, R>` 适配成 `Map.Entry<K, V>` 处理函数 |

这组方法在 `stream().map(...)`、`entrySet()` 遍历和 Vavr Tuple 场景里很顺手。

## Chain 链式接口

`chain(first).next(...).next(...).end()` 是 `Functions` 里比较有辨识度的一套写法。

| 能力 | 说明 |
| ---- | ---- |
| `chain(first)` | 创建链式函数构造器 |
| `next(fn)` | 继续往后接函数 |
| `partial(...)` / `partialRight(...)` | 在链上直接接偏函数 |
| `end()` | 返回最终函数 |
| `apply(arg)` | 直接执行整条链 |

```java
var pipeline = Functions.chain(User::getProfile)
    .next(Profile::getDepartment)
    .next(Department::getName)
    .end();
```

真正执行时通常类似：

```java
String departmentName = pipeline.apply(user);
```

## 其他能力

- `concat(fn1, fn2)`：连接两个返回 `Optional` 的函数，前一个没取到值时再尝试后一个

## 使用提醒

- `chain(...).end()` 返回的是 Vavr `Function1`，不是普通 Java `Function`。
- `through(...)` 更适合“把一个现成值顺着一串函数流过去”，并且是延迟执行。
- 如果团队里并没有系统使用 Vavr，过度使用 `Functions` 可能反而会降低可读性。

## 使用建议

- 项目里已经在用 Vavr 时，`Functions` 的价值会更明显
- 只是简单一两步 lambda 时，直接写普通 Java 代码通常更直观
- 需要把 Entry、Tuple、多参数函数互转时，优先先想想 `tupled` / `untupled*` / `toEntryMapper`

## 下一步看哪里

- 想看集合工具：看 [Lists](../lists/) 和 [Maps](../maps/)
- 想看 JSON 工具：看 [Json](../json/) 和 [JsonBag](../json-bag/)
