---
title: 用注解定义数据模型
---

# 用注解定义数据模型

业务模块需要随代码提供一组数据结构时，可以在 Java 类上声明数据模型。运行时扫描这些类，将注解转换为模型元数据，再进入平台统一的模型加载、迁移和数据操作链路。

这种方式适合由代码维护的独立模型。应用中已经存在的模型直接按全名访问，不必再声明一份同名 Java 模型；业务模型投影出的数据结构继续由业务模型维护。注解定义的是数据结构，不会单独建立业务动作、页面或菜单。

## 准备依赖与模型类

本页的注解统一使用 `com.ouroboros.data.annotation` 包。按所选工程模式安排依赖，版本与目标基座保持一致：

| 模块 | 用途 |
| --- | --- |
| `ouroboros-data-typed-core` | 提供模型注解和类型化访问接口，编译模型类时需要 |
| `ouroboros-data-typed-runtime` | 在运行环境中提供模型扫描、注册和类型化 Bean；标准基座已经提供时由扩展复用 |
| `ouroboros-data-plugins` | 提供唯一约束注解装饰器，以及审计、逻辑删除、归档和历史记录等模型能力 |

内嵌基座把所需运行模块装配进启动程序；标准基座扩展先核对目标基座已有模块，再决定扩展依赖的交付范围。工程配置见 [后端扩展包](../backend-extension-packages)。

下面定义一个由当前模块维护的商品模型。`Product.java` 放在 `com.example.catalog.model` 包中，示例显式指定存储名，主键使用平台已有的雪花生成策略：

```java
package com.example.catalog.model;

import java.math.BigDecimal;
import com.ouroboros.data.annotation.Field;
import com.ouroboros.data.annotation.Model;
import com.ouroboros.data.annotation.PrimaryKey;
import com.ouroboros.data.annotation.Rule;

@Model(fullName = "catalog.Product", rawName = "catalog_product", label = "商品")
public class Product {
  @Field(size = 64)
  @PrimaryKey(generator = "snowflake")
  private String id;

  @Field(label = "编码", size = 64)
  @Rule({"notEmpty", "regex:^[A-Z0-9_-]+$"})
  private String code;

  @Field(label = "名称", size = 200)
  @Rule("notEmpty")
  private String name;

  @Field(size = 64, nullable = true)
  private String categoryId;

  @Field(type = "Decimal", size = 18, decimalDigits = 2)
  private BigDecimal price;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
  public String getCategoryId() { return categoryId; }
  public void setCategoryId(String categoryId) { this.categoryId = categoryId; }
  public BigDecimal getPrice() { return price; }
  public void setPrice(BigDecimal price) { this.price = price; }
}
```

模型扫描读取类中直接声明并带有 `@Field` 的字段。没有 `@Field` 的属性不进入模型定义，父类字段也不会由当前扫描器自动收集。类型化读写使用普通 Java Bean 的访问器；不要把只存在于父类的字段当作已经注册的模型字段。

## 定义模型身份与存储

`@Model` 标在类上，决定模型在运行时的身份和存储位置。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `fullName` | 空字符串 | 为空时使用简单类名。建议显式写出带名称空间的稳定全名，例如 `catalog.Product` |
| `label` | 空字符串 | 展示名称 |
| `rawName` | 空字符串 | 存储名称；不指定时按模型名转换为下划线形式。需要固定表名时显式填写 |
| `dataStation` | `default` | 模型所属数据站，应与目标环境中配置的数据站对应 |
| `migrationStrategy` | `MigrationStrategy.AUTO` | `AUTO` 参与自动结构迁移；`DISABLED` 不自动迁移，由交付过程准备匹配的存储结构 |
| `extraProps` | 空数组 | 额外元数据属性，按键、值交替填写 |

`extraProps` 的写法例如 `{"customOption", "value"}`，数组长度必须为偶数，值以字符串进入元数据。已有专用注解的能力优先使用专用注解，不必再手工重复拼装相同属性。

修改 `fullName` 会改变模型标识；修改 `rawName` 或字段存储名也不能直接当作重命名迁移。已有数据的模型调整后，应检查实际迁移结果和数据保留情况。

## 定义字段

### 字段参数

