---
sidebar_position: 3
---

# 高级编辑组件

适用对象：需要在低代码页面里承载更复杂的选择、编辑和结构调整能力的开发者。

## 使用场景

- 你需要“选中 + 编辑”一体化的表格类组件
- 你需要可编辑的组合穿梭器
- 你需要可编辑、可移动的树形结构组件

## 支持编辑和选择的 Table

### 基本使用

```json
{
  "type": "selection-editor",
  "primaryField": "id",
  "columns": [
    {
      "label": "权限",
      "name": "title"
    }
  ],
  "selectedData": {
    "fullName": "$fullName",
    "accessControlParams": "$accessControlParams"
  },
  "editColumnProps": {
    "label": "数据权限"
  },
  "editButtonProps": {
    "level": "primary",
    "label": "配置数据权限"
  },
  "editDialogProps": {
    "size": "md",
    "title": "配置数据权限"
  },
  "editFormItems": [
    {
      "type": "amis-schema",
      "source": "${accessControlSettingSchema}",
      "label": "配置"
    }
  ]
}
```

### 属性表

下列属性为 selection-editor 独占属性,更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名          | 类型            | 默认值 | 说明                               |
| --------------- | --------------- | ------ | ---------------------------------- |
| type            | `string`        |        | type 指定为 SelectionEditor 渲染器 |
| columns         | `Array<Column>` |        | 用来设置列信息                     |
| primaryField    | `string`        | `id`   | 指定主字段                         |
| editColumnProps | `object`        |        | 定义编辑列的信息                   |
| editButtonProps | `object`        |        | 定义编辑按钮的属性                 |
| editDialogProps | `object`        |        | 定义编辑对话框的属性               |
| editFormItems   | `object`        |        | 定义编辑表单项                     |
| selectedData    | `object`        |        | 定义选中数据的参数格式             |

## 支持编辑的 TabsTransfer 组合穿梭器

### 基本使用

```json
{
  "type": "tabs-transfer-editor",
  "options": [
    {
      "label": "字段",
      "searchable": false,
      "source": "${fields|pick:label~title,name|addAttribute:type:field}"
    },
    {
      "label": "关联模型",
      "searchable": true,
      "source": "${relations|pick:label~title,name|addAttribute:type:relation}"
    }
  ],
  "valueTpl": [
    {
      "type": "text",
      "name": "label"
    },
    {
      "type": "tpl",
      "tpl": " (${name})",
      "className": "text-muted"
    }
  ],
  "editButtonProps": {
    "level": "primary",
    "label": "编辑",
    "size": "xs",
    "className": "float-right mr-2"
  },
  "editDialogProps": {
    "size": "md",
    "title": "编辑"
  },
  "editFormItems": {
    "field": [],
    "relation": []
  }
}
```

### 属性表

下列属性为 tabs-transfer-editor 独占属性, 更多属性用法，参考[TabsTransferPicker 穿梭选择器](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/tabs-transfer#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名          | 类型     | 默认值 | 说明                                  |
| --------------- | -------- | ------ | ------------------------------------- |
| type            | `string` |        | type 指定为 TabsTransferEditor 渲染器 |
| editButtonProps | `string` |        | 定义编辑按钮的属性                    |
| editDialogProps | `string` |        | 定义编辑对话框的属性                  |
| editFormItems   | `string` |        | 定义编辑表单项                        |

## 支持编辑和移动的 Tree

树形结构的编辑器，并提供了节点移动的功能。

:::warning
Tree 组件的参数都需要提供吗？
:::

### 基本使用

```json
{
  "type": "tree-editor",
  "labelField": "title",
  "valueField": "fullName"
}
```

### 属性表

下列属性为 tree-editor 独占属性,更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名     | 类型     | 默认值  | 说明                                                                                                                                              |
| ---------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| type       | `string` |         | type 指定为 TreeEditor 渲染器                                                                                                                     |
| labelField | `string` | `label` | [选项标签字段](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/options#%E9%80%89%E9%A1%B9%E6%A0%87%E7%AD%BE%E5%AD%97%E6%AE%B5-labelfield) |
| valueField | `string` | `value` | [选项值字段](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/options#%E9%80%89%E9%A1%B9%E5%80%BC%E5%AD%97%E6%AE%B5-valuefield)            |
