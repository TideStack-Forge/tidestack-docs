---
sidebar_position: 0
---

# 微前端初始化

初始化函数返回 `bootstrap`、`mount`、`update`、`unmount` 四个生命周期方法，将它们从微前端入口导出供平台调用。

## 选择入口

| 入口 | 适用对象 | 支持的钩子 |
| --- | --- | --- |
| `initMicroApp` | 业务页面、自定义登录页 | `render`、`beforeMount`、`afterMount`、`afterUpdate`、`afterUnmount`、`onBootstrap` |
| `initSingleComponent` | 单组件页面 | 与 `initMicroApp` 相同，是其别名 |
| `initLayoutComponent` | 顶栏、侧栏等布局 | `render`、`beforeMount`、`afterUpdate`、`afterUnmount`、`onBootstrap` |
| `initAmisComponentLib` | AMIS 组件库 | `beforeMount`、`afterUpdate`、`afterUnmount`、`onBootstrap` |

## 页面最小示例

假设入口 HTML 含有 `<div id="app"></div>`：

```js
import { initMicroApp } from 'ouroboros-sdk'

const { bootstrap, mount, update, unmount } = initMicroApp({
  async render(props) {
    const host = (props.container || document).querySelector('#app')
    const element = document.createElement('p')
    element.textContent = '订单工作台'
    host.appendChild(element)
    return element
  },
  async afterUnmount(props, element) {
    element?.remove()
  },
})

export { bootstrap, mount, update, unmount }
```

使用框架时，`render` 返回应用实例；在 `afterUnmount` 中调用该框架的卸载方法，并清理定时器、事件和订阅。

## 钩子参数与顺序

| 钩子 | 参数与用途 |
| --- | --- |
| `onBootstrap()` | 无参数；首次初始化 |
| `beforeMount(props)` | 挂载前读取参数或准备本地资源 |
| `render(props)` | 渲染并返回实例；运行时 SDK 已可使用 |
| `afterMount(props)` | 页面挂载后处理，仅 `initMicroApp` 支持 |
| `afterUpdate(props)` | 处理新参数；不会自动重新调用 `render` |
| `afterUnmount(props, instance)` | 清理资源；组件库的 `instance` 为 `null` |

页面挂载顺序为 `beforeMount → SDK 就绪 → render → afterMount`。布局入口没有 `afterMount`，组件库入口没有 `render` 和 `afterMount`。

`beforeMount` 中可读取 `props`，但不要在这里通过 SDK 查询菜单、获取用户或发请求。页面的运行时调用示例：

```js
import { initMicroApp, getUserInfo } from 'ouroboros-sdk'

const lifecycle = initMicroApp({
  async render(props) {
    const host = (props.container || document).querySelector('#app')
    host.textContent = '工作台'
    return host
  },
  async afterMount() {
    const user = await getUserInfo()
    console.log('当前用户', user)
  },
})

export const { bootstrap, mount, update, unmount } = lifecycle
```

## 公共 props

| 字段 | 用途 |
| --- | --- |
| `container` | 当前微前端容器；独立运行时可能不存在 |
| `token` | 挂载时的令牌快照；获取最新值用 `getToken()` |
| `apiHost` | 平台接口地址 |
| `mainWindow` | 主应用窗口 |
| `appInfo`、`config` | 应用信息和配置 |
| `i18n` | 国际化能力 |
| `__utils__` | 平台工具集合；日常调用使用 SDK 导出方法 |

布局组件还可接收 `appName`、`logo`、`menu`、`theme`、`userInfo`、`breadcrumb`、`currentPath` 等布局参数。可选字段使用前判空。

## 布局与组件库

布局用法与页面相同，换用 `initLayoutComponent`，在 `afterUpdate(props)` 中显式更新已创建的视图。不要每次更新都创建一个没有清理的渲染实例。

组件库可以在入口加载时完成静态注册：

```js
import { initAmisComponentLib, addRule } from 'ouroboros-sdk'

addRule('orderCode', (values, value) => /^ORD-\d+$/.test(value),
  '订单号格式应为 ORD-数字')

const { bootstrap, mount, update, unmount } = initAmisComponentLib({})
export { bootstrap, mount, update, unmount }
```

注册方式见 [事件、Schema 与组件注册](../completion-methods/events-schema-and-component-registration)。

## 独立运行

页面和布局入口在非平台环境会调用一次 `render({})`，其他挂载钩子不会随之执行。渲染代码应兼容缺少 `container`；请求、导航、认证等平台能力需要在平台内验证。

完整构建和发布步骤见 [微前端应用](../../../../guide/advance/extend-frontend/micro-app/)、[布局组件](../../../../guide/advance/extend-frontend/layout-component/) 和 [组件库](../../../../guide/advance/extend-frontend/amis-component/)。
