---
sidebar_position: 3
---

# 脚本上下文

这页收录的是脚本运行时可直接使用的对象与工具。当前平台脚本主要支持 JavaScript（GraalVM）和 Groovy，两者共享同一套上下文注入机制。

## 什么时候看这页

- 你在写完整脚本，而不是只写一段 `${...}` 表达式
- 你想确认脚本里怎么拿当前用户、组织、数据模型或日志对象
- 你需要判断某个能力是不是平台已经注入到了脚本环境里
- 你在排查“脚本里为什么拿不到某个对象”

如果你写的是 `${...}` 形式的表达式，而不是脚本，请优先看 [表达式上下文](../expression-context/)。

## 先判断该看这页还是别的页

| 当前问题                                                     | 优先去看哪里                                        |
| ------------------------------------------------------------ | --------------------------------------------------- |
| 我在写完整脚本，需要多步逻辑、变量、日志和运行时对象         | 这页                                                |
| 我写的是字段默认值、规则表达式或模板里的 `${...}`            | [表达式上下文](../expression-context/)              |
| 我想查 `Dates`、`Converter`、`Maps` 的完整方法               | [Java API](../java-api/)                            |
| 我想给脚本环境新增一个全局对象                               | [扩展脚本](../../../guide/advance/extend-backend/extend-script/) |
| 我只是想学什么时候该用脚本                                   | [脚本教程](../../../guide/tutorial/script/)         |

## 先理解脚本上下文是怎么来的

脚本上下文不是一张固定清单，而是脚本引擎在 `AbstractScriptEngine` 里把多个 `ScriptContextContributor` 的 `getBindings()` 结果聚合后的只读 `Map`。

这意味着两件事：

1. 业务里最常见的对象会比较稳定，例如认证、组织、日志、基础工具类、编码生成器
2. 部分对象会跟已启用的能力模块有关，例如配置、通知、调度

还有两点在当前代码里也很明确：

1. 同名全局对象会优先覆盖脚本入参中的同名 key
2. 脚本拿到的上下文是只读的，不能直接在上下文 map 上做 `put` / `remove`

如果你在某个环境里拿不到某个对象，先确认对应能力模块是否已经引入并启用。

## 当前代码里可确认的注入来源

下面这张表只列当前代码里已经能直接确认的默认注入源：

| 来源模块 | 注入对象 | 说明 |
| -------- | -------- | ---- |
| `common-script` | `logger` / `console` | 日志适配器 |
| `common-script` | `Dates` / `Converter` / `Maps` | 默认直接注入的三个基础工具类 |
| `web-security-runtime` | `AuthenticationHolder` / `AuthContext` | 认证与访问控制上下文 |
| `organization-structure-runtime` | `OrganizationHolder` / `OrganizationContext` | 组织上下文，两个名字指向同一个对象 |
| `data-runtime` | `DataModelCenter` | 运行时按名称获取数据模型 |
| `data-pkgen-coding` | `codeGen` | 编码生成器 |
| `app-runtime` | `BeanFactory` / `Exceptions` | Spring Bean 访问与标准异常抛出 |
| `configuration-runtime` | `Config` | 配置能力启用后出现 |
| `notification-runtime` | `NotificationDispatcher` | 通知能力启用后出现 |
| `scheduler-runtime` | `Scheduler` | 调度能力启用后出现 |

## 高频对象速览

| 名称                                        | 用途                               | 说明 |
| ------------------------------------------- | ---------------------------------- | ---- |
| `AuthenticationHolder`                      | 读取当前认证信息                   | 偏底层，适合直接拿认证对象或 principal |
| `AuthContext`                               | 读取当前用户与数据权限             | 面向业务脚本更顺手 |
| `OrganizationHolder` / `OrganizationContext` | 读取当前员工、部门、公司           | 两个名字指向同一对象 |
| `DataModelCenter`                           | 按模型名获取数据模型               | 适合脚本里动态拿模型 |
| `Dates` / `Converter` / `Maps`              | 调用通用工具类                     | 直接使用静态方法 |
| `logger` / `console`                        | 输出日志                           | 两个名字等价 |
| `codeGen`                                   | 生成或预览编码                     | 与表达式上下文里的 `codeGen` 是同一能力 |
| `BeanFactory`                               | 获取 Spring Bean                   | 适合临时接入已有服务 |
| `Exceptions`                                | 主动抛出校验、业务、平台、内部异常 | 适合脚本提前终止 |

