---
title: 自动化测试
---

# 自动化测试

融合开发的测试要同时检查业务行为和平台接入：输入是否正确处理，模型是否真正读写，失败是否回滚，普通账号是否受到权限约束。只看到页面打开或 Maven 打包成功，还不能判断这些结果。

本页使用 [物料登记示例](./first-feature)的完整工程。解压后即可运行本地测试；真实权限测试再连接已装配该扩展的隔离基座。

## 先运行已有测试

在示例工程目录执行：

```bash
mvn clean verify -Douroboros.version=<目标基座配套的依赖版本>
```

测试报告位于 `target/surefire-reports/`。当前工程包含 8 个测试：

| 测试类 | 检查行为 | 运行环境 |
| --- | --- | --- |
| `MaterialServiceTest` | 去除空白、必填、长度、存储失败传播 | JUnit + Mockito，无数据库 |
| `MaterialDataIntegrationTest` | 真实模型写入和读取、后续失败回滚、失败 `Try` 引发回滚 | H2 + SQL 数据站 + Spring 事务 |
| `MaterialMigrationTest` | 有旧数据时新增可选字段，旧值保留，新字段为空且可以更新 | H2 + SQL 迁移服务 |

本地测试不会连接开发平台或生产数据库。示例每次测试使用独立的内存库，不能据此判断某个线上实例已经安装成功。

## 为业务规则写单元测试

单元测试直接创建 `MaterialService`，只替换其数据模型依赖。这样能确认错误输入在写入前被拒绝，数据层失败会继续向外传播。

下面的测试可以放入 `MaterialServiceTest`；相关类型均在下载工程中：

```java
@Test
void propagatesStorageFailure() {
  var failure = new IllegalStateException("测试用存储失败");
  when(materials.insert(any(Material.class))).thenReturn(Try.failure(failure));

  assertSame(failure, assertThrows(IllegalStateException.class,
      () -> service.create("MAT-001", "物料")));
}
```

这个测试关注调用方能否收到原失败。若实现改成 `getOrElse(null)` 或捕获后返回成功，它就会失败。

新增规则时，先列出能区分正确与错误实现的输入。例如增加编码格式限制，应测试合法编码、非法字符和边界长度；增加唯一约束，则需要在真实数据模型上测试重复写入，单靠 Mock 不能证明数据库约束生效。

只运行这一层：

```bash
mvn test -Dtest=MaterialServiceTest
```

## 用真实数据模型验证持久化与事务

`MaterialDataIntegrationTest` 扫描示例自己的 `@Model`，通过 `SqlDataStation` 建表，再用 `BaseTypedDataModel` 包装真实模型。它没有用一个内存 Map 模拟平台的数据行为。

测试数据库的关键设置如下：

```java
var dataSource = new JdbcDataSource();
dataSource.setURL("jdbc:h2:mem:material_" + UUID.randomUUID()
    + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1");
dataSource.setUser("sa");

var meta = TypedModelMetaHelper.scanModelMate("com.example.material.model")
    .get("sample.Material");
var station = new SqlDataStation(
    "default", dataSource, List.of(meta), MigrationStrategy.AUTO, "H2");
var migration = station.migrate();
assertTrue(migration.isRight(), () -> migration.getLeft().getMessage());
```

`DATABASE_TO_LOWER=TRUE` 使 H2 建表与带引号查询使用一致的标识符大小写。`MODE=MySQL` 仅用于本地测试兼容，不能替代 MySQL 的方言、索引、锁和 DDL 验证。

示例用 Spring 上下文为 `MaterialService` 创建事务代理，并让事务管理器与数据站共享同一个 `DataSource`。其中一个测试在外层事务中先登记，再触发错误输入，最后查询记录数为零：

```java
@Test
void rollsBackEarlierWriteWhenLaterWorkFails() {
  assertThrows(BusinessException.class, () -> transaction.executeWithoutResult(status -> {
    service.create("MAT-001", "第一条物料");
    service.create("MAT-002", " ");
  }));
  assertEquals(0L, materials.count(Map.of()).get());
}
```

