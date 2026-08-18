---
sidebar_position: 1
---

# 扩展字段

扩展字段适用于平台已有字段类型不足以表达业务语义时。它解决的是“沉淀新的字段类型”，而不是给某一个模型临时打补丁。

## 什么时候应该扩展字段

- 多个数据模型或业务模型都需要复用同一类字段语义
- 除了存储类型外，还需要统一默认值、校验规则或展示约定
- 希望业务开发人员在建模时直接选择一个标准字段类型，而不是重复配置

如果需求只影响单个模型、单个表单或单条流程，通常先考虑模型字段配置、表达式、脚本或逻辑流，而不是新增字段类型。

## 常见实现抓手

- 应用内字段类型：开发态会聚合应用工作区中的 `field-types/*.field-type.json` 定义，适合沉淀应用专属字段类型。
- 能力包内置字段：通用能力可以随 JAR 一起提供 `src/main/metadata/*.field-type.json` 定义，供多个应用复用。
- 代码级字段来源：当字段定义需要动态生成或接入外部来源时，可以扩展 `FieldTypeDefinitionProvider`，最终由 `FieldTypeCatalog` 统一聚合。

## 先分清开发态和运行时字段来源

字段扩展最容易混淆的一点，就是“开发平台里能看到”和“运行时真正可用”不是同一条加载链路。

### 开发态

开发平台里，字段列表由 `FieldTypeCatalog` 聚合，开发态常见来源包括：

1. 当前应用工作区里的 `field-types/*.field-type.json`
2. JAR 内开发态专用 `META-INF/ouroboros/metadata/dev/*.field-type.json`
3. JAR 内通用 `META-INF/ouroboros/metadata/*.field-type.json`

这意味着你可以先在应用工作区沉淀字段定义，不必一开始就打成运行时能力包。

### 运行时

运行时真正用于字段解析的是 `FieldTypeCatalog`。当前可确认的常见来源有：

- 运行目录 `field-types/*.field-type.json`
- `META-INF/ouroboros/metadata/*.field-type.json`
- `FieldTypeDefinitionProvider` 自定义实现

如果一个字段只放进了 `metadata/dev`，开发平台可能看得到，但运行时并不会自动加载。

## 一个字段扩展的最小落地路径

### 路径 A：静态模板字段

适合大多数新字段类型。

1. 新增一个 JSON 字段模板。
2. 根据落点放到应用工作区 `field-types/`，或 JAR 工程的 `src/main/metadata/`。
3. 在建模界面确认该字段已出现。
4. 用它创建一个真实字段，验证生成页面、校验和存储行为。

一个最小字段定义通常会同时描述：

- 字段标识和显示名
- 底层数据类型
- 输入组件和展示组件
- 参数 UI Schema
- 参数默认值

示例结构：

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

当前实现会基于 `paramsUiSchema` 提取默认参数，所以参数默认值应直接放在表单项配置里。

### 路径 B：动态字段来源

当字段定义需要按环境、外部系统或代码规则动态生成时，再考虑实现：

- `FieldTypeDefinitionProvider`

这条路更适合“字段模板不是固定 JSON 文件”的场景，例如：

- 字段列表来自外部元数据平台
- 字段参数需要运行时计算
- 开发态和运行时需要不同的字段可见范围

## 什么时候只用 JSON，什么时候写 Provider

| 场景 | 更推荐的方式 |
| ---- | ---- |
| 字段定义固定，只是想补一个可复用类型 | 直接写 JSON 模板 |
| 字段定义依赖外部元数据或动态规则 | `FieldTypeDefinitionProvider` |
| 只想给当前应用临时补几个字段 | 应用工作区 `field-types/*.field-type.json` |
| 想把字段随能力包一起分发给多个应用 | `src/main/metadata/*.field-type.json` |

## 设计字段类型前先判断

- 这个字段类型的业务语义是否足够稳定，值得长期复用
- 哪些参数应该开放给建模人员配置，哪些应该固化在模板里
- 字段层只负责通用能力，不要把只属于某个业务流程的规则塞进字段类型

## 验证清单

做完字段扩展后，至少建议检查：

1. 开发平台字段选择器里能否看到该字段。
2. 字段参数面板能否正常渲染。
3. 基于该字段生成的页面组件是否符合预期。
4. 保存数据时底层类型、校验和默认值是否正确。
5. 如果字段通过能力包提供，目标运行环境是否已经安装这个包。

## 常见坑

- 只补了 `metadata/dev/*.field-type.json`，结果开发态可见、运行时不可用。
- 字段 `name` 和现有字段重名，被大小写不敏感的聚合逻辑覆盖。
- `paramsUiSchema` 里的字段名和模板里引用的参数不一致，导致参数面板能显示但模板解析不到值。
- 把只属于单个页面的规则放进字段模板，导致字段类型难以复用。

## 建议阅读顺序

1. 先看 [字段定义](../../../../concepts/field-define/)，明确字段类型和具体字段实例的区别。
2. 再结合 [业务模型教程](../../../tutorial/business-model/) 看业务开发者如何消费字段能力。
3. 需要判断它是否值得做成平台扩展时，回看 [高低开协同模式](../../../../fusion-development/high-low-code-collaboration/)。
