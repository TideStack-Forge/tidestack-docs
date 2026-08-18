---
sidebar_position: 5
---

# Stomp 与实时通信

适用对象：需要在微前端里做主题订阅、用户通道、点对点消息、发送消息和断线重连的开发者。

## 使用场景

- 你需要订阅主题、队列或用户主题
- 你需要主动发送文本、JSON 或二进制消息
- 你要处理连接、断开和重连

## subscribeTopic(topic,listener,keepSingleListener)

实时通信 - 订阅主题。

**参数说明**

| 参数名             | 类型     | 必填 | 默认值 | 说明                                                                            |
| ------------------ | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| topic              | string   | 是   |        | 订阅的主题                                                                      |
| listener           | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |
| keepSingleListener | boolean  | 否   | true   | 是否保持单一的监听器，即订阅同一个目的地时，之前的监听器会被移除                |

**示例**

```js
import { subscribeTopic } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

subscribeTopic('myTopic', messageListener, true)
```

## subscribeQueue(queue,listener,keepSingleListener)

实时通信 - 订阅点对点队列。

**参数说明**

| 参数名             | 类型     | 必填 | 默认值 | 说明                                                                            |
| ------------------ | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| queue              | string   | 是   |        | 点对点队列名称                                                                  |
| listener           | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |
| keepSingleListener | boolean  | 否   | true   | 是否保持单一的监听器，即订阅同一个目的地时，之前的监听器会被移除                |

**示例**

```js
import { subscribeQueue } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

subscribeQueue('myQueue', messageListener, true)
```

## subscribeUserTopic(topic,listener,keepSingleListener)

实时通信 - 订阅用户主题。

**参数说明**

| 参数名             | 类型     | 必填 | 默认值 | 说明                                                                            |
| ------------------ | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| topic              | string   | 是   |        | 订阅的主题                                                                      |
| listener           | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |
| keepSingleListener | boolean  | 否   | true   | 是否保持单一的监听器，即订阅同一个目的地时，之前的监听器会被移除                |

**示例**

```js
import { subscribeUserTopic } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

subscribeUserTopic('myUserTopic', messageListener, true)
```

## subscribe(destination,listener,keepSingleListener)

实时通信 - 订阅消息。

**参数说明**

| 参数名             | 类型     | 必填 | 默认值 | 说明                                                                            |
| ------------------ | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| destination        | string   | 是   |        | 订阅的目的地                                                                    |
| listener           | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |
| keepSingleListener | boolean  | 否   | true   | 是否保持单一的监听器，即订阅同一个目的地时，之前的监听器会被移除                |

**示例**

```js
import { subscribe } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

subscribe('/myDestination', messageListener, true)
```

## unsubscribeTopic(topic,listener)

实时通信 - 取消订阅主题。

**参数说明**

| 参数名   | 类型     | 必填 | 默认值 | 说明                                                                            |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| topic    | string   | 是   |        | 订阅的主题                                                                      |
| listener | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |

**示例**

```js
import { unsubscribeTopic } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

unsubscribeTopic('myTopic', messageListener)
```

## unsubscribeQueue(queue,listener)

实时通信 - 取消订阅点对点队列。

**参数说明**

| 参数名   | 类型     | 必填 | 默认值 | 说明                                                                            |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| queue    | string   | 是   |        | 点对点队列名称                                                                  |
| listener | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |

**示例**

```js
import { unsubscribeQueue } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

unsubscribeQueue('myQueue', messageListener)
```

## unsubscribeUserTopic(topic,listener)

实时通信 - 取消订阅用户主题。

**参数说明**

| 参数名   | 类型     | 必填 | 默认值 | 说明                                                                            |
| -------- | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| topic    | string   | 是   |        | 订阅的主题                                                                      |
| listener | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |

**示例**

```js
import { unsubscribeUserTopic } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

unsubscribeUserTopic('myUserTopic', messageListener)
```

## unsubscribe(destination,listener)

实时通信 - 取消订阅。

**参数说明**

