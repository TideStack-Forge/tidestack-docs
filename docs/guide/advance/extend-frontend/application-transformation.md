---
sidebar_position: 1
---

# 应用改造

本页说明如何把已有或 AI 生成的前端工程接入潮汐栈基座。接入完成后，基座能够加载构建产物、在指定容器中挂载界面，并在离开时释放资源。

页面、布局和组件库使用不同初始化入口，但都需要处理生命周期、资源路径及宿主依赖。先确定工程用途，再修改入口与构建配置。

## 检查现有工程

提供目标基座与 SDK 版本、`package.json`、入口文件、构建配置和一个运行入口。让 AI 根据当前框架与构建工具列出改动，不直接套用其他项目的配置。

| 工程用途 | SDK 初始化入口 | 接入重点 |
| --- | --- | --- |
| 业务页面或独立子应用 | `initMicroApp` | 页面容器、数据、路由范围与卸载 |
| 登录页或局部单组件 | `initSingleComponent` | 宿主参数与局部挂载；当前为 `initMicroApp` 的别名 |
| 顶栏、侧栏等布局区域 | `initLayoutComponent` | 菜单、主题、用户和导航上下文 |
| Schema 组件库 | `initAmisComponentLib` | 将组件、动作等注册到宿主 |

参数与生命周期契约见 [SDK 初始化方法](../../../api/frontend/sdk/initialization-methods/)。平台模板已经提供初始化方式时，保留模板的入口组织，按其契约修改。

## 1. 接入生命周期和容器

使用 SDK 时，导出它返回的 `bootstrap`、`mount`、`update` 和 `unmount`。界面挂载到 `props.container` 内，避免按全局选择器误挂载到基座的其他节点；容器内的目标元素需要与工程 HTML 一致。

下面以 Vue 3 页面为例，假定 HTML 中已有 `id="app"` 的容器：

```js
import { createApp } from 'vue'
import { initMicroApp } from 'ouroboros-sdk'
import App from './App.vue'

const { bootstrap, mount, update, unmount } = initMicroApp({
  async render(props = {}) {
    const host = props.container || document
    const app = createApp(App, props)
    app.mount(host.querySelector('#app'))
    return app
  },
  async afterUnmount(props, app) {
    app.unmount()
  },
})

export { bootstrap, mount, update, unmount }
```

示例展示挂载和销毁关系。宿主更新参数时，还需按页面状态设计处理更新；SDK 的 `afterUpdate` 参数及行为见初始化参考。React 工程使用自身的 root 创建、更新和卸载方式。

SDK 支持独立运行时的渲染，渲染函数应容忍空 props。依赖 token、应用信息、菜单或 SDK 运行时方法的行为，仍需在宿主中验证。

已有工程使用原生 qiankun 生命周期时，可保留该方式，按 [qiankun 微应用接入约定](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8) 核对导出、容器和销毁。一个工程采用一套明确的初始化方式，避免重复挂载。

## 2. 对齐资源路径和产物格式

资源基础路径决定入口脚本、样式、图片和异步资源从哪里加载。平台记录中的微前端路径与构建配置需要共同核对。

下面是 Vue CLI / Webpack 的配置片段，不能直接作为原生 Webpack 或 Vite 配置使用：

```js
const packageName = require('./package.json').name

module.exports = {
  publicPath: '/custom-page/',
  configureWebpack: {
    output: {
      library: `${packageName}-[name]`,
      libraryTarget: 'umd',
    },
  },
}
```

原生 Webpack 在 `output` 下配置对应选项。使用自动 publicPath 或相对路径的工程，要检查部署后实际解析出的地址，尤其是页面位于多级路由和异步加载时的地址。

Vite 工程应沿用兼容基座的模板和产物格式。仓库提供 Vue / Vite 的 UMD 模板；普通 Vite 页面默认生成的产物不能仅凭本地预览成功就认定可以被基座加载。

## 3. 按需要共享 React

React 组件需要和宿主 AMIS 渲染链路共同工作时，按目标工程约定共享兼容的 React 运行时。Webpack 的配置片段如下：

```js
module.exports = {
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react-dom/client': 'ReactDOM',
  },
}
```

Vue CLI 工程把这部分放在 `configureWebpack` 中。当前前端工程的 React / ReactDOM 基线为 `18.3.1`；实际依赖仍应与目标基座核对。使用 externals 后，独立预览环境也需提供对应全局对象。

## 4. 构建并接入平台

1. 执行当前工程的依赖安装、测试和构建命令。
2. 检查构建目录包含入口、脚本和样式，并确认没有把源码目录当作产物。
3. 按 [微前端包管理](./) 上传 ZIP，选择与用途对应的类型。
4. 将记录关联到 UI 模型、登录页、布局配置或组件库入口。
5. 从平台真实入口进入，检查挂载、数据和导航。

路由与 UI 模型的具体引用见 [微前端应用](./micro-app/)，组件注册见 [组件库](./amis-component/)。

## 验证与排查

| 现象 | 优先核对 |
| --- | --- |
| 入口或异步资源 404 | ZIP 目录、微前端路径、publicPath 与请求 URL |
| 生命周期找不到或执行失败 | 构建导出格式、初始化入口与宿主版本 |
| 空白页或界面挂错位置 | 宿主容器、根元素 ID 与框架渲染错误 |
| 重复进入后事件触发多次 | 卸载中的订阅、定时器、root / app 实例释放 |
| React hook 或上下文异常 | React / ReactDOM 版本、externals 与宿主运行时 |
| 本地正常，宿主中参数缺失 | 挂载时机、实际 props 与 SDK 工具注入 |

交付前至少验证进入、离开、再次进入和刷新。向 AI 反馈时提供构建配置、实际资源地址、入口记录、控制台错误及复现步骤，再复验原失败场景。
