---
title: 平台支撑能力
---

# 平台支撑能力

扩展包中的 Java 服务可以直接使用平台已有的配置、字典、通知、实时通信、上传和组织能力。下面分别说明准备资源、调用方式和验证结果。示例业务名称需要替换为应用已有定义。

## 装配准备

按 [后端扩展包](../backend-extension-packages)注册自动配置和业务 Bean。编译时依赖所用能力的公开接口模块，运行时确认目标应用装配了对应实现；只增加 core 依赖不会自动获得服务 Bean。

| 能力 | Java 入口 | 使用前准备 |
| --- | --- | --- |
| 统一配置 | `ConfigurationService` | 定义配置键、类型、默认值及可见范围 |
| 字典 | `DataDictService` | 创建字典与编码项 |
| 通知 | `EmployeeNotificationDispatcher` / `AddressNotificationDispatcher` | 模板、渠道及接收人地址映射 |
| 实时通信 | `StompMessageSender` / `StompMessageSubscriber` | WebSocket 运行时、认证与目的地约定 |
| 上传 | 已有 `/api/upload` 接口 | 上传运行时、存储目录、文件访问地址 |
| 组织 | `OrganizationFacadeService` | 公司、部门、岗位、员工与任职关系 |

## 统一配置

### 定义配置项

需要在线调整的业务参数进入统一配置。随扩展包交付时，在 `src/main/metadata/configurations.json` 中声明数组，例如导出批次大小：

```json
[
  {
    "key": "orders.export.batchSize",
    "label": "订单导出批次大小",
    "valueType": "int",
    "defaultValue": 100,
    "modifiable": true,
    "nullable": false
  }
]
```

按 [模型资源与打包](../../guide/advance/authoring-metadata-conventions/)交付定义，然后在目标应用配置界面设置实际值。定义的默认值与实例覆盖值分别管理，具体范围与设置方式见 [配置教程](../../guide/tutorial/configuration/)。

### Java 读取

```java
import org.springframework.stereotype.Service;
import com.ouroboros.configuration.ConfigurationService;

@Service
public class ExportSettings {
  private final ConfigurationService configuration;

  public ExportSettings(ConfigurationService configuration) {
    this.configuration = configuration;
  }

  public int batchSize() {
    return configuration.getOrDefault(
        Integer.class, "orders.export.batchSize", 100);
  }
}
```

必填项使用 `getRequired(类型, key)`，缺少时让调用失败；允许缺省时使用 `get` 的 `Optional` 或 `getOrDefault`。每次业务执行读取当前值，避免只在构造器读取一次后长期缓存。确需自建缓存时，用 `getRevision(key)` 判断配置版本。

### 脚本读取

```groovy
def value = Config.get('orders.export.batchSize')
def batchSize = value == null ? 100 : Converter.toInteger(value)
```

`Config.get` 经过执行上下文配置访问规则，不等同于可信 Java 服务对配置的读取权限。前端可见范围也需要单独声明。不要为了脚本能取到值而暴露服务端密钥。

验证时先读默认值，再在线改值并重新执行业务，同时检查缺少必填值、类型错误及脚本访问范围。

## 字典

先在平台创建 `orderStatus` 字典，维护 `OPEN`、`CLOSED` 等编码。业务记录保存编码，界面按标签显示；修改标签不应要求重写全部业务数据。

```java
import org.springframework.stereotype.Service;
import com.ouroboros.data.dict.DataDictService;
import com.ouroboros.exception.BusinessException;

@Service
public class OrderStatusLabels {
  private final DataDictService dictionaries;

  public OrderStatusLabels(DataDictService dictionaries) {
    this.dictionaries = dictionaries;
  }

  public String labelOf(String code) {
    return dictionaries.getItemByCode("orderStatus", code)
        .orElseThrow(() -> new BusinessException("订单状态编码不存在"))
        .getLabel();
  }
}
```

读取字典定义用 `detail(name)`，取全部选项用 `searchListItemByDictName(name)`。树形字典返回树形结构，不能当成必然平铺的列表。写入前验证编码是否属于指定字典。

