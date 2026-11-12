---
title: RPC 模型
---

# RPC 模型

RPC 模型集中维护外部地址、参数与认证。Java 和逻辑流可以引用同一个定义；普通 Java 系统集成也可以沿用应用已采用的 HTTP 客户端，不必为了发送请求先创建逻辑流。

## 1. 配置一个 RPC

在外部接口管理中定义并启用 `external.echo`：

```json
{
  "name": "external.echo",
  "title": "外部回显",
  "type": "OpenAPI",
  "isEnabled": true,
  "timeout": 5000,
  "retry": 0,
  "request": {
    "url": "#{external.baseUrl}/echo",
    "method": "POST",
    "parameters": [
      {"name": "text", "in": "body", "value": "${text}", "required": true}
    ]
  }
}
```

为 `external.baseUrl` 配置测试服务地址。需要认证时，使用 `authCredential` 引用已加载的 RPC 认证资源。更多参数位置与选项见 [RPC 模型](../../concepts/rpc-model/)。

## 2. 在 Java 中执行

将 `RpcInvocationExecutor` 注入业务服务，使用 `RpcInvocationRequest`：

```java
import java.util.Map;
import com.ouroboros.rpc.execution.RpcInvocationRequest;
import com.ouroboros.exception.BusinessException;

var result = executor.invoke(new RpcInvocationRequest(
    "external.echo", Map.of("text", "hello")
));
if (result.isFailure()) {
  throw new BusinessException("外部回显调用失败", result.getError());
}
Object payload = result.getPayload();
```

`executor` 是注入的 `com.ouroboros.rpc.execution.RpcInvocationExecutor`，需目标应用包含 RPC runtime。执行器负责选择协议调用器并应用拦截器。`RPCModelDefinitionCenter` 用于查询定义，`RpcRuntimeRegistryService` 用于列举运行信息，都不等价于执行接口。

需要覆盖本次超时或重试时，使用请求的完整构造器传入 options，当前 HTTP 调用器识别 `timeoutOverrideMs`、`retryOverride`。`internalCall` 与 `purpose` 表示调用场景，不能用来伪装用户授权。

## 3. 在逻辑流中复用

在 RPC 节点选择同一 `external.echo`，映射 `text` 输入和结果。环境切换只调整外部地址与凭据，保留名称和业务参数。协议执行成功后仍要按外部系统的响应结构判断业务成功。

## 验证

用测试外部服务核对 Java 与节点发出的请求、认证及 payload，再验证缺失定义、禁用模型、缺失凭据、超时、远程错误与业务失败。写操作启用重试前必须确认对端幂等语义。日志和 AI 上下文使用脱敏请求，不输出认证密钥。
