---
sidebar_position: 4
---

# 普通组件包（不带 manifest）

组件库为 UI Schema 页面提供可复用的表单项、展示组件和交互能力。页面按稳定的 `type` 与属性引用组件；组件实现负责渲染、值变化及状态处理，业务接口和权限继续通过平台链路执行。

本页通过微前端的“组件库”类型加载组件包，不要求 `components.manifest.json`。需要清单、平台安装和多应用导入时，见 [平台组件库（带 manifest）](../../../../fusion-development/plugin-extensions/frontend/platform-component-library)。

## 先定义组件契约

提供当前 Schema、AMIS 与 SDK 版本、同类组件和数据样例，让 AI 先核对内建组件是否已经满足需求。需要新增类型时，约定以下内容：

| 组件类型 | 必须明确的行为 |
| --- | --- |
| 表单项 | `value`、`onChange`、空值、校验、重置、只读和禁用 |
| 展示组件 | 输入结构、空数据、加载、异常和展示格式 |
| 交互控件 | 事件参数、动作目标、异步结果与卸载清理 |

类型名在注册、Schema 和使用说明中保持一致。独立业务页面使用 [微前端应用](../micro-app/)，顶栏和侧栏使用 [布局组件](../layout-component/)。

## 1. 实现组件

下面以一个数值表单项说明值的传递。示例的“随机修改”仅用于观察表单联动，业务组件应替换为自己的操作。

```jsx
import React from 'react'
import { FormItem } from 'ouroboros-sdk'

function MyFormItem({ value, onChange, disabled, readOnly }) {
  return (
    <div>
      <p>当前值：{value ?? '未设置'}</p>
      <button
        type="button"
        disabled={disabled || readOnly}
        onClick={() => onChange(Math.round(Math.random() * 10000))}
      >
        随机修改
      </button>
    </div>
  )
}

FormItem({ type: 'custom', autoVar: true })(MyFormItem)
```

`value` 来自表单数据，修改通过 `onChange` 通知宿主。只读和禁用时应限制交互；其他属性、校验和错误展示按目标 AMIS 及组件类型补齐。

展示组件使用 `Renderer` 等对应注册入口。API 说明见 [事件、Schema 与组件注册](../../../../api/frontend/sdk/completion-methods/events-schema-and-component-registration)。

## 2. 接入组件库生命周期

采用 SDK 注册方式的工程，使用 `initAmisComponentLib` 完成宿主工具注入与注册。下面假定上一节的组件放在 `registerComponent.jsx`：

```js
import { initAmisComponentLib } from 'ouroboros-sdk'
import './registerComponent.jsx'

const { bootstrap, mount, update, unmount } = initAmisComponentLib({})
export { bootstrap, mount, update, unmount }
```

若工程模板已有 `components` 或 `install(registry)` 等导出，先核对目标基座采用的加载方式，再沿用该模板完成注册。不要把两种工程入口直接拼接，导致同一类型重复注册。

组件库不注入页面路由。构建与共享 React 的配置见 [应用改造](../application-transformation)，生命周期参数见 [SDK 初始化方法](../../../../api/frontend/sdk/initialization-methods/)。

## 3. 安装并由 Schema 引用

1. 测试并构建组件库，将构建目录打包为 ZIP。
2. 在 **高级 → 微前端** 创建记录，类型选择 **组件库**。操作见 [微前端包管理](../index.md#configuration)。
3. 刷新目标页面，在最小 Schema 中引用组件类型。

```json
{
  "type": "page",
  "title": "自定义组件示例",
  "body": {
    "type": "form",
    "body": [
      { "type": "input-text", "label": "用户名", "name": "username" },
      { "type": "custom", "label": "随机值", "name": "random" }
    ]
  }
}
```

先验证示例中的 `random` 值能够回填、修改并进入表单提交，再在真实业务页面使用。组件可渲染与编辑器可配置是两项检查；设计器内的属性面板还需对应的编辑器定义。

## 4. 验证组件行为

| 场景 | 检查结果 |
| --- | --- |
| 按 `type` 加载 | 类型已注册，组件渲染且资源请求正常 |
| 正常值与空值 | 输入、展示、回填和默认状态符合约定 |
| 修改、重置和提交 | `onChange` 与宿主数据一致，提交使用最终值 |
| 无效值、只读与禁用 | 校验和交互限制符合页面契约 |
| 重复进入页面 | 无重复注册、监听或运行时冲突 |
| 构建升级 | 原 Schema 可继续使用，属性兼容性有记录 |

出现未知类型时，检查包加载与注册名；界面可见但值不更新时，检查字段 `name`、数据域和 `onChange`；运行时冲突时，检查共享 React 与初始化顺序。向 AI 提供最小 Schema、组件实现和实际结果，再复验失败场景。

交付包、类型与属性说明、最小 Schema 和实际测试记录。跨应用共享时，继续完成平台组件库的清单、安装和应用导入验证。
