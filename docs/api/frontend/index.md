---
sidebar_position: 3
---

# 前端 API

前端参考分为代码中使用的 `ouroboros-sdk`，以及页面 Schema 中使用的基座内建组件与动作。

## 前端基座 SDK

| 专题 | 查阅内容 |
| --- | --- |
| [SDK 总览](./sdk/) | 初始化、运行时方法与菜单扩展的职责 |
| [初始化方法](./sdk/initialization-methods/) | 微前端、单组件、布局组件和组件库的入口、参数与生命周期 |
| [运行时方法](./sdk/completion-methods/) | 导航、标签页、弹层、事件、Schema 渲染、请求、认证与实时通信 |
| [菜单扩展 API](./sdk/menu-extension/) | 菜单徽标、菜单树读写、用户菜单注册与清理 |

运行时方法在 `render`、`afterMount` 或其后的用户交互中调用；初始化入口与卸载清理方式见各专题。HTTP 请求返回响应对象，普通 JSON 接口通过 `response.data.data` 读取业务数据。

## 基座内建组件

| 专题 | 查阅内容 |
| --- | --- |
| [Schema 与编辑器组件](./buildin-comps/schema-and-editor-components) | Schema 渲染、编辑与预览 |
| [业务选择器与微前端容器](./buildin-comps/business-pickers-and-micro-components) | 字典、人员、组织选择器与 `micro-*` 容器 |
| [高级编辑组件](./buildin-comps/advanced-editor-components) | 选择、穿梭与树编辑组件 |
| [动作、过滤器与表达式函数](./buildin-comps/actions-filters-and-expression-functions) | 平台事件动作、`addAttribute` 与 `hasAuth` |

组件名称和适用范围见 [基座内建组件总览](./buildin-comps/)。

## 相关资料

扩展方式的选择见 [前端开发](../../fusion-development/frontend-extension-paths)；接入步骤见 [微前端包管理](../../guide/advance/extend-frontend/)；挂载、发布或登录异常见 [前端常见问题](../../faq/frontend/)。
