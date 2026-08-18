---
sidebar_position: 1
---

# SDK 方法参考指南

适用对象：已经完成微前端初始化，准备查运行时工具、认证能力、事件机制和实时通信方法的开发者。

这页不再把所有方法堆在一个长页里，而是作为总索引，帮你先定位到正确主题。

## 先判断你现在要找哪类方法

| 当前问题 | 优先看哪里 |
| -------- | ---------- |
| 我想打开菜单、标签页、对话框、抽屉或提示 | [导航、标签页与弹层](./navigation-and-tabs-and-dialogs) |
| 我想发事件、判断权限、渲染 Schema，或注册组件 / 动作 / 校验器 | [事件、Schema 与组件注册](./events-schema-and-component-registration) |
| 我想发请求、登录、登出、拿 token，或对接外部认证 | [请求与认证](./request-and-authentication) |
| 我想做 Stomp 订阅、发送消息或断线重连 | [Stomp 与实时通信](./stomp-and-realtime) |

## 使用前先注意

这些方法大多不是“裸 SDK 自己就能独立完成”的能力，而是宿主在微前端挂载后，通过运行时注入给你的平台能力。

可以把它理解成：

1. 你在代码里从 `ouroboros-sdk` 导入方法
2. 微前端初始化并 `mount` 后，宿主把真实实现注入进来
3. 后续你调用的就是平台侧真实能力

因此，如果你在初始化完成前就调用很多运行时方法，拿到的往往只是桩实现或空能力。

## 分主题阅读

### [导航、标签页与弹层](./navigation-and-tabs-and-dialogs)

适合查下面这些方法：

- `openMenu`
- `openTab`
- `closeTab`
- `openOrSwitchTab`
- `sendToOpenerTab`
- `updateTabTitle`
- `openDialog`
- `openDrawer`
- `confirm`
- `alert`
- `prompt`
- `toast`

### [事件、Schema 与组件注册](./events-schema-and-component-registration)

适合查下面这些方法：

- `EventBus`
- `hasAuth`
- `renderAmisSchema`
- `Renderer`
- `FormItem`
- `registerAction`
- `addRule`

如果你当前还没判断该不该做组件库，而不是继续用低代码页面，建议先回到 [组件库](../../../../guide/advance/extend-frontend/amis-component/) 和 [前端融合开发方式](../../../../fusion-development/frontend-extension-paths)。

### [请求与认证](./request-and-authentication)

适合查下面这些方法：

- `request`
- `login`
- `logout`
- `getUserInfo`
- `getToken`
- `listExternalProviders`
- `isLocalPasswordLoginEnabled`
- `startRedirectLogin`
- `loginWithLdap`
- `exchangeLoginCode`
- `bindExternalAccount`
- `resolveReturnUrl`
- `mapAuthError`

### [Stomp 与实时通信](./stomp-and-realtime)

适合查下面这些方法：

- `subscribeTopic`
- `subscribeQueue`
- `subscribeUserTopic`
- `subscribe`
- `unsubscribeTopic`
- `unsubscribeQueue`
- `unsubscribeUserTopic`
- `unsubscribe`
- `unsubscribeAll*`
- `sendBinary`
- `sendText`
- `sendJson`
- `send`
- `connect`
- `disconnect`
- `reconnect`

## 使用建议

- 先完成初始化，再使用这些运行时方法
- 先按能力类别定位，再进入对应子页查参数和示例
- 如果你查的是“怎么接入”，先回 [SDK 初始化方法](../initialization-methods/)
- 如果你查的是“平台里已经扩了哪些前端组件和动作”，再配合 [基座内建组件](../../buildin-comps/) 一起看
