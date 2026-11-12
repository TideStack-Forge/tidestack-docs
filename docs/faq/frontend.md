---
sidebar_position: 99.1
---

# 前端常见问题

## 页面应该用 UI Schema、组件库还是微前端？

标准列表、表单和详情继续使用 UI Schema；单个控件缺失时扩展组件库；需要独立路由、复杂交互或专用前端框架时使用微前端。入口选择与发布方式见 [前端开发](../fusion-development/frontend-extension-paths)。

## 发布后为什么没有显示新页面？

先核对 UI 模型是否指向新实现、菜单地址是否正确、当前用户是否有权限。再通过浏览器 Network 检查入口 HTML 和 JS/CSS 是否成功加载，响应内容是否确为本次产物，失败地址是否被代理返回了首页 HTML。

确认目标运行实例使用的应用版本和静态资源版本，再处理缓存。微前端目录结构与发布步骤见 [微前端应用](../guide/advance/extend-frontend/micro-app/)。

## SDK 方法为什么不可用或返回空结果？

运行时方法在页面的 `render`、`afterMount` 或后续用户交互中调用。`beforeMount` 发生在 SDK 就绪之前；独立打开微前端 HTML 也不能验证完整平台能力。

```js
import { initMicroApp, getUserInfo } from 'ouroboros-sdk'

const { bootstrap, mount, update, unmount } = initMicroApp({
  async afterMount() {
    const user = await getUserInfo()
    console.log('当前用户', user)
  },
})
export { bootstrap, mount, update, unmount }
```

该示例演示调用时机，实际页面另提供 `render`。完整生命周期见 [微前端初始化](../api/frontend/sdk/initialization-methods/)。

## HTTP 200 为什么仍提示失败？数据为什么多了一层？

普通平台 JSON 响应为 `{ code, msg, data }`。SDK `request` 返回响应对象，需要先取 `response.data`，再检查 `code`：

```js
import { request } from 'ouroboros-sdk'

// 示例要求应用定义了该接口。
const response = await request.get('/api/orders')
const result = response.data
if (result.code !== 0) throw new Error(result.msg || '查询失败')
console.log(result.data)
```

HTTP 错误还需通过 `try/catch` 处理。`login` 返回的则是登录结果 `success`，不能混用两种判断方式。见 [请求与认证](../api/frontend/sdk/completion-methods/request-and-authentication)。

## 自定义登录页要实现 callback 和 bind 吗？

通常无需自行实现。平台将 `/login` 交给自定义页面，`/login/callback` 和 `/login/bind` 继续由基座处理。自定义页面负责展示登录方式、发起登录并传递清洗后的回跳地址。

长期运行时使用 `getToken()` 获取最新令牌，`props.token` 是挂载时快照。接入流程见 [自定义登录页与认证接入](../fusion-development/custom-login-page-and-auth-integration)。

## 表单选择器为什么返回字符串，而不是对象？

检查 `joinValues` 和 `extractValue`。需要员工或组织对象时，显式设置二者为 `false`；多选输出对象数组，单选输出对象。需要 ID 数组时，设置 `joinValues: false`、`extractValue: true`。

字段类型、默认值及回显格式也要一致。完整示例见 [业务选择器与微前端容器](../api/frontend/buildin-comps/business-pickers-and-micro-components)。

## Schema 预览正常，为什么实际请求和跳转没有执行？

`amis-schema-preview` 用于外观预览，内容中的业务请求使用空数据，导航不执行。接口、权限、提交和跳转应在 `amis-schema` 或实际发布页面中验证。

`amis-schema` 同时提供多个来源时，优先使用 `schemaId`，然后才是 `source`。组件用法见 [Schema 与编辑器组件](../api/frontend/buildin-comps/schema-and-editor-components)。

## 离开页面后为什么还会收到消息，或者监听越来越多？

页面卸载时取消本页的事件、语言和 Stomp 订阅，并销毁自行创建的渲染实例。保留处理函数或订阅返回的清理函数，避免调用全局清理误删其他页面监听。

```js
import { Stomp } from 'ouroboros-sdk'

const stop = Stomp.subscribeTopic('orders', (message) => {
  console.log(message)
}, { keepSingleListener: false })
// 在页面卸载钩子中调用 stop()。
```

完整生命周期示例见 [Stomp 与实时通信](../api/frontend/sdk/completion-methods/stomp-and-realtime)。
