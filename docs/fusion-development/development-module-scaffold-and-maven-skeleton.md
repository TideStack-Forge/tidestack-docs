---
title: 开发模块与 Maven 脚手架
sidebar_position: 8
---

# 开发模块与 Maven 脚手架

开发模块脚手架用于新增可管理、可提交、可回滚并可被 UI 使用的 `*-dev` 模块。运行时能力扩展使用后端扩展包。

## 先理解它和普通后端扩展包的区别

普通后端扩展包更偏运行时能力扩展，例如：

- 新字段
- 新表达式能力
- 新脚本上下文
- 新逻辑流节点

而开发模块脚手架解决的是开发平台里的模型管理问题，例如：

- 开发态 CRUD
- VCS 锁定、提交、回滚
- 模型变更事件
- 开发页面和菜单入口

如果你的目标是新增一个 `*-dev` 模块，通常不该从零写一套控制器和版本治理逻辑，而是优先复用现成脚手架。

## 当前平台里的脚手架核心是什么

这组能力的核心是 `ouroboros-dev-model-manage-webapi-scaffold`。

从当前实现边界看，它主要提供：

- `DevelopService<M>`
- `BaseDevelopService<M>`
- `ModelDevelopController`
- `AbstractSingleFileController`
- VCS 用户与锁定相关适配
- 开发页面片段输出

这意味着很多 `*-dev` 模块只需要补足“自己的模型规则”，而不是自己从零搭一套开发管理框架。

## 先分清两条主路线

### 路线 A：模型型开发模块

适合大多数 `*.json` 模型文件管理场景。

典型特征：

- 每个模型都有 `fullName`
- 需要列表、详情、创建、编辑、删除
- 需要 VCS 锁定、提交、回滚和变更记录

这类模块通常以 `BaseDevelopService<M> + ModelDevelopController` 为核心。

### 路线 B：单文件型开发模块

适合一个应用只维护一份配置文件的场景，例如：

- 应用级元数据
- 单文件配置页
- 初始化配置或总开关页

这类模块通常更适合走 `AbstractSingleFileController<T, F>`。

## 什么时候应该走这条路

- 需要在开发平台中管理一类文件驱动模型
- 需要 Git/VCS 锁定、提交、回滚和历史能力
- 需要模型变更事件，供其他模块联动
- 需要在开发平台中补菜单和页面入口

如果你的目标只是运行时能力扩展，而不是开发态模型管理，通常还是回到 [创建后端扩展包](./backend-extension-packages.md)。

## 一个典型的模块骨架长什么样

一个常见的 `*-dev` 模块通常会有下面这些部分：

- 模型类
- 继承 `BaseDevelopService` 的服务类
- VCS 文件检查器
- 自动配置类
- `spring.factories`
- `spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- SPI 注册文件
- `dev-menu-model` 资源
- `ui-model/dev/...` 资源

这说明它本质上是“模型管理服务 + VCS 集成 + 开发页面资源”的组合，而不只是一个 Java 包。

一个典型目录结构通常类似：

```text
my-module-dev/
├── pom.xml
└── src/main/
    ├── java/com/example/mymodule/dev/
    │   ├── model/
    │   ├── service/
    │   ├── inspector/
    │   └── MyModuleDevAutoConfiguration.java
    └── resources/META-INF/
        ├── spring.factories
        ├── spring/
        │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
        ├── services/com.ouroboros.vcs.file.inspector.VCSFileInspector
        └── ouroboros/
            ├── dev-menu-model/
            └── ui-model/dev/{appName}/
