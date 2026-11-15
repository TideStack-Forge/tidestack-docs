---
title: 数据初始化
---

# 数据初始化

应用第一次启动时，通常需要一些可以立即使用的基础数据，例如状态、内置字典或默认记录。把这些记录写成 `.data-init.json`，随模块或应用交付，基座就会在模型刷新完成后检查并补齐缺失项。

初始化按匹配字段判断记录是否存在，已有记录保留原值。需要修正历史数据或回填新增字段时，使用 [模型变更与应用升级](../model-evolution-and-upgrade)中的迁移过程。

## 先确认运行条件

标准基座通常经由数据平台适配模块引入 `ouroboros-data-initialization-runtime`。裁剪基座或内嵌工程需要确认已装配该模块，并且存在：

- 可用的事务管理器 `PlatformTransactionManager`。
- 自适应分布式锁能力提供的 `DistributedLockManager`。
- 已加载的目标数据模型，能够通过 `DataModelCenter` 按全名取得。

不需要在 Controller、`@PostConstruct` 或自己的启动监听器中再次执行同一份初始化。默认运行链路会在模型刷新完成后触发，并统一处理锁、事务和账本。

## 为物料示例增加一条初始记录

[物料登记示例](../first-feature)的 `extras/materials.data-init.json` 包含下面的计划：

```json
{
  "id": "sample-material-catalog",
  "version": "v1",
  "blocks": [
    {
      "id": "materials",
      "targetModel": "sample.Material",
      "matchFields": ["code"],
      "records": [
        {"id": "demo-material-1", "code": "MAT-DEMO-001", "name": "示例物料"}
      ]
    }
  ]
}
```

在示例工程中执行：

```bash
cp extras/materials.data-init.json src/main/metadata/
mvn clean verify
jar tf target/material-registration-1.0.0-SNAPSHOT.jar
```

确认 JAR 中出现 `META-INF/ouroboros/metadata/materials.data-init.json`。将新包替换到测试应用并重启，登录物料登记页面，应该看到编码为 `MAT-DEMO-001` 的记录。

`Material.id` 使用调用方提供的主键，所以初始化记录也填写稳定 ID。使用其他模型时，按其主键生成策略填写，不能因为 `matchFields` 已经有编码就省略必填主键。

## 理解计划中的字段

| 字段 | 用途与填写建议 |
| --- | --- |
| `id` | 计划标识，保持稳定，便于查询同一项初始化的执行记录 |
| `version` | 本次数据资产的版本；省略时为 `default`，用于追踪，不强制覆盖旧数据 |
| `blocks` | 按目标模型或相近数据分组，至少包含一个块 |
| `blocks[].id` | 块标识，在计划内使用清楚且稳定的名称 |
| `blocks[].version` | 可选，覆盖计划版本，用于单独追踪一个块 |
| `targetModel` | 已加载的数据模型全名，本例为 `sample.Material` |
| `matchFields` | 判断记录是否存在的字段，去重后须非空；每条记录都要提供这些字段 |
| `records` | 要补齐的完整记录，遵循目标模型的必填、主键和约束规则 |

本例按 `code` 匹配。它应在当前数据集中唯一；若要在并发业务写入中也保证唯一，应在模型中增加适当的唯一约束。初始化检查本身不能代替模型约束。

## 选择交付位置

随业务模块复用的数据放在 JAR 中；针对某个应用或环境补充的数据放在应用元数据目录：

| 维护位置 | 运行时位置 |
| --- | --- |
| 扩展工程的 `src/main/metadata/**/*.data-init.json` | JAR 内 `META-INF/ouroboros/metadata/**` |
| 应用元数据目录的 `data-init/**/*.data-init.json` | `${appHome}/data-init/**` |

