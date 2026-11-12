---
sidebar_position: 2
---

# 脚本上下文扩展

业务脚本可以直接组合平台已有的上下文能力。多个脚本需要共享新的程序能力时，使用 `ScriptContextContributor` 提供对象；新增执行语言时，再实现语言对应的运行与编译接口。

## 先确定脚本任务

向 AI 提供脚本宿主、语言、输入 bindings、已有上下文对象、返回结果及失败处理。先按 [脚本上下文](../../../../api/backend/script-context/)确认可调用的方法，再生成业务脚本或必要的 helper。

| 任务 | 实现范围 |
| --- | --- |
| 在已有宿主中完成业务动作 | 调整脚本和调用参数，复用已有对象 |
| 多个脚本复用同一项能力 | 实现 helper 与 contributor，保持名称和返回结构稳定 |
| 平台需要执行另一种语言 | 实现并注册 `ScriptRunner`、`ScriptCompiler` |

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

## 新语言与上下文的区别

新增语言的执行与编译接口、SPI 注册和验证见 [新增脚本语言支持](../../../../fusion-development/plugin-extensions/backend/script-languages)。本页的 contributor 用于给已有脚本增加公共对象，不负责接入另一种执行器。

## 保持脚本调用边界

helper 暴露小而明确的业务能力，参数和结果适合脚本调用。由现有服务完成数据访问和权限处理，脚本入口只调用这些正式能力。多个宿主共享同一对象时，分别核对调用上下文。

AI 同时实现表达式入口时，让两边共享 helper 并保持名称、行为一致。脚本上下文对象名与绑定参数的优先级按当前实现处理，避免生成代码依赖错误的同名值。

## 验证脚本与上下文

1. 在实际宿主中执行最小脚本，验证语言、输入 bindings 和对象发现。
2. 使用约定输入检查返回值及业务状态，覆盖空值与无效参数。
3. 验证依赖 Bean 的装配、异常传播与权限边界。
4. 重复执行同一业务请求，检查状态变化是否符合幂等约定。
5. 新增执行器时，分别验证编译、执行和语言名称路由。

交付脚本源码、调用参数及实际结果。对象未发现时查 SPI，调用失败时查依赖与运行日志；AI 根据这些证据修改实现，再复验原场景。

可视化复用入口见 [扩展逻辑流](../extend-logicflow/)，实现的装配方式见 [后端扩展包](../../../../fusion-development/backend-extension-packages)。