`@Field` 标在 Java 字段上。运行时字段名使用 Java 属性名，存储名可以另外指定。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `type` | 空字符串 | 平台逻辑类型。不填时按受支持的 Java 类型推断；自定义值类型填写已注册的类型名 |
| `rawName` | 空字符串 | 存储字段名。不填时将 Java 属性名转换为下划线形式 |
| `label` | 空字符串 | 展示与校验提示使用的字段名称 |
| `rawType` | 空字符串 | 底层存储类型，由对应数据源适配器解释 |
| `nullable` | `false` | 是否允许为空。可选字段需要显式设置为 `true` |
| `defaultValueExpression` | 空字符串 | 默认值表达式，由平台数据表达式机制求值；不是 Java 字段初始化语句，也不是数据库 SQL 默认值 |
| `size` | `-1` | 未指定长度或容量；字符串长度、数值精度等含义由值类型和存储适配器确定 |
| `decimalDigits` | `-1` | 未指定小数位数；金额等精确数值应按需求设置 |
| `unsigned` | `false` | 无符号存储要求，支持情况取决于目标数据源 |
| `extraProps` | 空数组 | 类型或插件使用的扩展属性，按键、值交替填写 |

### Java 类型与逻辑类型

当前扫描器可推断以下类型，其他类型需要显式声明兼容的 `@Field(type = "...")`。数值和布尔字段优先使用包装类型，以便表达空值。

| Java 类型 | 平台类型 |
| --- | --- |
| `String` | `String` |
| `Boolean` | `Boolean` |
| `Short`、`Integer`、`Long` | 同名整数类型 |
| `Float`、`Double` | 同名浮点类型 |
| `BigDecimal` | `Decimal` |
| `LocalDate`、`java.util.Date` | `Date` |
| `LocalDateTime` | `DateTime` |
| `LocalTime` | `Time` |
| `Map`、`List` | `Map`、`List`，表示普通对象或列表值 |
| `JsonBag` | `Json` |

`Map`、`List` 值与模型关联不同。需要引用另一个数据模型时，使用下文的 `@Related`。

### 字段校验

`@Rule` 与 `@Field` 一起使用，`value` 接受规则字符串数组。前面的编码字段同时要求非空，并限制字符范围：

```java
@Field(size = 64)
@Rule({"notEmpty", "regex:^[A-Z0-9_-]+$"})
private String code;
```

内置规则包括 `notNull`、`notEmpty` 和 `regex:正则表达式`。`notEmpty` 对字符串检查是否为空字符串，不会自动去掉首尾空格；`regex:` 对非空值按 Java 正则匹配。规则检查与存储可空设置分别定义，`nullable = false` 不能替代业务需要的格式校验。

## 主键与唯一约束

### 选择主键策略

`@PrimaryKey` 标识主键字段，必须与 `@Field` 一起使用。它的 `generator` 默认是 `disabled`，表示由调用方提供主键。前面的 `snowflake` 使用平台主键生成器，示例以 `String` 接收生成结果。

使用数据库自增时，在适合的整数主键上增加 `@AutoIncrement`，不再同时指定雪花策略：

```java
import com.ouroboros.data.annotation.AutoIncrement;

@Field
@PrimaryKey
@AutoIncrement
private Long id;
```

自增的实际行为由存储适配器与数据库支持决定。类型化 Spring Bean 注入要求有且仅有一个主键，并且 `TypedDataModel<PK, M>` 中的 `PK` 与字段 Java 类型匹配。

### 单字段唯一

编码需要在整个模型中唯一时，为前面的 `code` 字段增加 `@Unique`：

```java
import com.ouroboros.data.annotation.Unique;

@Field(size = 64)
@Rule("notEmpty")
@Unique
private String code;
```

### 多字段唯一

如果业务规则是“同一分类内编码唯一”，则在类上声明联合约束，移除编码字段上的全局 `@Unique`：

```java
import com.ouroboros.data.annotation.UniqueConstraint;

@Model(fullName = "catalog.Product", rawName = "catalog_product")
@UniqueConstraint(name = "category_code", fields = {"categoryId", "code"})
public class Product {
  // 保留前文的字段和访问器。
}
```

`fields` 填写模型字段名，不能填数据库列名。`@UniqueConstraint` 可以重复声明多组约束，`@UniqueConstraints` 是 Java 的重复注解容器，通常无需手工使用。

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `@Unique.scope` | `DEFAULT` | 单字段约束范围 |
| `@UniqueConstraint.name` | 空字符串 | 约束名称，建议使用稳定且可辨认的名称 |
| `@UniqueConstraint.fields` | 必填 | 参与联合约束的模型字段名 |
| `@UniqueConstraint.scope` | `DEFAULT` | 联合约束范围 |
| `@UniqueConstraint.nullsDistinct` | `false` | 为 `true` 时，完整约束键中任一持久值为 `null`，该键不参与重复检查 |

