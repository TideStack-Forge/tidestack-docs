# Lists

Java 列表的安全索引、补位、复制和分块工具。导入 `com.ouroboros.util.Lists`。

## 方法

| 方法 | 返回值 / 行为 |
| --- | --- |
| `isEmpty(List<?>)` | `null` 或空列表为 `true` |
| `isStringKeyMapList(List<?>)` | 检查各项是否为字符串键 Map |
| `fill(list, length[, value / supplier / indexFunction])` | 原地补到指定长度，不缩短列表 |
| `setValue(list, index, value[, fillValue])` | 补位后写入，默认补 `null` |
| `getValue(list, index[, defaultValue])` | 越界时返回 `null` 或默认值 |
| `removeValue(list, index)` | 删除；越界返回 `null` |
| `merge(Collection<T>... lists)` | 合并为新列表 |
| `deepClone(Collection<T>)` | 递归复制嵌套集合和 Map |
| `partition(List<T>, int chunkSize)` | 按指定大小分块 |

## 索引读写

```java
import java.util.ArrayList;
import java.util.List;
import com.ouroboros.util.Lists;

var values = new ArrayList<String>(List.of("first"));
Lists.setValue(values, 3, "fourth");
// ["first", null, null, "fourth"]
String value = Lists.getValue(values, 10, "missing"); // missing
```

`fill`、`setValue` 和 `removeValue` 修改原列表，传入列表必须可变；使用非负索引。

## 分块

```java
var chunks = Lists.partition(List.of(1, 2, 3, 4, 5), 2);
// [[1, 2], [3, 4], [5]]
```

`chunkSize` 必须大于 `0`。分片是原列表的 `subList` 视图；需要独立副本时对分片调用 `new ArrayList<>(chunk)`。

`deepClone` 不复制任意 Java Bean。Map 工具见 [Maps](../maps/)。
