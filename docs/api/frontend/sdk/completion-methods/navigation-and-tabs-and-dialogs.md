---
sidebar_position: 2
---

# 导航、标签页与弹层

适用对象：已经挂载微前端，准备调用页面导航、标签页通信、对话框、抽屉和提示能力的开发者。

## 使用场景

- 你想打开菜单、标签页，或者和打开方标签通信
- 你想弹出对话框、抽屉或确认提示
- 你想在页面内给用户显示成功、失败或警告消息

## 快速索引

- 页面导航：`openMenu`、`openTab`、`closeTab`、`openOrSwitchTab`、`sendToOpenerTab`、`updateTabTitle`
- 弹层与提示：`openDialog`、`openDrawer`、`confirm`、`alert`、`prompt`、`toast`

## openMenu(menuOptions)

打开新菜单。

**参数说明**

| 参数名      | 类型                                  | 必填 | 说明               |
| ----------- | ------------------------------------- | ---- | ------------------ |
| menuOptions | string \| [MenuOptions](#menuoptions) | 是   | 菜单地址或菜单对象 |

### MenuOptions

| 参数名   | 类型    | 必填 | 默认值 | 说明                                                                                 |
| -------- | ------- | ---- | ------ | ------------------------------------------------------------------------------------ |
| path     | string  | 是   |        | 路径地址                                                                             |
| title    | string  | 否   |        | 标题                                                                                 |
| parent   | string  | 否   |        | 父级唯一标识(由菜单标题+路径+当前处于菜单数组位置的下标组成), 影响菜单导航的高亮样式 |
| icon     | string  | 否   |        | 图标                                                                                 |
| showMode | boolean | 否   | `tab`  | 页面打开形式，支持 newWindow(新窗口全屏打开), fullScreen(当前窗口全屏打开), tab      |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { openMenu } from 'ouroboros-sdk'

openMenu('地址')
```

## openTab(fullPath,openTabOptions)

打开新的标签页。

**参数说明**

| 参数名         | 类型                              | 必填 | 说明                         |
| -------------- | --------------------------------- | ---- | ---------------------------- |
| fullPath       | string                            | 是   | 带参数的完整路径             |
| openTabOptions | [OpenTabOptions](#opentaboptions) | 否   | 标签页的其他信息，例如标题等 |

### OpenTabOptions

| 参数名      | 类型     | 必填 | 说明                                      |
| ----------- | -------- | ---- | ----------------------------------------- |
| title       | string   | 否   | 标签页标题                                |
| breadcrumbs | object[] | 否   | 当前标签页路径的层级关系                  |
| callback    | function | 否   | 通知 openTab 调用者，与之建立界面间的通信 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { openTab } from 'ouroboros-sdk'

openTab('/system-setting/dynamic-form', {
  title: '动态表单',
  breadcrumbs: [
    {
      key: '系统设置3', // key = 菜单标题 + 路径 + 当前处于菜单数组位置的下标
      title: '系统设置',
    },
    {
      key: '动态表单管理/system-setting/dynamic-form3',
      title: '动态表单',
      path: '/system-setting/dynamic-form',
    },
  ],
})
```

## closeTab(id,result)

关闭标签页。

**参数说明**

| 参数名 | 类型   | 必填 | 默认值            | 说明              |
| ------ | ------ | ---- | ----------------- | ----------------- |
| id     | string | 否   | `当前标签页的 id` | 要关闭的标签页 ID |
| result | object | 否   |                   | 标签页间通信信息  |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { closeTab } from 'ouroboros-sdk'

closeTab()
```

## openOrSwitchTab(fullPath,switchTabOptions)

打开新的标签页，或者切换到已打开的标签页。

**参数说明**

| 参数名           | 类型                                  | 必填 | 说明             |
| ---------------- | ------------------------------------- | ---- | ---------------- |
| fullPath         | string                                | 是   | 带参数的完整路径 |
| switchTabOptions | [SwitchTabOptions](#switchtaboptions) | 否   | 标签页的其他信息 |

### SwitchTabOptions {#switchtaboptions}

| 参数名   | 类型     | 必填 | 说明                                      |
| -------- | -------- | ---- | ----------------------------------------- |
| callback | function | 否   | 通知 openTab 调用者，与之建立界面间的通信 |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { openOrSwitchTab } from 'ouroboros-sdk'

openOrSwitchTab('/your-tab-path')
```

## sendToOpenerTab(id,data)

向打开当前标签页的调用者发送消息。

**参数说明**

| 参数名 | 类型   | 必填 | 默认值            | 说明         |
| ------ | ------ | ---- | ----------------- | ------------ |
| id     | string | 是   | `当前标签页的 id` | 标签页 ID    |
| data   | any    | 是   |                   | 要发送的数据 |

**示例**

```js
import { sendToOpenerTab } from 'ouroboros-sdk'

sendToOpenerTab('通信信息')
```

## updateTabTitle(id,title)

更新标签页标题。

**参数说明**

| 参数名 | 类型   | 必填 | 默认值            | 说明              |
| ------ | ------ | ---- | ----------------- | ----------------- |
| id     | string | 否   | `当前标签页的 id` | 要更新的标签页 ID |
| title  | string | 是   |                   | 标题              |

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { updateTabTitle } from 'ouroboros-sdk'

updateTabTitle('tab-id', '更新后的标题')
```

## openDialog(schema, ctx)

打开一个对话框式模态框。

**参数说明**

| 参数名 | 类型                          | 必填 | 说明       |
| ------ | ----------------------------- | ---- | ---------- |
| schema | [DialogSchema](#dialogschema) | 是   | 模态框内容 |
| ctx    | object                        | 否   | 上下文     |

### DialogSchema {#dialogschema}

| 参数名 | 类型       | 默认值 | 说明                                             |
| ------ | ---------- | ------ | ------------------------------------------------ |
| title  | SchemaNode |        | 弹出层标题                                       |
| body   | SchemaNode |        | 往 Dialog 内容区加内容                           |
| size   | string     |        | 指定 Dialog 大小，支持: xs、sm、md、lg、xl、full |

[点击查看更多属性](https://aisuda.bce.baidu.com/amis/zh-CN/components/dialog?page=1#%E5%B1%9E%E6%80%A7%E8%A1%A8)

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { openDialog } from 'ouroboros-sdk'

const dialogPromise = await openDialog({
  body: {
    type: 'form',
    body: [
      {
        type: 'input-text',
        name: 'name',
        label: '姓名：',
      },
    ],
  },
  title: '测试标题',
})
// 点击确定按钮：dialogPromise = [{name: '测试name'}]
// 点击取消按钮：dialogPromise = false
```

## openDrawer(schema, ctx)

打开一个模态框-抽屉。

**参数说明**

| 参数名 | 类型                          | 必填 | 说明       |
| ------ | ----------------------------- | ---- | ---------- |
| schema | [DrawerSchema](#drawerschema) | 是   | 模态框内容 |
| ctx    | object                        | 否   | 上下文     |

### DrawerSchema {#drawerschema}

| 参数名   | 类型       | 默认值  | 说明                                             |
| -------- | ---------- | ------- | ------------------------------------------------ |
| title    | SchemaNode |         | 弹出层标题                                       |
| body     | SchemaNode |         | 往 Drawer 内容区加内容                           |
| size     | string     |         | 指定 Drawer 大小，支持: xs、sm、md、lg、xl       |
| position | string     | `right` | 指定 Drawer 大小，支持: left、right、top、bottom |

[点击查看更多属性](https://aisuda.bce.baidu.com/amis/zh-CN/components/drawer#%E5%B1%9E%E6%80%A7%E8%A1%A8)

**返回值**

返回一个 Promise 对象。

**示例**

```js
import { openDrawer } from 'ouroboros-sdk'

const drawerPromise = await openDrawer({
  body: {
    type: 'form',
    body: [
      {
        type: 'input-text',
        name: 'name',
        label: '姓名：',
      },
    ],
  },
  title: '测试标题',
})
// 点击确定按钮：drawerPromise = [{name: '测试name'}]
// 点击取消按钮：drawerPromise = false
```

## confirm(content,title,optionsOrConfirmText,content)

确认对话框

**参数说明**

| 参数名               | 类型                                        | 必填 | 说明                 |
| -------------------- | ------------------------------------------- | ---- | -------------------- |
| content              | string                                      | 是   | 内容                 |
| title                | string                                      | 否   | 标题                 |
| optionsOrConfirmText | string \| [ConfirmOptions](#confirmoptions) | 否   | 确认按钮配置或者文案 |
| content              | string                                      | 否   | 取消按钮文案         |

### ConfirmOptions {#confirmoptions}

| 参数名          | 类型    | 必填 | 说明                                                                   |
| --------------- | ------- | ---- | ---------------------------------------------------------------------- |
| className       | string  | 否   | 指定确认对话框的类名                                                   |
| closeOnEsc      | boolean | 否   | 是否允许按下 Esc 关闭对话框                                            |
| size            | string  | 否   | 指定对话框的尺寸，支持： '' ,'xs' , 'sm' , 'md' , 'lg' , 'xl' , 'full' |
| confirmBtnLevel | string  | 否   | 确认按钮的样式等级                                                     |
| cancelBtnLevel  | string  | 否   | 取消按钮的样式等级                                                     |
| confirmText     | string  | 否   | 确认按钮文本                                                           |
| cancelText      | string  | 否   | 取消按钮文本                                                           |

**返回值**

返回一个 Promise 等待用户确认。

**示例**

```js
import { confirm } from 'ouroboros-sdk'

const confirmPromise = await confirm('内容区', '标题')
```

## alert(content,title)

弹窗。

**参数说明**

| 参数名  | 类型   | 必填 | 说明 |
| ------- | ------ | ---- | ---- |
| content | string | 是   | 内容 |
| title   | string | 否   | 标题 |

**返回值**

返回一个 Promise 用于处理异步操作的结果。

**示例**

```js
import { alert } from 'ouroboros-sdk'

const confirmPromise = await alert('内容区', '标题')
```

## prompt

显示一个对话框，用于用户输入信息或做出选择。

**参数说明**

| 参数名       | 类型           | 必填 | 说明                                         |
| ------------ | -------------- | ---- | -------------------------------------------- |
| controls     | object\| array | 是   | 对话框的控件配置，可以是单个控件或控件数组。 |
| defaultValue | string         | 否   | 对话框控件的默认值                           |
| title        | string         | 否   | 对话框的标题                                 |
| confirmText  | string         | 否   | 确认按钮的文本                               |

**返回值**

返回一个 Promise 用于处理异步操作的结果，点击确认按钮，返回用户输入的内容，点击取消按钮，返回 false。

**示例**

```js
import { prompt } from 'ouroboros-sdk'

const promptPromise = await prompt({
  type: 'input-text',
  name: 'name',
  label: '姓名：',
})

或

const promptPromise = await prompt(
  [
    {
      className: 'w-full',
      type: 'tpl',
      label: false,
      tpl: '当前有部分已更改数据因为格式不正确尚未保存，您确认要丢弃这部分更改吗？',
    },
    {
      type: 'switch',
      label: false,
      option: '查看更改',
      name: 'diff',
      value: false,
    },
  ],
  {
    diff: true,
  },
  '请确认'
)
```

## toast

toast 提示。

**方法说明**

| 函数方法                            | 说明           |
| ----------------------------------- | -------------- |
| success、error、info(content, conf) | 显示成功消息   |
| error(content, conf)                | 显示错误消息   |
| info(content, conf)                 | 显示信息消息   |
| warning(content, conf)              | 发显示警告消息 |

**参数说明**

| 参数名  | 类型                                    | 必填 | 说明             |
| ------- | --------------------------------------- | ---- | ---------------- |
| content | string                                  | 是   | 要显示的消息内容 |
| conf    | string \| [ConfigObject](#configobject) | 否   | 配置对象         |

### ConfigObject {#configobject}

| 参数名      | 类型                | 必填 | 默认值 | 说明                 |
| ----------- | ------------------- | ---- | ------ | -------------------- |
| closeButton | boolean             | 否   | false  | 是否展示关闭按钮     |
| showIcon    | boolean             | 否   | true   | 是否展示图标         |
| timeout     | number              | 否   | 5000   | 持续时间             |
| title       | string\|HTMLElement | 否   |        | 标题                 |
| body        | string\|HTMLElement | 否   |        | 内容，会覆盖 content |

**示例**

```js
import { toast } from 'ouroboros-sdk'

toast.success('操作成功')
toast.error('操作失败', { timeout: 2000 })
```