另一项测试在同一事务中重复插入主键，让实际写入返回失败，再通过 `.get()` 传播。它用于检查“前面已写入、后面存储失败”时，前一条记录是否也被回滚。

按功能扩充集成测试时，还要加入关联、分页、插件行为，以及当前模型使用的唯一性和删除规则。测试替身适合隔离远端服务，不能替代本次要验证的数据约束。

```bash
mvn test -Dtest=MaterialDataIntegrationTest,MaterialMigrationTest
```

## 在真实基座验证权限

### 准备三个普通账号

将示例装配进独立测试应用，配置下面的角色。三个账号都应处于启用状态，未授权账号也必须能正常登录。

| 账号 | 应授予的示例权限 |
| --- | --- |
| 只读账号 | `sample.Material.read` |
| 登记账号 | `sample.Material.read`、`sample.Material.create` |
| 未授权账号 | 两项均不授予 |

不要使用管理员替代登记账号。管理员通过的请求，无法证明角色授权配置正确。

分别登录三个账号，从浏览器开发者工具的网络面板取得访问当前应用 API 时使用的 `Authorization` 请求头。复制完整头值，例如 `Bearer …`，不要把登录密码当成令牌。角色调整后重新登录或按目标认证方式刷新令牌，避免仍在使用旧授权状态。

### 设置地址与令牌

`MATERIAL_TEST_URL` 指向基座的应用访问地址，不是开发平台的管理 API。包含 context path 的部署要保留该前缀；请求最终应到达 `/api/custom/materials`。

在 Bash 或 zsh 中设置变量。以下交互输入不会把令牌回显到终端：

```bash
export MATERIAL_TEST_URL=http://127.0.0.1:<基座端口>
export MATERIAL_TEST_ALLOW_WRITE=yes

read -rs MATERIAL_READER_AUTHORIZATION
export MATERIAL_READER_AUTHORIZATION
read -rs MATERIAL_WRITER_AUTHORIZATION
export MATERIAL_WRITER_AUTHORIZATION
read -rs MATERIAL_DENIED_AUTHORIZATION
export MATERIAL_DENIED_AUTHORIZATION

python3 scripts/check-permissions.py
```

执行每个 `read` 后粘贴对应账号的完整头值并回车。CI 中从受保护的凭据变量注入，不要把令牌写进源码、命令历史或测试报告。

脚本会实际发送 HTTP 请求，检查未登录查询被拒绝、未授权查询被拒绝、只读查询成功、只读登记被拒绝、登记账号写入成功，以及列表响应结构正确。它同时核对 HTTP 状态和平台业务码，不会把返回登录 HTML、404 或跳转页面当成权限测试通过。

成功后会留下一个 `TEST-` 开头的物料，并输出其编码，供测试结束后清理。只在允许写入的隔离环境运行；本例没有删除接口，不为测试清理新增匿名删除入口。

### 单独的 Controller 测试能证明什么

独立 MockMvc 或直接调用 Controller，可以验证 JSON 绑定、参数和返回格式。省略真实认证与授权过滤链时，即使方法带有 `@Authority`，这类测试也不能证明权限受控。

本页选择对真实基座发请求，因此能够覆盖路由、认证、权限定义和角色授权。还需要检查行级数据权限时，应进一步准备同角色不同主体的账号和不同归属的数据，比较列表、单条读取、分页总数和返回字段。

## 将测试接入交付流程

提交业务修改时运行单元和集成测试；装配测试应用后再执行 HTTP 权限检查和一次页面登记。涉及结构变化时，另用目标数据库的旧版本数据副本运行迁移演练，步骤见 [模型变更与应用升级](./model-evolution-and-upgrade)。

失败记录应包含测试名称、输入、预期、实际响应及对应日志；不记录完整令牌和密码。权限错误先排查账号、角色、权限资源和目标实例，事务错误先核对代理调用、事务管理器及数据源，避免通过关闭鉴权或吞掉异常使测试变绿。
