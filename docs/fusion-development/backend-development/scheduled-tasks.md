---
title: 计划任务
---

# 计划任务

Java 定时方法使用应用的 Spring 调度机制，平台 Scheduler 则安排逻辑流执行。按执行对象选择入口，无需把普通 Java 任务先转换成逻辑流。

## 1. 编写 Java 定时任务

下面假定 `OrderReconciliationService` 是已装配的业务服务：

```java
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class OrderReconciliationJob {
  private final OrderReconciliationService service;

  public OrderReconciliationJob(OrderReconciliationService service) {
    this.service = service;
  }

  @Scheduled(fixedDelayString = "${orders.reconcile-delay-ms:60000}")
  public void reconcile() { service.reconcile(); }
}
```

目标 Spring 上下文需已启用调度；未启用时，在所属配置类中使用 `@EnableScheduling` 并导入任务 Bean。沿用应用已有调度器和线程池配置，不在每个任务内部创建线程池。间隔通过配置提供，业务需要暂停或动态调整时选择现有管理机制。

Spring 本地定时方法通常在每个应用实例运行。需要集群只执行一次时，使用应用已采用的协调机制；不能把单机验证结果视为集群互斥保证。

## 2. 调度逻辑流

目标应用已经加载并启用 `sales.reconcileOrders` 时，可注入 `com.ouroboros.scheduler.Scheduler`：

```java
import java.time.Duration;
import java.util.Map;

scheduler.scheduleOnce("sales-reconcile-test", Duration.ofMinutes(1),
    "sales.reconcileOrders", Map.of("batchSize", 100)).get();
```

周期调度使用 `scheduleCron(taskName, cron, flowName, data)`；Cron 语法按目标调度实现核对。取消使用 `cancel(taskName)`，`isScheduled(taskName)` 查询是否登记，不能用它证明业务执行成功。

当前平台 `Scheduler` 的这些接口以 `flowName` 为执行目标，没有 `Runnable` 重载。新增可复用的任务定义来源使用 `ScheduleTaskProvider`；普通 Java 定时方法不必实现 Provider。

## 3. 明确身份、事务与失败

任务线程没有浏览器请求。需要授权的模型操作必须安排执行身份；事务放在被调用的业务 Service 中，明确一批任务如何提交和失败回滚。记录任务名、业务批次、开始结束及错误，重试前确认幂等。

## 验证

先在测试环境设置短间隔或一次性任务，观察真正的业务状态变化，再验证失败、取消、重复启动与多实例。Spring 方法检查 Bean 是否装配、调度是否启用；平台任务检查任务定义、目标逻辑流、数据和 Scheduler 结果。
