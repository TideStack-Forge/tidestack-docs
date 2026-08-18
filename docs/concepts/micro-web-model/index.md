---
sidebar_position: 10
title: 微前端模型
---

# 微前端模型

微前端模型描述一个可以被平台页面加载的独立前端应用。它解决的是页面实现的交付和加载，不是业务对象或导航权限本身。

## 作用

- 为复杂交互、独立构建或独立发布的页面提供前端实现资源。
- 描述微前端包的名称、类型、入口和静态资源路径。
- 让 [UI 模型](../ui-model/) 可以在不改变业务数据模型的前提下切换页面实现。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `name` | 应用标识 | 微前端资源的稳定名称。 |
| `type` | 接入类型 | 区分加载器或微前端运行方式。 |
| `entry` | 入口地址 | 浏览器加载微前端的入口资源或地址。 |
| `publicPath` | 静态资源基路径 | 解决 JS、CSS 和图片等资源的相对加载问题。 |
| `packageName` | 包名 | 关联已安装的前端包或平台组件资源。 |

## 与其他模型的关系

- [UI 模型](../ui-model/) 管理路由和页面入口，微前端模型提供其中一种实现方式。
- [菜单模型](../menu-model/) 负责把入口呈现为导航，[权限模型](../authority-model/) 负责访问控制。
- 微前端页面通常调用 [WebAPI 模型](../webapi-model/) 暴露的接口，并围绕 [业务模型](../business-model/) 展示和操作数据。
- 微前端适合复杂交互；标准 CRUD 和结构化页面优先使用 UI Schema。

## 使用边界

只有在标准组件或 UI Schema 无法表达交互、页面需要独立生命周期或必须接入专用前端框架时才使用微前端。不要用微前端替代模型、菜单和权限体系。

## 使用入口与契约

- 操作入口：[微前端应用](../../guide/advance/extend-frontend/micro-app/) · [微前端菜单](../../low-code/development-platform-menus/micro-frontend)
- Schema：`micro-web.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
