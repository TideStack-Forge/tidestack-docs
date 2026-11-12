---
sidebar_position: 3
---

# 高级编辑组件

以下表单组件用于选择并编辑条目、组合穿梭选择和树结构编辑。通过 `name` 绑定字段，提交结果为选中条目或树数据。

## selection-editor：选择并编辑条目

`source` 提供候选数组或接口，`value` 为已选对象数组。选中条目后，可在弹层内编辑其附加属性。

```json
{
  "type": "form",
  "data": { "reviewers": [] },
  "body": [
    {
      "type": "selection-editor",
      "name": "reviewers",
      "label": "审核人员",
      "primaryField": "id",
      "source": [
        { "id": "employee-001", "name": "张三", "limit": 1000 },
        { "id": "employee-002", "name": "李四", "limit": 2000 }
      ],
      "columns": [{ "name": "name", "label": "姓名" }],
      "selectedData": { "id": "$id", "name": "$name", "limit": "$limit" },
      "editButtonProps": { "label": "设置额度" },
      "editDialogProps": { "title": "设置审核额度", "size": "md" },
      "editFormItems": [
        { "type": "input-number", "name": "limit", "label": "额度", "min": 0 }
      ]
    }
  ]
}
```

选中并修改后，`reviewers` 形如 `[{ "id": "employee-001", "name": "张三", "limit": 1500 }]`。

| 属性 | 类型 / 用途 |
| --- | --- |
| `source` | 候选数据数组或 API；接口返回数组或 `data.items` |
| `primaryField` | 匹配候选与已选数据的唯一字段，默认 `id` |
| `columns` | 表格列数组 |
| `selectedData` | 从候选条目生成已选对象的数据映射 |
| `editFormItems` | 编辑表单项数组 |
| `editColumnProps`、`editButtonProps`、`editDialogProps` | 编辑列、按钮和弹层配置对象 |

组件采用多选。主键必须唯一，`selectedData` 需要保留主键；编辑结果随表单提交，组件不会自动保存到服务端。

## tabs-transfer-editor：分组选择并编辑

按分组展示候选项，可编辑已选项并保留附加属性。以下示例完全使用本地数据：

```json
{
  "type": "form",
  "data": { "columns": [] },
  "body": [
    {
      "type": "tabs-transfer-editor",
      "name": "columns",
      "label": "导出列",
      "valueField": "value",
      "labelField": "label",
      "joinValues": false,
      "extractValue": false,
      "options": [
        {
          "label": "订单字段",
          "children": [
            { "value": "code", "label": "订单号", "width": 160 },
            { "value": "amount", "label": "金额", "width": 100 }
          ]
        }
      ],
      "valueTpl": "${label}",
      "editable": true,
      "editButton": { "label": "列设置" },
      "editDialog": { "title": "设置列宽" },
      "editControls": [
        { "type": "hidden", "name": "value" },
        { "type": "input-number", "name": "width", "label": "宽度", "min": 40 }
      ]
    }
  ]
}
```

| 属性 | 类型 / 用途 |
| --- | --- |
| `options` | 分组数组，每组可含 `children` 或 `source` |
| `source` | 整组选项的数据源，优先于 `options` |
| `valueField` | 唯一字段，默认 `value` |
| `selectedDataMapping` | 输出选中条目的数据映射，需保留唯一字段 |
| `editable` | 显示已选项编辑按钮，默认 `false` |
| `editButton`、`editDialog` | 编辑按钮和弹层配置对象 |
| `editControls` | 编辑表单项数组 |
| `creatable` | 是否允许新增条目 |
| `addButton`、`addDialog`、`addControls` | 新增按钮、弹层和表单项 |

当前编辑参数使用 `editable/editButton/editDialog/editControls`。编辑表单必须保留 `valueField` 对应字段，才能将结果合并到正确条目。输出为选中对象数组，如 `[{ "value": "code", "label": "订单号", "width": 180 }]`。

## tree-editor：编辑树结构

### 本地模式

默认 `mode: 'local'`，表单值承载整棵树。编辑先更新本地值，由外层表单统一保存。

```json
{
  "type": "form",
  "data": { "nodes": [{ "id": "root", "name": "订单分类", "children": [] }] },
  "body": [
    {
      "type": "tree-editor",
      "name": "nodes",
      "keyField": "id",
      "labelField": "name",
      "creatable": true,
      "editable": true,
      "removable": true,
      "draggable": true,
      "addControls": [
        { "type": "input-text", "name": "id", "label": "标识", "required": true },
        { "type": "input-text", "name": "name", "label": "名称", "required": true }
      ],
      "editControls": [{ "type": "input-text", "name": "name", "label": "名称", "required": true }]
    }
  ]
}
```

### 服务端命令模式

`mode: 'command'` 适用于新增、移动或删除必须经过服务端校验的树。示例要求已定义查询和移动接口：

```json
{
  "type": "tree-editor",
  "name": "projectTree",
  "mode": "command",
  "source": "/api/project/tree",
  "keyField": "id",
  "labelField": "name",
  "draggable": true,
  "moveApi": {
    "method": "post",
    "url": "/api/project/nodes/${event.dragNode.id}/move",
    "data": {
      "targetNodeId": "${event.targetNode.id}",
      "dropMode": "${event.dropMode}"
    }
  },
  "reloadOnSuccess": true,
  "optimistic": false
}
```

| 属性 | 用途 |
| --- | --- |
| `keyField` | 节点唯一键；兼容旧 `valueField`，默认 `value` |
| `labelField`、`childrenField` | 显示字段和子节点字段，默认 `label`、`children` |
| `selectedValue` | 当前选中节点，独立于整棵树 |
| `creatable`、`editable`、`removable`、`draggable` | 启用相应操作 |
| 对应的 `*On` | 节点级条件表达式，可读取 `item/node` |
| `createApi`、`updateApi`、`deleteApi`、`moveApi` | 命令接口 |
| `reloadOnSuccess` | 成功后重新加载 `source`，默认 `true` |
| `optimistic` | 命令前先修改本地树，默认 `false` |
| `autoFillHeight` | 填满有明确高度的父容器 |

移动事件提供 `dragNode`、`targetNode`、`dropMode`、父节点和索引等信息。`beforeMove`、`move`、`beforeDelete` 等事件可以阻止后续操作。节点键应稳定且唯一；服务端仍须校验层级、循环引用与权限。
