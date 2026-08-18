---
sidebar_position: 9
title: Widget 模型
---

# Widget 模型

Widget 模型定义可复用页面组件的配置契约。它位于 UI Schema 或工作台页面与实际前端组件之间，描述组件可以怎样配置、预览和约束尺寸。

## 作用

- 把一个前端组件沉淀成可被平台发现和复用的页面资产。
- 约束组件可配置区域、默认尺寸、默认样式和配置表单。
- 为工作台、看板和 UI Schema 编辑器提供组件预览和示例数据。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `scene` | 使用场景 | 说明组件可出现于工作台、页面或其他容器。 |
| `name` | 组件标识 | 组件在注册表中的稳定名称。 |
| `title` | 组件标题 | 编辑器和组件列表中的显示名称。 |
| `category` | 组件分类 | 便于在组件库中查找和组织。 |
| `sizeConstraints` | 尺寸约束 | 限制组件允许的最小、最大或步进尺寸。 |
| `defaultSize` | 默认尺寸 | 首次拖入或创建时使用的尺寸。 |
| `defaultConfig` | 默认配置 | 组件实例的初始业务配置。 |
| `defaultStyleConfig` | 默认样式 | 组件实例的初始视觉配置。 |
| `configFormItems` | 配置表单 | 用户编辑组件配置时使用的表单项。 |
| `thumbSchema` / `exampleData` | 预览资源 | 分别用于缩略图和设计态示例数据。 |

## 与其他模型的关系

- [UI Schema](../ui-schema/) 可以消费 Widget 提供的组件类型和配置。
- [UI 模型](../ui-model/) 决定页面入口，Widget 只负责页面内部的可复用实现资源。
- [字段定义](../field-define/) 为组件提供字段类型、输入控件和展示语义。
- 组件库负责分发和注册 Widget，不应改变业务模型或权限模型的职责。

## 使用入口与契约

- 操作入口：[工作台、Widget 与平台组件库](../../fusion-development/workbench-widgets-and-component-libraries) · [平台组件库](../../low-code/development-platform-menus/component-library)
- Schema：`widget.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