`scope` 使用 `com.ouroboros.data.model.UniquenessScope`：`DEFAULT` 沿用模型默认范围，普通模型默认检查全部记录；`ALL_RECORDS` 显式包含已逻辑删除记录；`ACTIVE_RECORDS` 配合逻辑删除，仅约束有效记录。启用 `@LogicalDelete` 的模型默认使用有效记录范围。

空值策略与删除范围分别生效。部分更新中未提交某个字段，不等于该字段值为 `null`。并发写入仍需要与业务范围匹配的数据库唯一约束，不能仅靠应用层预查询防止重复。

## 定义模型关联

`@Related` 配合 `@Field` 描述关联模型和关联键。建议明确写出类型及两端字段，便于检查实际关联方向。

| 参数 | 说明 |
| --- | --- |
| `model` | 必填，目标模型全名 |
| `type` | 单对象关联使用 `Model`，集合关联使用 `Collection`。不填时，当前扫描器对 `List` 推断为集合，其他情况推断为单对象 |
| `key` | 当前模型参与关联的字段名 |
| `referenceKey` | 目标模型参与关联的字段名 |

### 从商品读取分类

假设应用中已有 `catalog.Category`，其主键为 `id`。在 `Product` 中增加以下属性及访问器：

```java
import com.ouroboros.data.annotation.Related;

@Field
@Related(type = "Model", model = "catalog.Category",
    key = "categoryId", referenceKey = "id")
private Category category;
```

关联条件是 `Product.categoryId = Category.id`。`categoryId` 保存实际外键值，`category` 提供关联读取入口；由于 `key` 指向另一个字段，这个 `category` 属性是虚拟关联字段，不再增加同名存储列。

### 从分类读取商品集合

在 `Category` 类中增加反向集合及访问器：

```java
import java.util.List;
import com.ouroboros.data.annotation.Related;

@Field
@Related(type = "Collection", model = "catalog.Product",
    key = "id", referenceKey = "categoryId")
private List<Product> products;
```

这次当前模型是分类，关联条件是 `Category.id = Product.categoryId`。集合字段为虚拟字段。声明关联不会在每次查询时自动装载整个对象图，查询时按 [查询 DSL](../../api/backend/data-query-dsl/)选择所需关联数据。

## 启用审计、删除与历史记录

这些注解把内置能力加入模型，运行环境需要具备 `ouroboros-data-plugins` 中的注解装饰器和相应插件。注解声明与插件装配分别检查，模型类能够编译不代表运行时已经启用能力。

### 审计字段

在 `Product` 类上增加 `@AuditFields`，模型会补入 `createdBy`、`createdAt`、`updatedBy`、`updatedAt`，并启用相应的审计行为：

```java
import com.ouroboros.data.annotation.AuditFields;

@AuditFields(createdByRawName = "created_by", createdAtRawName = "created_at",
    updatedByRawName = "updated_by", updatedAtRawName = "updated_at")
```

四个参数均为空字符串时使用平台的存储命名约定；它们只调整存储名，不改变模型字段名。若要通过类型化 Java 对象读取这些字段，还需在类中提供对应属性和访问器，插件不会修改已经编译的 Java 类。

### 逻辑删除

`@LogicalDelete` 保留原记录，通过删除标记控制可见性，并可记录删除人和时间：

```java
import com.ouroboros.data.annotation.LogicalDelete;

@LogicalDelete(isDeletedRawName = "is_deleted",
    deletedByRawName = "deleted_by", deletedAtRawName = "deleted_at")
```

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `isDeletedRawName` | 空字符串 | `isDeleted` 的存储名 |
| `deletedByRawName` | 空字符串 | `deletedBy` 的存储名 |
| `deletedByDisabled` | `false` | 为 `true` 时不增加删除人字段 |
| `deletedAtRawName` | 空字符串 | `deletedAt` 的存储名 |
| `deletedAtDisabled` | `false` | 为 `true` 时不增加删除时间字段 |

删除操作应通过模型 API 进入插件链。启用后同时检查普通查询、计数和唯一约束范围，不要只观察数据库记录是否仍存在。

### 归档删除

需要把删除前的数据保存在另一个模型中时，使用 `@ArchiveDelete`：

```java
import com.ouroboros.data.annotation.ArchiveDelete;

@ArchiveDelete(archiveModelName = "catalog.ProductArchive")
```

`archiveModelName` 与 `archiveModel = ProductArchive.class` 二选一。使用类引用时，目标类必须带有 `@Model`，并位于本次模型扫描结果中。该注解不会替你创建归档模型。

