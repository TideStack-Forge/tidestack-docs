# Maps

Map 的合并、筛选、类型映射和嵌套路径工具。Java 导入 `com.ouroboros.util.Maps`；脚本可直接使用 `Maps`。

## 合并与复制

| 方法 | 是否修改输入 | 说明 |
| --- | --- | --- |
| `merge(sources...)` | 否 | 合并顶层键，后面的值覆盖前面的值 |
| `mergeTo(target, sources...)` | 是 | 合并到目标 Map |
| `deepMerge(sources...)` | 否 | 递归合并嵌套结构 |
| `deepMergeTo(target, sources...)` | 是 | 递归合并到目标 |
| `deepClone(map)` | 否 | 递归复制集合和 Map |
| `deepCloneUnmodifiable(map)` | 否 | 生成不可修改的副本 |

```java
import java.util.Map;
import com.ouroboros.util.Maps;

Map<String, Object> defaults = Map.of("pageSize", 20, "theme", "light");
Map<String, Object> overrides = Map.of("pageSize", 50);
var config = Maps.merge(defaults, overrides);
// {pageSize=50, theme=light}，defaults 未修改
```

`merge/mergeTo` 还可传入值合并函数。`deepClone` 处理 Map/集合结构，不保证复制任意 Bean 的内部状态。

## 筛选、转换和差异

| 方法族 | 用途 |
| --- | --- |
| `pick(map, keys / predicate)` | 选出键，返回新 Map |
| `omit(map, keys / predicate)` | 排除键，返回新 Map |
| `removeExcept(...)` / `remove(...)` | 原地保留或移除键 |
| `getAs(map, key, type)` / `getAsOrDefault(...)` | 按兼容类型读取，不负责数字或字符串转换 |
| `remap(...)` / `transform(...)` | 转换键和值 |
| `intersection(map1, map2)` / `difference(map1, map2)` | 比较内容 |
| `toBean(Class<T>, map)` / `tryToBean(Class<T>, map)` | Map 转对象，后者返回 `Try<T>` |
| `fromBean(Object)` | 对象转 Map |

```java
var publicConfig = Maps.pick(config, "pageSize", "theme");
Integer pageSize = Maps.getAs(config, "pageSize", Integer.class).orElse(20);
```

Map 中实际值是字符串 `"20"` 时，使用 [Converter](../converter/) 转换。

## 嵌套路径

`Maps.Hierarchical` 支持 `user.name`、`items[0].name` 等路径。

```java
import java.util.LinkedHashMap;

Map<String, Object> data = new LinkedHashMap<>();
Maps.Hierarchical.setValue(data, "user.profile.name", "张三");
Object name = Maps.Hierarchical.getValue(data, "user.profile.name").orElse(null);
```

| 方法 | 用途 |
| --- | --- |
| `Hierarchical.build(flatMap)` | 点路径 Map 转嵌套结构 |
| `Hierarchical.flatten(map)` | 展开 Map 和数组路径 |
| `Hierarchical.flattenMapsOnly(map)` | 只展开 Map 层级 |
| `Hierarchical.getValue(map, path)` | 返回 `Optional<Object>` |
| `Hierarchical.setValue(map, path, value)` | 原地写入 |
| `hierarchical(map)` / `immutableHierarchical(map)` | 包装为可变或不可变层级 Map |

## 构建 Map

```java
var payload = Maps.<String, Object>builder()
    .put("status", "OPEN")
    .put("pageSize", 20)
    .build();
```

集合数组处理见 [Lists](../lists/)，JSON 解析见 [Json](../json/)。
