# 物料登记示例

标准基座扩展模式的普通库 JAR，无独立启动程序。配套手册：融合开发 → 开始开发 → 完成第一个融合开发功能。

## 构建

使用 Java 21 和 Maven。先配置团队的 Maven 仓库，再将 `ouroboros.version` 改为目标基座的配套依赖版本：

```bash
mvn clean verify -Douroboros.version=<配套依赖版本>
```

POM 中的默认版本是本仓库源码的依赖基线，不能据此推断目标镜像版本。本例不新增第三方运行依赖；平台 API 均为 provided，测试依赖均为 test。目标基座需要提供 typed runtime、SQL 数据站、菜单、UI Schema 和权限运行模块。

`target/material-registration-1.0.0-SNAPSHOT.jar` 放入应用的 `metadata/extend/`，保留应用已有定义和配置，重启测试实例。不要用整个示例目录覆盖应用元数据目录。

## 测试

`mvn verify` 运行 Service 单元测试、H2 数据模型与事务集成测试，以及保留已有数据的字段升级测试。H2 设置 `DATABASE_TO_LOWER=TRUE`，使迁移建表与带引号查询的标识符大小写一致。H2 不能代替目标数据库的迁移演练。

真实权限验证见手册“自动化测试”。准备三个普通账号（只读、登记、未授权），从登录请求取得各自有效的 Authorization 头，设置 `MATERIAL_TEST_URL`、`MATERIAL_TEST_ALLOW_WRITE=yes`、`MATERIAL_READER_AUTHORIZATION`、`MATERIAL_WRITER_AUTHORIZATION`、`MATERIAL_DENIED_AUTHORIZATION`，运行：

```bash
python3 scripts/check-permissions.py
```

脚本会在隔离实例中新增一条 TEST 开头的物料，结束时输出待清理编码。不要对生产实例运行。

## 页面与授权

页面 `/sample/materials`，接口 `/api/custom/materials`。给只读角色授予 `sample.Material.read`；登记角色同时授予 `sample.Material.read` 和 `sample.Material.create`。切换账号后验证菜单和直接接口。

演示页最多显示 100 条，未实现分页、行级数据权限、编码唯一约束、编辑或删除。登记按钮的显示不是后端授权依据；只读账号提交登记请求必须被拒绝。

## 可选初始化

只有需要演示初始数据时，才把 `extras/materials.data-init.json` 复制到 `src/main/metadata/` 后重新构建。它按 `code` 补齐缺失记录，已存在记录不更新。目标基座需要装配数据初始化运行模块。
