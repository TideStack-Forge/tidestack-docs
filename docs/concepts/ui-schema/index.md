---
sidebar_position: 9
title: UI Schema 模型
---

# UI Schema 模型

UI Schema 是描述页面结构、组件、数据绑定和交互行为的声明式页面模型。平台当前基于 amis 渲染这类页面，也允许通过组件库扩展组件能力。

## 作用

- 用 JSON 配置交付表单、列表、详情、看板和审批页面。
- 将组件属性、数据请求、表单提交和交互动作放在一个可校验的页面定义中。
- 在不改变业务模型和数据模型的情况下覆盖或新增结构化页面。
- 为低代码页面和前端扩展提供清晰的配置边界。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `name` / `title` | 页面标识与标题 | 用于管理、查找和展示 Schema 页面。 |
| `description` | 页面说明 | 解释页面用途和适用范围。 |
| `schema` | 页面结构 | amis 页面、布局、组件、数据源和动作的主体定义。 |
| `type` | Schema 类型 | 区分页面、表单、列表或其他容器形态。 |
| `id` | DOM/组件标识 | 为页面或组件提供稳定标识。 |
| `className` | 样式类 | 控制页面或容器的样式挂载。 |
| `visible` / `hidden` | 静态可见性 | 控制页面或节点是否展示。 |
| `visibleOn` / `hiddenOn` | 条件可见性 | 根据上下文表达式动态控制展示。 |

## 与其他模型的关系

- [UI 模型](../ui-model/) 决定页面入口和实现方式，UI Schema 负责页面内容。
- [业务模型](../business-model/) 提供字段、视图和业务动作来源。
- [WebAPI 模型](../webapi-model/) 提供页面的数据读取、保存和操作接口。
- [字段定义](../field-define/) 和 [Widget 模型](../widget-model/) 提供控件和字段展示能力。
- 菜单和权限仍由 [菜单模型](../menu-model/) 与 [权限模型](../authority-model/) 负责。

## 使用边界

UI Schema 适合结构化、可配置、组件组合为主的页面。复杂动画、专用前端框架、独立构建或独立发布需求应进入 [微前端模型](../micro-web-model/) 和融合开发，不要在 Schema 中堆积不可维护的脚本。

## 使用入口与契约

- 操作入口：[UI Schema 菜单](../../low-code/development-platform-menus/ui-schema) · [页面交付方案](../../low-code/page-delivery-with-dynamic-forms-and-ui-schema)
- API 与组件：[前端 API](../../api/frontend/)
- Schema：`ui-schema.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
