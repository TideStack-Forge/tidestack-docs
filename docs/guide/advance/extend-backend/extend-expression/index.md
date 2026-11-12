---
sidebar_position: 3
---

# 表达式上下文扩展

后端表达式上下文可以提供可复用对象和短方法，供 `${...}` 位置取值或计算。先查看现有上下文；需要新增公共对象时，通过 `ExpressionContextContributor` 注册。

## 定义表达式契约

提供表达式的宿主位置、可用变量、输入类型、返回类型和空值行为。让 AI 先读取现有 [表达式上下文](../../../../api/backend/expression-context/)与同类 contributor，再确定是组合已有方法还是新增对象。

新增对象还需约定稳定名称与方法签名，并列出正常、空值和无效输入样例。表达式保持短小、可预期；涉及多步处理、循环或状态修改时，将处理放到脚本、逻辑流或业务服务中。

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

## 保持名称与行为稳定

配置会长期引用上下文对象名。生成前检查是否与已有名称冲突；当前 SPI 加载顺序会影响同名对象的覆盖结果。方法应优先只读、低副作用，调用者能够从参数和返回值理解其行为。

同一能力需要在表达式与脚本中使用时，共享同一个业务 helper，分别通过两个 contributor 暴露。由 AI 实现时，一并提供两个入口的名称、返回结构和测试样例，保持契约一致。

## 验证表达式调用

1. 用行为测试验证 helper 的正常、空值和无效输入结果。
2. 安装扩展包，在实际表达式宿主中验证上下文对象能够取得。
3. 调用目标方法，核对返回类型与宿主对结果的消费。
4. 依赖 Bean 时，验证自动配置与真实依赖已经装配。
5. 回归已有表达式，检查名称冲突或错误覆盖。

对象不存在时查 SPI 注册与产物；对象存在但调用失败时查参数、Bean 和异常。提供实际表达式、变量、日志与版本，让 AI 在对应位置修复。

配套实现见 [扩展脚本](../extend-script/)，项目及注册文件见 [后端扩展包](../../../../fusion-development/backend-extension-packages)。
