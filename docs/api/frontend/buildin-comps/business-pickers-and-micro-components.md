---
sidebar_position: 2
---

# 业务选择器与微前端容器

表单中可直接选择字典项、员工和组织；需要自定义交互时，可嵌入已发布的微前端入口。

## data-dict-picker

`dataDictName` 填已定义的数据字典名称。选项值字段为 `code`，显示字段为 `label`。

```json
{
  "type": "form",
  "body": [
    {
      "type": "data-dict-picker",
      "name": "status",
      "label": "订单状态",
      "dataDictName": "sales.OrderStatus",
      "multiple": false,
      "joinValues": false,
      "extractValue": true
    }
  ]
}
```

示例将选中项的 `code` 写入 `status`。`tenantId` 可指定租户上下文；`selectorType` 可选择内层控件，默认 `tree-select`。字典内容与维护方式见 [数据字典](../../../concepts/data-dict-model/)。

## employee-picker

选择员工业务身份，选项值字段为 `id`，显示字段为 `name`。需要完整员工对象时明确设置 `joinValues: false` 和 `extractValue: false`：

```json
{
  "type": "form",
  "body": [
    {
      "type": "employee-picker",
      "name": "assignees",
      "label": "经办人",
      "multiple": true,
      "joinValues": false,
      "extractValue": false,
      "minLength": 1,
      "maxLength": 5
    }
  ]
}
```

此配置输出员工对象数组，如 `[{ "id": "employee-001", "name": "张三" }]`。`multiple: false` 时为单个对象。

| 属性 | 用途 |
| --- | --- |
| `multiple` | 多选，默认 `false` |
| `minLength`、`maxLength` | 多选人数限制，使用数字 |
| `joinValues` | 将选中 ID 按分隔符拼为字符串 |
| `extractValue` | 提取 ID；多选并关闭 `joinValues` 时输出 ID 数组 |
| `disabledPeople` | 禁选人员 |

员工 ID 与登录用户 ID 不同，需要提交登录用户标识的接口不能直接使用员工 ID。

## organization-picker

通过展示范围和可选类型控制组织选择。以下示例展示公司和部门，仅允许选择部门，并输出组织对象：

```json
{
  "type": "form",
  "body": [
    {
      "type": "organization-picker",
      "name": "department",
      "label": "所属部门",
      "showCompany": true,
      "showDepartment": true,
      "pickCompany": false,
      "pickDepartment": true,
      "multiple": false,
      "joinValues": false,
      "extractValue": false
    }
  ]
}
```

| 属性 | 用途 |
| --- | --- |
| `showCompany`、`showDepartment` | 是否请求对应类型的组织节点 |
| `companyId` | 限定公司范围 |
| `pickCompany`、`pickDepartment` | 是否允许选中对应类型，默认均为 `true` |
| `parentNode` | 限定到某节点及其下级 |
| `disabledOrganizations` | 禁用节点 ID 或对象 |
| `disableChildOrganizations` | 同时禁用其下级，默认 `true` |
| `defaultCurrentCompany`、`defaultCurrentDepartment` | 无值时按当前组织设置默认 ID |

值字段为 `id`，显示字段为 `name`。`joinValues/extractValue` 控制字符串、ID 数组或对象形式；启用默认当前组织时可能先写入 ID。保存前按后端字段要求统一为所需格式，避免假定始终返回对象。

## micro-component 与 micro-form-component {#加载微前端应用}

`micro-component` 用于展示微前端，`micro-form-component` 用作表单项。`entry` 必填，应为可加载的微前端 HTML 入口。

```json
{
  "type": "form",
  "data": { "address": { "city": "上海" } },
  "body": [
    {
      "type": "micro-form-component",
      "name": "address",
      "label": "收货地址",
      "entry": "https://frontend.example.com/address-editor/",
      "inputStyle": { "minHeight": "160px" }
    }
  ]
}
```

示例入口须替换为实际部署地址，并允许平台加载。`inputStyle` 设置容器样式；普通展示时将类型改为 `micro-component`。

### 表单值交互 {#表单内加载微前端应用}

表单微前端从 `props.value` 读取值，用 `props.onChange(nextValue)` 更新表单。在入口中处理：

```js
import { initMicroApp } from 'ouroboros-sdk'

const { bootstrap, mount, update, unmount } = initMicroApp({
  async render(props) {
    const input = document.createElement('input')
    input.value = props.value?.city || ''
    input.addEventListener('change', () => {
      props.onChange?.({ ...props.value, city: input.value })
    })
    ;(props.container || document.querySelector('#app')).appendChild(input)
    return input
  },
  async afterUnmount(props, input) {
    input?.remove()
  },
})
export { bootstrap, mount, update, unmount }
```

需要响应后续表单值变化时，在 `afterUpdate` 中更新已创建的视图。JSON 配置不能包含 JavaScript 函数字面量，回调写在微前端代码中。构建与发布见 [微前端应用](../../../guide/advance/extend-frontend/micro-app/)。
