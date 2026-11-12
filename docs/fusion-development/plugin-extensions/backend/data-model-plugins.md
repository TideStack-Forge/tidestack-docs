---
title: 数据模型插件
---

# 数据模型插件

数据模型插件在数据操作链中提供可复用行为，例如审计、逻辑删除或统一校验。模型通过插件描述符选择插件，构建器根据模型与配置生成运行时实现。

## 1. 实现操作链行为

实现 `com.ouroboros.data.model.DataModelPlugin`，只覆盖需要改变的操作。以下摘录展示插入操作如何继续调用后续插件：

```java
@Override
public Try<Record> insert(Map<String, Object> data, DataModelPluginContext context) {
  return context.getNextPlugin().insert(data, context.getNextPluginContext());
}
```

这是委托契约，业务逻辑应在委托前后按需求实现。接口还提供 `batchInsert`、`update`、`delete`、`count`、`query`、`queryForUpdate`。只覆盖单条 insert 不会自动保证批量插入执行同样校验；查询过滤也要覆盖 count 和需要锁定查询的路径。

保留 `Try` 的错误语义和现有事务，使用 next plugin 与 next context 成对传递。不要在插件中重新调用同一模型的顶层方法，造成递归进入自身。

## 2. 实现插件构建器

`DataModelPluginBuilder` 提供：

```java
boolean support(String name);
Optional<DataModelPlugin> build(DataModel dataModel, Map<String, Object> config);
```

`support` 匹配稳定插件名，例如 `OrderAudit`；`build` 核对所需字段和配置后返回实现。注册：

```text
META-INF/services/com.ouroboros.data.model.DataModelPluginBuilder
```

文件写入构建器全限定类名，插件实例由构建器产生。可参考内置 `BasicAuditDataModelPlugin` 的 Builder 实现和操作链行为。

## 3. 在模型中启用

在模型元数据的插件描述符中配置名称与参数。Java 元数据构建过程可以使用：

```java
new PluginDescriptor("OrderAudit", Map.of("source", "orders"));
```

将描述符加入该模型的 `pluginDescriptors`，保留已有描述符。`PluginDescriptor` 位于 `com.ouroboros.data.model`。运行态插件不负责自动增加缺失字段；需要声明字段和配套描述符时，使用 [元数据装饰器](./metadata-decorators)。

## 验证

用启用与未启用插件的两个模型比较行为。覆盖单条、批量、更新、查询、count、锁定查询及删除中受影响的操作，验证链式顺序、错误传播和回滚。插件安装与模型启用分别检查，不能只证明构建器可发现。
