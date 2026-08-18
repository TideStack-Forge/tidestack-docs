---
sidebar_position: 4
---

# 组件库

组件库用于给低代码页面补充新的前端控件能力。它适合沉淀那些会在一个应用内多个页面复用的自定义表单项、展示组件或交互组件。

## 什么时候用组件库

- 多个页面都要复用同一种前端控件
- 标准 AMIS 组件无法满足业务交互或展示需求
- 希望业务开发人员在低代码页面里直接选择并复用组件

如果需求是承接整页复杂逻辑，通常应优先考虑 [微前端应用](../micro-app/)；如果只是替换平台壳层，请看 [布局组件](../layout-component/)。

## 先说明一个命名口径

手册和管理界面都统一把这条路线称为“组件库”。它解决的是“低代码页面里的复用组件”，不是“整页微前端”。

## 它最适合承接什么

- 表单项扩展
- 列表或详情中的定制展示组件
- 在多个低代码页面中重复出现的交互控件
- 需要给业务开发人员稳定复用的一组前端能力

## 它不适合承接什么

- 整页复杂业务逻辑
- 顶栏、侧栏等壳层布局
- 跨多个应用的统一分发治理

如果你的目标已经变成“多个应用都要统一安装和升级这批前端能力”，通常应继续评估 [平台组件库](../../../../fusion-development/workbench-widgets-and-component-libraries)。

## 实现步骤

### 构建应用

自选前端技术，创建组件应用。

:::warning
组件应用应避免路由的注入。
:::

### 应用改造

[点击查看应用改造](../application-transformation)。

通常需要额外关注 React 运行时共享；这部分可以和应用改造页一起看。

**示例**

1. 导出生命周期
2. 修改 publicPath 和 打包方式
3. 共享 react 运行时
4. 注册自定义组件，以表单项扩展举例说明

```js
import React from 'react'

class MyFormItem extends React.Component {
  render() {
    const { value, onChange } = this.props
    return (
      <div>
        <p>这个是个自定义组件</p>
        <p>当前值：{value}</p>
        <a
          className="btn btn-default"
          onClick={() => onChange(Math.round(Math.random() * 10000))}
        >
          随机修改
        </a>
      </div>
    )
  }
}

FormItem({
  type: 'custom',
  autoVar: true,
})(MyFormItem)
```

在页面中可以使用：

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
        "name": "username"
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

### 打包与配置

1. 构建应用程序，并将其打包成 zip 文件。
2. 在“高级 -> 微前端”中新增微前端，类型选择 **组件库**，[查看具体配置方式](../index.md#configuration)。

## 使用建议

- 优先沉淀通用组件，不要把只服务单一页面的一次性逻辑做成组件库
- 组件的入参与出参要尽量稳定，方便业务页面长期复用
- 当组件依赖特定数据结构或平台上下文时，最好同步补一份使用说明给业务开发人员
- 如果组件 API 还在快速变化，先停留在组件库层会比一开始就升级成平台组件库更稳

## 下一步看哪里

- 想先判断这是不是合适的承载层：看 [前端融合开发方式](../../../../fusion-development/frontend-extension-paths)
- 想看平台级复用和分发：看 [工作台、Widget 与平台组件库](../../../../fusion-development/workbench-widgets-and-component-libraries)