```

## Maven 模块骨架

因为这类模块通常可以按固定结构快速起一个 Maven 子模块，然后在这个骨架上补自己的模型和规则。

从当前仓库里的模式看，这套骨架至少会固定下来：

- 模块目录结构
- 关键依赖
- 自动装配注册方式
- SPI 注册方式
- 菜单与 UI 页面资源位置

也就是说，它更像“开发平台模块模板”，而不是一次性的示例代码。

## 核心组件分别负责什么

### `DevelopService<M>`

这是开发模块的统一抽象接口，覆盖的主要是：

- `create`
- `getOne`
- `update`
- `delete`
- `lock` / `unlock`
- `commit` / `rollback`
- `search`
- `getChangeLogs`

如果你的模块没有这些能力中的大部分，先停一下，再判断它是不是真的属于开发模块。

### `BaseDevelopService<M>`

这是最常用的基类。你通常至少要实现：

- `getModelFileDirectory()`
- `getModelDisplayName()`
- `getFullName(M model)`

必要时再覆盖：

- `validateModel(...)`
- `isAutoCommitWhenUpdate()`
- `getAssociatedFilesForCreate(...)`
- `getAssociatedFilesForUpdate(...)`
- `buildSearchFilter(...)`

它会帮你把文件读写、VCS 提交和模型事件先串起来。

### `ModelDevelopController`

它把开发模块统一暴露成 `/api/dev/{appName}/{moduleName}` 这套接口，常见能力包括：

- `POST /api/dev/{appName}/{moduleName}`
- `GET /api/dev/{appName}/{moduleName}/{fullName}`
- `PUT /api/dev/{appName}/{moduleName}/{fullName}`
- `DELETE /api/dev/{appName}/{moduleName}/{fullName}`
- `POST /lock` / `/commit` / `/rollback`
- `GET /change-log`

如果你已经走的是标准模型管理路线，通常不需要自己再写一整套路由。

### `AbstractSingleFileController`

适合单文件场景。你通常要实现：

- `getSingleFilePath()`
- `getInitFormData(...)`
- `getSubmitModelFromJson(...)`

它关注的是“一份文件的编辑生命周期”，不是“多个模型实例的增删改查”。

## 你通常会复用哪些关键抓手

### `BaseDevelopService`

适合大多数标准开发模块。

它会把文件持久化、VCS 锁定/提交/回滚、模型生命周期事件等标准能力先帮你接好。

### `ModelDevelopController`

适合把 `DevelopService` 统一暴露成开发平台入口。

如果你已经走 `BaseDevelopService` 路线，通常不需要自己重写一整套路由层。

### `AbstractSingleFileController`

适合单文件类型资源或更轻量的开发管理场景。

它不是所有模块都必须用，但在“单文件配置页”场景里会比完整模型管理更轻。

## 必须同时提供菜单、页面和检查器

开发模块不是只有后端服务。

### `VCSFileInspector`

它决定开发平台如何识别和展示这一类文件。少了它，文件可能在 VCS 里存在，但在开发界面的资源树中不够友好。

### `dev-menu-model`

它决定开发平台菜单里有没有你的模块入口。

### `ui-model/dev/{appName}/...`

它决定打开模块后看到什么页面，例如：

- 列表页
- 新建页
- 详情页
- 预览页

如果服务和控制器都已经写好，但菜单或 UI 资源没补齐，团队依然会认为“这个模块没做完”。

## 推荐的实现顺序

如果你要新建一个 `*-dev` 模块，通常建议按下面顺序推进：

1. 先判断这个模块是不是文件驱动模型
2. 再判断走 `BaseDevelopService` 还是更轻的单文件控制器路线
3. 搭好 Maven 模块、依赖和自动配置
4. 再补模型类、服务类、检查器和资源文件
5. 最后再把菜单、UI 和 VCS 行为联调起来

这样做比先写页面、再回头补服务骨架更稳。

## 仓库里的参考实现怎么选

当前仓库里已经给了三种复杂度参考：

- 简单：`core/ouroboros-resource/ouroboros-resource-dev`
- 中等：`core/ouroboros-logicflow/ouroboros-logicflow-dev`
- 复杂：`core/ouroboros-business-model/ouroboros-business-model-dev`

建议不要只盯着复杂模块抄。先挑与你目标复杂度最接近的参考，会更容易把边界把稳。

## 一个实用的判断原则

如果你发现自己正在手写：

- 开发态 CRUD
- 锁定与提交
- 模型文件读写
- 通用开发路由

那通常说明你应该先停一下，回头看脚手架，而不是继续重复造轮子。

## 仓库里的深度参考资料

如果你需要继续看完整模板和示例，仓库里已经有两份现成资料：

- `docs/guides/development-module-guide.md`
- `dev-module/docs/quick-reference.md`

前者更完整，后者更适合快速参考。

## 下一步看哪里

- 想先区分运行时扩展和开发模块扩展：看 [创建后端扩展包](./backend-extension-packages.md)
- 想直接进入后端详细扩展点：看 [扩展后端](../guide/advance/extend-backend/)
- 想回看协同边界：看 [高低开协同模式](./high-low-code-collaboration.md)
