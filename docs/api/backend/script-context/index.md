---
sidebar_position: 3
title: 脚本上下文
---

# 脚本上下文

业务脚本支持 JavaScript 和 Groovy，可直接调用下表中的全局对象。下面的业务处理示例使用 Groovy；模型名、配置键、通知模板和逻辑流名称须在目标应用中存在。

## 全局对象速查

| 对象 | 用途 | 可用条件 |
| --- | --- | --- |
| `logger` / `console` | 输出日志，两个名称等价 | 基础脚本能力 |
| `Dates`、`Converter`、`Maps` | 日期、转换和 Map 工具 | 基础脚本能力 |
| `AuthenticationHolder`、`AuthContext` | 当前认证、用户和数据权限 | 认证能力 |
| `OrganizationHolder` / `OrganizationContext` | 当前员工、部门和公司，两个名称等价 | 组织能力 |
| `DataModelCenter` | 按名称获取模型 | 数据模型能力 |
| `codeGen` | 生成、预览编码 | 编码生成能力 |
| `BeanFactory`、`Exceptions` | 调用已有服务、抛出标准异常 | 应用运行时 |
| `Config` | 读取配置值 | 配置能力 |
| `NotificationDispatcher` | 发送通知 | 通知能力 |
| `Scheduler` | 创建和取消调度任务 | 计划任务能力 |

业务入参由脚本调用方提供，`record`、`amount` 等名称并非固定全局变量。自定义入参应避开上表名称，同名时平台对象优先。上下文映射只读，不支持通过 `put/remove` 增删全局对象。

## AuthenticationHolder / AuthContext {#authenticationholder}

| 调用 | 返回值 | 说明 |
| --- | --- | --- |
| `AuthenticationHolder.getAuthentication()` | [OuroborosAuthentication](../java-api/entity/ouroboros-authentication/) | 当前认证对象；无登录态时为匿名认证 |
| `AuthenticationHolder.getPrincipal()` | `String` | 当前认证主体，匿名时通常为 `anonymousUser` |
| `AuthenticationHolder.getCurrentUserIdentity()` | `String` | 当前主体标识 |
| `AuthContext.getUserId()` | `String` | 当前用户标识 |
| `AuthContext.getUserDetail()` | `User?` | 当前用户详情 |
| `AuthContext.getAuthorizationDecision()` | `AccessControlParams` | 当前权限判定结果 |
| `AuthContext.getAuthorizationDecision(String authKey)` | `AccessControlParams` | 指定权限点的判定结果 |
| `AuthContext.getAccessControlParams(...)` | `AccessControlParams` | 对应 `getAuthorizationDecision(...)` 的兼容名称 |
| `AuthContext.getAllowedFields()` / `getDisallowedFields()` | `List<String>` | 允许或禁止访问的字段 |
| `AuthContext.getFilters()` | `Map<String, Object>` | 数据权限过滤条件 |

```groovy
def operatorId = AuthContext.getUserId()
logger.info('开始处理订单，操作人={}', operatorId)
```

读取这些信息不等于自动完成接口授权。接口和业务动作仍需配置相应权限，参见 [权限与访问控制](../../../fusion-development/authority-subject-and-access-control-design)。

## OrganizationHolder / OrganizationContext {#organizationholder}

| 方法 | 返回值 |
| --- | --- |
| `getEmployee()` / `getEmployeeId()` | [Employee](../java-api/entity/employee/)? / `String?` |
| `getDepartment()` / `getDepartmentId()` | [Department](../java-api/entity/department/)? / `String?` |
| `getCompany()` / `getCompanyId()` | [Company](../java-api/entity/company/)? / `String?` |

未绑定对应组织信息时返回 `null`。

```groovy
def employeeId = OrganizationHolder.getEmployeeId()
if (employeeId == null) {
    Exceptions.business('当前用户尚未绑定员工')
}
```

## DataModelCenter

`get(String name)` 返回 [DataModel](../data-model/data-model/)，找不到时返回 `null`。可使用模型全名 `crm.Order`，或使用带数据站前缀的 `main:crm.Order` 区分同名模型。

```groovy
def orders = DataModelCenter.get('main:crm.Order')
if (orders == null) {
    Exceptions.business('订单模型不可用')
}
def rows = orders.query([
    select: ['id', 'amount'],
    where: [status: 'OPEN'],
    order: [id: 'ASC'],
    skip: 0,
    limit: 20
]).get()
logger.info('读取到 {} 条订单', rows.size())
rows
```

