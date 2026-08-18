---
sidebar_position: 3
---

# 扩展后端

扩展后端用于承接低代码难以直接覆盖、但又需要与平台模型体系协同的场景。

选择扩展点前先看：

1. [融合开发总览](../../../fusion-development/overview)
2. [何时用低代码，何时写代码](../../../fusion-development/when-to-use-code)
3. [平台扩展点总表](../../../fusion-development/extension-points)

后端扩展按字段、表达式、脚本和逻辑流节点四类实现入口组织。

## 先判断你要扩哪一层

| 需求特征 | 更适合的扩展点 | 典型结果 |
| ---- | ---- | ---- |
| 需要沉淀新的字段语义、参数面板、默认 UI 和校验约定 | [扩展字段](./extend-field/) | 建模时多出一个可复用字段类型 |
| 需要在 `${...}` 中提供新的全局对象、短方法或只读工具 | [扩展表达式](./extend-expression/) | 表达式里直接可用的新上下文对象 |
| 需要在脚本中复用 helper、访问 Bean，或补新脚本语言 | [扩展脚本](./extend-script/) | 脚本上下文对象、脚本执行器 |
| 需要在可视化编排中新增一个稳定节点 | [扩展逻辑流](./extend-logicflow/) | 节点库中的新节点类型 |

如果你还没有确认需求该落在哪一层，先回到 [平台扩展点总表](../../../fusion-development/extension-points) 做判断，比直接下手写代码更省时间。

## 常见扩展方式

- [扩展字段](./extend-field/)
- [扩展表达式](./extend-expression/)
- [扩展脚本](./extend-script/)
- [扩展逻辑流](./extend-logicflow/)

## 一个后端扩展最小要交付什么

无论你扩的是字段、表达式、脚本还是逻辑流，真正能在平台里生效的最小闭环通常都不只是一段 Java 代码，而是下面几部分的组合：

1. 承载扩展能力的 Maven 模块或 JAR。
2. 扩展实现本身，例如 `ExpressionContextContributor`、`ScriptContextContributor`、`NodeBuilder`、`FieldTypeDefinitionProvider`。
3. 让平台发现它的注册信息，常见是 `META-INF/services/*`、`META-INF/ouroboros/*`、`META-INF/spring.factories` 和 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`。
4. 验证入口，确认开发平台或运行时已经真的看到了这个能力。

很多“代码写好了但平台里看不到”的问题，本质上都不是业务逻辑错了，而是第 3 步或第 4 步没有闭环。

## 何时进入后端扩展

常见场景包括：

- 业务规则复杂，难以只靠标准模型和配置描述
- 需要接入外部系统或封装通用能力
- 需要提供新的字段类型、表达式能力或脚本上下文
- 需要把定制代码稳定地纳入平台运行时

## 推荐推进顺序

1. 先用 [何时用低代码，何时写代码](../../../fusion-development/when-to-use-code) 判断是不是真的需要扩展。
2. 再用本页的四类扩展点把问题归类。
3. 进入对应专题，把实现、注册和验证方式走通。
4. 最后回到 [高低开协同模式](../../../fusion-development/high-low-code-collaboration) 看业务开发者将如何继续消费这个能力。

## 常见误区

- 把一次性业务逻辑做成平台扩展，导致能力点越来越碎。
- 只写 Spring Bean，不补 `META-INF/services` 或资源声明。
- 只验证“代码能编译”，不验证页面、脚本、模型或流程里是否真的能引用。
- 后端节点已经能执行，但开发平台里没有对应配置入口，业务人员仍然用不起来。

## 建议阅读顺序

1. 先判断需求属于字段、表达式、脚本还是逻辑流扩展
2. 再进入对应专题查看实现方式
3. 最后回到 [高低开协同模式](../../../fusion-development/high-low-code-collaboration) 检查扩展结果如何被业务开发继续复用
