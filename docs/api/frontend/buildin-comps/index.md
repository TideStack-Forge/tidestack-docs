---
sidebar_position: 6
---

# 基座内建组件

适用对象：已经在写 AMIS Schema、平台页面或前端扩展，想确认“基座里已经带了哪些组件、动作、过滤器和表达式函数”的开发者。

这页不再承载所有细节，而是作为总索引，帮你先判断应该进入哪一类平台内建能力。

## 先判断该看这页，还是看别的页

| 当前问题                                       | 优先去看哪里                               |
| ---------------------------------------------- | ------------------------------------------ |
| 我想知道 SDK 怎么初始化或怎么调用运行时方法    | 看 [前端基座 SDK](../sdk/)                 |
| 我还没判断该走低代码、UI Schema 还是微前端     | 看 [前端融合开发方式](../../../fusion-development/frontend-extension-paths) |
| 我想知道平台里已经内建了哪些组件、动作和表达式 | 看这页                                     |
| 我需要自己注册新组件、动作、公式或校验器       | 看 [扩展前端](../../../guide/advance/extend-frontend/) |

## 分主题阅读

### [Schema 与编辑器组件](./schema-and-editor-components)

适合查下面这些组件：

- `amis-schema`
- `amis-schema-editor`
- `amis-schema-preview`

### [业务选择器与微前端容器](./business-pickers-and-micro-components)

适合查下面这些组件：

- `data-dict-picker`
- `employee-picker`
- `organization-picker`
- `micro-form-component`
- `micro-component`

### [高级编辑组件](./advanced-editor-components)

适合查下面这些组件：

- `selection-editor`
- `tabs-transfer-editor`
- `tree-editor`

### [动作、过滤器与表达式函数](./actions-filters-and-expression-functions)

适合查下面这些能力：

- 平台扩展的事件动作
- `addAttribute`
- `hasAuth`

## 使用建议

- 先确认是不是平台内建能力，再决定要不要自己扩展
- 看到 `micro-*` 这类组件时，优先把它理解为“Schema 中挂载微前端入口”，而不是通用 AMIS 原生能力
- 如果你找的是 `openDialog`、`openTab`、`publish` 这类动作，通常要和 [SDK 方法参考指南](../sdk/completion-methods/) 一起看，才能把 Schema 层和运行时层对上
