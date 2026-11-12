---
sidebar_position: 4
---

# 动作、过滤器与表达式函数

在 AMIS Schema 的 `onEvent.<事件>.actions` 中声明动作，动作参数放入 `args`。下面的页面路径和权限名需要在应用中预先定义。

## 标签页动作

| `actionType` | `args` |
| --- | --- |
| `openTab` | `url`、`title?`、`params?`、`reloadOnReceive?`、`receiveActions?`、`isFixed?` |
| `openOrSwitchTab` | 同上，另支持 `replaceCurrentTab`、`closeOtherTabs`、`includeFixedTabs` |
| `sendToOpenerTab` | `msg`：回传数据 |
| `updateTabTitle` | `title` |
| `closeCurrentTab` / `closeTab` | `tabId?`、`result?`、`allowFixedTabClose?` |
| `closeOtherTabs` | `tabId?`、`includeFixedTabs?` |

`params` 是查询参数对象；`reloadOnReceive` 是布尔值，默认 `false`。关闭动作省略 `tabId` 时操作当前页，固定标签页默认保留。

```json
{
  "type": "button",
  "label": "查看订单",
  "onEvent": {
    "click": {
      "actions": [
        {
          "actionType": "openTab",
          "args": {
            "url": "/orders/detail",
            "title": "订单详情",
            "params": { "id": "${id}" },
            "reloadOnReceive": true
          }
        }
      ]
    }
  }
}
```

详情页保存成功后，用以下动作回传结果并关闭：

```json
{
  "actionType": "closeCurrentTab",
  "args": { "result": { "saved": true, "id": "${id}" } }
}
```

需要继续保留详情页时，用 `sendToOpenerTab`，参数为 `args.msg`。JavaScript 对应方法见 [导航、标签页与弹层](../sdk/completion-methods/navigation-and-tabs-and-dialogs)。

## 对话框与抽屉

Schema 使用 AMIS 的 `dialog` / `drawer` 动作，配置分别放在 `dialog` / `drawer` 中。平台允许内容通过 `url` 加载已有页面，或通过 `schemaId` 加载 UI Schema。

```json
{
  "type": "button",
  "label": "编辑订单",
  "actionType": "dialog",
  "dialog": {
    "title": "编辑订单",
    "size": "lg",
    "url": "/orders/edit?id=${id}"
  }
}
```

抽屉示例：

```json
{
  "type": "button",
  "label": "查看订单",
  "actionType": "drawer",
  "drawer": {
    "title": "订单详情",
    "position": "right",
    "schemaId": "/orders/detail"
  }
}
```

内联内容使用 `body`，确认和取消使用弹层自身的按钮。SDK 中打开弹层的方法名为 `openDialog/openDrawer`，Schema 的动作类型使用 `dialog/drawer`。

## 发布事件与菜单徽标

| 动作 | 参数 |
| --- | --- |
| `publish` | `eventName`、`eventData`、可选 `options` |
| `setMenuBadge` | `fullName`、`badge`；`badge: null` 清除 |

```json
{
  "type": "button",
  "label": "通知订单更新",
  "onEvent": {
    "click": {
      "actions": [
        { "actionType": "publish", "args": { "eventName": "orders:saved", "eventData": { "id": "${id}" } } },
        { "actionType": "setMenuBadge", "args": { "fullName": "orders.list", "badge": { "type": "dot" } } }
      ]
    }
  }
}
```

事件监听与回放见 [EventBus](../sdk/completion-methods/events-schema-and-component-registration#eventbus)，徽标类型见 [菜单扩展 API](../sdk/menu-extension/)。

## addAttribute / addProps 过滤器

两个名称等价，向对象或对象数组的每个元素添加属性，并返回新对象。参数按键值成对传入；同名属性覆盖原值。

```text
${fields | addAttribute:type:field}
```

输入：

```json
[{ "name": "code", "label": "订单号" }]
```

输出：

```json
[{ "name": "code", "label": "订单号", "type": "field" }]
```

也可以传多个键值对，或一个属性对象。标量和嵌套数组元素保持原值；复杂业务计算应放在脚本、接口或前端代码中。

## hasAuth 表达式函数

`hasAuth('权限标识')` 返回布尔值，可用于 `visibleOn` 或 `disabledOn`：

```json
{
  "type": "button",
  "label": "审核",
  "visibleOn": "${hasAuth('orders.approve')}",
  "onEvent": {
    "click": {
      "actions": [{ "actionType": "toast", "args": { "msg": "请选择待审核订单" } }]
    }
  }
}
```

前端判断控制交互展示，审核接口仍须执行服务端授权。权限配置见 [权限与访问控制](../../../fusion-development/authority-subject-and-access-control-design)。
