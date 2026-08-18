---
sidebar_position: 4
---

# 动作、过滤器与表达式函数

适用对象：想在 Schema 层直接调用平台扩展动作、过滤器和表达式函数的开发者。

## 使用场景

- 你想在事件动作里直接打开标签页、对话框或发布事件
- 你想在数据映射阶段补充轻量加工
- 你想在表达式里直接判断权限

## 事件动作

### 打开一个对话框式模态框

通过配置 `actionType: 'openDialog'` 实现。

**动作属性（args）**

| 属性名     | 类型    | 默认值               | 说明                                             |
| ---------- | ------- | -------------------- | ------------------------------------------------ |
| url        | string  |                      | 页面地址                                         |
| size       | string  | `md`                 | 指定 Dialog 大小，支持: xs、sm、md、lg、xl、full |
| width      | string  |                      | 指定 Dialog 宽度                                 |
| showFooter | boolean | `false`              | 是否显示底部按                                   |
| title      | string  | `页面地址的默认标题` | 标题                                             |

### 打开一个抽屉式模态框

通过配置 `actionType: 'openDrawer'` 实现。

**动作属性（args）**

| 属性名     | 类型    | 默认值               | 说明                                             |
| ---------- | ------- | -------------------- | ------------------------------------------------ |
| url        | string  |                      | 页面地址                                         |
| size       | string  | `md`                 | 指定 Drawer 大小，支持: xs、sm、md、lg、xl       |
| direction  | string  | `right`              | 指定 Drawer 方向，支持: left、right、top、bottom |
| showFooter | boolean | `false`              | 是否显示底部按钮                                 |
| title      | string  | `页面地址的默认标题` | 标题                                             |

### 关闭模态框

通过配置 `actionType: 'closeModal'` 实现。

**动作属性（args）**

| 属性名 | 类型              | 默认值  | 说明             |
| ------ | ----------------- | ------- | ---------------- |
| result | object \| boolean | `false` | 模态框间通信信息 |

### 打开新的标签页

通过配置 `actionType: 'openTab'` 实现。

**动作属性（args）**

| 属性名          | 类型   | 默认值 | 说明           |
| --------------- | ------ | ------ | -------------- |
| url             | string |        | 要打开的网址   |
| title           | string |        | 标签页的标题   |
| reloadOnReceive | string |        | 重新加载页面   |
| params          | object |        | url 的查询参数 |

### 打开新的标签页或切换到已打开的标签页

通过配置 `actionType: 'openOrSwitchTab'` 实现。

**动作属性（args）**

| 属性名          | 类型   | 默认值 | 说明           |
| --------------- | ------ | ------ | -------------- |
| url             | string |        | 要打开的网址   |
| title           | string |        | 标签页的标题   |
| reloadOnReceive | string |        | 重新加载页面   |
| params          | object |        | url 的查询参数 |

### 向打开当前 activeTab 页的调用者发送消息

通过配置 `actionType: 'sendToOpenerTab'` 实现。

**动作属性（args）**

| 属性名 | 类型   | 默认值 | 说明     |
| ------ | ------ | ------ | -------- |
| msg    | object |        | 通信信息 |

### 更新标签页标题

通过配置 `actionType: 'updateTabTitle'` 实现。

**动作属性（args）**

| 属性名 | 类型   | 默认值 | 说明 |
| ------ | ------ | ------ | ---- |
| title  | string |        | 标题 |

### 关闭除选中项以外的其他标签页

通过配置 `actionType: 'closeOtherTabs'` 实现。

### 关闭标签页

通过配置 `actionType: 'closeCurrentTab'` 或 `actionType: 'closeTab'` 实现。

**动作属性（args）**

| 属性名 | 类型   | 默认值            | 说明              |
| ------ | ------ | ----------------- | ----------------- |
| id     | string | `当前标签页的 id` | 要关闭的标签页 ID |
| result | object |                   | 标签页间通信信息  |

### 发布指定的事件

通过配置 `actionType: 'publish'`实现。

**动作属性（args）**

| 属性名    | 类型   | 默认值 | 说明     |
| --------- | ------ | ------ | -------- |
| eventName | string |        | 事件名   |
| eventData | object |        | 事件数据 |
| options   | object |        | 回放配置 |

更详细参数信息参考 [事件、Schema 与组件注册](../sdk/completion-methods/events-schema-and-component-registration) 中的 `EventBus.publish(...)` 相关说明。

#### 基本使用

动作配置可以通过 `args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](https://aisuda.bce.baidu.com/amis/zh-CN/docs/concepts/event-action)。

例如：

```json
{
  "actionType": "openTab",
  "args": {
    "url": ""
  }
}
```

## 数据映射过滤器

### 动态添加属性

数组中的每个元素上动态添加属性。

- key: 对象键值
- value: 对象的值

```js
${xxx | addAttribute[:key][:value]}
```

## 表达式函数

### 判断是否存在某权限的能力

#### 基本使用

```js
{
  "type": "button",
  "label": "查看是否存在权限",
  "level": "primary",
  "onEvent": {
    "click": {
      "actions": [
        {
          "actionType": "toast",
          "args": {
            "msg": "${hasAuth('权限标识')}"
          }
        }
      ]
    }
  }
}
```

#### 参数说明

| 参数名  | 说明     |
| ------- | -------- |
| authKey | 权限标识 |