模型字段使用平台已有字典字段配置关联 `orderStatus`。自定义页面也可调用 `GET /api/sys/data-dict/orderStatus` 获取选项，接口返回列表包装结果；按响应中的 `code`、`label` 字段配置控件值与展示映射。页面展示和后端校验共用同一份字典。

验证新增、标签调整、未知编码及树形选项；不要把标签当成业务判断条件。字典维护方式见 [字典教程](../../guide/tutorial/dict/)。

## 通知

### 准备模板与接收人

先建立通知模板 `orderCreated`，约定载荷 `orderCode`，并启用需要的渠道。模板随包交付时使用 `.notification.json` 后缀，结构与配置见 [通知教程](../../guide/tutorial/notification/)。

发给员工时，维护员工与渠道地址的映射。传入的是组织员工 ID，不是登录用户 ID，也不是钉钉或企业微信的外部用户标识。

### Java 发送

```java
import java.util.Map;
import org.springframework.stereotype.Service;
import com.ouroboros.notification.EmployeeNotificationDispatcher;

@Service
public class OrderNotices {
  private final EmployeeNotificationDispatcher notifications;

  public OrderNotices(EmployeeNotificationDispatcher notifications) {
    this.notifications = notifications;
  }

  public void created(String employeeId, String orderCode) {
    notifications.send(employeeId, "orderCreated", Map.of("orderCode", orderCode));
  }
}
```

已有确切渠道地址时，注入 `AddressNotificationDispatcher`，调用 `send(addresses, template, payload)`。`addresses` 的类型为 `Map<String, Collection<String>>`，key 使用目标应用已注册的渠道名，value 为该渠道的地址集合。

普通 `send` 返回不代表收件人已收到通知。需要检查渠道执行结果时使用 `sendWithResult(..., DispatchOptions)`，检查 `success()` 和各渠道结果；实现可能返回 unknown，不能把未知当成功。可靠业务事件投递还需要支持 `NotificationDispatchRequest` 与 `NotificationDeliveryPolicy` 的正式重载，落实接收人、披露策略、幂等和结果确认，不能靠捕获异常后返回成功来确认事件。

### 脚本发送

```groovy
NotificationDispatcher.sendByEmployee(
    recipientEmployeeId, 'orderCreated', [orderCode: orderCode]
)
```