读写方法返回 `Try`。示例用 `.get()` 取值，失败时会抛出原异常；不要忽略返回值后继续执行。查询语法见 [查询 DSL](../data-query-dsl/)。

## 工具与日志

`Dates`、`Converter` 和 `Maps` 可直接使用，无需导入。其他 [Java 工具类](../java-api/) 并非默认脚本全局对象。

```groovy
def pageSize = Converter.toInteger('20')
def payload = [status: 'OPEN', pageSize: pageSize]
logger.info('查询参数={}', payload)
```

`logger` / `console` 支持 `trace`、`debug`、`info`、`warn`、`error`；`log` 等同于 `info`。支持 `{}` 参数占位符和异常参数。日志中避免输出口令、令牌和完整个人信息。

## codeGen

`get(template[, context])` 生成并消耗序列号，`peek(template[, context])` 仅预览。模板语法见 [编码生成器](../expression-context/#codegen)。

```groovy
def orderCode = codeGen.get('ORD-{yyyyMMdd}-<0001>')
if (orderCode == null) {
    Exceptions.business('编码生成器不可用')
}
```

## Exceptions

| 方法 | 用途 |
| --- | --- |
| `validation(String message)` | 输入校验失败 |
| `validation(Map<String, String> errors)` | 按字段返回校验错误 |
| `business(...)` / `throwBusiness(...)` | 业务条件不满足 |
| `platform(...)` / `throwPlatform(...)` | 平台能力执行失败 |
| `internal(...)` / `throwInternal(...)` | 内部处理失败 |

这些方法抛出异常并终止当前脚本。例如，调用方传入 `amount` 后：

```groovy
if (amount == null || amount <= 0) {
    Exceptions.validation([amount: '金额必须大于 0'])
}
```

## BeanFactory

`get(String beanName)` 获取服务，找不到时返回 `null`；`getBean(...)` 使用标准 Spring 语义，找不到会抛出异常。只调用已经安装并公开给应用使用的服务。

```groovy
def service = BeanFactory.get('orderExportService')
if (service == null) {
    Exceptions.business('请先安装订单导出扩展')
}
// 后续调用以该服务公开的方法签名为准。
```

需要稳定复用的脚本接口时，见 [扩展脚本](../../../guide/advance/extend-backend/extend-script/)。

## Config

`get(String key)` 读取配置，找不到时返回 `null`。

```groovy
def configuredSize = Config.get('orders.pageSize')
def pageSize = configuredSize == null ? 20 : Converter.toInteger(configuredSize)
```

配置键与值的声明见 [配置教程](../../../guide/tutorial/configuration/)。

## NotificationDispatcher

| 方法 | 用途 |
| --- | --- |
| `sendByEmployee(String employeeId, String template, Map payload)` | 发给单个员工 |
| `sendByEmployee(Collection<String> employeeIds, String template, Map payload)` | 发给多个员工 |
| `sendByAddress(Map<String, Collection<String>> addresses, String template, Map payload)` | 按渠道地址发送 |

以上方法还可追加 `DispatchOptions`，指定 `channels`、`channelOptions` 等发送选项。示例要求已存在 `orderCreated` 模板，且调用方传入员工 ID 和订单编号：

```groovy
NotificationDispatcher.sendByEmployee(
    recipientEmployeeId, 'orderCreated', [orderCode: orderCode]
)
```

`payload` 字段须与 [通知模板](../../../guide/tutorial/notification/) 一致。

## Scheduler

| 方法 | 返回值 / 用途 |
| --- | --- |
| `schedule(ScheduleTask task)` | `Try<LocalDateTime>`，创建任务 |
| `scheduleCron(String taskName, String cron, String flowName, Map data)` | `Try<LocalDateTime>`，周期任务 |
| `scheduleOnce(...)` | `Try<LocalDateTime>`，支持日期、时间、时长或毫秒数 |
| `cancel(String taskName)` | `Try<Void>`，取消任务 |
| `isScheduled(String taskName)` | `boolean`，检查任务是否存在 |

已配置 `cleanupOrders` 逻辑流时：

```groovy
Scheduler.scheduleCron(
    'orders-cleanup', '0 0 2 * * ?', 'cleanupOrders', [retentionDays: 30]
).get()
```

没有可用调度器时返回失败结果；使用 `.get()` 或处理 `Try` 的失败分支。平台界面配置方式见 [计划任务](../../../low-code/development-platform-menus/scheduled-task)。
