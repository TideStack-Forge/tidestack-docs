---
sidebar_position: 3
---

# 事件、Schema 与组件注册

适用对象：需要在微前端里发事件、判断权限、动态渲染 Schema，或者为组件库注册自定义组件 / 动作 / 校验器的开发者。

## 使用场景

- 你想发平台事件或监听平台事件
- 你想动态渲染一段 AMIS Schema
- 你想在组件库里注册自定义组件、动作或表单校验规则

## EventBus

事件总线，集中式事件处理机制，允许不同的组件进行彼此通信而又不需要相互依赖。

**方法说明**

| 函数方法                                                                | 说明                             |
| ----------------------------------------------------------------------- | -------------------------------- |
| [subscribeOnce(event,filter,handler)](#subscribeonceeventfilterhandler) | 一次性订阅指定的事件             |
| [subscribe(event,filter,handler)](#subscribeeventfilterhandler)         | 订阅指定的事件                   |
| [unsubscribe(event,handler)](#unsubscribeeventhandler)                  | 取消订阅指定事件的处理函数       |
| [publish(event,data,eventOptions)](#publisheventdataeventoptions)       | 发布指定的事件，并传递相关的数据 |

### subscribeOnce(event,filter,handler)

**参数说明**

| 参数    | 类型     | 必填 | 说明         |
| ------- | -------- | ---- | ------------ |
| event   | string   | 是   | 事件名       |
| filter  | function | 否   | 过滤器函数   |
| handler | function | 是   | 事件处理函数 |

**示例**

```js
import { EventBus } from 'ouroboros-sdk'

EventBus.subscribeOnce('事件名', (data) => {
  // 业务逻辑
})
```

### subscribe(event,filter,handler)

| 参数    | 类型     | 必填 | 说明         |
| ------- | -------- | ---- | ------------ |
| event   | string   | 是   | 事件名       |
| filter  | function | 否   | 过滤器函数   |
| handler | function | 是   | 事件处理函数 |

### unsubscribe(event,handler)

| 参数    | 类型     | 必填 | 说明         |
| ------- | -------- | ---- | ------------ |
| event   | string   | 是   | 事件名       |
| handler | function | 是   | 事件处理函数 |

### publish(event,data,eventOptions)

| 参数         | 类型                          | 必填 | 说明                             |
| ------------ | ----------------------------- | ---- | -------------------------------- |
| event        | string                        | 是   | 事件名,详见[系统方法](#系统方法) |
| data         | object                        | 是   | 事件数据                         |
| eventOptions | [EventOptions](#eventoptions) | 否   | 回放配置                         |

> 回放解释：当一些数据存在 sessionStorage 中，例如更新完应用名称或者菜单，刷新页面修改后的数据会丢，加了回放则会支持修改后数据不丢。

### 系统方法

| 事件名        | 参数    | 参数类型 | 说明         |
| ------------- | ------- | -------- | ------------ |
| updateAppName | appName | string   | 更新应用名称 |
| updateMenu    | menu    | object[] | 更新菜单     |
| updateAppLogo | logo    | string   | 更新应用图标 |

### EventOptions

| 参数        | 类型   | 必填 | 说明                                               |
| ----------- | ------ | ---- | -------------------------------------------------- |
| replayScope | string | 是   | 回放范围选项,支持： SESSION                        |
| replayStage | string | 是   | 标识事件的回放阶段,支持：SYS_INIT_USER, SYS_LOGOUT |

**示例**

```js
import { EventBus } from 'ouroboros-sdk'

EventBus.publish('事件名', '事件数据', {
  replayStage: 'SYS_INIT_USER',
  replayScope: 'SESSION',
})
```

## hasAuth(authKey)

判断是否存在某权限的能力。

**参数说明**

| 参数名  | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| authKey | string | 是   | 权限标识 |

**返回值**

存在权限，返回**true**，否则**false**。

## renderAmisSchema(containerEl,schema,props,env)

渲染 amis Schema 页面。

**参数说明**

| 参数名      | 类型        | 必填 | 说明                                                     |
| ----------- | ----------- | ---- | -------------------------------------------------------- |
| containerEl | HTMLElement | 是   | 要渲染到的容器元素                                       |
| schema      | object      | 是   | 组件的 JSON 配置                                         |
| props       | object      | 否   | 传递一些数据给渲染器内部使用，例如可以传递 data 数据进去 |
| env         | object      | 是   | 环境变量                                                 |

**返回值**

返回一个 Promise 对象，可以获取 amis 渲染的内部信息。

**示例**

```vue
<template>
  <div ref="testRef"></div>
</template>
```

```js
import { renderAmisSchema } from 'ouroboros-sdk'
const amisScope = await renderAmisSchema(this.$refs.testRef, {
  type: 'page',
  body: 'test',
})
console.log(amisScope)
```

## Renderer

amis 注册自定义类型，[点击查看更多信息。](https://aisuda.bce.baidu.com/amis/zh-CN/docs/extend/custom-react#react-%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E7%B1%BB%E5%9E%8B)

**示例**

```ts
import { Renderer } from 'ouroboros-sdk'
import React from 'react'

export default class CustomRenderer extends React.Component<any, any> {
  render() {
    const { tip } = this.props
    return <div>这是自定义组件：{tip}</div>
  }
}

Renderer({
  type: 'my-renderer',
  autoVar: true,
})(CustomRenderer as any)
```

页面使用

```json
{
  "type": "page",
  "title": "自定义组件示例",
  "body": {
    "type": "my-renderer",
    "tip": "简单示例"
  }
}
```

## FormItem

amis 注册自定义类型-表单项的扩展,[点击查看更多信息。](https://aisuda.bce.baidu.com/amis/zh-CN/docs/extend/custom-react#%E8%A1%A8%E5%8D%95%E9%A1%B9%E7%9A%84%E6%89%A9%E5%B1%95)

**示例**

```ts
import { FormItem } from 'ouroboros-sdk'
import React from 'react'

export default class MyFormItem extends React.Component<any, any> {
  render() {
    const { value, onChange } = this.props
    return (
      <div>
        <p>这个是个自定义组件</p>
        <p>当前值：{value}</p>
        <a
          className="btn btn-default"
          onClick={() => onChange(Math.round(Math.random() * 10000))}>
          随机修改
        </a>
      </div>
    )
  }
}

FormItem({
  type: 'custom',
  autoVar: true,
})(MyFormItem as any)
```

页面使用

```json
{
  "type": "page",
  "title": "自定义组件示例",
  "body": {
    "type": "form",
    "body": [
      {
        "type": "input-text",
        "label": "用户名",
        "name": "usename"
      },

      {
        "type": "custom",
        "label": "随机值",
        "name": "random"
      }
    ]
  }
}
```

## registerAction

amis 注册自定义动作,[点击查看更多信息。](https://aisuda.bce.baidu.com/amis/zh-CN/docs/concepts/event-action#%E6%B3%A8%E5%86%8C%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8A%A8%E4%BD%9C)

**示例**

```ts
import { registerAction } from 'ouroboros-sdk'
import React from 'react'

export class MyAction {
  run(action, renderer, event) {
    const props = renderer.props
    const { param1, param2 } = action.args // 动作参数
    // 自定义动作逻辑
    console.log(param1, param2)
  }
}

registerAction('my-action', new MyAction())
```

页面使用

```json
{
  "type": "page",
  "body": [
    {
      "type": "button",
      "label": "测试按钮",
      "onEvent": {
        "click": {
          "actions": [
            {
              "actionType": "my-action",
              "args": {
                "param1": "test1",
                "param2": "test2"
              }
            }
          ]
        }
      }
    }
  ]
}
```

## addRule

扩展表单验证，[点击查看更多信息。](https://aisuda.bce.baidu.com/amis/zh-CN/docs/extend/addon#%E6%89%A9%E5%B1%95%E8%A1%A8%E5%8D%95%E9%AA%8C%E8%AF%81)

**示例**

```ts
import { addRule } from 'ouroboros-sdk'
function isZXSFn(values: any, value: string, field?: string) {
  if (value === '新加坡') {
    // 校验不通过，提示：该地区不在国内
    return {
      error: true,
      msg: '该地区不在国内',
    }
  }

  if (value === '北京' || value === '上海' || value === '天津' || value === '重庆') {
    // return true 表示校验通过
    return true
  }

  // 校验不通过，提示：输入的不是直辖市
  return {
    error: true,
    msg: '输入的不是直辖市',
  }
}

addRule('isZXS', isZXSFn, '输入的不是直辖市')
```

在配置中就能使用下面的验证方法

```json
"validations": {
  "isZXS": true
}
```
