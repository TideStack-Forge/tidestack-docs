# Maps

`Maps` 是平台里非常常用的一组 Map 工具方法，既适合普通后端代码，也很适合脚本、配置处理和 JSON 结构转换场景。

Maven 包: `com.ouroboros:ouroboros-util`

Java 包: `com.ouroboros.util`

## 什么时候看这页

- 你在处理 `Map<String, Object>` 这类弱结构数据
- 你想做 Map 合并、筛选、重映射或嵌套路径读写
- 你要在 Bean 和 Map 之间互转

## 先理解这页的定位

`Maps` 源码非常长，能力覆盖也很多。这页不打算把每个重载方法逐个展开，而是帮你先定位“该用哪一类方法”。

如果你已经明确知道要用某个方法名，再回源码或 IDE 自动补全里查重载会更快。

## 最常用的几类能力

| 类别 | 代表方法 | 适用场景 |
| ---- | -------- | -------- |
| 基础判断 | `containsKey`、`isEmpty`、`isNotEmpty` | 安全判断 Map 状态 |
| 重映射 | `remap`、`transform` | 改 key、改 value 或两者一起改 |
| 合并 | `merge`、`mergeTo`、`deepMerge` | 合并多个 Map |
| 过滤 | `pick`、`omit`、`remove`、`removeExcept` | 只保留或删除一部分字段 |
| 读取与写入 | `getAs`、`putIfAbsentAll`、`putIf` | 安全读写 |
| 结构转换 | `toBean`、`fromBean` | Bean 和 Map 互转 |
| 嵌套 Map | `Maps.Hierarchical.build`、`flatten`、`getValue`、`setValue` | 处理嵌套路径结构 |

## 基础判断

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `isStringKeyMap(Map<?, ?> map)` | `boolean` | 判断是否为字符串键 Map |
| `containsKey(Map<K, ?> map, K key)` | `boolean` | 安全判断是否包含某个 key |
| `isEmpty(Map<?, ?> map)` | `boolean` | `null` 或空 Map 都返回 `true` |
| `isNotEmpty(Map<?, ?> map)` | `boolean` | `isEmpty` 的相反语义 |

```java
if (Maps.isEmpty(config)) {
  return;
}
```

## 重映射与转换

### remap

`remap` 适合把 Map 的 key 或 value 改成另一种结构。

```java
Map<String, Integer> result = Maps.remap(source, Object::toString, String::length);
```

它有多种重载：

- 只改 key
- 根据 key 和 value 一起改 key
- 同时改 key 和 value

### transform

`transform` 也适合做结构变换，通常用于把一种 Map 结构映射成另一种类型结构。

如果你只是做简单 key/value 改写，通常先从 `remap` 开始就够了。

## 合并

| 方法 | 说明 |
| ---- | ---- |
| `mergeTo(target, ...)` | 把多个 Map 合并进已有目标 Map |
| `merge(...)` | 合并多个 Map 并返回新 Map |
| `deepMergeTo(target, ...)` | 深度合并到目标 Map |
| `deepMerge(...)` | 返回深度合并后的新 Map |

### 什么时候用 `merge`

只需要顶层字段合并，后来的值覆盖前面的值时，用 `merge` / `mergeTo`。

### 什么时候用 `deepMerge`

值本身还是 Map，希望递归合并子层级时，用 `deepMerge` / `deepMergeTo`。

```java
Map<String, Object> merged = Maps.deepMerge(defaultConfig, appConfig, runtimeConfig);
```

这类方法在配置、Schema、前后端透传对象处理中非常常见。

## 过滤与裁剪

| 方法 | 说明 |
| ---- | ---- |
| `pick(...)` | 只保留满足条件或指定 key 的字段 |
| `omit(...)` | 返回排除指定字段后的新 Map |
| `remove(...)` | 直接从原 Map 删除满足条件的字段 |
| `removeExcept(...)` | 直接从原 Map 删除“不满足条件”的字段 |

一个简单的判断方式：

- 想返回一个新 Map：优先看 `pick` / `omit`
- 想原地修改已有 Map：优先看 `remove` / `removeExcept`

```java
Map<String, Object> safe = Maps.omit(payload, List.of("password", "secret"));
```

## 读取与便捷写入

| 方法 | 说明 |
| ---- | ---- |
| `getAs(map, key, type)` | 按类型安全读取值，返回 `Optional` |
| `getAsOrDefault(map, key, type, defaultValue)` | 读取失败时返回默认值 |
| `putIfAbsentAll(target, source)` | 只补不存在的字段 |
| `putIf(map, key, value, condition)` | 满足条件时才写入 |
| `firstNonNull(map, keys...)` | 依次查找第一个非空值 |
| `firstMapped(map, keys...)` | 依次查找第一个存在映射的值 |

这类方法很适合做“多来源参数回退”和“兜底默认值”。

## Bean 与 Map 互转

| 方法 | 说明 |
| ---- | ---- |
| `toBean(Class<T> clazz, Map<String, Object> map)` | Map 转 Bean |
| `tryToBean(Class<T> clazz, Map<String, Object> map)` | 以 `Try` 方式执行转换 |
| `fromBean(Object bean)` | Bean 转 Map |

```java
UserDTO dto = Maps.toBean(UserDTO.class, payloadMap);
Map<String, Object> raw = Maps.fromBean(dto);
```

如果你不确定数据是否一定能成功映射，优先用 `tryToBean` 会更稳。

## 嵌套 Map 与路径处理

`Maps.Hierarchical` 是这组工具里很实用的一部分，适合处理“点路径”或嵌套 JSON 结构。

### 常见方法

| 方法 | 说明 |
| ---- | ---- |
| `Maps.Hierarchical.build(flattenMap)` | 把扁平路径结构构造成嵌套 Map |
| `Maps.Hierarchical.flatten(hierarchicalMap)` | 把嵌套 Map 拍平成路径结构 |
| `Maps.Hierarchical.flattenMapsOnly(hierarchicalMap)` | 只拍平 Map 层级 |
| `Maps.Hierarchical.setValue(map, path, value)` | 按路径写入值 |
| `Maps.Hierarchical.getValue(map, path)` | 按路径读取值 |

```java
Maps.Hierarchical.setValue(data, "user.profile.name", "张三");
Optional<Object> name = Maps.Hierarchical.getValue(data, "user.profile.name");
```

这类能力在：

- 表单数据处理
- UI Schema / 配置对象转换
- 动态字段映射

里都非常常见。

## 其他值得知道的能力

- `deepClone` / `deepCloneUnmodifiable`: 深拷贝 Map
- `intersection` / `difference`: 比较两个 Map 的交集或差异
- `builder()` / `MapBuilder`: 用构建器方式组装 Map
- `hierarchical()` / `immutableHierarchical()`: 以层级结构包装现有 Map

## 使用建议

- 顶层配置合并先用 `merge`，嵌套配置合并再用 `deepMerge`
- 想返回新结果就用 `pick` / `omit`，想原地修改再用 `remove` / `removeExcept`
- 遇到点路径、数组路径、嵌套结构时，优先想到 `Maps.Hierarchical`
- 要把弱结构 Map 转强类型对象时，优先试 `toBean` / `tryToBean`

## 下一步看哪里

- 想看类型转换：看 [Converter](../converter/)
- 想看日期工具：看 [Dates](../dates/)
- 想看脚本里怎么直接使用 `Maps`：看 [脚本上下文](../../../script-context/)
