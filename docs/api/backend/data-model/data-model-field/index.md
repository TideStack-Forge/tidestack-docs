# DataModelField

`com.ouroboros.data.model.DataModelField` 提供已加载模型的字段信息、校验规则和默认值计算。通过 `DataModel.getField(name)` 或 `getFields()` 获取。

## 方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `getName()` / `getLabel()` / `getDescription()` | `String` | 名称、标题、说明 |
| `getType()` | `String` | 逻辑字段类型名 |
| `getValueType()` | `ValueType<?>` | 字段值类型 |
| `getRawName()` / `getRawType()` | `String` | 原始存储名称和类型 |
| `getDefaultValue(Map<String, Object> context)` | `Object` | 在指定记录上下文中计算默认值 |
| `getRules()` | `List<Rule>` | 校验规则 |
| `getSize()` / `getDecimalDigits()` | `Integer` | 长度和小数位数 |
| `getIsNullable()` / `getIsUnsigned()` | `Boolean` | 可空和无符号约束 |
| `getIsAutoIncrement()` / `getIsUnique()` | `Boolean` | 自增和唯一约束 |
| `getUniquenessScope()` | `UniquenessScope` | 唯一性检查范围 |
| `getExtraProps()` / `getExtraProp(String name)` | `Map<String, Object>` / `Optional<Object>` | 扩展属性 |
| `getExtraProp(Class<T> type, String name)` | `Optional<T>` | 按类型读取扩展属性 |
| `getDataModel()` | `DataModel` | 所属模型 |

## 读取字段示例

```java
import com.ouroboros.data.model.DataModelCenter;

var orders = DataModelCenter.getDataModel("crm.Order")
    .orElseThrow(() -> new IllegalStateException("订单模型不可用"));
var amount = orders.getField("amount")
    .orElseThrow(() -> new IllegalArgumentException("缺少 amount 字段"));
String type = amount.getType();
boolean required = Boolean.FALSE.equals(amount.getIsNullable());
```

布尔约束和数值属性可能为空，读取时按业务需要处理。

## 计算默认值

```java
import java.util.Map;

// code 是已取得的 DataModelField，且模型中配置了该字段的默认值。
Object value = code.getDefaultValue(Map.of("departmentId", "sales"));
```

传入当前记录字段，默认值表达式可读取它们。计算可能调用编码生成器等有状态能力，因此不要为展示字段说明而反复求值。

只需要读取默认值原始定义时，使用 [DataModelFieldMeta](../data-model-field-meta/)，无需调用求值方法。
