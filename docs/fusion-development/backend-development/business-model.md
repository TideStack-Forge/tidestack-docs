---
title: 业务模型
---

# 业务模型

业务模型定义对象、关系及动作契约，Java 可以实现动作，也可以调用同一动作运行时。普通 HTTP Controller 或 Service 方法不会自动成为业务动作。

## 1. 在模型中定义动作

先在业务模型中声明动作的名称、参数、数据、权限与前置条件。实现绑定可以选择逻辑流或 Java Handler。以下是动作定义中绑定部分的示意，需并入目标模型已有动作：

```json
{
  "binding": {
    "kind": "handler",
    "handlerName": "orderRemarkHandler"
  }
}
```

模型全名和动作名使用稳定标识，例如 `sales.Order` 的 `setRemark`。模型已声明契约时，Java 使用实现绑定，不再另建一份同名动作契约。

## 2. 用 Spring Bean 实现动作

以下方法假定模型的 `setRemark` 动作接受 `params.orderId` 与 `data.remark`，`OrderService` 已实现业务校验和更新：

```java
import org.springframework.stereotype.Service;
import com.ouroboros.businessmodel.annotation.BusinessActionBinding;
import com.ouroboros.businessmodel.annotation.BusinessActionParam;
import com.ouroboros.businessmodel.annotation.BusinessActionData;

@Service
public class OrderActionHandlers {
  private final OrderService orders;

  public OrderActionHandlers(OrderService orders) { this.orders = orders; }

  @BusinessActionBinding(
      modelFullName = "sales.Order", actionName = "setRemark",
      handlerName = "orderRemarkHandler")
  public void setRemark(@BusinessActionParam("orderId") String orderId,
                        @BusinessActionData("remark") String remark) {
    orders.setRemark(orderId, remark);
  }
}
```

通过自动配置导入该 Bean。复杂实现可使用正式 `BusinessActionHandler`，以 `getName()` 对应 `handlerName`，在 `handle(BusinessActionContext, BusinessActionInput<?, ?>)` 中处理输入。完整注解 `@BusinessAction` 可贡献契约；`@BusinessActionBinding` 用于绑定已有契约。

## 3. 从 Java 调用同一动作

将 `BusinessActionRuntime` 注入调用服务：

```java
import java.util.Map;
import com.ouroboros.businessmodel.action.BusinessActionInput;

runtime.invoke("sales.Order", "setRemark", BusinessActionInput.of(
    Map.of("orderId", "ORDER-001"),
    Map.of("remark", "已核对收货信息")
));
```

`runtime` 是注入的 `BusinessActionRuntime`。输入明确区分 `params` 与 `data`，只有一类时使用 `paramsOnly` 或 `dataOnly`，无输入时使用 `empty()`。调用进入统一动作运行时；直接调用 Handler Bean 方法不等价于调用动作。

动作以 REQUIRED 传播方式参与事务；加入外层事务时，最终提交由外层决定。方法返回不代表提交后事件已完成。消息和计划任务调用动作时，需要安排对应执行身份，不能伪造请求用户。

## 4. 让低代码入口调用 Java 实现

业务模型投影的界面与接口按动作绑定调用上述实现。自定义 WebAPI 使用 `BusinessAction` 处理器，显式声明模型、动作和 `actionInputMapping`，见 [WebAPI 模型](./webapi-model)。逻辑流实现则将 binding 改为 `kind: logicflow` 并引用有效 `flowName`。

普通 `@RequestMapping` 接口默认仍走 Controller 链路；只有明确配置动作绑定并提供正式实现，才共用动作契约。

## 5. 监听业务事件

业务事件表达已发生的事实，例如 `sales.Order` 的 `submitted`。先在源模型声明事件及载荷 Schema，并由动作的 `emits` 声明和实际实现产生事实。Java 消费者使用 `@BusinessEventSubscription` 或 `BusinessEventListener`；普通 Spring `@EventListener` 不会自动订阅这些事实。

假设源模型已有 `submitted`，载荷中 `orderId` 为字符串，消费者模型 `sales.Order` 已存在。以下注解为消费者声明 `updateSummary` 订阅，并绑定当前方法。`OrderSummaryService` 是应用自己实现的业务服务，在接收事务中更新汇总，并记录交付 ID 防止重复处理：