## 按能力模块追加的对象

| 名称                     | 什么时候会出现               | 用途 |
| ------------------------ | ---------------------------- | ---- |
| `Config`                 | 当前运行时启用了配置能力     | 读取配置项 |
| `NotificationDispatcher` | 当前运行时启用了通知能力     | 按员工或地址发送通知 |
| `Scheduler`              | 当前运行时启用了计划任务能力 | 在脚本中创建或取消调度任务 |

## AuthenticationHolder / AuthContext {#authenticationholder}

这两组对象都和当前登录态有关，但侧重点不一样：

- `AuthenticationHolder`：偏底层，直接暴露认证对象和 principal
- `AuthContext`：偏业务读取，直接拿用户详情和数据权限参数

### AuthenticationHolder

| 方法                                                  | 返回值类型                                                              | 说明 |
| ----------------------------------------------------- | ----------------------------------------------------------------------- | ---- |
| `getAuthentication()`                                 | [OuroborosAuthentication](../java-api/entity/ouroboros-authentication/) | 获取完整认证对象 |
| `getPrincipal()`                                      | `String`                                                                | 获取当前认证主体 |
| `getCurrentUserIdentity()`                            | `String`                                                                | 与 `getPrincipal()` 等价 |

返回值说明：

- 已认证时，`getAuthentication()` 返回当前认证对象
- 未认证时，返回匿名认证对象
- `getPrincipal()` 在未认证场景下通常会得到 `anonymousUser`

### AuthContext

| 方法                                   | 返回值类型             | 说明 |
| -------------------------------------- | ---------------------- | ---- |
| `getUserId()`                          | `String`               | 获取当前认证主体标识，通常也是用户 ID |
| `getUserDetail()`                      | `User?`                | 获取当前用户详情 |
| `getAccessControlParams()`             | `AccessControlParams`  | 获取当前请求的数据权限参数 |
| `getAccessControlParams(String authKey)` | `AccessControlParams` | 获取指定权限点的数据权限参数 |
| `getAllowedFields()`                   | `List<String>`         | 获取允许访问的字段列表 |
| `getDisallowedFields()`                | `List<String>`         | 获取禁止访问的字段列表 |
| `getFilters()`                         | `Map<String, Object>`  | 获取数据过滤条件 |

如果你在脚本里要处理“当前用户能看什么、要附加什么数据过滤条件”，优先从 `AuthContext` 下手会比直接啃认证对象更顺。

```javascript
var userId = AuthContext.getUserId()
var filters = AuthContext.getFilters()
logger.info('current user={}, filters={}', userId, filters)
```

如果你需要进一步理解这些访问控制参数是怎么来的，可以继续看 [权限与访问控制](../../../guide/advance/authority-and-access-control)。

## OrganizationHolder / OrganizationContext {#organizationholder}

`OrganizationHolder` 和 `OrganizationContext` 指向同一个对象，用来读取当前请求关联的组织上下文。

| 方法                 | 返回值类型                          | 说明 |
| -------------------- | ----------------------------------- | ---- |
| `getEmployee()`      | [Employee](../java-api/entity/employee/)? | 获取当前员工对象 |
| `getEmployeeId()`    | `String?`                           | 获取当前员工 ID |
| `getDepartment()`    | [Department](../java-api/entity/department/)? | 获取当前部门对象 |
| `getDepartmentId()`  | `String?`                           | 获取当前部门 ID |
| `getCompany()`       | [Company](../java-api/entity/company/)? | 获取当前公司对象 |
| `getCompanyId()`     | `String?`                           | 获取当前公司 ID |

如果当前请求还没有建立员工、部门或公司上下文，这些方法会返回 `null`。

```javascript
var employee = OrganizationHolder.getEmployee()
if (employee == null) {
  Exceptions.business('当前上下文没有绑定员工信息')
}
```

## DataModelCenter

数据模型中心用于按名称获取运行时数据模型。

