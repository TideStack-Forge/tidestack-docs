---
title: 数据模型元数据装饰器插件
---

# 数据模型元数据装饰器插件

元数据装饰器在模型构建过程中补充或调整定义，例如增加审计字段和配套插件描述符。数据模型插件改变运行时操作行为，两者职责不同，也可以配合使用。

## 1. 实现装饰器

实现 `com.ouroboros.data.model.DataModelMetaDecorator`：

```java
boolean supports(DataModelMeta originalMeta);
DataModelMeta decorate(DataModelMeta originalMeta);
```

以“启用来源标签后增加 sourceTag 字段”为例：

```java
public class SourceTagDecorator implements DataModelMetaDecorator {
  @Override
  public boolean supports(DataModelMeta meta) {
    return meta.getExtraProp(Boolean.class, "enableSourceTag").orElse(false);
  }

  @Override
  public DataModelMeta decorate(DataModelMeta meta) {
    var copy = meta.deepCopy();
    if (copy.getFields().stream().anyMatch(f -> "sourceTag".equals(f.getName()))) {
      return copy;
    }
    var field = new DataModelFieldMeta();
    field.setName("sourceTag");
    field.setLabel("来源标签");
    field.setType("String");
    field.setIsNullable(true);
    var fields = new java.util.ArrayList<>(copy.getFields());
    fields.add(field);
    copy.setFields(fields);
    return copy;
  }
}
```

所用模型类均来自 `com.ouroboros.data.model`。此示例只添加元数据，不自动填充值；需要自动填充时，配套实现 [数据模型插件](./data-model-plugins)。已有同名字段时，应按业务约定核对类型兼容性，不能重复添加。

## 2. 注册并启用

注册文件：

```text
META-INF/services/com.ouroboros.data.model.DataModelMetaDecorator
```

写入实现类名，在目标模型的扩展属性中设置 `enableSourceTag: true`。平台加载器调用装饰器链，无需在业务请求中手动执行 `decorate`。

装饰器按平台反向排序链应用。`supports` 使用原始元数据判断，`decorate` 依次接受前一装饰结果；不能依赖某个装饰器新加属性后才让另一个 supports 命中。涉及顺序时参考既有 `@Priority` 约定并验证组合。

## 3. 注解装饰与模型装饰

Java 自定义模型注解、字段注解的解析还可使用 `TypedModelAnnotationDecorator`、`TypedFieldAnnotationDecorator`。它们负责注解到元数据的转换，与本页的元数据装饰阶段不同。沿用既有 typed 扫描与装饰链，不再新增独立扫描器。

## 验证

核对开关关闭、开启、已有字段、多个装饰器叠加和重复加载。检查最终字段、描述符与数据库迁移，确认原始元数据未被意外改写，刷新后不重复增加字段或插件。旧数据新增非空字段时还需要迁移与默认值方案。
