---
sidebar_position: 2
---

# 扩展脚本

扩展脚本适用于要给脚本运行时补充上下文对象、工具方法，或增加新的脚本执行能力的场景。它比表达式更适合承接有分支、循环和中间变量的逻辑。

## 什么时候用脚本扩展

- 现有脚本上下文缺少稳定复用的工具对象
- 某类脚本能力要在多个模型、节点或规则中重复使用
- 需要补充新的脚本语言支持或新的执行器能力

如果需求只是简单取值或单行计算，优先考虑表达式；如果能力要被大量业务开发人员以可视化方式复用，优先考虑逻辑流节点。

## 常见实现抓手

- 向脚本上下文注入能力时，实现 `ScriptContextContributor`。
- 通过 `META-INF/services/com.ouroboros.script.ScriptContextContributor` 注册后，脚本执行入口会自动聚合这些上下文对象。
- 平台脚本通过 `Scripts.execute()` 和 `Scripts.compile()` 执行；重复调用的场景要关注预编译和性能。
- 如果要新增整种脚本语言，则需要继续实现 `ScriptRunner` 和 `ScriptCompiler`。

## 一个最小脚本上下文扩展怎么做

### 1. 实现 `ScriptContextContributor`

```java
public class AuditScriptContextContributor implements ScriptContextContributor {
  @Override
  public Map<String, Object> getBindings() {
    return Collections.singletonMap("Audit", new AuditHelper());
  }
}
```

### 2. 注册 SPI

文件路径：

```text
META-INF/services/com.ouroboros.script.ScriptContextContributor
```

文件内容：

```text
com.example.audit.AuditScriptContextContributor
```

当前脚本引擎会把所有 contributor 聚合成一个只读上下文 Map。同名键会优先取 contributor 中的值，而不是脚本调用方传入的 bindings。

### 3. 需要 Spring Bean 时，优先做成“轻 contributor + 真正业务 Bean”

脚本里直接暴露一个巨大的 service 往往会让调用边界失控。更推荐：

1. 让 Spring Bean 承载真正业务能力。
2. 让 contributor 只暴露一个边界清晰的 helper。
3. helper 内部再委托到 Spring Bean。

这类模式在 `Config`、`NotificationDispatcher`、`Scheduler` 相关能力里都能看到。

## 如果你要新增脚本语言

当前平台内建支持：

- `js`
- `javascript`
- `groovy`

如果你要补新的脚本语言，除了上下文对象之外，还要继续实现：

- `ScriptRunner`
- `ScriptCompiler`

然后分别注册到：

```text
META-INF/services/com.ouroboros.script.ScriptRunner
META-INF/services/com.ouroboros.script.ScriptCompiler
```

平台的 `Scripts` 会基于 `language` 名称路由到对应实现。

## 设计脚本扩展时的边界建议

### 让 helper 像 API，而不是像整个系统

脚本扩展最怕的不是功能少，而是把整个应用服务层原样塞进去。推荐优先暴露：

- 明确的小能力对象
- 参数稳定的方法
- 容易被业务脚本理解的返回值

不推荐直接把职责很大的 service 整个扔进脚本上下文。

### 名称和返回结构要稳定

脚本一旦被大量模型、节点和规则引用，改一个上下文对象名就可能影响很多地方。所以：

- 名称一开始就要定稳
- 返回结构尽量简洁
- 避免为了迁就内部实现而频繁变更方法签名

### 能复用到表达式时，同步规划

如果某项能力在脚本和表达式里都值得复用，通常应同时提供：

- `ScriptContextContributor`
- `ExpressionContextContributor`

避免出现“脚本能用、表达式不能用”或两边名字不一致的情况。

## 设计建议

- 暴露边界清晰的 helper，而不是把过大的 service 直接塞给脚本
- 能力名称和返回结构尽量稳定，避免业务脚本跟着底层实现频繁变化
- 如果一项能力既需要在 SpEL 中可用，也需要在脚本中可用，可以同步提供 `ExpressionContextContributor`

## 怎么验证扩展是否生效

1. 把扩展包安装到当前运行环境。
2. 找一个脚本宿主位置，写最小验证脚本，先只输出或读取一个简单值。
3. 如果脚本里完全拿不到对象，先检查 `META-INF/services/com.ouroboros.script.ScriptContextContributor`。
4. 如果对象存在但调用失败，再检查对应 Bean 是否已经装配、以及 helper 是否按预期转发。

## 常见坑

- 忘了补 SPI 文件，导致上下文对象根本没有被发现。
- 上下文对象名与现有全局对象冲突，实际调用到的不是你预期的实现。
- helper 暴露过多底层实现，业务脚本很快和内部代码耦合在一起。
- 同一个能力在脚本和表达式里分别起了不同名字，后期难以维护。

## 相关文档

- [脚本上下文](../../../../api/backend/script-context/)
- [表达式上下文](../../../../api/backend/expression-context/)
- [逻辑流教程](../../../tutorial/logicflow/)
