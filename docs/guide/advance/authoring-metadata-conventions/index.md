---
title: 模型资源与打包
sidebar_position: 4
---

# 模型资源与打包

模块自带的声明式元数据（菜单、权限、UI 模型、审批流、错误码等）统一放在模块的 `src/main/metadata/` 目录中，由构建期复制进 `META-INF/ouroboros/metadata/`，运行时继续通过 Provider + Center 链路发现。

本页规定源码位置、类型后缀、打包路径和发现机制。无论手工维护还是让 AI 生成，元数据都应进入这条链路，并与目标版本的模型定义及资源引用保持一致。

## 生成或修改前准备

向 AI 提供目标模块、平台版本、元数据类型、同模块现有样例，以及被引用资源的真实名称。先检查目标类型已有的 Provider 或读取者，再确定文件位置；不要仅根据展示名称推测后缀和 JSON 字段。

- 修改已有能力：说明哪些资源标识必须保留，以及需要同步调整的菜单、权限、页面、流程或接口引用。
- 新增资源：确定唯一名、业务归属及关联对象，避免生成与已有资源冲突的 key。
- 核对结构：从 [JSON Schema](../../../reference/jsonschema/) 查找适用定义，同时核对目标版本。公开 Schema 的覆盖范围不能代替实际消费方契约。

