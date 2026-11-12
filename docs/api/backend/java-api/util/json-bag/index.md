# JsonBag

用同一类型承载 JSON 对象、数组或标量，导入 `com.ouroboros.util.JsonBag`。结构确定时可以直接使用 Map 或 List。

## 创建和读取

| 方法 | 返回值 / 行为 |
| --- | --- |
| `JsonBag.of(Object value)` | 包装 Map、List 或标量，不复制原数据 |
| `JsonBag.empty()` | 内容为 `null` 的包 |
| `isMap()` / `isList()` / `isValue()` / `isNull()` | 判断内容类型 |
| `getMap()` / `getList()` | 对应底层集合，不匹配时为 `null` |
| `get()` | 底层标量；对象和数组使用各自 getter |
| `get(String key)` / `get(int index)` | 按键或下标读取 |

```java
import com.ouroboros.util.Json;

var bag = Json.tryToJsonBag("{\"status\":\"OPEN\"}").get();
if (bag.isMap()) {
    Object status = bag.get("status");
}
```

`empty()` 不表示空对象或空数组；读取 JSON 字符串应使用 `Json.tryToJsonBag`，直接 `JsonBag.of("{}")` 包装的是字符串。

## 修改

`put(key/index, value)` 和 `remove(key/index)` 直接修改底层集合。对数组使用数字字符串键，如 `"1"`，等同于下标 `1`；对象上的整数下标转换为字符串键。

```java
import java.util.ArrayList;
import java.util.List;
import com.ouroboros.util.JsonBag;

var data = new ArrayList<Object>(List.of("first"));
var bag = JsonBag.of(data);
bag.put(2, "third");
// data 变为 ["first", null, "third"]
Object missing = bag.get(10); // null
```

写入需要可变 Map/List；使用 `Map.of` 或 `List.of` 包装的不可变集合仍不可修改。数组的非数字字符串键不执行读写，通常返回 `null`。更多列表操作见 [Lists](../lists/)。
