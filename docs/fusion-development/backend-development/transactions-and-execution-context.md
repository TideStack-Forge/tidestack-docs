---
title: 事务、异常与后台身份
---

# 事务、异常与后台身份

同一个 Service 可能从页面请求、业务动作、消息或计划任务调用。每个入口都要回答三个问题：哪些写入共同提交，失败怎样传给调用方，以谁的身份执行。入口改变时，这些条件需要重新核对。

## 为一项业务操作划定事务

普通 Spring Service 使用项目已有的 `PlatformTransactionManager`。把需要共同成功的一组写入放在公开事务方法中，由另一个 Bean 通过 Spring 代理调用：

```java
@Transactional(rollbackFor = Exception.class)
public Material create(String code, String name) {
  var material = new Material();
  material.setId(UUID.randomUUID().toString());
  material.setCode(code);
  material.setName(name);
  return materials.insert(material).get();
}
```

这里沿用 [物料登记示例](../first-feature)中的模型和依赖。真实方法先执行输入校验，示例突出写入与失败传播的边界。

事务管理器与数据模型实际使用的连接资源必须一致。`@Transactional` 不会让多个独立数据源、外部 HTTP 请求或消息发送自动成为一个原子事务。多事务管理器工程要明确选择对应 Bean，并验证使用的是同一个数据源。

同一个对象用 `this.create(...)` 调用自身方法不会经过代理；在代码中 `new MaterialService(...)` 也不会获得注解事务。应将事务入口放在适当的独立 Service 中，经容器注入后调用。测试中的手工构造适合检查纯业务逻辑，事务效果要由带真实代理和数据源的集成测试验证。

## 让数据操作失败离开事务边界

平台数据操作通常返回 `Try`。要让写入失败引发事务回滚，应在事务方法中取出结果并传播异常：

```java
var created = materials.insert(material).get();
return created;
```

下面的写法会丢掉失败信息，使调用方无法区分“没有结果”和“保存失败”：

```java
// 不用于需要失败回滚的业务写入。
return materials.insert(material).getOrElse((Material) null);
```

也不要在事务方法内部先转换为 `WebApiResult.error(...)` 再正常返回。响应转换应位于事务方法之外；先让事务看到失败，再由统一异常处理映射为接口结果。

单条写入成功也不能证明事务有效。验证时先写入一条记录，再触发后续失败，最后在事务外检查前一条记录没有留下。[自动化测试](../automated-testing)附有实际执行这条路径的测试。

## 区分普通 Service 与业务动作

业务模型动作已经有统一执行边界：运行时使用 `PROPAGATION_REQUIRED` 事务，并处理权限、前置条件、只读约束、变更跟踪、事件与审计。需要这些行为时，从 [业务动作入口](./business-model)调用，不能直接调用动作的实现方法替代整个执行过程。

动作实现可以调用普通 Service，但其写入必须参与当前动作事务。动作运行时会核对数据写入使用的事务资源；在内部另开独立事务、写到不匹配的数据源或绕开模型数据层，都可能破坏动作的提交与事件一致性。

调用逻辑流时也要确认所在入口。经业务动作执行的逻辑流受动作边界管理；普通代码直接调用流程，不能据此推断已具备相同的鉴权、事务和事件契约。

## 抛出可以定位的异常

业务规则不满足时，使用 `BusinessException` 给出可处理的信息，例如“物料编码不能为空”。捕获底层异常并改写为业务语义时，保留原因为后续定位提供线索：

```java
throw new BusinessException("物料登记失败，请核对当前物料状态", cause);
```

只在能够解释、补充上下文或完成明确恢复时捕获异常。不要捕获所有错误后继续执行剩余写入，也不要返回一个空列表来掩盖查询失败。模型校验异常已有平台映射，能够原样传播时无需额外包裹。

日志中记录业务标识、动作和执行批次，保留异常堆栈；面向用户的响应说明下一步可检查的对象。密码、令牌和整份敏感记录都不应进入这些信息。

## 在后台显式设置执行身份

HTTP 请求中的身份位于当前执行上下文。线程池、消息消费者和计划任务不应假定自己继承了浏览器用户。新代码使用 `CurrentSecurityContextHolder` 的作用域方法，在工作线程内设置身份，并在结束后自动恢复原上下文。

