---
sidebar_position: 1
---

# 字段类型扩展

字段类型把底层数据类型、配置参数、输入组件和展示方式组织为可复用定义。创建业务字段前先核对已有类型；需要新的统一语义时，再新增模板或动态来源。

## 确定字段契约和来源

让 AI 读取目标版本的同类字段定义及使用模型，明确值的存储类型、空值与边界、参数默认值、编辑与只读表现。字段类型只承载可复用规则，单个业务动作的状态变化留在业务模型或流程中。

| 使用范围 | 定义位置或机制 |
| --- | --- |
| 当前应用的专属类型 | 应用工作区 `field-types/*.field-type.json` |
| 随能力包提供的固定类型 | `src/main/metadata/**/*.field-type.json`，打包后进入元数据目录 |
| 仅供开发态使用的定义 | 开发态专用 `META-INF/ouroboros/metadata/dev/*.field-type.json` |
| 依赖外部元数据或程序规则的来源 | `FieldTypeDefinitionProvider` |

固定定义优先维护 JSON。新增前核对类型名及参数名，避免与现有类型冲突。

## 1. 编写字段模板

下面保留日期类型的定义示例，展示 `dataType`、输入、展示和参数面板的关系。真实任务使用项目自己的稳定类型名。

```json
{
  "name": "日期",
  "label": "日期",
  "order": 40,
  "dataType": {
    "type": "Date"
  },
  "ui": {
    "input": {
      "type": "input-date",
      "format": "YYYY-MM-DD"
    },
    "display": {
      "type": "static-date",
      "format": "${format}"
    }
  },
  "paramsUiSchema": [
    {
      "type": "input-text",
      "name": "format",
      "label": "日期格式",
      "value": "YYYY-MM-DD"
    }
  ]
}
```

参数 `format` 同时出现在 `paramsUiSchema` 与展示模板引用中。当前实现从表单项提取默认参数，因此默认值放在相应表单项的 `value` 中。让 AI 同步核对参数名称、默认值和模板引用，避免面板可配置而运行时取不到值。

将文件放到选定来源，使用 `.field-type.json` 后缀。能力包的源码与打包约定见 [模型资源与打包](../../authoring-metadata-conventions/)。

## 2. 核对开发态与运行时可见范围

两种场景都通过 `FieldTypeCatalog` 聚合，但可用来源不同。

| 场景 | 常见来源 | 检查重点 |
| --- | --- | --- |
| 开发态 | 应用工作区、JAR 开发态定义、JAR 通用定义 | 建模时能选择类型并填写参数 |
| 运行时 | 运行目录字段定义、JAR 通用定义、自定义 Provider | 实际模型字段能够解析并使用该类型 |

只放在 `metadata/dev` 的定义不能作为运行时可用的依据。随包发布时，检查 JAR 中的通用资源；应用内定义则确认已随目标应用版本进入运行工作区。

类型名按大小写不敏感规则聚合，实际选择还受来源层级影响。出现同名定义时，先检查当前场景和来源，不通过改动另一个资源掩盖冲突。

## 3. 按需实现动态 Provider

只有固定模板不足以描述来源时，再实现 `FieldTypeDefinitionProvider`。接口包含：

```java
boolean supports(FieldTypeCatalogContext context);
List<FieldTypeDefinition> load(FieldTypeCatalogContext context);
```

`supports` 决定当前上下文是否使用该来源，`load` 返回类型定义。让 AI 一并处理定义名称、来源、目标场景及加载失败行为，再通过当前字段类型模块的 Bean 或 SPI 聚合机制接入。SPI 注册路径为：

```text
META-INF/services/com.ouroboros.fieldtype.FieldTypeDefinitionProvider
```

运行时字段模块会合并注入的 Provider 与 SPI 来源；依赖 Bean 的实现还需自动配置。安装方式见 [后端扩展包](../../../../fusion-development/backend-extension-packages)。

当前目录按上下文缓存定义，不应把 Provider 理解为每次请求都重新读取外部数据。需要更新定义时，核对目标版本的加载与刷新机制。

## 4. 用真实字段验证

1. 在开发平台选择新类型，核对参数面板和默认值。
2. 创建真实业务字段，保存后检查模型中的类型和参数。
3. 在编辑、详情和只读页面验证输入与展示。
4. 保存空值、正常值和边界值，核对实际存储及读取结果。
5. 在目标实例重复验证，确认运行时定义与开发态选择一致。

动态来源还需测试支持与不支持的上下文、外部加载失败和同名类型处理。交付类型定义、最小使用模型和实际结果。

## 排查类型未生效

| 现象 | 先检查 |
| --- | --- |
| 建模时找不到类型 | 工作区、后缀、开发态来源及加载日志 |
| 开发态可见，运行时找不到 | 是否仅放在 `metadata/dev`，应用版本或 JAR 是否已更新 |
| 参数面板正常，显示格式错误 | 参数名、默认值、模板引用和生成后的字段 |
| 得到另一份同名定义 | 大小写冲突、来源层级与实际装配 |
| 修改后仍是旧定义 | 目标实例与上下文缓存，是否完成相应更新 |

向 AI 提供定义文件、使用模型、参数、产物版本和实际结果，从模板、加载、参数编译或页面组件中定位失败位置。字段概念见 [字段定义](../../../../concepts/field-define/)。
