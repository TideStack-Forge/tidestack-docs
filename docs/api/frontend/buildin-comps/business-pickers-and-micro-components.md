---
sidebar_position: 2
---

# 业务选择器与微前端容器

适用对象：想在 Schema 中直接复用平台已有业务选择器，或把微前端页面 / 表单挂进低代码页面的开发者。

## 使用场景

- 你想选员工、组织或数据字典项
- 你想在低代码页面里挂一个微前端容器
- 你想判断现有需求能不能先复用平台定制组件

## 展示数据字典项

展示数据字典项的组件，通过传递已定义好的数据字典的字典名，组件可以展示该数据字典中已定义字典项。

### 基本使用

```json
{
  "type": "data-dict-picker",
  "dataDictName": ""
}
```

### 属性表

下列属性为 data-dict-picker 独占属性,更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名       | 类型     | 默认值 | 说明                              |
| ------------ | -------- | ------ | --------------------------------- |
| type         | `string` |        | type 指定为 DataDictPicker 渲染器 |
| dataDictName | `string` |        | 字典名                            |
| tenantId     | `string` |        | 租户 id                           |

## 选择员工

### 基本使用

```json
{
  "type": "employee-picker",
  "multiple": true,
  "minLength": "1",
  "maxLength": "5"
}
```

### 属性表

下列属性为 employee-picker 独占属性,更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名    | 类型      | 默认值  | 说明                                      |
| --------- | --------- | ------- | ----------------------------------------- |
| type      | `string`  |         | type 指定为 EmployeePicker 渲染器         |
| multiple  | `boolean` | `false` | 是否为多选                                |
| minLength | `number`  |         | multiple 为 true 时生效，最少选择员工数量 |
| maxLength | `number`  |         | multiple 为 true 时生效，最多选择员工数量 |

### 返回值

- 单选 - 返回对象。
- 多选 - 返回选中数据组成的数组对象。

## 选择组织架构

### 基本使用

```json
{
  "type": "organization-picker",
  "multiple": true
}
```

### 属性表

下列属性为 organization-picker 独占属性,更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名         | 类型      | 默认值 | 说明                                                |
| -------------- | --------- | ------ | --------------------------------------------------- |
| type           | `string`  |        | type 指定为 OrganizationPicker 渲染器               |
| multiple       | `boolean` |        | 是否为多选                                          |
| showCompany    | `boolean` |        | 展示所有公司的选项                                  |
| companyId      | `string`  |        | 指定公司的组织架构数据                              |
| showDepartment | `boolean` |        | 展示部门的选项，若设置为 `true`, **companyId 必填** |
| pickCompany    | `boolean` | true   | 用户可以选择公司                                    |
| pickDepartment | `boolean` | true   | 用户可以选择部门                                    |

### 返回值

- 单选 - 返回对象。
- 多选 - 返回选中数据组成的数组对象。

## 表单内加载微前端应用

### 基本使用

```json
{
  "type": "micro-form-component",
  "entry": "",
  "inputStyle": {
    "width": "70%",
    "height": "75px",
    "marginLeft": "10%"
  }
}
```

### 属性表

下列属性为 micro-form-component 独占属性, 更多属性用法，参考[FormItem 普通表单项](https://aisuda.bce.baidu.com/amis/zh-CN/components/form/formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8)

| 属性名     | 类型     | 默认值 | 说明                                  |
| ---------- | -------- | ------ | ------------------------------------- |
| type       | `string` |        | type 指定为 MicroFormComponent 渲染器 |
| entry      | `string` |        | 微前端路径 **必填**                   |
| inputStyle | `object` |        | 微应用容器样式                        |

## 加载微前端应用

### 基本使用

```json
{
  "type": "micro-component",
  "entry": ""
}
```

### 属性表

| 属性名     | 类型     | 默认值 | 说明                              |
| ---------- | -------- | ------ | --------------------------------- |
| type       | `string` |        | type 指定为 MicroComponent 渲染器 |
| entry      | `string` |        | 微前端路径 **必填**               |
| inputStyle | `object` |        | 微应用容器样式                    |

### 动作表

支持自定义方法传给微前端，微前端接收方法与调用。

例如：

```js
{
  "type": "micro-component",
  "entry": "",
  "onChange": function (val) {
    console.log(val)
  },
}
```