JSON 结构和引用的通用检查步骤见 [任务执行与验收](../../../ai/task-recipes#编写或修改元数据)。以下目录约定用于模块随包交付的模型资源源码；平台中编辑模型的保存方式应遵循相应开发模块。

## 目录与后缀

模型资源源码只使用 JSON（`style.css` 是固定例外），文件名以短后缀区分类型，目录按业务组织，不按类型再分桶：

| 类型 | 源码路径 | JAR 内路径 |
| --- | --- | --- |
| 权限 | `src/main/metadata/**/*.authority.json` | `META-INF/ouroboros/metadata/**/*.authority.json` |
| 菜单 | `src/main/metadata/**/*.menu.json` | `META-INF/ouroboros/metadata/**/*.menu.json` |
| 开发菜单 | `src/main/metadata/**/*.dev-menu.json` | `META-INF/ouroboros/metadata/**/*.dev-menu.json` |
| UI 模型 | `src/main/metadata/**/*.ui-model.json` | `META-INF/ouroboros/metadata/**/*.ui-model.json` |
| UI Schema | `src/main/metadata/**/*.ui-schema.json` | `META-INF/ouroboros/metadata/**/*.ui-schema.json` |
| 业务模型 | `src/main/metadata/**/*.business.json` | `META-INF/ouroboros/metadata/**/*.business.json` |
| 逻辑流模型 | `src/main/metadata/**/*.logicflow.json` | `META-INF/ouroboros/metadata/**/*.logicflow.json` |
| 字段类型 | `src/main/metadata/**/*.field-type.json` | `META-INF/ouroboros/metadata/**/*.field-type.json` |
| RPC 模型 | `src/main/metadata/**/*.rpc.json` | `META-INF/ouroboros/metadata/**/*.rpc.json` |
| RPC 认证 | `src/main/metadata/**/*.rpc.auth.json` | `META-INF/ouroboros/metadata/**/*.rpc.auth.json` |
| WebAPI 模型 | `src/main/metadata/**/*.webapi.json` | `META-INF/ouroboros/metadata/**/*.webapi.json` |
| 审批流 | `src/main/metadata/**/*.workflow.json` | `META-INF/ouroboros/metadata/**/*.workflow.json` |
| 通知模板 | `src/main/metadata/**/*.notification.json` | `META-INF/ouroboros/metadata/**/*.notification.json` |
| 业务日志模板 | `src/main/metadata/**/*.business-log.json` | `META-INF/ouroboros/metadata/**/*.business-log.json` |
| 错误码 | `src/main/metadata/error-codes.error.json` | `META-INF/ouroboros/metadata/error-codes.error.json` |
| 数据初始化 | `src/main/metadata/**/*.data-init.json` | `META-INF/ouroboros/metadata/**/*.data-init.json` |
| 组件定义 | `src/main/metadata/**/*.widget.json` | `META-INF/ouroboros/metadata/**/*.widget.json` |
| 逻辑流节点 | `src/main/metadata/**/*.flow-node.json` | `META-INF/ouroboros/metadata/**/*.flow-node.json` |
| 微前端 | `src/main/metadata/**/*.micro-web.json` | `META-INF/ouroboros/metadata/**/*.micro-web.json` |
| 岗位定义 | `src/main/metadata/**/*.position.json` | `META-INF/ouroboros/metadata/**/*.position.json` |
| 配置项 | `src/main/metadata/**/*.config.json` | `META-INF/ouroboros/metadata/**/*.config.json` |
| 配置分组 | `src/main/metadata/**/*.config-group.json` | `META-INF/ouroboros/metadata/**/*.config-group.json` |

固定文件与固定目录单独处理：

| 类型 | 源码路径 | JAR 内路径 |
| --- | --- | --- |
| 应用元数据 | `src/main/metadata/app.metadata.json` | `META-INF/ouroboros/metadata/app.metadata.json` |
| 模块树 diff | `src/main/metadata/modules.diff.json` | `META-INF/ouroboros/metadata/modules.diff.json` |
| 应用模块 | `src/main/metadata/app-modules.json` | `META-INF/ouroboros/metadata/app-modules.json` |
| 配置元数据 | `src/main/metadata/configurations.json` | `META-INF/ouroboros/metadata/configurations.json` |
| 自定义样式 | `src/main/metadata/style.css` | `META-INF/ouroboros/metadata/style.css` |

仓库中的真实例子：

```text
core/ouroboros-error-code/ouroboros-error-code-runtime/src/main/metadata/error-codes.error.json
ability/ouroboros-approval-workflow-external-integration/ouroboros-approval-workflow-external-integration-runtime/src/main/metadata/configurations.json
ability/ouroboros-widget/ouroboros-widget-common/src/main/metadata/BarChartWidget.widget.json
core/ouroboros-approval-workflow/ouroboros-approval-workflow-web/src/main/metadata/micro-web/approvalWorkflow.micro-web.json
```

几条容易踩的规则：

- 短后缀不机械追加 `-model` / `-template` / `-definition`：业务模型用 `.business.json`，通知模板用 `.notification.json`，组件定义用 `.widget.json`。
- 开发态页面资源放在 `src/main/metadata/dev/{appName}/...`，与运行态资源分离。
- 固定文件按来源优先级合并：`app.metadata.json` 对象合并、`modules.diff.json` 合并全部 diff 条目、`style.css` 直接拼接文本。
- 部分类型保留 legacy 读取（旧目录的 `*.json` 仍可读）；已经破坏性升级的类型只读新短后缀文件，例如字段类型、错误码和审批流。

## 构建期如何打包

Maven 默认只把 `src/main/resources` 当作 main resources，`src/main/metadata` 不会自动进入 jar。根 `pom.xml` 通过 `maven-resources-plugin` 增加了一个继承执行 `copy-metadata-sources`：

- 绑定阶段：`process-resources`；
- 复制方向：`${project.basedir}/src/main/metadata` → `${project.build.outputDirectory}/META-INF/ouroboros/metadata`；
- 过滤：不做变量替换（`filtering=false`），只排除 `.gitkeep`。

继承本仓库根 POM 的模块只需要把文件放进 `src/main/metadata`，不需要在模块 `pom.xml` 里重复声明资源目录。独立扩展工程应核对自己的父 POM 与构建配置，按 [后端扩展包](../../../fusion-development/backend-extension-packages)确保同样的打包结果。

验证方式：

```bash
mvn -pl core/ouroboros-resource/ouroboros-resource-dev -am process-resources
```

完成后应能在 `target/classes/META-INF/ouroboros/metadata/` 下看到对应文件。

## 运行时如何被发现

构建产物进入 classpath 后，由 provider 声明类型后缀、legacy/typed 资源计划和合并策略，由 `common-metadata` 的 typed catalog 统一执行候选资源读取、解析、空 key 诊断与重复 key 合并；classpath/JAR 资源走 `ClasspathMetadataSource`，appHome/文件系统资源走 `FileSystemMetadataSource`。

新增元数据类型的正确做法是先确认已有读取者（provider、controller 或 runtime center），再决定后缀与命名空间；只有当消费方语义明显不同、已有目录无法承载时，才新增 `META-INF/ouroboros/<namespace>/`。

不要绕过这条链路：

- 不要新增运行时 loader 直接读取 `src/main/metadata`（运行时只认打包后的 `META-INF/ouroboros/metadata`）。
- 不要把元数据放进 `src/main/resources` 冒充普通资源。
- 不要让同一语义在多个目录重复声明，也不要为单个模块私有的临时用途新造顶级命名空间。

## 交付检查

| 层次 | 检查结果 |
| --- | --- |
| 源码 | JSON 可解析，文件名和后缀正确，目标类型结构符合版本要求 |
| 引用 | 唯一名无冲突，菜单、权限、页面、接口和流程等引用指向真实资源 |
| 构建 | `target/classes` 与最终 JAR 中包含预期资源，路径与内容一致 |
| 发现 | 测试实例加载了目标产物，Provider / Center 可以发现对应定义 |
| 使用 | 从实际业务入口执行行为，权限、页面或流程结果符合需求 |

例如新增菜单时，不能止步于 `.menu.json` 通过校验；还要确认目标页面存在、路由可达、授权正确且普通业务账号可使用。资源未生效时，将源码路径、JAR 内路径、实际加载版本和诊断日志一并反馈，先定位断点，再修改生成结果。

## 权威来源

- 源码目录、后缀与 IDE 模板：仓库内 `docs/guides/metadata-source-editor-guide.md`。
- `META-INF` 命名空间与消费方：仓库内 `docs/design-docs/cross-cutting/meta-inf-resource-conventions.md`。
