# Lists

`Lists` 是平台里处理 `List`、弱结构数组数据和安全索引访问时很常用的一组工具方法。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 什么时候看这页

- 你在处理 `List<Object>`、JSON 数组或嵌套集合
- 你想安全读写指定下标，而不自己做越界判断
- 你需要把列表按长度分块、补齐或深拷贝

## 最常用的几类能力

| 类别 | 代表方法 | 适用场景 |
| ---- | -------- | -------- |
| 安全判断 | `isStringKeyMapList`、`isEmpty` | 判断列表内容结构或空值 |
| 补齐列表 | `fill(...)` | 按长度补齐列表 |
| 安全写入 | `setValue(...)` | 自动补齐后再写指定位置 |
| 安全读取 | `getValue(...)` | 越界时返回默认值或 `null` |
| 删除元素 | `removeValue(...)` | 越界时安全返回 `null` |
| 合并/拷贝 | `merge(...)`、`deepClone(...)` | 组装或复制列表 |
| 分块 | `partition(...)` | 按固定 chunk size 切片 |

## 结构判断

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `isStringKeyMapList(List<?> list)` | `Boolean` | 判断列表里的每一项是否都是 `Map<String, ?>` |
| `isEmpty(List<?> list)` | `Boolean` | `null` 或空列表都返回 `true` |

## fill

`fill` 用于把列表补到指定长度。

| 方法形态 | 说明 |
| -------- | ---- |
| `fill(list, length)` | 用 `null` 补齐 |
| `fill(list, length, item)` | 用固定值补齐 |
| `fill(list, length, Supplier<T>)` | 动态生成补齐值 |
| `fill(list, length, Function<Integer, T>)` | 根据待填位置索引生成补齐值 |

这组方法本身不返回新列表，而是直接修改原列表。

也就是说，`fill` 更像“原地扩容并补值”，不是纯函数式工具。

## setValue / getValue / removeValue

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `setValue(list, index, value)` | `T` | 自动补齐后写入；默认用 `null` 补位 |
| `setValue(list, index, value, fillItem)` | `T` | 自动补齐后写入；指定补位值 |
| `getValue(list, index)` | `T?` | 越界时返回 `null` |
| `getValue(list, index, defaultValue)` | `T` | 越界时返回默认值 |
| `removeValue(list, index)` | `T?` | 越界时返回 `null` |

```java
Lists.setValue(data, 3, "done");
String value = Lists.getValue(data, 10, "default");
```

## merge / deepClone / partition

| 方法 | 说明 |
| ---- | ---- |
| `merge(Collection<T>... lists)` | 合并多个集合为一个新 `List` |
| `deepClone(Collection<T> list)` | 深拷贝列表；嵌套 `Collection` 和 `Map` 会递归复制 |
| `partition(List<T> list, int chunkSize)` | 按固定块大小切成 `List<List<T>>` |

`partition` 很适合批处理、分页装配或按固定数量分片提交。

## 使用提醒

- `fill(...)`、`setValue(...)`、`removeValue(...)` 都会修改原列表。
- `deepClone(...)` 会递归复制嵌套 `Collection` 和 `Map`，但不会深拷贝任意 Java Bean。
- `partition(...)` 返回的是基于原列表的分片视图 `subList`，不是完全独立的新列表；原列表变化时，分片结果也会受影响。

## 使用建议

- 需要安全按下标访问时，优先用 `getValue` / `setValue`
- 处理 JSON 数组或动态配置数组时，`fill` 和 `deepClone` 很实用
- 做批量处理时，优先先看 `partition`

## 下一步看哪里

- 想看 Map 工具：看 [Maps](../maps/)
- 想看 JSON 包装器：看 [JsonBag](../json-bag/)
