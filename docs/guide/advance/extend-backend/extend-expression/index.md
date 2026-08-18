---
sidebar_position: 3
---

# 扩展表达式

扩展表达式适用于希望在 `${...}` 中直接提供新的全局变量、工具方法或上下文对象的场景。它更适合短小、可复用、可读性强的计算逻辑。

## 什么时候用表达式扩展

- 业务配置里大量使用短表达式、条件判断或模板取值
- 希望业务开发人员在不写长脚本的前提下复用统一能力
- 某个工具类或上下文对象应该在多个表达式位置以同一名称出现

如果逻辑已经涉及多步处理、循环、复杂错误控制或较长的中间计算，通常应转向脚本或逻辑流，而不是继续堆表达式。

## 常见实现抓手

- 平台表达式能力基于 SpEL。
- 新的全局对象通常通过实现 `ExpressionContextContributor` 注入。
- 通过 `META-INF/services/com.ouroboros.expression.ExpressionContextContributor` 注册后，可以在表达式上下文中以固定名称使用。
- 如果同一能力也需要在脚本里复用，通常应同时实现 `ScriptContextContributor`；平台中的 `Config`、`codeGen` 等能力就是这种模式。

## 一个最小表达式扩展怎么做

### 1. 实现 `ExpressionContextContributor`

`ExpressionContextContributor` 的职责非常直接：返回一组要暴露给表达式的全局对象。

```java
public class AuditExpressionContextContributor implements ExpressionContextContributor {
  @Override
  public Map<String, Object> getBindings() {
    return Collections.singletonMap("Audit", new AuditHelper());
  }
}
```

### 2. 注册 SPI

文件路径：

```text
META-INF/services/com.ouroboros.expression.ExpressionContextContributor
```

文件内容：

```text
com.example.audit.AuditExpressionContextContributor
```

平台表达式引擎会通过 SPI 聚合这些 contributor。当前实现使用 `SPI.getReversedServiceStream(ExpressionContextContributor.class)` 加载，所以优先级和注册顺序都会影响同名对象的覆盖结果。

### 3. 如果依赖 Spring Bean，再补装配

如果你暴露给表达式的对象需要访问 Spring 容器里的服务，就不能只写一个普通 POJO。常见做法有两种：

1. 用一个外层 `@Component` 持有 Bean，再用内部 `Proxy` 实现 `ExpressionContextContributor`。
2. 把真正的业务逻辑封在普通 Spring Bean 里，contributor 只负责转发入口。

仓库里的 `ConfigurationContextContributor.Proxy` 就是这一类模式。

## 表达式扩展设计建议

### 名称要短、稳定、业务可读

表达式的优势是“配置层一眼能读懂”。所以对象名更适合像：

- `Config`
- `codeGen`
- `Audit`

而不是把大量内部实现细节暴露成又长又技术化的入口名。

### 方法尽量只读、低副作用

表达式适合快速取值和短计算，不适合承接复杂写操作。一个经验判断是：

- 如果方法调用后，配置人员很难预估它会不会改状态，那它就不适合作为表达式入口。
- 如果一条表达式已经开始需要日志、异常控制或中间变量，那它也不该继续留在表达式层。

### 让表达式和脚本共享一套 helper

如果同一能力既要在 `${...}` 中可用，也要在脚本中可用，优先让两边共享同一个 helper，再分别暴露为：

- `ExpressionContextContributor`
- `ScriptContextContributor`

这样文档、行为和命名都会更稳定。

## 设计建议

- 入口名称要短、稳定、语义清晰，避免让表达式看起来像一段隐藏代码
- 尽量提供只读或低副作用的方法，减少配置层难以追踪的状态变更
- 让表达式保持“短而可读”；一旦需要多行说明，往往就该升级为脚本或节点

## 怎么验证扩展是否生效

1. 把扩展包安装到当前运行环境。
2. 在一个能写 `${...}` 的位置，先做最小表达式验证，例如直接取你暴露的对象。
3. 如果表达式里拿不到对象，先检查 SPI 注册文件路径和类名。
4. 如果对象存在但方法报空，继续检查它依赖的 Spring Bean 是否完成装配。

## 常见坑

- 只写了 contributor 类，没有补 `META-INF/services/com.ouroboros.expression.ExpressionContextContributor`。
- 给表达式对象取了一个和现有上下文重名的名称，结果把原有对象覆盖掉了。
- 把需要多步流程、日志、异常控制的逻辑硬塞进表达式，最后既难读又难调试。
- 只给表达式补了入口，但业务人员实际主要写脚本，导致能力仍然难用。

## 相关文档

- [表达式上下文](../../../../api/backend/expression-context/)
- [脚本上下文](../../../../api/backend/script-context/)
- [何时用低代码，何时写代码](../../../../fusion-development/when-to-use-code/)
