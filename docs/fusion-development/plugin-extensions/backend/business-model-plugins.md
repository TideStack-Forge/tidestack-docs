---
title: 业务模型插件
---

# 业务模型插件

业务模型功能插件将可选的编辑配置、投影和运行能力打包，供多个业务模型复用。只为一个模型编写动作实现时，使用 [业务模型](../../backend-development/business-model)，无需先创建功能插件。

## 1. 定义插件标识和适用类型

实现 `com.ouroboros.businessmodel.plugin.BusinessModelFeaturePlugin`：

| 方法 | 需要提供的内容 |
| --- | --- |
| `getPluginId()` | 唯一稳定的插件标识 |
| `getDisplayName()` | 用户可识别的名称 |
| `getSupportedModelTypes()` | 至少一个非空的业务模型类型名 |
| `getMetadata()` | 版本、说明、作者和依赖插件 |
| `getEditorContributor()` | 可选编辑器配置片段 |
| `getProjector()` | 可选投影行为 |
| `prepare(meta, model)` | 准备功能声明及后续投影计划 |

`PluginMetadata` 通过构造器接收 version、description、author、requiredPlugins。依赖填写插件 ID，不能仅依靠类路径中的偶然加载顺序。

## 2. 实现编辑配置与投影

1. 先定义模型启用此功能需要哪些配置、默认值和约束。
2. 通过 `PluginEditorSchemaContributor` 将配置纳入已有编辑器；界面选择只是配置，不代替运行时实现。
3. 通过 `PluginProjector.project(BusinessModelMeta, ModelProjectionPipelineContext<?>)` 贡献对应投影。
4. 需要提前声明行为时使用 prepare 阶段，保持声明与后续投影分离。

`prepare` 不应立即投影整个 bundle，也不应解析另一个尚未准备好的模型行为。默认实现会将 projector 留待投影阶段调用。参考内置 `SoftDeleteFeaturePlugin`、`ArchiveDeleteFeaturePlugin`、`Scd2HistoryFeaturePlugin` 的分工。

## 3. 注册与模型启用

注册文件：

```text
META-INF/services/com.ouroboros.businessmodel.plugin.BusinessModelFeaturePlugin
```

写入插件实现类名。模型通过扩展属性 `enabledPlugins`，或嵌套 `plugins.enabled` 指定启用的插件 ID。沿用目标模型当前配置格式，不同时维护两份冲突列表。

插件注册中心检查模型类型与必要依赖。不要把“JAR 已安装”当作所有模型自动启用插件，也不要将编辑器插件与业务运行插件混为一类。

## 验证

检查编辑器配置保存和重新打开，观察最终投影出的数据模型、动作、页面或其他资源。覆盖未启用、不支持类型、缺少依赖、组合插件与重复投影，再从真实业务入口验证行为。升级涉及已有资源名称或结构变化时，评估迁移与回退。
