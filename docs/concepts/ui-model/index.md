---
sidebar_position: 8
title: UI 模型
---

# UI 模型

UI 模型定义页面入口及其实现方式。它把路由、标题和页面实现从具体的 UI Schema 或微前端代码中分离出来，是页面装配和替换的稳定边界。

## 作用

- 定义用户可以访问的页面路径和页面标题。
- 指定页面由标准页面、UI Schema、微前端或其他 UI provider 实现。
- 让同一业务入口可以在不修改业务模型的情况下替换前端实现。
- 为菜单、权限、页面调用和前端扩展提供统一入口标识。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `path` | 页面路径 | 页面在应用中的稳定路由地址。 |
| `type` | 实现类型 | 区分内建页面、UI Schema、微前端等实现方式。 |
| `title` | 页面标题 | 页面标签、导航或浏览器标题使用的显示名称。 |
| `icon` | 页面图标 | 与菜单或页面入口关联的图标。 |
| `description` | 页面说明 | 解释页面用途和适用场景。 |

## 与其他模型的关系

- [业务模型](../business-model/) 可以投射标准 UI 模型；UI 模型也可以独立定义。
- [UI Schema](../ui-schema/) 描述结构化页面内容，[微前端模型](../micro-web-model/) 提供独立前端实现。
- [菜单模型](../menu-model/) 把 UI 模型暴露为导航，[权限模型](../authority-model/) 决定用户是否可以访问。
- 页面通常通过 [WebAPI 模型](../webapi-model/) 获取数据和提交业务动作。

## UI 模型与页面实现

UI 模型只负责“入口和实现方式”，不负责组件树、请求参数或业务处理。页面需要结构化配置时使用 UI Schema，需要复杂交互或独立发布时使用微前端；两者都不应绕过菜单、权限和 API 契约。

## 使用入口与契约

- 操作入口：[UI 模型菜单](../../low-code/development-platform-menus/ui-model) · [页面交付方案](../../low-code/page-delivery-with-dynamic-forms-and-ui-schema)
- Schema：`ui-model.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
