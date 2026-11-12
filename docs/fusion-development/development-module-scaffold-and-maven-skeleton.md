---
title: 开发模块脚手架
sidebar_position: 8
---

# 开发模块脚手架

需要在开发平台中管理一类文件驱动模型，并提供创建、编辑、锁定、提交、回滚和页面入口时，使用 `*-dev` 开发模块。只增加运行时字段、表达式、脚本或节点能力时，使用 [后端扩展包](./backend-extension-packages)。

开发模块复用 `ouroboros-dev-model-manage-webapi-scaffold` 的服务、控制器和 VCS 生命周期，在这些入口补充模型规则、检查器和页面资源。

## 明确模型管理契约

任务需要给出模型标识、文件格式、存储目录、校验规则、关联文件以及保存和提交的关系。还应提供一个现有开发模块供 AI 读取，说明新模块的菜单、页面和权限入口。

让 AI 先画清服务、文件、VCS 与页面的引用关系，再按脚手架生成实现和测试。模型业务规则由任务明确，通用的锁定、提交和回滚沿用已有生命周期。

## 选择模型管理方式

| 场景 | 主要组件 | 管理范围 |
| --- | --- | --- |
| 同类模型有多个实例，按 `fullName` 标识 | `BaseDevelopService<M>` + `ModelDevelopController` | 列表、详情、增删改、锁定、提交、回滚和变更记录 |
| 每个应用只维护一份配置文件 | `AbstractSingleFileController<T, F>` | 单文件表单和编辑生命周期 |

先明确模型标识、存储目录和文件后缀，以及保存时是否立即提交。由模型规则决定服务实现，保留脚手架提供的文件读写、锁定和版本管理机制。

## Maven 模块骨架

模块包含 Java 实现、自动配置与 SPI 注册，以及开发菜单和页面元数据。新建元数据按 [模型资源与打包](../guide/advance/authoring-metadata-conventions/) 组织：

```text
my-module-dev/
├── pom.xml
└── src/main/
    ├── java/com/example/mymodule/dev/
    │   ├── model/
    │   ├── service/
    │   ├── inspector/
    │   └── MyModuleDevAutoConfiguration.java
    ├── metadata/
    │   ├── MyModule.dev-menu.json
    │   └── dev/{appName}/my-module/
    │       ├── list.ui-model.json
    │       └── list.ui-schema.json
    └── resources/META-INF/
        ├── spring.factories
        ├── spring/
        │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
        └── services/com.ouroboros.vcs.file.inspector.VCSFileInspector
```

`pom.xml` 使用与目标平台一致的版本和脚手架依赖。Maven 构建需把 `src/main/metadata` 复制到 `META-INF/ouroboros/metadata`；仓库内模块继承根 POM 的复制执行，独立工程按模型资源打包约定配置资源复制。

## 实现模型型开发模块

### 1. 实现模型服务

`DevelopService<M>` 定义创建、查询、更新、删除、锁定、提交、回滚、搜索和变更记录等能力。常规文件模型继承 `BaseDevelopService<M>`，实现：

- `getModelFileDirectory()`：模型文件目录。
- `getModelDisplayName()`：模型显示名。
- `getFullName(M model)`：模型唯一标识。

按模型需要覆盖 `getModelFileExtension()`、`validateModel(...)`、`isAutoCommitWhenUpdate()`、`getAssociatedFilesForCreate(...)`、`getAssociatedFilesForUpdate(...)` 或 `buildSearchFilter(...)`。关联文件应纳入同一 VCS 操作，保持提交和回滚一致。

将服务注册为 Spring Bean，并使用 `@DevelopModule("my-module")` 声明模块名。`ModelDevelopController` 根据该注解发现服务，统一提供 `/api/dev/{appName}/{moduleName}` 下的模型管理接口。

### 2. 接入 VCS 检查器

实现 `VCSFileInspector`，让开发平台识别这类文件并展示模型信息；在 `META-INF/services/com.ouroboros.vcs.file.inspector.VCSFileInspector` 中注册实现类全限定名。

检查器使用的文件目录、后缀和标识规则需要与模型服务一致。

### 3. 装配菜单与页面

通过自动配置装配服务和必要的 Bean，并维护 `spring.factories` 与 `AutoConfiguration.imports`。开发菜单引用正确的页面，页面调用对应模块的标准管理接口。

开发菜单使用 `.dev-menu.json`；列表、编辑和详情页面使用 `.ui-model.json` 与 `.ui-schema.json`，放在 `src/main/metadata/dev/{appName}/...` 下。运行时由平台元数据发现链路加载。

## 实现单文件型开发模块

继承 `AbstractSingleFileController<T, F>`，实现文件与表单之间的转换：

- `getSingleFilePath()`：应用内的配置文件路径。
- `getInitFormData(...)`：把文件转换为表单数据。
- `getSubmitModelFromJson(...)`：把提交内容转换为模型。

沿用该控制器的编辑、锁定和提交生命周期，再补对应菜单与页面。

## 验证开发生命周期

测试应从模型规则延伸到文件及关联资源，再验证页面与 VCS 操作。AI 生成的菜单和服务都存在，并不能证明它们指向同一模块；需要通过下面的实际操作确认。

1. 启动开发平台，确认菜单可见、页面能打开，服务被标准路由发现。
2. 创建一个模型，核对文件路径、内容和模型标识。
3. 锁定并修改，确认其他用户的编辑行为符合锁定规则。
4. 提交后查看变更记录，确认模型及关联资源属于同一次变更。
5. 再次修改并回滚，确认文件内容与锁定状态恢复。
6. 删除模型，检查关联文件处理，以及需要消费模型事件的模块是否收到预期事件。

单文件场景按同样原则验证读取、编辑、提交与回滚。单元测试覆盖模型校验和文件规则，集成验证覆盖服务、VCS、菜单及页面之间的协作。

## 选择参考实现

| 模块 | 适合参考的内容 |
| --- | --- |
| `core/ouroboros-resource/ouroboros-resource-dev` | 模型文件、关联资源与检查器 |
| `core/ouroboros-logicflow/ouroboros-logicflow-dev` | 逻辑流模型管理与编辑页面 |
| `core/ouroboros-business-model/ouroboros-business-model-dev` | 较复杂的模型规则和资源联动 |

在平台源码仓库中，完整开发指南见 `docs/guides/development-module-guide.md`，速查见 `dev-module/docs/quick-reference.md`。
