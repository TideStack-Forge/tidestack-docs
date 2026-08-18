# DataModelFieldMeta

`DataModelFieldMeta` 是字段级元数据对象，用来描述字段名、类型、校验规则、默认值和各种结构约束。

它回答的是“字段定义里写了什么”，而不是“运行时算出来的结果是什么”。

## 基础属性

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getName()` | `String` | 字段名 |
| `getLabel()` | `String` | 字段标题 |
| `getDescription()` | `String` | 字段说明 |
| `getRawName()` | `String` | 原始字段名 |
| `getType()` | `String` | 逻辑字段类型 |
| `getRawType()` | `String` | 原始字段类型 |

## 结构约束

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getDecimalDigits()` | `Integer` | 小数位数 |
| `getSize()` | `Integer` | 长度或容量 |
| `getIsNullable()` | `Boolean` | 是否可空 |
| `getIsUnsigned()` | `Boolean` | 是否无符号 |
| `getIsAutoIncrement()` | `Boolean` | 是否自增 |
| `getIsUnique()` | `Boolean` | 是否唯一 |
| `getRules()` | `List<String>` | 校验规则表达列表 |
| `getDefaultValue()` | `String` | 默认值表达式 |

## 这组属性怎么理解

- `type` 是逻辑字段类型名
- `rawType` 更接近底层存储类型
- `rules` 描述的是规则表达式，而不是已经执行后的校验结果
- `defaultValue` 保存的是默认值定义，不是运行时求值结果

如果你当前要的是“这个默认值在当前上下文里最终算成了什么”，要转到 [DataModelField](../data-model-field/)。

## 扩展属性

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getExtraProps()` | `Map<String, Object>` | 扩展属性集合 |
| `getExtraProp(String propName)` | `Optional<Object>` | 读取单个扩展属性 |
| `getExtraProp(Class<T>, String)` | `Optional<T>` | 按类型读取扩展属性 |

和 `DataModelMeta` 一样，这个类也通过 `@JsonAnyGetter` / `@JsonAnySetter` 暴露扩展属性。

## 复制

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `deepCopy()` | `DataModelFieldMeta` | 深拷贝字段元数据 |

## 常见使用方式

### 做字段定义检查

适合在建模阶段检查：

- 是否少配了字段名或类型
- 默认值表达式是否合理
- 结构约束是否与业务预期一致

### 做字段派生

适合动态页面生成、动态表单生成、模型装饰等场景。

## 使用提醒

- 扩展属性通过 `@JsonAnyGetter` / `@JsonAnySetter` 直接铺在对象外层，读取时要记得一起考虑。
- `deepCopy()` 适合在做模型 patch 之前复制字段定义，避免直接改原对象。

## 下一步看哪里

- 想看运行时字段对象：看 [DataModelField](../data-model-field/)
- 想看模型元数据：看 [DataModelMeta](../data-model-meta/)
