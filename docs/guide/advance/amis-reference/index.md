---
sidebar_position: 2
---

# AMIS 开发参考

这页是潮汐栈开发者使用 AMIS 的统一入口。它帮助你在“AMIS 原生能力”和“潮汐栈平台能力”之间快速定位文档，而不是把两套文档割裂开来查。

在潮汐栈里，AMIS 不是孤立使用的。它通常会和下面几类能力一起出现：

- 低代码页面与 UI Schema
- 平台基座内建组件
- 微前端 SDK
- 组件库扩展

如果你只是查 AMIS 原生组件、表达式或事件动作，优先进入 AMIS 原生文档；如果你要把这些能力接入潮汐栈页面、SDK、组件库或微前端，继续看 handbook 里的平台文档。

## 先判断你现在遇到的是哪类问题

| 当前问题 | 优先去看哪里 |
| --- | --- |
| 我不知道某个 Schema、组件属性或事件动作怎么写 | [AMIS 原生文档](https://baidu.github.io/amis/zh-CN/docs/index) |
| 我想查 Page、Form、CRUD、Dialog、Table 等组件 | [AMIS 组件文档](https://baidu.github.io/amis/zh-CN/components/page) |
| 我想查表达式、模板、数据映射、数据域和联动 | [AMIS 概念文档](https://baidu.github.io/amis/zh-CN/docs/concepts/schema) |
| 我想知道潮汐栈基座已经内建了哪些前端组件 | [前端 API](../../../api/frontend/) 和 [基座内建组件](../../../api/frontend/buildin-comps/) |
| 我想在微前端里调用平台对话框、抽屉、事件或工具 | [SDK 文档](../../../api/frontend/sdk/) |
| 我需要在低代码页面里注册新的可复用控件 | [组件库](../extend-frontend/amis-component/) |
| 我还没想清楚该写 UI Schema 还是做前端扩展 | [前端融合开发方式](../../../fusion-development/frontend-extension-paths) 和 [前端 FAQ](../../../faq/frontend/) |

## AMIS 原生能力入口

| 能力 | 适合查什么 |
| --- | --- |
| [快速开始](https://baidu.github.io/amis/zh-CN/docs/start/getting-started) | AMIS SDK、React 使用方式和基础渲染方式 |
| [核心概念](https://baidu.github.io/amis/zh-CN/docs/concepts/schema) | Schema、模板、表达式、数据域、数据映射、事件动作 |
| [组件文档](https://baidu.github.io/amis/zh-CN/components/page) | 页面、表单、CRUD、弹窗、抽屉、表格、列表、容器等组件属性 |
| [类型说明](https://baidu.github.io/amis/zh-CN/docs/types/schemanode) | SchemaNode、API、ClassName、Definitions 等通用类型 |
| [样式说明](https://baidu.github.io/amis/zh-CN/style/index) | className、CSS 变量、响应式和状态样式 |
| [扩展机制](https://baidu.github.io/amis/zh-CN/docs/extend/custom-react) | 自定义组件、SDK 扩展、编辑器扩展、国际化和埋点 |

AMIS 原生文档里的示例通常带有可运行沙箱，尤其是 `schema:` 示例。查组件和语法时优先使用这些可运行示例验证效果，再把最终 Schema 放回潮汐栈页面里。

## 在潮汐栈里，AMIS 通常承担什么角色

你可以把 AMIS 理解成“平台前端里的结构化界面描述层”。

它最适合承接：

- 列表、表单、详情、操作面板这类结构化页面
- 需要通过 Schema 快速交付和迭代的业务界面
- 基于平台现成组件和运行时能力拼装出来的页面

它不太适合直接承接：

- 大量自定义状态管理和复杂交互的整页应用
- 独立路由、复杂图形交互或强工程化的前端产品
- 本质上更适合微前端页面的场景

如果你发现 Schema 越写越像“在 JSON 里硬写一整套前端应用逻辑”，通常就该回头评估是否应该切到微前端路线。

## 平台内怎么接 AMIS

### 写 UI Schema 页面

如果你要配置结构化页面，先用 AMIS 文档确认组件和语法，再回到平台文档确认页面承载方式：

- [UI Schema](../../../concepts/ui-schema/)
- [页面交付：标准页面、动态表单与 UI Schema](../../../low-code/page-delivery-with-dynamic-forms-and-ui-schema)
- [基座内建组件](../../../api/frontend/buildin-comps/)

### 调用平台 SDK 能力

如果 Schema 或微前端页面需要打开弹窗、抽屉、页签、事件总线或动态渲染 Schema，看：

- [SDK 文档](../../../api/frontend/sdk/)
- [事件、Schema 与组件注册](../../../api/frontend/sdk/completion-methods/events-schema-and-component-registration)
- [导航、页签、弹窗与抽屉](../../../api/frontend/sdk/completion-methods/navigation-and-tabs-and-dialogs)

### 补充平台组件

如果 AMIS 原生组件不够，但需求仍然属于低代码页面里的复用控件，优先走组件库：

- [扩展前端](../extend-frontend/)
- [组件库](../extend-frontend/amis-component/)
- [前端融合开发方式](../../../fusion-development/frontend-extension-paths)

### 切到微前端

如果页面需要独立路由、复杂状态、专用可视化或重前端交互，优先按微前端承载：

- [前端融合开发方式](../../../fusion-development/frontend-extension-paths)
- [微前端应用](../extend-frontend/micro-app/)
- [何时用低代码，何时写代码](../../../fusion-development/when-to-use-code)

## 一条很实用的判断线

### 只是写 Schema

优先看 AMIS 原生文档，再结合平台内建组件和现成页面模式。

### 需要调用平台能力

优先看 [前端 API](../../../api/frontend/)，尤其是 SDK 和基座组件相关内容。

### 需要做自定义控件

优先看 [扩展前端](../extend-frontend/) 里的 [组件库](../extend-frontend/amis-component/)。

### 需要做整页复杂交互

先回到 [前端融合开发方式](../../../fusion-development/frontend-extension-paths)，判断是否应该用微前端页面，而不是继续堆 Schema。

## 开发小贴士

### 事件动作里的 expression 上下文

在 AMIS 事件动作里写 `expression` 时，常见可用上下文可以这样理解：

1. 事件自身的 `data`
   例如通过 `broadcast` 动作广播事件时，可以在 `data` 中传值；监听该事件的动作表达式里可以直接读取这些字段。
2. 当前动作所在位置的数据域
   例如这个动作挂在表单里，就通常可以直接访问表单数据。
3. `event` 对象
   它包含事件本身的类型、数据以及上下文信息。

如果事件的 `data` 和当前数据域里出现同名字段，通常需要显式通过 `__super.xxx` 或 `__rendererData.xxx` 来区分来源，避免表达式读错值。

## 推荐阅读顺序

1. [AMIS 官方文档](https://baidu.github.io/amis/zh-CN/docs/index)
2. [前端 API](../../../api/frontend/)
3. [SDK 文档](../../../api/frontend/sdk/)
4. [扩展前端](../extend-frontend/)
5. [组件库](../extend-frontend/amis-component/)

## 下一步看哪里

- 想先判断该不该写前端扩展：看 [前端融合开发方式](../../../fusion-development/frontend-extension-paths)
- 想直接查平台前端能力：看 [前端 API](../../../api/frontend/)
- 想扩展平台前端：看 [扩展前端](../extend-frontend/)
