---
sidebar_position: 6
title: 字段定义
---

# 字段定义

字段定义描述“一类字段应该怎样存储、校验和展示”。它是可复用的字段类型模板，不是业务模型中的某一个字段实例。

## 作用

- 把金额、手机号、日期、组织选择等通用字段语义沉淀为可复用类型。
- 统一字段的数据类型、主键能力、输入控件、展示方式和校验规则。
- 允许平台扩展新的字段类型，而不让业务模型重复编写底层实现。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `name` / `label` | 类型标识与标题 | `name` 稳定识别字段类型，`label` 面向编辑器显示。 |
| `description` / `order` | 说明与排序 | 影响字段类型列表中的解释和顺序。 |
| `isPrimaryKeyType` | 主键类型标记 | 表示该类型是否可用于主键。 |
| `primaryKeyGenerator` | 主键生成器 | 指定主键值的生成策略。 |
| `dataType` | 数据类型 | 描述字段底层值的类型和参数。 |
| `ui` | 默认 UI 约定 | 定义输入控件和展示组件。 |
| `validations` | 校验规则 | 定义长度、范围、格式、必填等约束。 |
| `validationErrors` | 校验错误文案 | 为校验规则提供可展示的错误信息。 |
| `paramsUiSchema` | 类型参数编辑器 | 描述字段类型参数如何在编辑器中配置。 |
| `defaultParams` | 默认参数 | 创建字段实例时使用的默认值。 |

## 与其他模型的关系

- [业务模型](../business-model/) 和 [数据模型](../data-model/) 引用字段定义形成具体字段。
- [UI Schema](../ui-schema/) 和 Widget 可以消费字段的输入、展示和参数 UI 约定。
- [数据字典模型](../data-dict-model/) 可以作为选择类字段的值来源。
- 自定义字段实现通过字段类型 Registry 和正式扩展点注册，不应把专用逻辑塞进业务模型 `custom` 属性。

## 字段类型与字段实例

字段类型是组织级可复用定义，字段实例属于某个具体业务或数据模型。修改字段类型可能影响多个模型，发布前应评估兼容性；只影响单个对象的约束优先写在字段实例上。

## 使用入口与契约

- 操作入口：[字段类型菜单](../../low-code/development-platform-menus/field-type) · [扩展字段](../../guide/advance/extend-backend/extend-field/)
- Schema：`field-type.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
