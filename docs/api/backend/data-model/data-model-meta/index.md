# DataModelMeta

`DataModelMeta` 是数据模型的元数据定义对象，描述了模型名、字段列表、主键、迁移策略、插件和扩展属性等内容。

如果说 `DataModel` 更像“运行时可执行模型”，那 `DataModelMeta` 更像“这张模型蓝图本身长什么样”。

## 基础标识

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getFormatVersion()` | `String` | 格式版本 |
| `getSource()` | `String` | 元数据来源 |
| `getDataStation()` | `String` | 模型所属数据站名称 |
| `getNamespace()` | `String` | 命名空间 |
| `getName()` | `String` | 模型名 |
| `getFullName()` | `String` | 完整模型名 |
| `getLabel()` | `String` | 展示标题 |
| `getDescription()` | `String` | 模型说明 |
| `getRawName()` | `String` | 原始名称 |

## 结构定义

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getMigrationStrategy()` | `MigrationStrategy` | 当前迁移策略 |
| `getFields()` | `List<DataModelFieldMeta>` | 字段元数据列表 |
| `getPrimaryKeys()` | `List<String>` | 主键字段名列表 |
| `getPrimaryKeyGenerator()` | `String` | 主键生成器名称 |
| `getPluginDescriptors()` | `List<PluginDescriptor>` | 模型插件描述列表 |

## 这组字段怎么理解

- `namespace + name` 共同决定 `getFullName()`
- `dataStation` 决定模型属于哪个数据站
- `migrationStrategy` 决定结构变更如何迁移
- `fields`、`primaryKeys`、`primaryKeyGenerator` 一起定义模型结构和主键行为
- `pluginDescriptors` 用来声明模型启用的插件及其配置

如果你在做的是运行时数据读写，而不是看模型定义，通常应该转到 [DataModel](../data-model/)。

## 扩展属性

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getExtraProps()` | `Map<String, Object>` | 扩展属性集合 |
| `getExtraProp(String propName)` | `Optional<Object>` | 读取单个扩展属性 |
| `getExtraProp(Class<T>, String)` | `Optional<T>` | 按类型读取扩展属性 |

当前实现通过 `@JsonAnyGetter` / `@JsonAnySetter` 暴露扩展属性，所以很多非标准属性会直接铺在元数据对象外层。

## 可变与复制

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `addPluginDescriptor(...)` | `void` | 追加插件描述 |
| `removePluginDescriptor(String pluginName)` | `void` | 删除插件描述 |
| `deepCopy()` | `DataModelMeta` | 深拷贝元数据对象 |

`deepCopy()` 会连带复制字段、主键、插件描述和扩展属性，适合做运行时 patch 或装饰前的保护性复制。

## 常见使用方式

### 做建模检查

适合在开发态或启动期检查：

- 字段是否齐全
- 主键是否正确
- 插件声明是否完整

### 做运行时装饰

适合在真正构建 `DataModel` 前，对元数据做保护性复制和补丁处理。

### 生成其他结构

比如动态页面、动态表单、开发平台界面等，都可能会先消费 `DataModelMeta` 和 `DataModelFieldMeta`。

## 使用提醒

- `getFullName()` 是由 `namespace` 和 `name` 组合出来的，不是独立存储字段。
- 扩展属性通过 `@JsonAnyGetter` / `@JsonAnySetter` 平铺在对象外层，读取时不要只盯着固定字段。
- 如果你要的是“字段默认值在当前上下文下算出来的结果”，那已经超出元数据层了，应该看 [DataModelField](../data-model-field/)。

## 下一步看哪里

- 想看运行时模型接口：看 [DataModel](../data-model/)
- 想看字段元数据：看 [DataModelFieldMeta](../data-model-field-meta/)
- 想看插件描述对象：看 [PluginDescriptor](../plugin-descriptor/)
