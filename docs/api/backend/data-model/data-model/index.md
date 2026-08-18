# DataModel

`DataModel` 是平台里最核心的运行时数据访问接口。它把“一个模型能读什么、怎么查、怎么增删改、有哪些字段和插件”统一收口到一个对象上。

## 先理解它的风格

`DataModel` 当前有两个很重要的特征：

1. 数据读写方法普遍返回 `io.vavr.control.Try`
2. 接口同时承载元数据访问和运行时 CRUD 能力

这意味着你拿到一个 `DataModel` 之后，既能读模型定义，也能直接查数据。

## 基础标识与元数据

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getFormatVersion()` | `String` | 格式版本 |
| `getSource()` | `String` | 模型来源 |
| `getNamespace()` | `String` | 命名空间 |
| `getName()` | `String` | 模型名 |
| `getFullName()` | `String` | 完整模型名，通常是 `namespace.name` |
| `getLabel()` | `String` | 模型标题 |
| `getDescription()` | `String` | 模型描述 |
| `getRawName()` | `String` | 底层原始名称，通常更接近物理表名 |
| `getMigrationStrategy()` | `MigrationStrategy` | 当前迁移策略 |
| `getExtraProps()` | `Map<String, Object>` | 扩展属性 |
| `getExtraProp(String name)` | `Optional<Object>` | 读取单个扩展属性 |

## 字段与主键

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getFields()` | `List<DataModelField>` | 获取全部字段 |
| `getField(String name)` | `Optional<DataModelField>` | 按名称取字段 |
| `getPrimaryKeys()` | `List<DataModelField>` | 获取主键字段列表 |
| `getPrimaryKeyGenerator()` | `PrimaryKeyGenerator<?>` | 获取主键生成器 |

## 运行时基础依赖

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `getAdapter()` | `DataAdapter` | 当前模型使用的数据适配器 |
| `getDataStation()` | `DataStation<?>` | 当前模型所属数据站 |

## 写入相关

| 方法族 | 返回值类型 | 说明 |
| ------ | ---------- | ---- |
| `insert(Map<String, Object> data)` | `Try<Record>` | 插入单条记录 |
| `insertOrUpdate(Map<String, Object> data)` | `Try<Record>` | 按主键做插入或更新 |
| `batchInsert(...)` | `Try<RecordList>` | 批量插入 |
| `batchInsertOrUpdate(...)` | `Try<RecordList>` | 批量插入或更新 |
| `update(id / ids / where, data)` | `Try<Long>` | 更新记录 |
| `delete(id / ids / where)` | `Try<Long>` | 删除记录 |

## 查询相关

| 方法族 | 返回值类型 | 说明 |
| ------ | ---------- | ---- |
| `count(Map<String, Object> where)` | `Try<Long>` | 统计数量 |
| `get(Object id)` | `Try<Record>` | 按主键读取单条 |
| `get(Object id, Map<String, Object> statement)` | `Try<Record>` | 按主键读取并附加查询语句 |
| `query(List<?> ids)` | `Try<RecordList>` | 按 ID 列表查询 |
| `query(Map<String, Object> statement)` | `Try<RecordList>` | 按完整 DSL 查询 |
| `query(select, where)` 等重载 | `Try<RecordList>` | 便捷查询重载 |

如果你要写复杂过滤、排序、分页或关联查询，下一步通常要继续看 [查询 DSL](../../data-query-dsl/)。

## 插件切换

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `withPlugins(...)` | `DataModel` | 追加模型插件 |
| `withoutPlugins(pluginNames)` | `DataModel` | 去掉指定插件 |
| `withoutPlugins()` | `DataModel` | 去掉全部插件 |
| `hasPlugin(String name)` | `boolean` | 是否启用指定插件 |

这组方法更适合运行时临时装配插件行为，而不是修改模型定义本身。

## 使用建议

- 只要你需要同时读元数据和读写数据，优先先看 `DataModel`
- 需要强类型对象映射时，继续看 [TypedDataModel](../typed-data-model/)
- 需要按名称拿模型时，继续看 [DataModelCenter](../data-model-center/)

## 下一步看哪里

- 想看字段对象：看 [DataModelField](../data-model-field/)
- 想看元数据对象：看 [DataModelMeta](../data-model-meta/)
- 想看脚本里怎么按名称拿模型：看 [脚本上下文](../../script-context/)