### 只需要业务身份的任务

例如，一个已经通过入口授权的短任务，需要把当前业务用户传给审计或默认值计算，可以在提交前取出身份，在任务内部建立作用域：

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import com.ouroboros.security.context.CurrentSecurityContextHolder;

var identity = CurrentSecurityContextHolder.getRequiredIdentity();
CompletableFuture<Material> result = CompletableFuture.supplyAsync(
    () -> CurrentSecurityContextHolder.withIdentity(
        identity, () -> materialService.create(code, name)),
    executor);
```

`executor` 使用应用已经配置并管理生命周期的线程池；`materialService` 是注入的 Spring Bean，在工作线程内开启自己的事务。提交线程的数据库事务不会随身份一起传入。

`withIdentity` 只提供 `SecurityIdentity`，不同时提供完整认证和权限计算结果。任务需要调用受权限约束的业务动作或消费访问控制参数时，应使用下面的完整上下文方式。身份作用域也不会把直接数据查询自动变成按用户过滤的查询。

### 同时需要认证和权限上下文的任务

对请求内立即提交的短任务，可以捕获当前可信认证对象和身份，组成一个作用域。下面的片段接在已完成认证的调用位置：

```java
import java.util.Optional;
import com.ouroboros.security.authentication.OuroborosAuthentication;
import com.ouroboros.security.context.CurrentSecurityContext;
import com.ouroboros.security.context.CurrentSecurityContextHolder;
import com.ouroboros.security.identity.SecurityIdentity;

var identity = CurrentSecurityContextHolder.getRequiredIdentity();
var authentication = CurrentSecurityContextHolder.findAuthentication()
    .orElseThrow(() -> new IllegalStateException("当前调用缺少认证上下文"));

CurrentSecurityContext taskContext = new CurrentSecurityContext() {
  @Override
  public Optional<SecurityIdentity> findIdentity() {
    return Optional.of(identity);
  }

  @Override
  public Optional<OuroborosAuthentication> findAuthentication() {
    return Optional.of(authentication);
  }
};

CompletableFuture<Material> result = CompletableFuture.supplyAsync(
    () -> CurrentSecurityContextHolder.withContext(
        taskContext, () -> materialService.create(code, name)),
    executor);
```

这段代码传递已有认证，不会增加角色或权限。后台实现仍应调用正式业务入口，并消费相应的数据访问控制结果。长时间排队、跨进程或需要在执行时重新核验账号状态的任务，应保存必要的主体和任务参数，在消费者中重新取得可信身份并授权，不把请求对象或旧认证对象序列化进消息。

不要通过 `setDelegate` 切换某个任务的身份；它是全局基础设施入口，会影响其他调用。作用域方法在成功、失败和嵌套调用后都会恢复之前的线程上下文，适合线程复用。

### 系统任务的身份

无发起用户的系统维护任务可以按其业务约定使用 `SystemSecurityIdentities.system()` 建立身份作用域。它提供名为 `system` 的系统身份，不会自动成为管理员，也不代表已经具备完整认证或任意业务权限。

需要以服务账号执行受控业务时，使用项目已配置的服务身份与授权机制。不要构造一个假管理员、绕过权限入口，或借用任意在线用户的上下文。

## 安排提交后的外部副作用

数据库事务无法撤回已经发出的远端请求或通知。更新物料后还需要发消息时，先确认项目已有的可靠事件、事务消息或待处理记录机制，在数据库提交成功后继续执行，并为重试设置稳定的业务幂等标识。

异步任务必须有失败的接收方。将 `CompletableFuture` 返回给调用方并处理异常，或把任务结果交给已有任务状态与重试机制；不要提交后丢弃结果。重试前区分“业务未执行”和“业务已成功、响应或确认丢失”，后者需要按幂等标识读取已有结果。

## 验证执行边界

至少运行一条“先成功写入、后失败”的事务测试，确认没有部分保存。后台执行再验证当前用户缺失、账号禁用、权限不足、线程复用，以及任务失败后的下一条任务，检查身份和事务没有泄漏。

涉及业务动作、消息和计划任务的实现，分别从真实入口执行一次。记录实际执行身份、事务资源和最终结果，比只观察入口方法是否被调用更能发现问题。
