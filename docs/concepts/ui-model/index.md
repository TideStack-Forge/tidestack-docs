---
sidebar_position: 8
title: UI 模型
---

# UI 模型

UI 模型定义前端页面的路由以及采用哪种方式实现页面。菜单和链接通过路径找到页面，前端再根据路由类型加载 UI Schema、微前端或已注册的内部页面。路由保持稳定时，页面内容可以独立调整。

## 路由怎样找到页面内容

页面入口和页面内容使用不同标识。`path` 是浏览器访问的路由，`schemaId` 是 Schema 页面的内容标识；省略 `schemaId` 时，路由服务默认使用 `path` 查找内容。

例如，资料设置页面的路由是 `/settings/account`，但复用 `/settings/profile` 这一份 UI Schema：

```json
{
  "path": "/settings/account",
  "type": "amis",
  "title": "资料设置",
  "icon": "fa fa-user",
  "schemaId": "/settings/profile"
}
```

这里 `amis` 是当前 Schema 页面使用的协议类型值，页面由 PrismUI 渲染；编写元数据时应保留这个类型值。页面内容应另行定义为对应的 UI Schema，菜单的目标地址则指向 `/settings/account`。

## 页面实现类型

### Schema 页面

`type: "amis"` 表示按 `schemaId` 加载 UI Schema。也可以在 UI 模型的 `schema` 属性中提供内嵌 Schema，由对应的 Schema 提供者读取。独立 Schema 适合复用和单独维护；内嵌方式适合随单个路由一起交付的内容。

### 微前端页面

`type: "micro"` 表示由微前端实现。开发定义可以通过 `microWebName` 引用已有微前端，加载时解析其入口并填入 `entry`；直接提供入口的定义则使用 `entry`。

```json
{
  "path": "/analysis/overview",
  "type": "micro",
  "title": "分析总览",
  "microWebName": "analysis"
}
```

这个例子要求先存在名为 `analysis` 的微前端定义。若引用无法解析且没有有效 `entry`，路由虽然可以存在，前端仍无法加载实际页面。

### 内部与扩展页面

平台还使用 `internal`、`qb` 等路由类型，由相应前端实现消费。新增类型需要已有的渲染器或正式扩展配合；只在元数据中填写一个新类型名称不会自动获得页面实现。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `path` | 页面路径 | 应用中识别、装配和覆盖页面的稳定路由。 |
| `type` | 实现类型 | `amis` 使用 Schema，`micro` 使用微前端；其他类型由对应渲染器支持。 |
| `title` | 页面标题 | 用于标签页、导航等显示场景。 |
| `icon` | 页面图标 | 用于页面入口的视觉标识。 |
| `description` | 页面说明 | 解释页面用途；由扩展属性承载。 |
| `schemaId` | 页面内容标识 | Schema 页面的内容引用，默认使用路由路径。 |
| `schema` | 内嵌页面定义 | Schema 页面使用的页面内容，由相应 provider 读取。 |
| `microWebName` | 微前端名称 | 低代码定义引用的微前端，加载时解析为入口。 |
| `entry` | 微前端入口 | `micro` 路由实际交给前端加载的入口地址。 |
| `fullName` | 开发管理全名 | 低代码管理对象从路径派生的名称，不单独保存。 |
| `extraProps` | 扩展属性 | 保存该实现类型约定的附加属性；JSON 按属性名展开。 |


## 页面入口、导航和访问控制

UI 模型汇总为前端路由表，业务模型也可以向其中投影标准页面入口。菜单模型引用路由并提供导航位置；没有菜单的页面仍可从按钮或链接打开。权限模型中的页面关联用于描述页面访问，接口访问和数据权限还要分别受控。

调整页面标题时修改 `title`。调整菜单名称时修改菜单或模块编排。需要替换页面实现时，应保留入口路径并核对原页面的参数约定、接口调用和权限关联，避免入口相同但调用行为不兼容。

## 常见问题

### 页面路由存在，为什么内容加载失败？

Schema 页面检查 `schemaId` 是否能找到内容；微前端页面检查 `microWebName` 是否解析成功、`entry` 是否可访问。路由注册成功只说明入口存在。

### 新建 UI 模型后会自动出现在导航里吗？

不会。还需要菜单引用该路径，并进入模块编排和当前用户可见的导航。

### UI 模型的 `fullName` 要手动配置吗？

低代码管理对象会从路径计算点分全名，用于开发管理；实际页面仍由 `path` 标识。不要把它当成另一条需要独立维护的路由。

## 继续阅读

- [UI Schema 模型](../ui-schema/)：页面结构、数据和交互。
- [微前端模型](../micro-web-model/)：独立前端资源的交付。
- [菜单模型](../menu-model/)：页面如何成为导航入口。
- [UI 模型管理](../../low-code/development-platform-menus/ui-model)：创建与维护页面入口。
- [JSON Schema 参考](../../reference/jsonschema/)：`ui-model.schema.json`。
