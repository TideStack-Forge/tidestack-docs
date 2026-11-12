---
sidebar_position: 1
---

# Schema 与编辑器组件

这些组件用于加载、预览和编辑 AMIS 页面配置。这里的 UI Schema 是界面配置；用于验证数据结构的标准见 [JSON Schema](../../../reference/jsonschema/)。

## amis-schema：加载并渲染

`amis-schema` 与 `ui-schema` 等价。可加载已发布的 UI Schema，也可直接渲染内联对象。

```json
{
  "type": "page",
  "body": {
    "type": "amis-schema",
    "schemaId": "/orders/detail"
  }
}
```

示例要求应用中存在路径为 `/orders/detail` 的 UI Schema，`schemaId` 填路径。

| 属性 | 类型 / 行为 |
| --- | --- |
| `schemaId` | UI Schema 路径，优先级最高 |
| `source` | Schema 对象 / 数组，或返回 Schema 的接口字符串 / API 对象 |
| `schema` | 内联 Schema，未提供前两项时使用 |
| `autoRemapping` | `true` 映射整个 Schema；字符串数组只映射指定顶层属性 |
| `defaultProps` | 载入 Schema 未设置的默认属性 |
| `replaceProps` | 覆盖载入 Schema 的同名属性 |
| `mergeProps` | 深度合并到最终 Schema |

同时提供时，选择顺序为 `schemaId → source → schema`。内联示例无需额外资源：

```json
{
  "type": "amis-schema",
  "source": {
    "type": "alert",
    "level": "info",
    "body": "请选择订单后继续"
  }
}
```

接口形式的 `source` 需要返回成功响应，业务数据为待渲染的 Schema 对象或数组。

## amis-schema-editor：编辑组件配置

`amis-schema-editor` 与 `ui-schema-editor` 等价，是表单项。默认编辑一个组件，`multiple: true` 时编辑组件数组。

```json
{
  "type": "form",
  "body": [
    {
      "type": "amis-schema-editor",
      "name": "customBody",
      "label": "自定义内容",
      "showSwitch": true,
      "onText": "启用自定义内容",
      "offText": "使用默认内容",
      "initValue": { "type": "tpl", "tpl": "订单详情" },
      "switchLayout": false
    }
  ]
}
```

| 属性 | 用途 |
| --- | --- |
| `value` | 当前组件对象或组件数组 |
| `defaultSchema` | 当前没有值时供编辑器展示的默认配置 |
| `initValue`、`initValueApi` | 初始化值 / 加载初始值的接口 |
| `showSwitch` | 显示启用开关，默认关闭此功能 |
| `onText`、`offText` | 开关文字 |
| `multiple` | 是否编辑多个组件，默认 `false` |
| `minLength`、`maxLength` | 多组件数量约束 |
| `switchLayout` | 展示不同表单布局预览，默认 `true` |
| `propsEditMode` | 仅编辑属性 |
| `placeholder` | 无值提示 |
| `pureSchema` | 清理未使用的组件 ID，默认 `true` |

开关关闭时，字段输出 `null`；启用后需有实际配置才能通过校验。默认配置的预览不等于已提交表单值，应通过 `initValue` 或表单数据明确初始化。

## amis-schema-preview：外观预览

`amis-schema-preview` 与 `ui-schema-preview` 等价，适合在编辑页展示布局：

```json
{
  "type": "amis-schema-preview",
  "source": {
    "type": "page",
    "title": "订单预览",
    "body": "这里展示页面布局"
  }
}
```

支持 `source` 和 `schemaId`，其中 `source` 优先；`placeholder` 设置无 Schema 时的提示。

预览内容中的业务请求使用空数据，导航不执行。验证表单提交、权限、接口和跳转时，应使用 `amis-schema` 或实际发布页面。