```java
import java.util.Map;
import org.springframework.stereotype.Service;
import com.ouroboros.businessmodel.annotation.BusinessEventSubscription;
import com.ouroboros.businessmodel.event.BusinessEventOccurrence;
import com.ouroboros.businessmodel.event.BusinessEventDeliveryContext;
import com.ouroboros.exception.BusinessException;

@Service
public class OrderEventListeners {
  private final OrderSummaryService summaries;

  public OrderEventListeners(OrderSummaryService summaries) {
    this.summaries = summaries;
  }

  @BusinessEventSubscription(
      consumerModelFullName = "sales.Order",
      subscriptionName = "updateSummary",
      sourceEventModelFullName = "sales.Order",
      sourceEventName = "submitted",
      listenerName = "orderSubmittedSummary",
      executionPrincipalRef = "order-event-consumer")
  public void onSubmitted(BusinessEventOccurrence<Map<String, Object>> event,
                          BusinessEventDeliveryContext delivery) {
    Object value = event.payloadFields().get("orderId");
    if (!(value instanceof String orderId) || orderId.isBlank()) {
      throw new BusinessException("订单事件缺少 orderId");
    }
    summaries.updateFromSubmission(delivery.deliveryId(), event.eventId(), orderId);
  }
}
```

通过扩展包自动配置导入监听 Bean。`order-event-consumer` 必须替换为已存在且启用的执行 User，并授予源事件、完整载荷和实际消费操作所需的权限。它不是监听器名称，也不会自动继承发起 HTTP 请求的用户。

### 与平台中的订阅配合

订阅也可以先在消费者模型中配置来源、过滤条件、执行身份及 `listenerName`。此时 Java 仅绑定实现，保留方法体，把注解替换为：

```java
@BusinessEventSubscription(
    consumerModelFullName = "sales.Order",
    subscriptionName = "updateSummary",
    listenerName = "orderSubmittedSummary")
```

两种方式选择一种，避免同名订阅重复贡献。订阅绑定只能关联已有契约，不能顺便覆盖动态配置。`listenerConfig` 传静态配置；依赖事件内容的参数使用 `listenerInputMapping`，在 `delivery.listenerInput()` 中读取。需要在多个订阅复用同一个实现时，可以注册命名的 `BusinessEventListener`，再由模型引用其 `getName()`。

### 载荷、事务与重试

- 事实与 Outbox 随源事务一起提交，消费者在源提交后处理；源事务回滚时不应产生可消费的事实。动作返回不等于监听处理完成。
- 默认 `ATOMIC` 模式把消费者的数据写入和交付确认放在接收事务中。写入继续使用正式数据模型 API，异常向外传播，避免失败后仍确认成功。
- 外部通知、远程接口等副作用需要支持 `INDEPENDENT` 的监听实现：同步执行，但在接收事务及锁之外完成。该模式不能写平台业务数据，外部副作用的持久化、幂等与结果确认由实现负责；不能只修改订阅配置就让普通实现具备可靠投递能力。
- 注解方法的载荷泛型使用具体 DTO 或 `Map<String, Object>`，不能使用通配符。方法必须同步返回 `void`，不要加 `@Async` 或返回 `CompletableFuture`。平台只有在实现完成后才能确认交付。
- 使用 `event.eventId()` 标识事实、`delivery.deliveryId()` 标识一次订阅的交付责任，结合 `delivery.attempt()` 排查重试。实现应能安全处理重驱和重复请求。
- 载荷是不可变历史事实。不要重新查询当前订单来冒充发生时的载荷。使用生成的类型化载荷时，身份和 Schema 指纹必须匹配，再用 `event.payload()` 读取。

默认数据变更事件 `recordsCreated`、`recordsUpdated`、`recordsDeleted` 的载荷是操作类型、对象 ID 与影响数量，不是完整记录镜像。需要“订单已提交”这类业务含义时，显式定义事件及其载荷。

## 验证

从平台页面、HTTP 动作入口与 Java runtime 分别执行同一组输入，检查业务结果、权限、前置条件、失败回滚及事件。对事件另验源事务回滚、监听失败重试、消费身份无权限、重驱幂等和模型刷新后的订阅发现。再验证实现缺失、参数不符、无权限和重复请求。`formatVersion: 2.0` 的自定义动作接口必须显式提供输入映射，不能沿用旧版隐式输入假设。
