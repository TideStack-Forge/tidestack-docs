# DataModelField

`DataModelField` 表示运行时数据模型中的一个字段对象。它比 `DataModelFieldMeta` 更靠近运行时，因为它已经绑定到了具体 `DataModel` 和 `ValueType`。

如果你已经拿到了 `DataModel`，并想继续下钻单个字段在运行时的行为，这页就是对应入口。

## 基础属性

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getName()` | `String` | 字段名 |
| `getLabel()` | `String` | 字段标题 |
| `getDescription()` | `String` | 字段描述 |
| `getType()` | `String` | 逻辑字段类型 |
| `getRawName()` | `String` | 底层原始字段名 |
| `getRawType()` | `String` | 底层原始类型 |

## 运行时类型与默认值

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getValueType()` | `ValueType<?>` | 运行时值类型对象 |
| `getDefaultValue(Map<String, Object> context)` | `Object` | 在给定上下文下计算默认值 |

`getDefaultValue(context)` 这一点和纯元数据不同，它允许默认值依赖上下文。

## 它和 `DataModelFieldMeta` 的区别

| 对象 | 更适合的问题 |
| ---- | ---- |
| `DataModelFieldMeta` | 字段定义里写了什么 |
| `DataModelField` | 字段在当前运行时到底怎么表现 |

最典型的差别是：

- `DataModelFieldMeta.getDefaultValue()` 返回的是元数据中的默认值表达式
- `DataModelField.getDefaultValue(context)` 返回的是在当前上下文下算出来的真实值

## 校验与结构约束

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getRules()` | `List<Rule>` | 当前字段的校验规则 |
| `getDecimalDigits()` | `Integer` | 小数位数 |
| `getSize()` | `Integer` | 字段长度或容量 |
| `getIsNullable()` | `Boolean` | 是否可空 |
| `getIsUnsigned()` | `Boolean` | 是否无符号 |
| `getIsAutoIncrement()` | `Boolean` | 是否自增 |
| `getIsUnique()` | `Boolean` | 是否唯一 |

## 扩展属性与归属模型

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getExtraProps()` | `Map<String, Object>` | 扩展属性集合 |
| `getExtraProp(String name)` | `Optional<Object>` | 单个扩展属性 |
| `getDataModel()` | `DataModel` | 当前字段所属模型 |

## 常见使用方式

### 看默认值和校验

适合在运行时判断：

- 当前字段默认值到底算出来了什么
- 这个字段有哪些校验规则

### 做动态字段处理

适合在脚本、节点或运行时装饰逻辑中：

- 读取字段类型
- 判断是否唯一、是否可空
- 按字段值类型做定制处理

## 使用提醒

- `getValueType()` 和 `getType()` 不是一回事。前者是运行时值类型对象，后者更接近逻辑字段类型名。
- `getDefaultValue(context)` 依赖你传入的上下文；同一个字段在不同上下文下可能得到不同结果。
- 如果你当前只想看字段结构定义，而不关心运行时求值，继续看 [DataModelFieldMeta](../data-model-field-meta/)。

## 下一步看哪里

- 想看字段元数据定义：看 [DataModelFieldMeta](../data-model-field-meta/)
- 想看模型本身：看 [DataModel](../data-model/)