| 方法          | 返回值类型             | 说明 |
| ------------- | ---------------------- | ---- |
| `get(String name)` | [DataModel](../data-model/data-model/)? | 获取指定名称的数据模型 |

返回值说明：

- 找到模型时返回 `DataModel`
- 找不到时返回 `null`

在当前代码里，`DataModelCenter.refresh()` 会同时注册两类 key：

- `模型全名`
- `数据站名:模型全名`

所以如果同名模型来自多个数据站，脚本里更稳妥的写法通常是显式带上数据站名前缀。

这类用法适合“模型名在运行时才确定”的脚本。如果你只是想理解模型本身，建议再看 [数据模型 API](../data-model/) 和 [DataModel 接口](../data-model/data-model/)。

## Dates / Converter / Maps

当前默认脚本环境直接注入的工具类只有这三个，它们本质上都是 Java 静态工具类：

- `Dates`：日期和时间工具，见 [Dates 工具类](../java-api/util/dates/)
- `Converter`：类型转换工具，见 [Converter 工具类](../java-api/util/converter/)
- `Maps`：Map 处理工具，见 [Maps 工具类](../java-api/util/maps/)

如果你开始在脚本里反复写日期格式化、类型判断或 Map 清洗逻辑，优先先看一眼这些工具类，通常不需要自己再造一套。

像 [Lists](../java-api/util/lists/)、[Json](../java-api/util/json/)、[JsonBag](../java-api/util/json-bag/)、[Paths](../java-api/util/paths/) 这些工具类，当前代码里并不会默认作为脚本全局对象注入，但在后端 Java 代码里同样很常用。

## logger / console

`logger` 和 `console` 是同一个日志适配器，只是提供了两种更顺手的命名方式。

| 方法族           | 说明 |
| ---------------- | ---- |
| `log(...)`       | 与 `info(...)` 等价 |
| `info(...)`      | 输出信息日志 |
| `warn(...)`      | 输出警告日志 |
| `error(...)`     | 输出错误日志 |
| `debug(...)`     | 输出调试日志 |
| `trace(...)`     | 输出跟踪日志 |

这些方法支持常见的 SLF4J 风格重载，例如：

- `logger.info("message")`
- `logger.info("id={}", id)`
- `logger.error("failed", throwable)`

```javascript
logger.info('start handle record={}', recordId)
console.warn('payload is empty, skip send')
```

## codeGen

