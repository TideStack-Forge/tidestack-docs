---
title: 消息队列
---

# 消息队列

Java 业务代码可以直接发送和消费消息，不需要把每次消息处理包装成逻辑流。需要业务人员配置消息驱动流程时，再使用低代码消息模型与节点。

## 1. 准备绑定

先按目标应用配置消息中间件、binder、destination、消费组及 `MQBridge` 使用的绑定名。下例约定生产绑定为 `order-events-out`、消费绑定为 `order-events-in`，两者连接同一测试目标；名称仅为示例，不会自动创建中间件资源。

## 2. 从 Service 发送

```java
import java.util.Map;
import org.springframework.messaging.support.MessageBuilder;

mq.send("order-events-out", MessageBuilder.withPayload(Map.of(
    "eventId", "evt-001", "orderId", "ORDER-001"
)).build());
```

`mq` 是注入的 `com.ouroboros.mq.MQBridge`。可使用 `send(bindingName, routingKey, message)` 指定路由键；具体生效语义取决于目标 binder。返回 `void`，不能将方法返回视为消费者已处理成功或消息已持久化。

## 3. 注册并释放消费者

下面在 Bean 生命周期中保留同一个 Handler 实例用于注销，业务 `OrderEventService` 负责解析、校验与幂等处理：

```java
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.messaging.MessageHandler;
import org.springframework.stereotype.Component;
import com.ouroboros.mq.MQBridge;

@Component
public class OrderEventConsumer {
  private final MQBridge mq;
  private final MessageHandler handler;

  public OrderEventConsumer(MQBridge mq, OrderEventService service) {
    this.mq = mq;
    this.handler = message -> service.handle(message.getPayload());
  }

  @PostConstruct
  public void subscribe() { mq.subscribe("order-events-in", handler); }

  @PreDestroy
  public void unsubscribe() { mq.unsubscribe("order-events-in", handler); }
}
```

通过扩展包自动配置导入消费者与 Service。`MQBridge` 有平台刷新后的启动与延迟操作机制，不自行创建另一套连接来规避绑定问题。异常交给既有消息错误处理链路，重试与死信按 binder 和应用配置验证。

## 4. 选择流程或 Java 消费

流程消费入口适合可视化编排；Java 消费直接调用普通 Service，也可以按明确业务契约调用动作或逻辑流。不要让同一事件同时被两个入口重复处理；后台处理需要明确执行身份，不能假设存在当前请求用户。

## 验证

发送带唯一 `eventId` 的测试消息，确认实际中间件和消费者均收到，再重复发送检查幂等。覆盖绑定缺失、中间件不可用、消费异常、重启和多实例，观察日志、重试及死信。`MQBridge` 部分降级路径会记录错误或丢弃操作，必须核对实际投递结果。事务数据与消息之间的一致性按业务要求设计，方法返回不代表两者原子提交。
