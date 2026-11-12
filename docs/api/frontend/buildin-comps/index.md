---
sidebar_position: 6
---

# 基座内建组件

平台在 AMIS 页面中提供业务选择器、Schema 容器、编辑组件和扩展动作，可通过 `type` 或 `actionType` 直接引用。

| 参考页 | 组件 / 能力 |
| --- | --- |
| [Schema 与编辑器组件](./schema-and-editor-components) | `amis-schema`、`amis-schema-editor`、`amis-schema-preview`，及对应 `ui-schema-*` 别名 |
| [业务选择器与微前端容器](./business-pickers-and-micro-components) | `data-dict-picker`、`employee-picker`、`organization-picker`、`micro-component`、`micro-form-component` |
| [高级编辑组件](./advanced-editor-components) | `selection-editor`、`tabs-transfer-editor`、`tree-editor` |
| [动作、过滤器与表达式函数](./actions-filters-and-expression-functions) | 标签页动作、事件发布、菜单徽标、`addAttribute`、`hasAuth` |

表单组件需要放入 `form.body` 并配置 `name`，值才会进入表单数据。各页示例说明了数据来源和输出形态；应用中的字典名、Schema 路径和接口地址应替换为已定义的资源。

新增组件见 [组件库](../../../guide/advance/extend-frontend/amis-component/)，从 JavaScript 调用平台能力见 [前端基座 SDK](../sdk/)。
