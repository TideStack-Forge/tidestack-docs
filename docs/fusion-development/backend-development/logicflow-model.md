---
title: 逻辑流模型
---

# 逻辑流模型

逻辑流可编排数据、脚本、RPC 和平台节点。Java 服务通过正式执行入口调用已加载流程；需要在编排中复用 Java 能力时，再提供脚本 helper 或节点插件。

## 1. 准备流程契约

在目标应用创建并启用流程，例如 `sales.calculateAmount`。约定输入顺序、数据类型、输出及失败处理，在平台中用真实样例执行一次。模型资源随 JAR 交付时，按 [元数据约定](../../guide/advance/authoring-metadata-conventions/)打包，保持相同流程名。

## 2. 在 Service 中执行

```java
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.ouroboros.logicflow.LogicFlowExecutionFacade;

@Service
public class OrderCalculationService {
  private final LogicFlowExecutionFacade flows;

  public OrderCalculationService(LogicFlowExecutionFacade flows) {
    this.flows = flows;
  }

  public Object calculate(String orderId) {
    return flows.execute("sales.calculateAmount",
        List.<Object>of(Map.of("orderId", orderId))).get();
  }
}
```

本例约定流程只有一个对象输入。`List<Object>` 的各项对应流程输入，不能把多个输入随意合并成一个 Map。返回 `Try<Object>`，失败通过 `.get()` 传播，由业务边界统一转换异常。

`FlowModelCenter` 用于发现与检查流程。业务执行使用 `LogicFlowExecutionFacade`，保留流程启用状态和设计错误检查；无需自行按名称缓存模型快照或绕过执行门禁。

## 3. 从流程使用 Java 能力

| 使用场景 | 实现方式 |
| --- | --- |
| 脚本节点调用一项共享服务 | [脚本上下文扩展](../../guide/advance/extend-backend/extend-script/)提供 helper，委托 Spring Bean |
| 业务人员需要可配置、可复用节点 | [逻辑流节点扩展](../../guide/advance/extend-backend/extend-logicflow/)提供节点定义、参数和执行器 |
| HTTP 请求进入流程 | [WebAPI 模型](./webapi-model)配置逻辑流处理器 |
| 在指定时间执行流程 | [计划任务](./scheduled-tasks)使用平台 Scheduler |

仅在一个 Service 内使用的 Java 方法可以直接调用，不必为了调用它先创建节点。

## 验证

比较平台执行和 Java 执行的输入与输出，再检查禁用、设计错误、无效参数和业务失败。流程读写受权限控制的数据时，确认当前执行身份、数据过滤与事务边界。背景任务中没有 HTTP 上下文，不能依赖浏览器用户或请求参数。
