---
sidebar_position: 9
title: Widget 模型
---

# Widget 模型

Widget 是可加入用户看板的小组件。它将页面模板、配置表单、默认配置和尺寸约束组织为一个可复用定义；用户将它加入看板后，再保存自己的位置、大小和配置。同一种小组件可以在一个或多个看板中使用。

## 小组件定义与看板实例

小组件定义决定“有哪些内容可以配置”。看板实例决定“这一次怎样使用它”。例如同一个列表小组件可以被加入两次，分别引用不同接口，采用不同标题和尺寸。

| 对象 | 保存内容 | 影响范围 |
| --- | --- | --- |
| 小组件定义 | 模板、配置表单、默认值和尺寸约束 | 所有引用该定义的实例。 |
| 看板中的组件实例 | 所选定义、实际配置和布局信息 | 当前看板中的这个组件。 |
| 小组件业务数据 | 接口返回的数据 | 由接口和业务权限决定。 |

`defaultConfig` 是新实例的初始配置，不是业务数据存储。`exampleData` 用于预览，不代表接口已经可用；运行时仍需调用真实接口，并遵循当前用户的接口和数据权限。

## 从配置生成内容

小组件的 `configFormItems` 构成配置表单，填写结果交给 `schemaTpl` 生成页面内容。模板中使用的配置名，应与配置表单和默认值一致。以一个最小文本组件为例：

```json
{
  "name": "NoticeText",
  "title": "提示文字",
  "category": "内容",
  "allowHeader": true,
  "allowFooter": false,
  "defaultSize": { "cols": 6, "rows": 4 },
  "sizeConstraints": {
    "min": { "cols": 3, "rows": 2 },
    "max": { "cols": 12, "rows": 8 }
  },
  "defaultConfig": { "message": "填写提示内容" },
  "configFormItems": [
    { "type": "input-text", "name": "message", "label": "内容" }
  ],
  "schemaTpl": { "type": "tpl", "tpl": "#{message}" }
}
```

加入看板时采用默认尺寸，配置面板提供“内容”输入框，模板将 `message` 配置填入页面节点。`#{...}` 用于组件模板中的配置替换；模板输出中的页面表达式还会由页面渲染阶段解释，两者应分清。

## 配置、外观与预览

`allowHeader` 和 `allowFooter` 表示组件定义是否允许这些区域，实例中的 `showHeader`、`showFooter` 表示具体是否显示。组件内容和外观配置分别放在 `defaultConfig` 与 `defaultStyleConfig`，避免把背景、边框等样式参数混入业务数据。

尺寸使用看板栅格的列数和行数，不是像素。`defaultSize` 应落在最小、最大尺寸范围内，并留出足够空间容纳组件内容。缩略图 `thumbSchema` 用于选择组件时识别用途，实际实例使用 `schemaTpl`；只配置缩略图不会提供真实内容。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `scene` | 使用场景 | 标识组件可用于哪种看板或页面场景。 |
| `name` | 组件标识 | 组件定义的稳定名称。 |
| `title` | 组件标题 | 组件列表和编辑器中的显示名称。 |
| `description` | 组件说明 | 解释组件的用途。 |
| `category` | 组件分类 | 组织组件选择列表。 |
| `allowHeader` | 允许页头 | 声明是否允许显示组件页头。 |
| `allowFooter` | 允许页脚 | 声明是否允许显示组件页脚。 |
| `sizeConstraints` | 尺寸约束 | 规定组件允许的最小和最大栅格尺寸。 |
| `defaultSize` | 默认尺寸 | 组件首次加入看板时采用的尺寸。 |
| `defaultConfig` | 默认配置 | 组件实例采用的初始业务与显示配置。 |
| `defaultStyleConfig` | 默认样式 | 组件实例采用的初始样式配置。 |
| `configFormItems` | 配置表单 | 编辑组件配置使用的表单项。 |
| `thumbSchema` | 缩略图定义 | 用于组件选择和预览的缩略内容。 |
| `schemaTpl` | 页面模板 | 根据组件配置构建实际页面内容的模板。 |
| `exampleData` | 示例数据 | 为设计态预览提供示例内容。 |
| `configDialogSize` | 配置窗口尺寸 | 指定编辑组件配置的对话框大小。 |

