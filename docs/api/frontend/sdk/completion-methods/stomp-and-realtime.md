---
sidebar_position: 5
---

# Stomp 与实时通信

从 SDK 导入 `Stomp`，用于接收服务端推送和发送消息。目的地须与应用服务端配置一致；平台默认连接路径为 `/websocket/stomp`。

## 订阅与清理

| 方法 | 目的地示例 | 返回值 |
| --- | --- | --- |
| `Stomp.subscribeTopic('orders', listener, options?)` | `/topic/orders` | 取消函数 |
| `Stomp.subscribeQueue('jobs', listener, options?)` | `/queue/jobs` | 取消函数 |
| `Stomp.subscribeUserTopic('notice', listener, options?)` | `/user/topic/notice` | 取消函数 |
| `Stomp.subscribe(destination, listener, options?)` | 使用完整目的地 | 取消函数 |

监听器接收 `(message, rawMessage)`。第三个参数可传布尔值或 `{ keepSingleListener }`，默认 `true`，会替换该目的地已有监听器。多个组件需要同时监听时设为 `false`。

```js
import { Stomp, initMicroApp } from 'ouroboros-sdk'

let stop
const { bootstrap, mount, update, unmount } = initMicroApp({
  async afterMount() {
    stop = Stomp.subscribeTopic('orders', (message) => {
      console.log('订单状态', message)
    }, { keepSingleListener: false })
  },
  async afterUnmount() {
    stop?.()
    stop = undefined
  },
})
export { bootstrap, mount, update, unmount }
```

普通订阅会按需连接，重连后恢复订阅。组件卸载时调用自己持有的取消函数。

## 初始数据加实时更新

服务端实现了对应初始化接口时，可用 `subscribeWithInitial`。例如实时目的地 `/orders/status` 默认配对 `/app/orders/status/init`：

```js
import { Stomp } from 'ouroboros-sdk'

const handle = Stomp.subscribeWithInitial('/orders/status', (message) => {
  console.log('收到订单数据', message)
}, {
  initialBody: { status: 'OPEN' },
  initialTimeoutMs: 10000,
  keepSingleListener: false,
})
try {
  await handle.bootstrapDone
  console.log('初始数据接收完成')
} catch (error) {
  console.error('初始数据加载失败', error)
}
// 页面卸载时：
// handle.unsubscribe()
```

该方法返回 `{ bootstrapDone, unsubscribe }`。初始化失败、超时或提前取消会使等待失败，需要处理 Promise 拒绝。

| 选项 | 用途 |
| --- | --- |
| `initialDestination` | 显式指定 `/app/.../init` 地址 |
| `initialBody` | 初始请求数据 |
| `createInitialRequest()` | 每次初始化动态生成请求数据 |
| `initialTimeoutMs` | 等待初始数据的超时，毫秒 |
| `splitInitialHandlers` | 分开处理初始与实时消息 |
| `onInitialData`、`onInitialLive` | 初始数据 / 初始化期间实时数据回调 |
| `onInitialComplete`、`onInitialError` | 初始化结束 / 错误回调 |

普通 `subscribe*` 的选项也可携带这些初始化配置；需要等待完成时使用 `subscribeWithInitial`。

## 发送消息

| 方法 | 消息体 |
| --- | --- |
| `Stomp.sendText(destination, body, headers?)` | 字符串 |
| `Stomp.sendJson(destination, body, headers?)` | JSON 数据 |
| `Stomp.sendBinary(destination, body, headers?)` | `Uint8Array` |
| `Stomp.send(destination, body, headers?)` | 通用发送 |

均返回 Promise。发送成功仅表示消息已发出，业务处理完成应由服务端结果消息确认。

```js
await Stomp.sendJson('/app/orders/reload', { orderId: 'order-001' })
```

## 连接状态

| 方法 | 用途 |
| --- | --- |
| `connect()`、`reconnect()` | 建立 / 重建连接，返回 Promise |
| `disconnect(force?)` | 断开连接，默认非强制 |
| `isConnected()` | 是否已建立连接 |
| `isActive()` | 客户端是否已激活 |
| `isStompAuthenticated()` | Stomp 认证状态 |
| `onStompConnected(handler)`、`onStompDisconnected(handler)` | 监听状态，返回清理函数 |

```js
const stopStatus = Stomp.onStompConnected(() => console.log('实时连接已就绪'))
// 页面卸载时：
// stopStatus()
```

连接由同一基座下的页面共享。普通组件通过取消自己的订阅清理资源，避免断开整个连接。

## 按目的地取消

`unsubscribeTopic`、`unsubscribeQueue`、`unsubscribeUserTopic` 和 `unsubscribe` 接收目的地及可选 `listener`。省略监听器会取消该目的地的全部监听。

`unsubscribeAll`、`unsubscribeAllTopics`、`unsubscribeAllQueues`、`unsubscribeAllUserTopics` 会影响其他使用者，仅用于明确需要全局清理的场景。
