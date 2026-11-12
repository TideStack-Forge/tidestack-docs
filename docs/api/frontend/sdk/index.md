---
sidebar_position: 1
---

# 前端基座 SDK

`ouroboros-sdk` 用于将微前端接入平台，并调用导航、请求、认证、菜单和实时通信能力。

## 安装与导入

在微前端项目中安装与所部署基座兼容的 SDK 版本：

```bash
npm install ouroboros-sdk
```

```js
import { initMicroApp, request, toast } from 'ouroboros-sdk'
```

页面、布局和组件库均从包名导入公开 API。

## 接口索引

| 专题 | 主要入口 |
| --- | --- |
| [微前端初始化](./initialization-methods/) | `initMicroApp`、`initSingleComponent`、`initLayoutComponent`、`initAmisComponentLib` |
| [导航、标签页与弹层](./completion-methods/navigation-and-tabs-and-dialogs) | `openMenu`、`openTab`、`openDialog`、`confirm`、`toast` |
| [事件、Schema 与组件注册](./completion-methods/events-schema-and-component-registration) | `EventBus`、`hasAuth`、`renderAmisSchema`、`Renderer`、`FormItem` |
| [请求与认证](./completion-methods/request-and-authentication) | `request`、`businessActions`、`login`、`getUserInfo`、`getToken` |
| [Stomp 与实时通信](./completion-methods/stomp-and-realtime) | `Stomp` 的订阅、发送和连接方法 |
| [菜单扩展](./menu-extension/) | `menu`、`userMenu` |

## 调用时机

请求、导航、事件和用户信息等运行时 API 应在 `render`、`afterMount` 或其后的用户交互中调用。`beforeMount` 发生在运行时 API 就绪之前，可以读取传入的 `props`。

静态组件、动作、公式和校验器的注册可以放在模块加载阶段。事件监听、实时订阅和自行创建的渲染实例，需要在卸载时清理。

接入步骤见 [微前端应用](../../../guide/advance/extend-frontend/micro-app/)，页面 Schema 可用的现成组件见 [基座内建组件](../buildin-comps/)。
