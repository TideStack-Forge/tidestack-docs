# PluginDescriptor

`PluginDescriptor` 用来描述一个数据模型插件，包括插件名和插件配置。

它最常出现在：

- `DataModelMeta.getPluginDescriptors()`
- `DataModel.withPlugins(...)`
- `TypedDataModel.withPlugins(...)`

## 先理解它是什么

`PluginDescriptor` 不是插件实现本身，而是“某个模型启用了哪个插件、插件参数是什么”的描述对象。

也就是说，它更像下面这种结构化声明：

```json
{
  "name": "tenantFilter",
  "config": {
    "field": "tenantId"
  }
}
```

真正怎么解释这个插件、运行时如何生效，取决于对应插件实现。

## 基础属性

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getName()` | `String` | 插件名 |
| `getConfig()` | `Map<String, Object>` | 插件配置；当前实现里即使未设置也会返回空 Map |

## 复制

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `deepCopy()` | `PluginDescriptor` | 深拷贝插件描述及其配置 |

## 使用建议

- 只需要临时启停模型插件时，可以把它当作一个轻量配置对象来传
- 配置对象会被深拷贝，因此适合做运行时拼装

## 常见使用方式

### 在元数据里声明

适合模型定义阶段就确定需要哪些插件。

### 在运行时临时追加

适合某次查询或某段处理里临时增强模型行为：

- `DataModel.withPlugins(...)`
- `TypedDataModel.withPlugins(...)`

这种方式更像运行时装饰，不会直接改写原始模型定义。

## 使用提醒

- `getConfig()` 即使没有配置，也会返回空 `Map`，不要把“没有配置”和 `null` 混为一谈。
- `deepCopy()` 会连带复制配置内容，适合在做运行时 patch 前保护原始描述对象。
- 如果你当前还不确定“插件到底是什么”，先回到 [DataModelMeta](../data-model-meta/) 和 [DataModel](../data-model/) 结合上下文一起看。

## 下一步看哪里

- 想看模型接口：看 [DataModel](../data-model/)
- 想看元数据对象：看 [DataModelMeta](../data-model-meta/)
