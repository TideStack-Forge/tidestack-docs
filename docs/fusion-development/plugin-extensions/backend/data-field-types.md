---
title: 数据字段类型扩展
---

# 数据字段类型扩展

数据字段类型负责 Java 值转换、持久化值和数据库类型映射。建模界面的业务字段类型负责参数、编辑器和默认 UI，后者见 [字段类型扩展](../../../guide/advance/extend-backend/extend-field/)。一个业务字段可以复用现有数据类型，不一定两层都要新增。

## 1. 定义值类型

实现 `com.ouroboros.data.model.ValueType<T>`，明确：

| 方法 | 职责 |
| --- | --- |
| `getName()` / `getLabel()` | 稳定类型名与展示名 |
| `getType()` | 转换结果的 Java 类型 |
| `convert(Object)` | 输入与读取值的转换 |
| `toPersistentValue(Object)` | 写入持久层前的值转换 |
| `isPhysical()` | 是否需要物理存储字段 |
| `canPopulate()` | 是否支持关联填充 |

例如将具有固定格式的业务标识转换为字符串，需先确定空值、格式错误、大小写和历史数据的处理规则。不能只改名称，仍让转换结果与声明 Java 类型冲突。

## 2. 提供构建器并注册

`ValueTypeBuilder<VT, T extends ValueType<VT>>` 提供 `getName()`、`getLabel()` 和 `build(DataModelField)`。字段依赖长度、精度或扩展属性时，在构建阶段读取。无状态类型可同时实现 ValueType 和 Builder，平台的 `StringValue` 即采用这种方式。

注册文件：

```text
META-INF/services/com.ouroboros.data.model.ValueTypeBuilder
```

写入实现的全限定类名。字段元数据的 `type` 与构建器名称一致；缺失构建器可能落到 Unknown 类型，不能把没有启动异常视为注册成功。

## 3. 补数据库映射

需要新物理类型时，实现 `com.ouroboros.data.migration.datatype.DataTypeBuilder`：

```java
boolean support(Database database, DataModelField field);
DataType build(Database database, DataModelField field);
```

`Database` 与 `DataType` 来自 Liquibase。按目标数据库、值类型和长度等属性决定是否支持，并注册：

```text
META-INF/services/com.ouroboros.data.migration.datatype.DataTypeBuilder
```

复用现有类型映射时先核对其 `support` 条件，继承或改变类型后未必仍被匹配。迁移映射与运行时值转换是不同检查项。

## 4. 在模型中使用并验证

为测试模型配置新 `type`；Java 注解模型可以使用 `@Field(type="业务类型名")`。如果还需在业务建模器中选择该类型，再提供业务字段类型与界面定义。

测试输入转换、数据库读写往返、查询条件、空值、精度、批量操作与目标数据库迁移。确认最终列类型和实际返回值，并检查老数据升级是否可读取。
