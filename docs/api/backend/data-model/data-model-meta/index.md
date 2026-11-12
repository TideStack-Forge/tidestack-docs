# DataModelMeta

`com.ouroboros.data.model.DataModelMeta` 描述模型的名称、字段、主键、唯一约束和插件。用于模型定义检查或扩展；业务数据读写使用 [DataModel](../data-model/)。

## 属性

下表列出 getter；可变定义对象也提供对应 setter。

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `getNamespace()` / `getName()` | `String` | 名称空间和模型名 |
| `getFullName()` | `String` | 按名称空间与模型名计算的全名 |
| `getLabel()` / `getDescription()` | `String` | 标题和说明 |
| `getFormatVersion()` / `getSource()` | `String` | 格式版本和来源 |
| `getDataStation()` / `getRawName()` | `String` | 数据站名和原始名称 |
| `getMigrationStrategy()` | `MigrationStrategy` | 结构迁移策略 |
| `getFields()` | `List<DataModelFieldMeta>` | 字段定义 |
| `getPrimaryKeys()` / `getPrimaryKeyGenerator()` | `List<String>` / `String` | 主键字段和生成器名称 |
| `getUniqueConstraints()` | `List<DataModelUniqueConstraintMeta>` | 模型级唯一约束 |
| `getPluginDescriptors()` | `List<PluginDescriptor>` | 插件声明 |
| `getExtraProps()` / `getExtraProp(String name)` | `Map<String, Object>` / `Optional<Object>` | 扩展属性 |
| `getExtraProp(Class<T> type, String name)` | `Optional<T>` | 按类型读取扩展属性 |

## 构建定义示例

```java
import java.util.List;
import com.ouroboros.data.model.DataModelFieldMeta;
import com.ouroboros.data.model.DataModelMeta;

var id = new DataModelFieldMeta();
id.setName("id");
id.setType("string");
id.setIsNullable(false);

var definition = new DataModelMeta();
definition.setNamespace("crm");
definition.setName("Order");
definition.setLabel("订单");
definition.setFields(List.of(id));
definition.setPrimaryKeys(List.of("id"));
String fullName = definition.getFullName(); // crm.Order
```

示例只构建定义对象，不注册运行时模型，也不创建数据库表。模型加载仍由应用的建模与发布流程完成。

## 唯一约束

`uniqueConstraints` 支持多字段唯一约束。`nullsDistinct` 默认 `false`，空值参与重复检查；为 `true` 时，完整约束键中任一持久值为 `null`，该键不参与重复检查。字段缺失不能直接当作空值，部分更新仍需补齐约束字段。

Java 模型声明示例：

```java
@UniqueConstraint(fields = {"tenantId", "activeKey"}, nullsDistinct = true)
```

动态定义在单个约束上配置 `"nullsDistinct": true`，或调用 `constraint.setExtraProp("nullsDistinct", true)`。这不改变软删除的 `scope` 范围；含空值的约束键也不能作为无主键更新的唯一身份。并发写入仍需匹配的数据库唯一约束。

## 扩展和复制

使用 `setExtraProp(name, value)` 配置扩展属性，它们在 JSON 中与标准属性平铺。插件通过 `addPluginDescriptor(...)` 和 `removePluginDescriptor(name)` 维护。

需要生成修改后的定义时，先调用 `deepCopy()`，再修改副本。字段结构见 [DataModelFieldMeta](../data-model-field-meta/)，插件参数见 [PluginDescriptor](../plugin-descriptor/)。
