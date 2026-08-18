---
sidebar_position: 0
---

# 微前端初始化

本专题按接入目标选择前端基座初始化入口。

在潮汐栈里，SDK 初始化方法本质上解决的是同一件事: 让你的前端产物以平台可识别的生命周期方式挂到宿主里。

## 先判断你该用哪一个入口

| 当前目标 | 推荐入口 | 说明 |
| -------- | -------- | ---- |
| 做一个完整业务页面或自定义登录页 | `initMicroApp` | 适合页面级微前端 |
| 做一个单页、单组件式页面入口 | `initSingleComponent` | 实际上是 `initMicroApp` 的别名 |
| 替换顶栏、侧栏或平台壳层 | `initLayoutComponent` | 适合布局组件 |
| 注册 AMIS 自定义组件、动作、校验器、公式 | `initAmisComponentLib` | 适合组件库扩展 |

如果你还没判断清楚要走“微前端页面、布局组件还是组件库”，建议先回到 [前端融合开发方式](../../../../fusion-development/frontend-extension-paths)。

## 四个入口的共同点

这几个初始化方法最终都会返回同一组生命周期函数：

| 方法 | 说明 |
| ---- | ---- |
| `bootstrap()` | 微前端初始化时调用一次 |
| `mount(props)` | 每次挂载时调用 |
| `update(props)` | 宿主更新传参时调用 |
| `unmount(props)` | 卸载时调用 |

实践上，你通常会这样导出：

```ts
const { bootstrap, mount, update, unmount } = initMicroApp({...})
export { bootstrap, mount, update, unmount }
```

## 宿主会注入哪些公共 props

无论你用哪一种初始化入口，宿主都会注入一组通用 props。当前 SDK 类型里比较稳定的是：

| 字段 | 类型 | 说明 |
| ---- | ---- | ---- |
| `token` | `MicroAppToken \| null` | 当前登录令牌快照 |
| `apiHost` | `string` | 宿主接口地址 |
| `mainWindow` | `Window` | 主应用 `window` |
| `appInfo` | `Record<string, any>` | 应用信息 |
| `config` | `Record<string, any>` | 宿主配置 |
| `__utils__` | `MicroAppCommonUtils` | 宿主注入的运行时工具 |
| `i18n` | `MicroAppI18n` | 国际化能力 |

:::warning
虽然宿主会通过 `__utils__` 注入很多运行时方法，但在业务代码里，仍然更推荐直接从 `ouroboros-sdk` 导入这些 API；只有在初始化前置阶段或特殊注入场景下，才需要直接操作 `props.__utils__`。
:::

如果你想查这些运行时方法本身，请继续看 [SDK 自动补全方法](../completion-methods/)。

## initMicroApp

`initMicroApp` 适合承接普通微前端页面，也是最通用的初始化入口。

常见场景：

- 独立业务页面
- 页面覆盖
- 自定义登录页
- 需要自己控制渲染实例和卸载逻辑的页面级入口

### 初始化参数

| 参数 | 类型 | 是否常用 | 说明 |
| ---- | ---- | -------- | ---- |
| `render` | `(props) => Promise<any>` | 是 | 渲染函数，返回应用实例 |
| `beforeMount` | `(props) => Promise<void>` | 常用 | 挂载前处理 |
| `afterMount` | `(props) => Promise<void>` | 常用 | 挂载后处理 |
| `afterUpdate` | `(props) => Promise<void>` | 按需 | 宿主更新 props 后处理 |
| `afterUnmount` | `(props, instance) => Promise<void>` | 常用 | 卸载时清理实例 |
| `onBootstrap` | `() => Promise<void>` | 按需 | 初始化钩子 |

说明：

- 从类型定义看，这些参数都不是强制必填
- 但从实际接入经验看，`render` 基本可以视为页面型微前端的核心入口
- `onBootstrap` 当前是无参钩子，不要按旧文档理解成会收到 `props`

### 生命周期顺序

通常可以这样理解：

1. `bootstrap()`
2. `beforeMount(props)`
3. `render(props)`
4. `afterMount(props)`
5. `afterUpdate(props)`
6. `afterUnmount(props, instance)`

### 一个推荐示例

```ts
import { initMicroApp } from 'ouroboros-sdk'
import { createApp } from 'vue'
import App from './App.vue'

async function render(props = {}) {
  const { container } = props
  const app = createApp(App)
  app.mount((container || document).querySelector('#app'))
  return app
}

const { bootstrap, mount, update, unmount } = initMicroApp({
  render,
  async beforeMount(props) {
    console.log('apiHost=', props.apiHost)
  },
  async afterUnmount(props, app) {
    app?.unmount?.()
  },
})

export { bootstrap, mount, update, unmount }
```

### 一个容易忽略的行为

从当前 SDK 实现看，`initMicroApp` 在非 qiankun 宿主环境下会先执行一次 `render({})`，方便本地独立调试。

这意味着你的 `render` 最好能容忍：

- `props` 为空对象
- `props.container` 不存在

## initSingleComponent

`initSingleComponent` 适合单页面、单组件式入口，例如：

- 自定义登录页
- 被页面局部挂载的单一界面
- 不打算承载复杂路由的轻量页面

但要注意，当前 SDK 源码里：

```ts
export { initMicroApp as initSingleComponent }
```

也就是说，它不是一套新的生命周期协议，而是 `initMicroApp` 的别名。

因此你可以这样理解：

