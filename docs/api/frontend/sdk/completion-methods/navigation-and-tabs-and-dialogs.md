---
sidebar_position: 2
---

# 导航、标签页与弹层

以下方法从 `ouroboros-sdk` 导入，在平台挂载后调用。路径示例以应用已配置 `/orders` 和 `/orders/detail` 页面为前提。

## 菜单与标签页

| 方法 | 参数与行为 |
| --- | --- |
| `openMenu(menu)` | 接收路径字符串，或 `{ path, title?, parent?, icon?, showMode? }` |
| `openTab(fullPath, options?)` | 打开标签页；`options` 支持 `title`、`breadcrumbs`、`icon`、`callback` |
| `openOrSwitchTab(fullPath, options?)` | 复用匹配的标签页，否则打开新页 |
| `closeTab(id?, result?)` | 关闭指定标签页；省略 `id` 关闭当前页，可携带返回数据 |
| `sendToOpenerTab(id, data)` | 向该标签页的打开方回传消息；当前页传 `undefined` |
| `updateTabTitle(id, title)` | 更新标题；当前页传 `undefined` |

`showMode` 是 `'tab'`、`'newWindow'` 或 `'fullScreen'`，默认 `'tab'`。页面配置会影响是否允许同一路径打开多个标签页。

```js
import { openMenu, openTab, openOrSwitchTab } from 'ouroboros-sdk'

await openMenu({ path: '/orders', title: '订单', showMode: 'tab' })
await openOrSwitchTab('/orders')
await openTab('/orders/detail?id=order-001', {
  title: '订单详情',
  callback(result) {
    if (result?.saved) console.log('订单已保存', result.id)
  },
})
```

详情页保存后，选择“回传并关闭”或“回传后继续编辑”中的一种：

```js
import { closeTab, sendToOpenerTab, updateTabTitle } from 'ouroboros-sdk'

await updateTabTitle(undefined, '订单 order-001')
await sendToOpenerTab(undefined, { saved: true, id: 'order-001' })
// 若要回传并关闭，使用：
// await closeTab(undefined, { saved: true, id: 'order-001' })
```

这些方法的异步调用可用 `await` 等待。固定标签页可能拒绝关闭；有配置的国际化标题时，显示标题优先使用翻译。

## 对话框与抽屉

`openDialog(schema, ctx?)` 和 `openDrawer(schema, ctx?)` 返回 Promise：确认时为各表单值组成的数组，取消时为 `false`。

| 配置 | 类型 / 用途 |
| --- | --- |
| `title` | 标题 |
| `body` | 内联 AMIS Schema |
| `schemaId` | 已发布 UI Schema 的路径 |
| `url` | 要加载的页面地址 |
| `data` | 初始数据 |
| `size` | `xs`、`sm`、`md`、`lg`、`xl`、`full` |
| `position` | 抽屉方向：`left`、`right`、`top`、`bottom` |
| `onConfirm(values)`、`onClose()` | 可选的结果回调 |

内容按需求选择 `body`、`schemaId` 或 `url`；`ctx` 传递弹层可读取的上下文数据。

```js
import { openDialog, toast } from 'ouroboros-sdk'

const values = await openDialog({
  title: '填写订单备注',
  size: 'md',
  body: {
    type: 'form',
    body: [{ type: 'input-text', name: 'remark', label: '备注' }],
  },
})
if (values !== false) {
  const remark = values[0]?.remark
  toast.success(`已确认备注：${remark || '无'}`)
}
```

同样的表单可以传给 `openDrawer`，另加 `position: 'right'`。弹层内的微前端可用 `onConfirm(params, reload?)` 提交结果，用 `onCancel()` 取消。

## 确认与输入

| 方法 | 结果 |
| --- | --- |
| `confirm(content, title?, optionsOrConfirmText?, cancelText?)` | Promise，确认 / 取消结果 |
| `alert(content, title?, className?)` | Promise，等待用户关闭 |
| `prompt(controls, defaultValue?, title?, confirmText?)` | Promise，输入结果或 `false` |

`confirm` 的第三个参数可以是按钮文本，也可以是配置对象：`confirmText`、`cancelText`、`confirmBtnLevel`、`cancelBtnLevel`、`closeOnEsc`、`size`、`className`。

```js
import { confirm, prompt } from 'ouroboros-sdk'

if (await confirm('确定取消这张订单？', '取消订单', { confirmText: '确认取消' })) {
  console.log('用户已确认')
}

const input = await prompt(
  [{ type: 'input-text', name: 'reason', label: '原因', required: true }],
  { reason: '' },
  '填写取消原因',
)
if (input !== false) console.log(input.reason)
```

## 消息提示

```js
import { toast } from 'ouroboros-sdk'

toast.success('保存成功')
toast.error('保存失败，请检查输入', { timeout: 5000 })
toast.info('任务已进入队列')
toast.warning('请先选择订单')
```

四种方法均接收 `content` 和可选配置。常用配置为 `timeout`（毫秒）、`closeButton`、`showIcon` 和 `title`。
