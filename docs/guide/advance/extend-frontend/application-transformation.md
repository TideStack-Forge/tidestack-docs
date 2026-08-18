---
sidebar_position: 1
---

# 应用改造

将独立前端工程改造成可被潮汐栈基座加载的微前端应用。

## 改造步骤

### 1. 导出微应用的生命周期

1. 优先使用 [SDK 提供的初始化方法](../../../api/frontend/sdk/initialization-methods/)。

2. 也支持原生 qiankun 生命周期导出方式。更多信息见 [qiankun 微应用](https://qiankun.umijs.org/zh/guide/getting-started#%E5%BE%AE%E5%BA%94%E7%94%A8)，示例代码如下：

```js
import Vue from 'vue'
import App from './App.vue'
Vue.config.productionTip = false

// 保存 Vue 实例
let instance = null

// 动态设置 webpack publicPath，防止静态资源加载出错
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// 渲染函数既会在主应用挂载时调用，也会在独立运行时调用
function render(props = {}) {
  const { container } = props
  instance = new Vue({
    el: (container || document).querySelector('#容器ID'),
    render: (h) => h(App),
  })
}

export async function bootstrap() {
  console.log('VueMicroApp bootstrapped')
}

export async function mount(props) {
  console.log('VueMicroApp mount', props)
  render(props)
}

export async function unmount() {
  console.log('VueMicroApp unmount')
  instance.$destroy()
  instance = null
}

// 独立运行时直接挂载应用
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}
```

:::success
推荐 SDK 方式，导出微应用的生命周期。
:::

### 2. 配置微应用的 publicPath 和打包工具

**Webpack**

```js
const packageName = require('./package.json').name

module.exports = {
  publicPath: '自定义publicPath',
  configureWebpack: {
    output: {
      library: `${packageName}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
    },
  },
}
```

### 3. 共享 react 运行时（可选）

如果你使用 React，通常需要共享 React 运行时；接入**组件库**时尤其常见。

**Webpack**

```js
module.exports = {
  configureWebpack: {
    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  },
}
```

:::warning

1. 当前文档仍以 Webpack 为主说明，使用 Vite 前请先确认你的接入方式和产物格式已经兼容基座加载。
2. 当前 `react` 与 `react-dom` 版本均为 `^18.3.1`。
   :::