多员工使用员工 ID 集合；直接地址使用 `sendByAddress`。调用业务流程前，先用测试模板和测试接收人验证渠道配置，再检查缺少地址、模板参数不符、渠道失败及重复执行。业务事务回滚不会撤回已发出的外部通知，需可靠交付时使用 [业务事件](./business-model#5-监听业务事件)机制安排发送。

## 前后端实时通信

### 后端推送，前端订阅

以下示例推送不含私人数据的公共进度，目的地统一为 `/topic/import-progress`：

```java
import java.util.Map;
import org.springframework.stereotype.Service;
import com.ouroboros.websocket.StompMessageSender;

@Service
public class ImportProgress {
  private final StompMessageSender messages;

  public ImportProgress(StompMessageSender messages) {
    this.messages = messages;
  }

  public void report(String jobId, int completed) {
    messages.send("/topic/import-progress", Map.of(
        "jobId", jobId, "completed", completed));
  }
}
```

页面挂载后订阅，卸载时清理自己的监听：

```js
import { Stomp } from 'ouroboros-sdk'

const stop = Stomp.subscribeTopic('import-progress', (message) => {
  console.log(message.jobId, message.completed)
}, { keepSingleListener: false })
// 页面卸载时调用 stop()
```

私人通知使用 `sendToUser(user, "/topic/import-progress", payload)`，前端配对 `subscribeUserTopic('import-progress', listener)`。`user` 必须对应当前认证主体的用户名称，不能随意换成员工 ID。目的地授权与业务数据访问需要同时验证。

### 前端发送，后端接收

前端通过 SDK 发送 JSON：

```js
await Stomp.sendJson('/app/imports/reload', { jobId: 'job-001' })
```

Java 可以注入 `StompMessageSubscriber`，在业务 Bean 初始化时调用 `onSend("/app/imports/reload", handler)`。`handler` 是 Spring `MessageHandler`，从 `Message<?>` 读取消息头及载荷，再按约定解析 JSON；需要鉴权和校验输入后才执行业务操作。保存同一个 handler，在销毁时调用 `unsubscribe(handler)`，不要每次请求都注册一次。不要假定原始载荷已经是业务 DTO。

平台默认连接地址为 `/websocket/stomp`。断线重连会恢复订阅，但实时消息不替代业务查询；页面重新连接后应重新读取当前状态。发送 Promise 完成表示消息发出，处理成功需要服务端结果消息确认。完整 SDK 与初始化订阅见 [Stomp 与实时通信](../../api/frontend/sdk/completion-methods/stomp-and-realtime)。

验证双向目的地、身份隔离、断线恢复、重复挂载清理，以及任务失败时的最终状态。

## 文件上传

### 使用已有上传接口

普通业务页面直接复用目标应用上传入口：

| 请求 | 用途 | 结果 |
| --- | --- | --- |
| `POST /api/upload/file` | 普通文件上传 | `WebApiResult<UploadResult>` |
| `POST /api/upload/upload-temp` | 表单临时上传 | `WebApiResult<TempUploadResult>` |
| `GET /api/file/{filePath}` | 获取文件 | 文件内容；可用 `fileName` 指定下载名称 |

上传请求为 multipart，文件字段名是 `file`。自定义前端使用 SDK 当前登录态发送，不手写磁盘路径：

```js
import { request } from 'ouroboros-sdk'

export async function upload(file) {
  const form = new FormData()
  form.append('file', file)
  const response = await request.post('/api/upload/file', form)
  const result = response.data
  if (result.code !== 0) throw new Error(result.msg || '上传失败')
  return result.data
}
```

让请求层与浏览器处理 multipart boundary，避免手填缺少 boundary 的 `Content-Type`。成功结果包含 `value`、`url`、`name`；当前普通上传实现将 `value` 设为访问 URL，不能把它当成本机绝对路径。表单按目标字段的结构保存结果，展示或下载使用返回的 `url`。

### 临时上传与业务保存

临时结果还包含 `isTemp: true` 和 `tempFile`，供明确支持临时文件的业务链路使用。使用前确认业务保存端如何取得临时内容、转存及清理；通用上传接口不会仅因为表单提交了 `tempFile` 就自动归档。普通永久附件使用 `/api/upload/file`，不要把临时文件标识存成长期下载地址。

Java 后端需要操作文件存储时，先确认实际上传链路装配的实现。当前默认 Controller 直接使用文件系统链路，不保证存在可供任意服务注入的默认 `UploadStorageService` Bean。接入对象存储等新介质时，按 [文件上传存储扩展](../plugin-extensions/backend/upload-storage)完成显式装配。

验证文件大小与格式限制、上传失败、保存后再次下载、临时文件过期和实例重启后的可用性。敏感附件还应验证实际下载入口的访问控制。

## 组织与员工

组织数据通过公司、部门、岗位、员工和任职关系表达。应用中的组织维护业务可以注入 `com.ouroboros.organizationstructure.service.OrganizationFacadeService`，使用其已有复合操作：

```java
// organization 是注入的 OrganizationFacadeService。
organization.linkEmployeeUser(employeeId, userId);
organization.transferToDepartment(employeeId, newDepartmentId);
```

`linkEmployeeUser` 关联员工与登录账号；`transferToDepartment` 处理结束原主岗并在目标部门默认岗位建立新任职。入口应先完成业务授权，不要直接修改员工部门字段替代任职调整。

模型和页面选择员工、部门时使用已有组织字段类型；通知用员工 ID，认证与权限用平台主体，各类标识通过正式关系解析。验证主岗唯一性、兼职、任职日期及未绑定账号员工。对象和字段说明见 [组织模型](../../concepts/organization-model/)。
