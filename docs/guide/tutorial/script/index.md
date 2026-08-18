---
sidebar_position: 8
---

# 脚本

脚本适合承接比表达式更复杂的业务计算。它通常用于多步处理、临时变量、循环、分支判断或需要调用更多上下文能力的场景。

## 什么时候用脚本

- 一条规则已经长到不适合继续写成表达式
- 需要多步计算、中间变量或更清晰的控制流程
- 需要调用脚本上下文中的工具对象和日志能力

如果只是简单取值或单行判断，优先使用 [表达式](../expression/)；如果逻辑需要被大量业务人员以可视化方式复用，优先考虑 [逻辑流](../logicflow/)。

## 常见使用位置

- 逻辑流中的脚本节点
- 业务配置里需要承接较复杂计算的地方
- 需要输出日志、处理上下文对象或执行多步规则的场景

## 你通常还需要一起看什么

- [脚本上下文](../../../api/backend/script-context/)：脚本里可直接使用的对象和工具
- [表达式上下文](../../../api/backend/expression-context/)：适合短逻辑时的更轻量选择
- [扩展脚本](../../advance/extend-backend/extend-script/)：需要补充新的脚本能力或上下文时再看

## 当前支持哪些脚本语言

当前代码里可以直接确认的内建语言有：

- `js`
- `javascript`
- `groovy`

脚本统一通过 `Scripts.execute(...)` / `Scripts.compile(...)` 进入，所以不同语言共享同一套上下文注入机制。

## 写脚本时通常能直接用什么

和表达式相比，脚本环境更完整。高频对象包括：

- `logger` / `console`
- `AuthenticationHolder` / `AuthContext`
- `OrganizationHolder` / `OrganizationContext`
- `DataModelCenter`
- `Dates` / `Converter` / `Maps`
- `codeGen`
- `BeanFactory`
- `Exceptions`

如果当前环境启用了额外能力，还可能拿到：

- `Config`
- `NotificationDispatcher`
- `Scheduler`

完整说明继续看 [脚本上下文](../../../api/backend/script-context/)。

## 一个最常见的脚本套路

```javascript
var userId = AuthContext.getUserId()
var orderModel = DataModelCenter.get('main:crm.Order')

if (orderModel == null) {
  Exceptions.platform('未找到订单模型')
}

logger.info('start process order, user={}', userId)
```

这类写法适合：

- 先取上下文
- 再做分支判断
- 最后查模型、调能力、记日志

## 什么时候脚本比表达式更合适

只要出现下面任一特征，优先考虑脚本：

- 需要多步计算
- 需要临时变量
- 需要循环或条件分支
- 需要日志
- 需要对异常做显式处理

如果脚本又开始越来越长、越来越像一个稳定能力，再考虑升级成：

- [逻辑流](../logicflow/)
- [扩展脚本](../../advance/extend-backend/extend-script/)
- [扩展逻辑流](../../advance/extend-backend/extend-logicflow/)

## 使用建议

- 让脚本只处理当前规则本身，不要把过多业务耦合塞进去
- 对重复使用的脚本能力，优先考虑沉淀成上下文对象或平台扩展
- 当脚本开始影响多人协作和可维护性时，考虑升级为逻辑流节点或后端扩展

## 排查建议

如果脚本跑出来的结果不对，优先检查：

1. 当前脚本语言是否写对了。
2. 当前宿主位置是否真的支持脚本，而不是只支持表达式。
3. 依赖的上下文对象是否已经注入。
4. 对象是不存在，还是存在但其内部依赖的模块没启用。
5. 是否应该在关键分支处补 `logger` 输出。

## 常见坑

- 把表达式写法和脚本写法混在一起。
- 脚本里直接塞太多业务细节，后续几乎没人敢维护。
- 默认认为某个上下文对象一定存在，没有先判空。
- 明明是稳定复用能力，却一直散落在多个脚本片段里重复复制。