### 尺寸与默认配置

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `sizeConstraints.min` | 最小尺寸 | 组件允许缩小到的栅格尺寸。 |
| `sizeConstraints.min.cols` | 最小列数 | 组件横向至少占用的栅格数。 |
| `sizeConstraints.min.rows` | 最小行数 | 组件纵向至少占用的栅格数。 |
| `sizeConstraints.max` | 最大尺寸 | 组件允许放大到的栅格尺寸。 |
| `sizeConstraints.max.cols` | 最大列数 | 组件横向最多占用的栅格数。 |
| `sizeConstraints.max.rows` | 最大行数 | 组件纵向最多占用的栅格数。 |
| `defaultSize.cols` | 默认列数 | 组件默认横向占用的栅格数。 |
| `defaultSize.rows` | 默认行数 | 组件默认纵向占用的栅格数。 |
| `defaultConfig.title` | 实例标题 | 组件实例的初始标题。 |
| `defaultConfig.header` | 页头内容 | 组件实例的初始页头定义。 |
| `defaultConfig.showHeader` | 显示页头 | 控制实例是否显示页头。 |
| `defaultConfig.showFooter` | 显示页脚 | 控制实例是否显示页脚。 |
| `defaultConfig.extraProps` | 实例扩展配置 | 以属性名直接展开，供组件模板和配置表单消费。 |


## 定义从哪里来

插件资源可以直接提供 `WidgetDefinition`，管理能力也可以保存组件描述，再由 `WidgetDefinitionGenerator` 转成运行时定义。`simple` 是已有的基本小组件构造器，它从描述的 `config` 中读取默认配置、配置表单和页面模板。

两种对象的字段位置不同：直接定义使用顶层 `schemaTpl`；使用构造器保存的描述将它放在 `config.schemaTpl`。构造器描述还包含以下属性，不能与运行时定义混写。

| 属性 | 含义 | 说明 |
| --- | --- | --- |
| `generatorName` | 构造器名称 | 选择生成运行时定义的实现，例如 `simple`。 |
| `config` | 构造器配置 | 由该构造器解释的参数对象。 |
| `config.defaultConfig` | 实例默认配置 | `simple` 构造器使用。 |
| `config.defaultStyleConfig` | 默认样式配置 | `simple` 构造器使用。 |
| `config.configFormItems` | 配置表单项 | `simple` 构造器使用。 |
| `config.thumbSchema` | 缩略图 | `simple` 构造器使用。 |
| `config.schemaTpl` | 页面模板 | `simple` 构造器使用。 |
| `config.exampleData` | 示例数据 | `simple` 构造器使用。 |

名称、标题、分类、场景、页头页脚许可、尺寸和配置窗口大小由描述中的同名属性传递。扩展新的生成方式时，应注册构造器，继续通过组件定义服务提供给前端。

## 常见问题

### 小组件和 PrismUI 组件是一回事吗？

PrismUI 组件是页面节点的渲染实现；Widget 是看板可选择、可配置、可布局的内容单元。Widget 的页面模板可以使用 PrismUI 组件，但登记 Widget 不等于注册新的页面渲染器。

### 缩略图有内容，加入看板后为什么空白？

检查 `schemaTpl`、实例配置和真实数据接口。缩略图和示例数据只服务预览，不会补齐运行时数据。

### 修改默认配置会重置用户看板吗？

默认配置用于初始化。已有实例还保存自己的配置，不应依赖修改默认值来迁移实例；模板或配置字段变更时需要检查已有实例兼容性。

## 继续阅读

- [工作台与 Widget](../../fusion-development/workbench-widgets-and-component-libraries)：定义与扩展方式。
- [平台组件库](../../low-code/development-platform-menus/component-library)：管理组件资源。
- [UI Schema 模型](../ui-schema/)：模板输出的页面结构。
- [JSON Schema 参考](../../reference/jsonschema/)：`widget.schema.json`。
