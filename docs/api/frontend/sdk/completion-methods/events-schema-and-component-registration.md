---
sidebar_position: 3
---

# 事件、Schema 与组件注册

前端事件、权限判断和 Schema 渲染在挂载后使用；组件、动作和校验器可在组件库入口加载时注册。

## EventBus

| 方法 | 用途 |
| --- | --- |
| `subscribe(event, handler)` | 持续监听 |
| `subscribeOnce(event, handler)` | 一次性监听 |
| `unsubscribe(event, handler)` | 移除指定处理函数 |
| `unsubscribeAll(event)` | 移除该事件的所有监听 |
| `publish(event, data, options?)` | 发布事件 |

```js
import { EventBus, initMicroApp } from 'ouroboros-sdk'

const handleSaved = (order) => console.log('订单更新', order.id)
const { bootstrap, mount, update, unmount } = initMicroApp({
  async afterMount() {
    EventBus.subscribe('orders:saved', handleSaved)
  },
  async afterUnmount() {
    EventBus.unsubscribe('orders:saved', handleSaved)
  },
})
export { bootstrap, mount, update, unmount }

// 保存成功后的交互处理函数中调用：
export function notifySaved(order) {
  EventBus.publish('orders:saved', { id: order.id })
}
```

取消监听需传入原处理函数。组件卸载时使用 `unsubscribe`，避免移除其他页面的监听。

当前平台支持第三个参数作为过滤器：`EventBus.subscribe(event, handler, filter)`，过滤器返回 `true` 才通知处理函数。SDK 类型声明的三参数顺序与运行时存在差异；需要兼容不同基座版本时，使用双参数订阅，并在 `handler` 内判断条件。

### 平台事件与回放

| 事件 | 数据 |
| --- | --- |
| `updateAppName` | 应用名称字符串 |
| `updateAppLogo` | Logo 地址字符串 |
| `updateMenu` | 菜单数组 |

需要在用户初始化后恢复前端展示设置时，可显式记录会话回放：

```js
EventBus.publish('updateAppName', '订单中心', {
  replayScope: 'SESSION',
  replayStage: 'SYS_INIT_USER',
})
```

回放用于前端展示状态，不会保存应用元数据。同名事件只保留最新记录；不要存入密码、令牌或敏感业务数据。

## hasAuth

`hasAuth(authKey)` 返回布尔值，可控制按钮等前端展示。实际读写权限由服务端校验。

```js
import { hasAuth } from 'ouroboros-sdk'

const canApprove = hasAuth('orders.approve')
```

## renderAmisSchema

`await renderAmisSchema(containerEl, schema, props?, env?)` 渲染 AMIS 页面，返回包含 `update`、`destroy` 和 `getScopeRef` 的句柄。

```js
import { renderAmisSchema } from 'ouroboros-sdk'

// containerEl 为页面已创建的 DOM 容器。
const view = await renderAmisSchema(containerEl, {
  type: 'page',
  body: { type: 'tpl', tpl: '订单号：${orderId}' },
}, { data: { orderId: 'order-001' } })

await view.update({ type: 'page', body: '订单已处理' })
// 页面卸载时：
view.destroy()
```

传入的容器应专供该渲染实例使用。`props.data` 提供页面数据；`env` 按需覆盖运行环境方法。

## Renderer 与 FormItem

`Renderer(options)(Component)` 注册展示组件；`FormItem(options)(Component)` 注册表单项。自定义表单项通过 `value` 读取值，通过 `onChange(nextValue)` 更新值。

```jsx
import React from 'react'
import { Renderer, FormItem } from 'ouroboros-sdk'

function OrderStatus({ status }) {
  return <span>{status === 'OPEN' ? '待处理' : '已处理'}</span>
}
Renderer({ type: 'order-status', autoVar: true })(OrderStatus)

function OrderCode({ value = '', onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
FormItem({ type: 'order-code', autoVar: true })(OrderCode)
```

在页面中引用：

```json
{
  "type": "form",
  "body": [
    { "type": "order-code", "name": "code", "label": "订单号" },
    { "type": "order-status", "status": "OPEN" }
  ]
}
```

注册名应在应用内唯一。组件库构建与加载方式见 [组件库](../../../../guide/advance/extend-frontend/amis-component/)。

## 自定义动作与校验

```js
import { registerAction, addRule, toast } from 'ouroboros-sdk'

registerAction('show-order-code', {
  run(action) {
    toast.info(`订单号：${action.args.code}`)
  },
})
addRule('orderCode', (values, value) => /^ORD-\d+$/.test(value),
  '订单号格式应为 ORD-数字')
```

```json
{
  "type": "form",
  "body": [
    {
      "type": "input-text",
      "name": "code",
      "label": "订单号",
      "validations": { "orderCode": true }
    },
    {
      "type": "button",
      "label": "显示订单号",
      "onEvent": {
        "click": {
          "actions": [
            { "actionType": "show-order-code", "args": { "code": "${code}" } }
          ]
        }
      }
    }
  ]
}
```

其他注册入口包括 `OptionsControl`、`registerFormula`、`registerValidator`、`registerIcon`、`registerEditorPlugin` 和 `registerActionPanel`，分别用于选项表单项、公式、公式校验、图标及编辑器扩展。

## 主题与国际化

```js
import { getTheme, setTheme, i18n } from 'ouroboros-sdk'

const theme = getTheme()
setTheme(theme)
const title = i18n.t('orders.title', '订单')
const stop = i18n.onLocaleChange((locale) => console.log('语言切换', locale))
// 页面卸载时：
stop()
```

`i18n` 还支持 `getLocale()`、`getLanguages()`、`switchLanguage(locale)`、`tn(namespace, key, defaultText?, params?)`、`tMenu` 和 `tCommon`。
