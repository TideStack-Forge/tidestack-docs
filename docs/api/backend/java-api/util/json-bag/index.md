# JsonBag

`JsonBag` 是一个轻量的 JSON 包装器，用来统一容纳三类值：

- 对象：`Map<String, Object>`
- 数组：`List<Object>`
- 标量：字符串、数字、布尔值或 `null`

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 什么时候看这页

- 你拿到的 JSON 结构不稳定，可能是对象、数组或单值
- 你不想先写很多 `instanceof`
- 你要按 key 或 index 统一读写弱结构数据

## 创建方式

| 方法 | 说明 |
| ---- | ---- |
| `JsonBag.of(Object value)` | 根据传入值自动包成对象、数组或标量 |
| `JsonBag.empty()` | 创建一个空包，内部值为 `null`，不是空对象也不是空数组 |

## 类型判断

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `isNull()` | `Boolean` | 当前内容是否为空 |
| `isList()` | `Boolean` | 当前内容是否为数组 |
| `isMap()` | `Boolean` | 当前内容是否为对象 |
| `isValue()` | `Boolean` | 当前内容是否为单值 |

## 获取底层值

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getList()` | `List<Object>` | 读取底层数组 |
| `getMap()` | `Map<String, Object>` | 读取底层对象 |
| `get()` | `Object` | 读取底层标量值 |

## 按 key / index 读写

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `get(String key)` | `Object?` | 对象按 key 取值；数组时若 key 是数字字符串也会按 index 读 |
| `get(int index)` | `Object?` | 数组按下标取值；对象时会尝试把 index 转成字符串 key |
| `put(String key, Object value)` | `Object?` | 对象按 key 写值；数组时可传数字字符串 |
| `put(int index, Object value)` | `Object?` | 数组按下标写值，内部复用 `Lists.setValue` |
| `remove(String key)` | `Object?` | 对象按 key 删除；数组时支持数字字符串 |
| `remove(int index)` | `Object?` | 数组按下标删除；对象时会按字符串 key 删除 |

这意味着它在对象和数组场景下都支持一种“尽量统一”的访问方式。

## 常见使用方式

### 结构未知时先包一层

```java
JsonBag bag = Json.toJsonBag(rawJson);
if (bag.isMap()) {
  var status = bag.get("status");
}
```

### 把数组和对象都按统一方式处理

比如配置值有时是数组、有时是对象时，可以先统一走 `JsonBag`，再分流判断。

## 使用提醒

- `put(...)`、`remove(...)` 会直接修改底层 `Map` / `List`，不是返回新对象。
- 对数组调用 `get("1")`、`put("1", value)` 这类数字字符串 key，会被当成下标处理。
- 对列表传入非数字字符串 key 时，不会自动转换，通常直接返回 `null`。
- `JsonBag.empty()` 表示“空值包”，不是空 `Map` 或空 `List`。

## 使用建议

- 结构不确定时，先 `isMap()` / `isList()` 再做进一步处理
- 需要“对象与数组混用”的弱结构适配时，`JsonBag` 会比直接操作 `Map` / `List` 更顺手
- 如果你已经明确数据一定是对象或一定是数组，直接用原生 `Map` / `List` 往往更简单

## 下一步看哪里

- 想看 JSON 解析入口：看 [Json](../json/)
- 想看 List 工具：看 [Lists](../lists/)