`codeGen` 用来在脚本里生成或预览编码值，和 [表达式上下文](../expression-context/#codegen) 中的是同一能力。

| 方法                                        | 返回值类型 | 说明 |
| ------------------------------------------- | ---------- | ---- |
| `get(String codeTemplate)`                  | `String?`  | 获取下一个编码值 |
| `get(String codeTemplate, Map context)`     | `String?`  | 带上下文获取下一个编码值 |
| `peek(String codeTemplate)`                 | `String?`  | 预览下一个编码值，不递增 |
| `peek(String codeTemplate, Map context)`    | `String?`  | 带上下文预览下一个编码值 |

例子：

```javascript
var code = codeGen.get('PREFIX-{yyyyMMdd}-<0001>', record)
```

如果你主要是在字段默认值或模板表达式里用它，直接看 [表达式上下文](../expression-context/#codegen) 会更顺。

## BeanFactory

`BeanFactory` 用来从脚本里获取 Spring Bean。

| 方法                    | 返回值类型 | 说明 |
| ----------------------- | ---------- | ---- |
| `get(String beanName)`  | `Object?`  | 安全获取 Bean；找不到时返回 `null` |
| `getBean(...)`          | `Object`   | 标准 Spring `BeanFactory` 行为；找不到会抛异常 |

使用建议：

- 脚本偶尔需要接入已有服务时，可以用 `BeanFactory`
- 如果某个 Bean 被大量脚本反复直接调用，更推荐把它封装成稳定的脚本上下文对象

更多方法请参考 [Spring BeanFactory 官方文档](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/BeanFactory.html)。

## Exceptions

`Exceptions` 用来在脚本中主动终止流程并抛出平台标准异常。

| 方法族                                            | 说明 |
| ------------------------------------------------- | ---- |
| `validation(String message)`                      | 抛出校验异常 |
| `validation(Map<String, String> errors)`          | 按字段错误集合抛出校验异常 |
| `business(...)` / `throwBusiness(...)`           | 抛出业务异常 |
| `platform(...)` / `throwPlatform(...)`           | 抛出平台异常 |
| `internal(...)` / `throwInternal(...)`           | 抛出内部异常 |

说明：

- `throwBusiness` / `throwPlatform` / `throwInternal` 只是同义别名
- `business` 更适合脚本主动拦截业务规则
- `platform` 和 `internal` 更适合表示平台运行错误，而不是普通业务校验

```javascript
if (amount <= 0) {
  Exceptions.validation('金额必须大于 0')
}

if (!hasPermission) {
  Exceptions.business('当前用户没有该操作权限')
}
```

## Config

如果当前运行时启用了配置能力，脚本里还会额外拿到 `Config`。

| 方法          | 返回值类型 | 说明 |
| ------------- | ---------- | ---- |
| `get(String key)` | `Object?` | 按配置键读取值，读不到时返回 `null` |

要注意一点：当前脚本上下文暴露的 `Config` 只包装了 `get(String key)`，并没有把 `ConfigurationService` 的全部方法都开放出来。

它适合在脚本里读取平台配置项，而不是把配置常量硬编码进脚本。相关背景可以配合 [配置教程](../../../guide/tutorial/configuration/) 一起看。

## NotificationDispatcher

如果当前运行时启用了通知能力，脚本里还会额外拿到 `NotificationDispatcher`。

| 方法形态                                                                 | 说明 |
| ------------------------------------------------------------------------ | ---- |
| `sendByEmployee(String employeeId, String template, Map payload)`        | 给单个员工发通知 |
| `sendByEmployee(Collection<String> employeeIds, String template, Map payload)` | 给多个员工发通知 |
| `sendByAddress(Map<String, Collection<String>> addressMap, String template, Map payload)` | 按渠道地址直接发通知 |
| 上述方法都支持再追加一个 `DispatchOptions options` 参数                  | 指定发送附加选项 |

使用建议：

- 已经知道员工 ID 时，优先用 `sendByEmployee`
- 已经自行准备好渠道地址时，再考虑 `sendByAddress`
- 模板名和 `payload` 字段要与通知模板定义保持一致
- 如果需要附加发送选项，`DispatchOptions` 当前可用字段主要是 `channels`、`channelOptions` 和 `sendByEmployee`

通知模板本身怎么设计，可以继续看 [通知模板教程](../../../guide/tutorial/notification/)。

## Scheduler

如果当前运行时启用了计划任务能力，脚本里还会额外拿到 `Scheduler`。

| 方法形态                                                                  | 返回值类型           | 说明 |
| ------------------------------------------------------------------------- | -------------------- | ---- |
| `schedule(ScheduleTask task)`                                             | `Try<LocalDateTime>` | 按任务对象创建调度 |
| `scheduleCron(String taskName, String cron, String flowName, Map data)`   | `Try<LocalDateTime>` | 创建 cron 调度 |
| `scheduleOnce(...)`                                                       | `Try<LocalDateTime>` | 创建一次性调度，支持 `Date`、`LocalDateTime`、`Duration`、毫秒数 |
| `cancel(String taskName)`                                                 | `Try<Void>`          | 取消任务 |
| `isScheduled(String taskName)`                                            | `boolean`            | 判断任务是否已存在 |

要注意两点：

- `Scheduler` 返回的是 `Try`，不是直接抛异常
- 如果当前环境没有可用调度器实例，这些调用会失败

这类能力更偏集成和自动化场景；如果它会成为稳定的业务能力，通常还要结合后端扩展或逻辑流来设计。

## 下一步看哪里

- 想查 `${...}` 里能直接用什么：看 [表达式上下文](../expression-context/)
- 想学什么时候该写脚本：看 [脚本教程](../../../guide/tutorial/script/)
- 想给脚本补充新的全局对象：看 [扩展脚本](../../../guide/advance/extend-backend/extend-script/)
- 想查这些对象背后的 Java 类型：看 [Java API](../java-api/)
