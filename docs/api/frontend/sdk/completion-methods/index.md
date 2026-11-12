---
sidebar_position: 1
sidebar_label: SDK 运行时方法
---

# SDK 运行时方法

运行时方法用于操作平台页面、调用接口和接收消息。页面在 `render` 或 `afterMount` 中开始使用，调用时机见 [微前端初始化](../initialization-methods/)。

| 任务 | 参考页 | 主要 API |
| --- | --- | --- |
| 打开页面、标签页、对话框和提示 | [导航、标签页与弹层](./navigation-and-tabs-and-dialogs) | `openMenu`、`openTab`、`openDialog`、`toast` |
| 页面通信、权限判断、Schema 渲染与扩展注册 | [事件、Schema 与组件注册](./events-schema-and-component-registration) | `EventBus`、`hasAuth`、`renderAmisSchema`、`Renderer` |
| HTTP 请求、业务动作、登录与用户态 | [请求与认证](./request-and-authentication) | `request`、`businessActions`、`login`、`getToken` |
| 消息订阅、发送与重连 | [Stomp 与实时通信](./stomp-and-realtime) | `Stomp` |
| 菜单徽标、菜单树和用户菜单 | [菜单扩展 API](../menu-extension/) | `menu`、`userMenu` |

SDK 的 `EventBus` 用于前端页面间通信；服务端推送使用 `Stomp`。同一个页面中创建的监听和订阅，应由该页面在卸载时清理。
