---
title: JSON Schema
sidebar_position: 3
---

# JSON Schema

本页提供平台元数据资源的 JSON Schema，用于编辑器提示、结构校验和 AI 理解。选择与文件类型匹配的 Schema，检查必填项、字段类型、枚举和嵌套结构。

## 下载与选择

按下表下载 Schema，校验工具需支持 **Draft 2020-12**。每份文件包含其引用的嵌套定义，可单独保存使用；机器可读映射见 [Schema 索引](./metadata/index.json)。

带点前缀的规则表示文件后缀，其余是固定文件名。配置项与配置分组分别提供数组文件和单项文件的 Schema，注意与输入形态匹配。

## 类型索引

| 类型标识 | 名称 | 文件后缀或固定文件名 | Schema |
| --- | --- | --- | --- |
| `authority` | 权限项模型 | `.authority.json` | [authority.schema.json](./metadata/authority.schema.json) |
| `menu` | 菜单模型 | `.menu.json` | [menu.schema.json](./metadata/menu.schema.json) |
| `dev-menu` | 开发菜单模型 | `.dev-menu.json` | [dev-menu.schema.json](./metadata/dev-menu.schema.json) |
| `ui-model` | UI 模型 | `.ui-model.json` | [ui-model.schema.json](./metadata/ui-model.schema.json) |
| `ui-schema` | UI Schema | `.ui-schema.json` | [ui-schema.schema.json](./metadata/ui-schema.schema.json) |
| `business` | 业务模型 | `.business.json` | [business.schema.json](./metadata/business.schema.json) |
| `logicflow` | 逻辑流模型 | `.logicflow.json` | [logicflow.schema.json](./metadata/logicflow.schema.json) |
| `approval-workflow` | 审批流 | `.workflow.json` | [approval-workflow.schema.json](./metadata/approval-workflow.schema.json) |
| `field-type` | 字段类型 | `.field-type.json` | [field-type.schema.json](./metadata/field-type.schema.json) |
| `flow-node` | 逻辑流节点 | `.flow-node.json` | [flow-node.schema.json](./metadata/flow-node.schema.json) |
| `widget` | 组件定义 | `.widget.json` | [widget.schema.json](./metadata/widget.schema.json) |
| `micro-web` | 微前端 | `.micro-web.json` | [micro-web.schema.json](./metadata/micro-web.schema.json) |
| `rpc` | RPC 模型 | `.rpc.json` | [rpc.schema.json](./metadata/rpc.schema.json) |
| `rpc-auth` | RPC 认证 | `.rpc.auth.json` | [rpc-auth.schema.json](./metadata/rpc-auth.schema.json) |
| `webapi` | WebAPI 模型 | `.webapi.json` | [webapi.schema.json](./metadata/webapi.schema.json) |
| `notification` | 通知模板 | `.notification.json` | [notification.schema.json](./metadata/notification.schema.json) |
| `business-log` | 业务日志模板 | `.business-log.json` | [business-log.schema.json](./metadata/business-log.schema.json) |
| `data-init` | 数据初始化 | `.data-init.json` | [data-init.schema.json](./metadata/data-init.schema.json) |
| `mq` | MQ 绑定 | `.mq.json` | [mq.schema.json](./metadata/mq.schema.json) |
| `schedule` | 定时任务 | `.schedule.json` | [schedule.schema.json](./metadata/schedule.schema.json) |
| `i18n` | 国际化语言包 | `.i18n.json` | [i18n.schema.json](./metadata/i18n.schema.json) |
| `data-dict` | 数据字典 | `.dict.json` | [data-dict.schema.json](./metadata/data-dict.schema.json) |
| `position` | 岗位定义 | `.position.json` | [position.schema.json](./metadata/position.schema.json) |
| `error-code` | 错误码 | `error-codes.error.json` | [error-code.schema.json](./metadata/error-code.schema.json) |
| `app-metadata` | 应用元数据 | `app.metadata.json` | [app-metadata.schema.json](./metadata/app-metadata.schema.json) |
| `modules-diff` | 模块树 Diff | `modules.diff.json` | [modules-diff.schema.json](./metadata/modules-diff.schema.json) |
| `app-module` | 应用模块 | `app-modules.json` | [app-module.schema.json](./metadata/app-module.schema.json) |
| `configuration` | 配置项 | `configurations.json`、`configuration.json` | [configuration.schema.json](./metadata/configuration.schema.json) |
| `configuration-group` | 配置分组 | `configuration-groups.json` | [configuration-group.schema.json](./metadata/configuration-group.schema.json) |
| `configuration-item` | 配置项 | `.config.json` | [configuration-item.schema.json](./metadata/configuration-item.schema.json) |
| `configuration-group-item` | 配置分组 | `.config-group.json` | [configuration-group-item.schema.json](./metadata/configuration-group-item.schema.json) |

