# DataModelFieldMeta

`com.ouroboros.data.model.DataModelFieldMeta` 描述字段的类型、默认值定义和约束。默认值在这里是表达式字符串；实际求值使用 [DataModelField](../data-model-field/)。

## 属性

下表列出 getter；定义对象提供对应 setter。

| 方法 | 返回值 | 默认值 / 含义 |
| --- | --- | --- |
| `getName()` / `getLabel()` | `String` | 字段名和标题，默认空字符串 |
| `getDescription()` | `String` | 字段说明 |
| `getType()` / `getRawType()` | `String` | 逻辑类型和原始存储类型 |
| `getRawName()` | `String` | 原始存储名称 |
| `getSize()` / `getDecimalDigits()` | `Integer` | 长度、小数位数 |
| `getIsNullable()` | `Boolean` | 默认 `true` |
| `getIsUnsigned()` / `getIsAutoIncrement()` / `getIsUnique()` | `Boolean` | 默认 `false` |
| `getUniquenessScope()` | `UniquenessScope` | 唯一性检查范围 |
| `getRules()` | `List<String>` | 规则定义，默认空列表 |
| `getDefaultValue()` | `String` | 默认值表达式 |
| `getExtraProps()` / `getExtraProp(String name)` | `Map<String, Object>` / `Optional<Object>` | 扩展属性 |
| `getExtraProp(Class<T> type, String name)` | `Optional<T>` | 按类型读取扩展属性 |

## 定义字段示例

```java
import com.ouroboros.data.model.DataModelFieldMeta;

var status = new DataModelFieldMeta();
status.setName("status");
status.setLabel("订单状态");
status.setType("string");
status.setSize(20);
status.setIsNullable(false);
status.setDefaultValue("'OPEN'");
```

`type` 必须是应用支持的字段类型。示例把字符串常量表达式 `'OPEN'` 作为默认值定义，实际存储和校验取决于模型配置。

## 扩展属性与副本

`setExtraProp(name, value)` 添加扩展属性，JSON 中直接平铺在字段对象上。读取时可用 `getExtraProp`，避免假定扩展属性一定存在。

`deepCopy()` 可生成字段定义副本；需要独立修改 `rules` 列表时，再复制该列表后设置，避免共享列表上的修改影响原定义。

模型整体定义见 [DataModelMeta](../data-model-meta/)。
