---
title: 数据模型
---

# 数据模型

本教程用 Java 访问应用中已加载的数据模型，并展示如何随扩展包声明一个新的类型化模型。模型定义来自平台或 Java 时，都进入同一数据模型运行时。

## 1. 调用已有模型

假设应用已有 `sales.Order`，且包含 `status` 字段：

```java
import java.util.Map;
import com.ouroboros.data.model.DataModelCenter;
import com.ouroboros.exception.BusinessException;

var orders = DataModelCenter.getDataModel("sales.Order")
    .orElseThrow(() -> new BusinessException("订单模型尚未加载"));
var rows = orders.query(Map.of(
    "where", Map.of("status", "OPEN"),
    "limit", 20
)).get();
```

Java 中查询中心返回 `Optional`，数据操作返回 `Try`；`.get()` 会传播失败。多数据站有同名模型时使用 `数据站名:模型全名`。过滤、关联、排序与写入语法见 [数据模型 API](../../api/backend/data-model/)和 [查询 DSL](../../api/backend/data-query-dsl/)。

调用数据模型 API 不代表自动执行某个业务动作的全部授权、状态校验和事件。订单审批等业务行为应优先调用对应的 [业务动作](./business-model)。自定义查询必须落实 [访问控制结果](../authority-subject-and-access-control-design)。

## 2. 用注解声明新模型

下面为独立的积分记录声明模型；它不应与业务模型投影生成的数据模型重名。

```java
package com.example.reward.model;

import com.ouroboros.data.annotation.Field;
import com.ouroboros.data.annotation.Model;
import com.ouroboros.data.annotation.PrimaryKey;

@Model(fullName = "reward.PointRecord", label = "积分记录")
public class PointRecord {
  @PrimaryKey
  @Field(type = "String", size = 64)
  private String id;

  @Field(type = "String", size = 64)
  private String ownerId;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getOwnerId() { return ownerId; }
  public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
}
```

`@Model.fullName` 是运行时模型名，`rawName` 用于存储名称，`dataStation` 默认 `default`。`@Field` 控制类型、长度、可空及默认值等元数据。`@PrimaryKey` 默认 `generator="disabled"`，本例写入时由调用方提供 ID；需要平台生成时配置实际存在的主键策略。

## 3. 注册扫描与类型化访问

在扩展包自动配置中声明扫描包：

```java
import org.springframework.context.annotation.Configuration;
import com.ouroboros.data.annotation.DataModelScan;

@Configuration
@DataModelScan("com.example.reward.model")
public class RewardModelConfiguration {
}
```

按 [扩展包指南](../backend-extension-packages)在 imports 与 spring.factories 中注册同一自动配置，并确保目标应用已加载 typed runtime。`@DataModelScan` 是扫描标记，本身不导入运行时；真正的扫描注册由 `TypedDataModelAutoConfiguration` 提供。Java 类写进 JAR 但未被扫描时，模型不会自动出现。

运行时模型准备好后，按类型取得模型：

```java
import com.ouroboros.data.model.TypedDataModelCenter;

var points = TypedDataModelCenter.getDataModel(String.class, PointRecord.class)
    .orElseThrow(() -> new IllegalStateException("积分模型尚未加载"));
```

## 4. 用 @Autowired 注入类型化模型

模型已经通过上面的扫描注册时，Spring 可以按泛型注入 `TypedDataModel<主键类型, 模型类型>`。下面直接使用字段注入，`PointRecord` 就是前文的模型类：

```java
package com.example.reward.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.reward.model.PointRecord;
import com.ouroboros.data.model.TypedDataModel;

@Service
public class PointRecordService {
  @Autowired
  private TypedDataModel<String, PointRecord> points;

  public PointRecord find(String id) {
    return points.get(id).get();
  }

  public PointRecord create(String id, String ownerId) {
    var record = new PointRecord();
    record.setId(id);
    record.setOwnerId(ownerId);
    return points.insert(record).get();
  }
}
```

同样可以使用单构造器注入，单构造器上的 `@Autowired` 可省略。选择一种方式即可，无需再为同一模型手写 `@Bean` 工厂：

```java
public PointRecordService(TypedDataModel<String, PointRecord> points) {
  this.points = points;
}
```

把业务 Service 一并导入扩展包自动配置。注入条件与模型生命周期如下：

| 条件或阶段 | 行为 |
| --- | --- |
| 模型类已被 `@DataModelScan` 扫描，typed runtime 已装配 | 可以注册对应的类型化 Bean |
| 有且仅有一个 `@PrimaryKey`，泛型主键类型匹配 | 本例使用 `String`；缺少主键或使用复合主键时不提供该注入 Bean |
| Spring 创建 Service 时模型尚未刷新 | 可以先注入延迟代理；注入成功不代表模型已经可查询 |
| 模型刷新完成后从业务方法调用 | 代理委托给已加载模型，数据操作返回 `Try` |
| 模型未就绪便调用 | 抛出 `Model is not ready`；不要在构造器或过早的 `@PostConstruct` 中查询 |
| 刷新后仍不存在目标模型 | 代理进入失败状态，应检查扫描、模型加载与全名，而不是无限等待 |

类型化只改变 Java 的调用形式，权限、事务和数据模型插件仍需按实际入口配置。更多查询与写入方法见 [类型化模型 API](../../api/backend/data-model/typed-data-model/)。

## 验证

安装后按全名和 Java 类型分别发现同一模型，核对数据站、字段、主键及迁移结果。写入后从平台模型入口读取，再从 Java 查询，检查空值、重复主键、无效字段和失败传播。增加一个注入该类型化模型的 Service，在模型就绪后实际读写；同时验证缺少扫描、错误主键类型和过早访问时的失败。不要仅根据 JAR 中存在注解或 Spring 注入成功判断模型可用。