## 校验示例

以菜单资源为例，下载 [menu.schema.json](./metadata/menu.schema.json)，另存为 `menu.schema.json`。在同一目录创建 `orders.menu.json`：

```json
{
  "fullName": "sales.orders",
  "title": "订单管理",
  "url": "/orders",
  "placement": "main",
  "showMode": "tab"
}
```

安装校验依赖：

```bash
npm install --save-dev ajv
```

创建 `validate-menu.mjs`：

```js
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'

const readJson = (name) => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'))
const schema = readJson('./menu.schema.json')
const data = readJson('./orders.menu.json')
const ajv = new Ajv2020({ allErrors: true, strict: false })
const validate = ajv.compile(schema)

if (!validate(data)) {
  console.error(JSON.stringify(validate.errors, null, 2))
  process.exitCode = 1
} else {
  console.log('菜单结构校验通过')
}
```

```bash
node validate-menu.mjs
```

将 `showMode` 改为 `true` 或移除 `title`，会得到字段类型或必填项错误。结构通过后，仍需在目标应用确认 `/orders` 页面存在并配置菜单权限。

使用支持 JSON Schema 的编辑器时，也可把 Schema 关联到对应后缀。编辑器关联规则取决于所用工具，不需要为了开启提示给每份平台元数据添加 `$schema` 字段。

## title、description 与字段说明

JSON Schema 标准支持在根定义、嵌套定义和每个字段的子 Schema 上添加说明：

| 关键字 | 用途 |
| --- | --- |
| `title` | 简短名称 |
| `description` | 含义、用途、单位、取值条件和引用关系，供开发者与 AI 阅读 |
| `examples` | 示例值数组，不会作为默认值填入 |
| `$comment` | Schema 维护备注；工具可以移除，不用它承载业务语义 |

例如，业务输入的自定义 Schema 可以这样写：

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "订单审核输入",
  "description": "审核一张待处理订单时提交的数据。",
  "type": "object",
  "properties": {
    "orderId": {
      "type": "string",
      "description": "待审核订单的唯一标识。",
      "examples": ["order-001"]
    },
    "review": { "$ref": "#/$defs/review" }
  },
  "required": ["orderId", "review"],
  "$defs": {
    "review": {
      "title": "审核意见",
      "description": "记录是否同意及审核备注。",
      "type": "object",
      "properties": {
        "approved": { "type": "boolean", "description": "true 表示同意，false 表示拒绝。" },
        "comment": { "type": "string", "description": "审核备注。" }
      },
      "required": ["approved"]
    }
  }
}
```

`description` 不会自动成为必填或权限校验。实际约束由 `type`、`required`、`enum` 等关键字表达。字段支持说明的标准依据见 [title 与 description](https://json-schema.org/draft/2020-12/json-schema-validation#section-9.1) 和 [examples](https://json-schema.org/draft/2020-12/json-schema-validation#section-9.5)；维护备注见 [$comment](https://json-schema.org/draft/2020-12/json-schema-core#section-8.3)。

本栏目提供的 Schema 已在模型、嵌套定义和字段上补充说明。阅读时从根 `description` 确认用途，再按 `$ref` 查找 `$defs`；向 AI 提供 Schema 时一并提供目标平台版本和实际资源示例。

## 常用资源的格式约定

| 资源 | 编写要求 |
| --- | --- |
| 业务模型 | 默认模型 `formatVersion` 为字符串，当前使用 `"2.0"`，兼容 `"0.1"`、`"1.0"` 或省略；扩展模型类型按自身约定 |
| 审批流 | 静态定义的 `formatVersion` 和 `version` 为整数，默认 `1`；`enabled` 默认 `true`；支持 `flowDefinition` 外层包装 |
| UI Schema | 直接使用组件对象或数组，无需增加 `name/schema` 外层包装 |
| 配置项 | `defaultValue` 接受任意 JSON 值；选择单项或数组 Schema 匹配文件形态 |
| 微前端 | 类型使用 `app`、`parcels`、`library` 等标准值 |

Schema 的 `default` 只说明缺省值，普通校验不会自动填入。资源允许的扩展属性并不保证当前运行环境已有对应插件。

## 校验边界

Schema 检查静态结构，不确认引用资源是否存在，也不执行表达式、权限检查、动作或流程。通过校验后，需要将资源安装或发布到目标应用，验证实际读写、调用和权限结果。

这些文件面向平台资源编写格式。部署不同平台版本时，使用与其匹配的定义；旧格式迁移和扩展模型的专有语义以对应功能文档为准。

资源打包方式见 [元数据编写规范](../../guide/advance/authoring-metadata-conventions/)，模型职责见 [概念与设计](../../concepts/)，运行时读写见 [数据模型 API](../../api/backend/data-model/)。