独立扩展工程需要保留 [元数据复制配置](../backend-extension-packages#3-配套元数据并配置打包)。JAR 打包目录与应用目录的布局不同，不要将整个 JAR 内部路径原样复制到应用目录。

运行时先读取 classpath 计划，再读取应用目录计划；同一来源中按资源名或路径排序，每份计划再按块和记录顺序执行。它没有声明式 `dependsOn` 依赖图。简单关联数据应先准备被引用记录，需要复杂跨模型协调时使用受控业务或迁移过程。

## 核对重复执行的结果

每条记录会按 `matchFields` 查询目标模型：

| 查询结果 | 执行动作 |
| --- | --- |
| 没有记录 | 插入整条初始记录 |
| 恰好一条 | 跳过，保留已有字段值 |
| 超过一条 | 该块失败，提示目标数据不唯一 |

可以在隔离应用中依次验证：

1. 首次装配，确认出现 `MAT-DEMO-001`，只出现一条。
2. 保留数据再次重启，确认没有重复记录。
3. 用正式业务更新入口修改这条记录的名称，再次重启，确认名称没有被初始值覆盖。
4. 把初始化文件的名称和版本一起修改后重新装配，确认已有记录仍保留修改后的名称。

版本用于区分数据资产和执行记录，不是“重新覆盖”的开关。删除已初始化的记录后，下次刷新仍会补齐；如果不希望它恢复，应同时调整初始化计划。

## 检查事务和执行记录

默认以块为事务边界。一个块中途失败时，该块的目标写入按事务回滚；前面已经成功的其他块，不会因此全部撤销。把一个业务整体拆成多个块之前，要确认这种提交方式符合要求。

运行时通过 `DataInitializationLedgerRecord` 模型记录执行情况，物理表为 `sys_data_initialization_ledger`。可在受控诊断工具中使用模型 API 读取，例如：

```java
var ledger = DataModelCenter.getDataModel("DataInitializationLedgerRecord")
    .orElseThrow(() -> new IllegalStateException("数据初始化账本尚未加载"));
var records = ledger.query(Map.of("limit", 20)).get();
```

结合当前日志核对计划、块、来源、版本、内容哈希、插入数、跳过数和错误。状态包括 `RUNNING`、`SUCCESS` 和 `FAILED`。账本帮助追踪执行；真正决定是否插入的仍是目标模型中的记录，不能通过删除成功账本来强制更新已有数据。

## 排查没有生效的初始化

### JAR 中有文件，为什么没有执行？

先确认新 JAR 已被当前进程加载，再检查文件是否位于 `META-INF/ouroboros/metadata/` 且使用 `.data-init.json` 后缀。随后检查初始化 runtime、锁、事务管理器和模型刷新日志。只替换文件而不重启或刷新模型，不代表新计划已进入运行链路。

### 为什么提示目标模型不存在？

核对 `targetModel` 全名、扩展模型的扫描包和数据站。文件存在不代表目标模型已注册；先让模型正常加载，再执行初始化。

### 改了名称和版本，旧记录为什么没更新？

匹配到一条记录时就会跳过。修改既有数据应由业务更新或迁移完成；不要把 `matchFields` 临时改成另一组字段来制造“缺失”，否则可能增加重复记录。

### 一个块失败后能直接重启重试吗？

先查明是重复数据、字段缺失、校验失败还是环境依赖不可用，修复后再触发。幂等匹配会跳过已存在的记录；跨块操作仍需核对前面哪些块已经提交。

## 扩展计划来源或执行方式

普通模块只需提供 JSON。确实需要从其他来源读取计划时，使用 `InitializationPlanProvider`；目标数据集、账本、锁和事务分别由 `TargetDatasetGateway`、`InitializationLedger`、`InitializationLock`、`InitializationTransaction` 扩展。

默认网关、账本、锁、事务和协调器按对应 Bean 类型提供缺省实现。额外注册一个 `InitializationPlanProvider` 会与默认文件来源共同参与，并不会自动关闭文件扫描。沿用这些入口扩展，避免再建立一套并行启动初始化器。