默认归档契约要求目标模型包含源模型字段，以及 `sourceModel`、`sourceDataStation`、`sourcePrimaryKey`、`deletedAt`、`deletedBy`、`deleteOperationId` 六个元数据字段。它们分别记录来源模型、数据站、原主键、删除时间、删除人和本次删除操作标识。先准备符合契约的归档模型，再验证归档与删除的一致性；不要只添加目标名称就执行删除。

### SCD2 历史记录

需要记录数据随时间发生的版本变化时，使用 `@Scd2History`：

```java
import com.ouroboros.data.annotation.Scd2History;

@Scd2History(historyModelName = "catalog.ProductHistory")
```

`historyModelName` 与 `historyModel = ProductHistory.class` 二选一，类引用的扫描要求与归档模型相同。源模型需要单一主键，历史模型预先定义并加载，且不能再次启用 SCD2。

默认历史模型需要自己的版本主键、源模型中除主键以外的物理字段，以及以下字段：

| 字段 | 用途 |
| --- | --- |
| `businessKey` | 保存源记录主键，类型与其持久值兼容 |
| `validFrom`、`validTo` | 版本有效期，当前版本的结束时间允许为空 |
| `isCurrent` | 是否为当前版本 |
| `opType` | 产生版本的操作类型 |
| `operator` | 操作者信息，需考虑无当前用户的后台调用 |

开启差异存储时还需要 `changedFields` 和 `changeSet`。高级参数属于插件配置；不要在同一模型上同时用专用注解和 `@DataPlugin` 再声明同一个插件。

### 使用其他已注册插件

`@DataPlugin` 用于直接引用插件名及字符串配置。例如，目标环境已经安装了名为 `CatalogPolicy` 的业务插件，且约定接收 `mode` 参数时，可以写为：

```java
import com.ouroboros.data.annotation.DataPlugin;

@DataPlugin(name = "CatalogPolicy", config = {"mode", "strict"})
```

`name` 必填，`config` 按键、值成对填写。这个示例不包含该插件的实现；开发自己的插件见 [数据模型插件](../plugin-extensions/backend/data-model-plugins)，需要扩展注解到元数据的转换时见 [元数据装饰器](../plugin-extensions/backend/metadata-decorators)。

## 注册扫描并访问模型

将模型包交给扩展包自动配置扫描：

```java
package com.example.catalog;

import org.springframework.context.annotation.Configuration;
import com.ouroboros.data.annotation.DataModelScan;

@Configuration
@DataModelScan("com.example.catalog.model")
public class CatalogAutoConfiguration {
}
```

`@DataModelScan.value` 可以填写多个包；留空时扫描标注该注解的配置类所在包。自动配置本身仍需按 [后端扩展包](../backend-extension-packages)登记并装配。`@DataModelScan` 只是扫描标记，不能替代 typed runtime 的运行依赖。

模型完成加载后，通过 `DataModelCenter` 按全名访问，或注入 `TypedDataModel<String, Product>`。Spring 注入的延迟代理可能早于模型就绪，读写放在运行时业务方法中，具体示例见 [数据模型](./data-model)。

需要编译器检查查询字段时，再启用 [类型化数据模型编译](../development-tools#类型化数据模型编译)，生成 `ProductMeta`。编译期生成查询字段、运行时扫描模型、存储结构迁移是三个不同环节，分别确认结果。

## 验证与常见问题

先在测试环境核对最终模型全名、数据站、存储名、字段与主键，再通过模型 API 实际读写。增加约束或插件后，补测重复值、空值、关联加载、删除、历史记录和失败回滚；已有数据还要检查升级后的读取结果。

### 类已经打进 JAR，为什么找不到模型？

依次确认 typed runtime 已装配、自动配置已加载、`@DataModelScan` 包名覆盖目标类、类上有 `@Model`。模型发现与普通组件扫描是不同机制，扩大 `@ComponentScan` 不能替代模型扫描。

### 为什么父类属性或某个 Java 字段没有出现在模型里？

当前模型扫描只读取类中直接声明且带 `@Field` 的字段。检查注解位置及继承关系，不要只看 Java 对象是否拥有 getter。

### 为什么 `@Unique`、审计或删除注解没有产生预期行为？

确认目标运行环境包含 `ouroboros-data-plugins` 及其 SPI 注册资源，再查看最终模型的约束、字段和插件描述符。编译时存在注解类，只能证明注解可以引用。

### 为什么类型化模型可以注入，却提示 `Model is not ready`？

注入得到的可能是延迟代理。避免在构造器或过早的 `@PostConstruct` 中读写，确认模型刷新已经完成；刷新后仍失败时检查模型全名和加载错误，不能靠重复注入解决。
