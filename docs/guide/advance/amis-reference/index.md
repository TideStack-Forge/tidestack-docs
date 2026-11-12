---
sidebar_position: 2
---

# PrismUI 开发参考

本页用于编写和核对潮汐栈页面的 UI Schema：组件属性、表达式和事件语法查 PrismUI 文档；页面承载、平台组件、接口调用和 SDK 行为查对应的平台契约。让 AI 生成页面时，也应同时提供这两类上下文。

## 按问题查参考

| 需要确定什么 | 参考入口 |
| --- | --- |
| Schema、模板、数据域、数据映射与事件动作 | [PrismUI 核心概念](https://prismui.io/docs/zh-CN/docs/concepts/schema) |
| Page、Form、CRUD、Dialog、Table 等组件属性 | [PrismUI 组件文档](https://prismui.io/docs/zh-CN/components/page) |
| SchemaNode、API、ClassName、Definitions 等通用类型 | [PrismUI 类型说明](https://prismui.io/docs/zh-CN/docs/types/schemanode) |
| className、CSS 变量、响应式和状态样式 | [PrismUI 样式说明](https://prismui.io/docs/zh-CN/style/index) |
| 自定义组件、编辑器、国际化与埋点机制 | [PrismUI 扩展机制](https://prismui.io/docs/zh-CN/docs/extend/custom-react) |
| 渲染和初始化方式 | [PrismUI 快速开始](https://prismui.io/docs/zh-CN/docs/start/getting-started) |
| 平台如何承载和引用 Schema | [UI Schema](../../../concepts/ui-schema/)、[页面交付](../../../low-code/page-delivery-with-dynamic-forms-and-ui-schema) |
| 平台已内建的渲染组件 | [基座内建组件](../../../api/frontend/buildin-comps/) |
| 弹窗、抽屉、页签、事件总线与 Schema 渲染 | [SDK](../../../api/frontend/sdk/)、[事件与组件注册](../../../api/frontend/sdk/completion-methods/events-schema-and-component-registration)、[导航与弹窗](../../../api/frontend/sdk/completion-methods/navigation-and-tabs-and-dialogs) |
| 可复用控件与整页应用的实现位置 | [前端开发](../../../fusion-development/frontend-extension-paths)、[组件库](../extend-frontend/amis-component/)、[微前端应用](../extend-frontend/micro-app/) |

PrismUI 文档中的示例可用于理解和试验语法。目标平台实际使用的渲染器版本、注册组件和数据上下文仍需单独核对，官方沙箱中的效果不能代替平台内的验证。

外部参考采用 PrismUI 文档。现有工程中的 `amis`、`initAmisComponentLib` 等包名或协议标识按目标 SDK 保留；切换参考站点不等于迁移运行时依赖。

## 生成页面前准备上下文

先给出当前 UI 模型、已有 Schema 和一个真实接口响应，再描述要增加的行为。若页面由业务模型投影产生，应先检查模型配置和投影机制，确认修改位置。

| 上下文 | 需要明确的内容 |
| --- | --- |
| 页面入口 | UI 模型名称、路由、页面参数、菜单与权限 |
| 数据 | 接口路径和方法、请求参数、响应结构、分页、空值和错误示例 |
| 交互 | 查询、提交、弹窗、联动分别由什么事件触发，影响哪个数据域 |
| 组件 | 当前版本可用的 PrismUI 属性、平台内建组件、自定义组件及其注册名 |
| 状态 | 加载、空数据、失败、只读、禁用和无权限时的预期表现 |

可以让 AI 按“修改 Schema → 说明数据来源和事件目标 → 给出验证步骤”交付。不要只根据页面截图推测接口字段或组件属性。任务拆解见 [用 AI 完成功能开发](../../../fusion-development/ai-assisted-development)。

## 在平台内验证

1. 检查 Schema 结构、组件名称和属性是否适用于目标版本，确认自定义组件已加载。
2. 从真实菜单或 UI 模型入口打开页面，确认路由参数、初始数据和当前用户上下文正确。
3. 用实际响应检查列表、表单和详情的数据映射；覆盖空数据、分页、字段缺失和错误返回。
4. 逐一操作查询、提交、弹窗和联动，核对事件读取的数据域、目标组件和最终请求。
5. 用只读或无权限账号验证界面状态和后端访问限制；刷新或重新进入页面，检查状态是否符合预期。

如果失败，将相关 Schema 片段、触发步骤、请求响应和控制台错误反馈给 AI。涉及复杂状态、独立路由或专用可视化时，按 [前端开发](../../../fusion-development/frontend-extension-paths)确定组件或微前端边界，保留平台的页面与权限入口。

## 开发小贴士

### 事件动作里的 expression 上下文

在 PrismUI 事件动作里写 `expression` 时，常见可用上下文可以这样理解：

1. 事件自身的 `data`
   例如通过 `broadcast` 动作广播事件时，可以在 `data` 中传值；监听该事件的动作表达式里可以直接读取这些字段。
2. 当前动作所在位置的数据域
   例如这个动作挂在表单里，就通常可以直接访问表单数据。
3. `event` 对象
   它包含事件本身的类型、数据以及上下文信息。

如果事件的 `data` 和当前数据域里出现同名字段，通常需要显式通过 `__super.xxx` 或 `__rendererData.xxx` 来区分来源，避免表达式读错值。

## 相关文档

- [PrismUI 官方文档](https://prismui.io/docs/zh-CN/docs/index)
- [前端 API](../../../api/frontend/)
- [微前端包管理](../extend-frontend/)