| 参数名      | 类型     | 必填 | 默认值 | 说明                                                                            |
| ----------- | -------- | ---- | ------ | ------------------------------------------------------------------------------- |
| destination | string   | 是   |        | 取消订阅的目的地                                                                |
| listener    | function | 是   |        | 消息监听器，接收两个参数：`message` 表示消息内容， `rawMessage`表示原始消息对象 |

**示例**

```js
import { unsubscribe } from 'ouroboros-sdk'

const messageListener = (message, rawMessage) => {
  console.log('Received message:', message)
}

unsubscribe('/myDestination', messageListener)
```

## unsubscribeAll

实时通信 - 取消订阅所有。

**示例**

```js
import { unsubscribeAll } from 'ouroboros-sdk'

unsubscribeAll()
```

## unsubscribeAllTopics

实时通信 - 取消订阅所有主题。

**示例**

```js
import { unsubscribeAll } from 'ouroboros-sdk'

unsubscribeAll()
```

## unsubscribeAllQueues

实时通信 - 取消订阅所有点对点队列。

**示例**

```js
import { unsubscribeAllQueues } from 'ouroboros-sdk'

unsubscribeAllQueues()
```

## unsubscribeAllUserTopics

实时通信 - 取消订阅所有用户主题。

**示例**

```js
import { unsubscribeAllUserTopics } from 'ouroboros-sdk'

unsubscribeAllUserTopics()
```

## sendBinary(destination,body,headers)

发送二进制消息。

**参数说明**

| 参数名      | 类型       | 必填 | 默认值 | 说明       |
| ----------- | ---------- | ---- | ------ | ---------- |
| destination | string     | 是   |        | 目的地     |
| body        | Uint8Array | 是   |        | 消息体     |
| headers     | any        | 否   |        | 请求头信息 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { sendBinary } from 'ouroboros-sdk'

const destination = '/upload'
const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
const headers = { 'Content-Type': 'application/octet-stream' }

await sendBinary(destination, binaryData, headers)
```

## sendText(destination,body,headers)

发送文本消息。

**参数说明**

| 参数名      | 类型   | 必填 | 默认值 | 说明       |
| ----------- | ------ | ---- | ------ | ---------- |
| destination | string | 是   |        | 目的地     |
| body        | string | 是   |        | 消息体     |
| headers     | any    | 否   |        | 请求头信息 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { sendText } from 'ouroboros-sdk'

const destination = '/upload'
const body = 'Hello, World!'
const headers = { 'Content-Type': 'text/plain' }

await sendText(destination, body, headers)
```

## sendJson(destination,body,headers)

发送 JSON 消息。

**参数说明**

| 参数名      | 类型   | 必填 | 默认值 | 说明       |
| ----------- | ------ | ---- | ------ | ---------- |
| destination | string | 是   |        | 目的地     |
| body        | any    | 是   |        | 消息体     |
| headers     | any    | 否   |        | 请求头信息 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { sendJson } from 'ouroboros-sdk'

const destination = '/upload'
const jsonData = { name: 'John', age: 30 }
const headers = { 'Content-Type': 'application/json' }

await sendJson(destination, jsonData, headers)
```

## send(destination,body,headers)

发送消息。

**参数说明**

| 参数名      | 类型   | 必填 | 默认值 | 说明       |
| ----------- | ------ | ---- | ------ | ---------- |
| destination | string | 是   |        | 目的地     |
| body        | any    | 是   |        | 消息体     |
| headers     | any    | 否   |        | 请求头信息 |

**返回值**

返回一个 Promise 对象。

**示例**

同上。

## connect

连接服务器。

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { connect } from 'ouroboros-sdk'

await connect()
```

## disconnect(force)

断开连接。

**参数说明**

| 参数名 | 类型    | 必填 | 默认值 | 说明             |
| ------ | ------- | ---- | ------ | ---------------- |
| force  | boolean | 否   | false  | 是否强制断开连接 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { disconnect } from 'ouroboros-sdk'

await disconnect()
```

## reconnect

重新连接。

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { reconnect } from 'ouroboros-sdk'

await reconnect()
```