- 选 `initSingleComponent` 是为了表达“这是单组件模式”
- 真正的参数、生命周期和行为，都与 `initMicroApp` 保持一致

如果你在做自定义登录页，也建议结合 [平台自定义登录页集成指南](../../../../guide/advance/extend-frontend/micro-app/custom-login-integration) 一起看。

## initLayoutComponent

`initLayoutComponent` 用于替换平台壳层，比如顶栏、侧栏和导航容器。

它和普通页面型微前端的差异在于：这里的重点不是渲染一整页业务内容，而是消费宿主提供的布局信息。

### 初始化参数

| 参数 | 类型 | 是否常用 | 说明 |
| ---- | ---- | -------- | ---- |
| `render` | `(props) => Promise<any>` | 是 | 渲染布局实例 |
| `beforeMount` | `(props) => Promise<void>` | 常用 | 挂载前处理 |
| `afterUpdate` | `(props) => Promise<void>` | 常用 | 宿主更新布局 props 后处理 |
| `afterUnmount` | `(props, instance) => Promise<void>` | 常用 | 卸载清理 |
| `onBootstrap` | `() => Promise<void>` | 按需 | 初始化钩子 |

### 这类组件通常会拿到哪些额外 props

除了公共 props 之外，当前 SDK 初始化层还会透传这类布局字段：

- `container`
- `appName`
- `logo`
- `menu`
- `theme`
- `userInfo`
- `breadcrumb`
- `sidebarStatus`
- `onThemeChanged`
- `onSidebarWidthChange`
- `themeList`
- `showXsNavbar`

其中有些字段是否真的由宿主传入，取决于当前平台布局实现。根据当前主应用实现，稳定可见的通常是 `appName`、`logo`、`menu`、`theme`、`userInfo`、`breadcrumb` 这几类信息；其余字段应按实际运行环境验证。

### 一个真实接入风格的示例

```jsx
import { initLayoutComponent } from 'ouroboros-sdk'
import { createRoot } from 'react-dom/client'
import TopBar from './TopBar.jsx'

let root

function render(props) {
  const { container, ...restProps } = props
  root?.unmount()
  root = createRoot((container || document).querySelector('#custom-topbar-container'))
  root.render(<TopBar {...restProps} />)
  return root
}

const { bootstrap, mount, update, unmount } = initLayoutComponent({
  render,
  afterUpdate(props) {
    render(props)
  },
  afterUnmount(props, app) {
    app?.unmount?.()
  },
})

export { bootstrap, mount, update, unmount }
```

布局组件的整体接入路径，建议再配合 [布局组件](../../../../guide/advance/extend-frontend/layout-component/) 一起看。

## initAmisComponentLib

`initAmisComponentLib` 适合组件库场景。它和前两个入口最大的区别是：这里通常不负责渲染整页，而是负责把自定义组件、动作、校验器、公式等能力注册进宿主。

### 初始化参数

| 参数 | 类型 | 是否常用 | 说明 |
| ---- | ---- | -------- | ---- |
| `beforeMount` | `(props) => Promise<void>` | 是 | 挂载前注册组件或初始化宿主工具 |
| `afterUpdate` | `(props) => Promise<void>` | 按需 | 宿主更新后处理 |
| `afterUnmount` | `(props, instance) => Promise<void>` | 按需 | 卸载处理；当前实例通常为 `null` |
| `onBootstrap` | `() => Promise<void>` | 按需 | 初始化钩子 |

### 推荐理解方式

在组件库里，初始化的重点通常只有两件事：

1. 宿主工具注入完成
2. 组件 / 动作 / 公式 / 校验器已经注册

一个最小示例通常像这样：

```ts
import { initAmisComponentLib } from 'ouroboros-sdk'
import './registerComponent'

const { bootstrap, mount, update, unmount } = initAmisComponentLib({
  async beforeMount(props) {
    console.log('sdk utils ready', !!props.__utils__)
  },
})

export { bootstrap, mount, update, unmount }
```

### 这页不再重复什么

像下面这些 API 的详细用法：

- `Renderer`
- `FormItem`
- `registerAction`
- `addRule`
- `registerFormula`
- `registerValidator`

已经更适合放在 [SDK 自动补全方法](../completion-methods/) 和 [组件库](../../../../guide/advance/extend-frontend/amis-component/) 里查，不需要在初始化页再重复一遍。

## 常见误区

### 把 `initSingleComponent` 当成一套独立 API

当前不是。它只是 `initMicroApp` 的别名，主要表达“这个入口是单组件模式”。

### 直接依赖 `props.__utils__` 作为日常调用方式

宿主确实会注入它，但业务代码里更推荐直接从 `ouroboros-sdk` 导入方法，减少初始化顺序和宿主注入时机带来的耦合。

### 让布局组件承担业务页面职责

布局组件适合做壳层，不适合把整页业务逻辑直接塞进去。业务内容仍应优先放回普通微前端页面里。

### 在布局组件或组件库里继续做路由型设计

这通常会让职责边界变乱。布局组件和组件库都更适合做壳层或能力扩展，而不是独立路由页面容器。

## 下一步看哪里

- 想继续查运行时方法：看 [SDK 自动补全方法](../completion-methods/)
- 想看页面型接入路径：看 [微前端应用](../../../../guide/advance/extend-frontend/micro-app/)
- 想看壳层替换：看 [布局组件](../../../../guide/advance/extend-frontend/layout-component/)
- 想看低代码组件扩展：看 [组件库](../../../../guide/advance/extend-frontend/amis-component/)
