---
title: 内嵌基座模式
---

# 内嵌基座模式

内嵌基座模式由应用自己的 Spring Boot 程序启动，把潮汐栈的运行能力作为 Maven 依赖装配进来。业务代码、声明式模型和基座能力共同组成一个应用，团队可以按产品需要选择模块，并维护自己的运行包或镜像。

业务工程可以将共享领域定义和业务实现分成多个 Maven 模块，由独立的启动模块装配业务模块与基座依赖。这里的“内嵌”指依赖与运行能力的装配，应用无需复制基座源码。

## 准备版本与运行环境

确定目标基座版本及其配套的 JDK、Spring Boot 和数据库。当前主线工程使用 Java 21；引入旧项目时，应先核对其依赖基线。

根 POM 导入 `com.ouroboros:ouroboros-bom`，用同一个 `ouroboros.version` 管理基座依赖。BOM 负责版本约束，真正需要运行的模块仍要在 `dependencies` 中声明。

工程还需要可访问的 Maven 仓库、本地数据库连接，以及所选能力使用的外部服务。例如，引入消息能力后，要同时准备它使用的消息队列连接。不要把某个示例项目的排除项和数据库驱动原样复制到新应用。

## 1. 划分业务模块与启动模块

可以从下面的结构开始，名称按项目调整：

```text
myapp/
├── pom.xml
├── myapp-domain/             # 跨模块共享的实体、枚举和请求结果类型
├── myapp-orders/             # 一项业务能力及其模型、页面和权限资源
├── myapp-analysis/           # 另一项业务能力
├── myapp-webapp/             # 启动入口、运行依赖和应用装配
├── frontends/                # 微前端等前端工程
└── config/
    ├── application-local.example.yml
    └── application-local.yml
```

业务模块依赖共享领域模块；启动模块依赖所需业务模块。只有确实被多项业务共用的定义才进入领域模块，页面、菜单和该业务专用配置留在所属业务模块。

业务模块产出普通库 JAR。Spring Boot 的可执行程序打包只放在启动模块，避免把每个业务模块都重新打包成可执行 JAR。

用官方 archetype 创建业务模块后，移除扩展交付用的依赖过滤 profile；内嵌应用的启动模块需要完整运行依赖。Java 类型化模型需要生成查询字段时，则可保留并启用 `typed-data-model` profile，见 [类型化数据模型编译](../development-tools#类型化数据模型编译)。

## 2. 在启动模块装配基座

根 POM 中的 BOM 导入片段如下，`ouroboros.version` 使用团队已确认并可解析的目标版本：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.ouroboros</groupId>
            <artifactId>ouroboros-bom</artifactId>
            <version>${ouroboros.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

启动模块按需声明运行依赖：

| 依赖 | 装配用途 |
| --- | --- |
| `ouroboros-ability-all-runtime` | 聚合基座主要运行能力；需要裁剪时再逐项选择相应运行模块 |
| `ouroboros-approval-workflow-runtime` | 需要审批流时装配审批运行时 |
| `ouroboros-approval-workflow-business-model-form` | 审批流需要关联业务模型表单时接入 |
| `ui-schema-in-db-management-runtime` | 需要 UI Schema 实时管理时接入 |
| `document-management-autoconfigure` | 需要文档管理时接入 |
| Spring Boot Web、数据库驱动及相应基础设施依赖 | 提供 HTTP、数据连接等运行环境 |

这些是装配入口，不是一份适用于所有应用的最小依赖清单。可以对照同版本的 `platform/ouroboros-mothership/pom.xml` 核对完整运行入口，再按实际业务裁剪。顶层公共应用模块由启动模块显式引入。

启动模块需要实际携带这些运行依赖。业务模块为编译引用而使用的 `provided` 依赖，不会自动成为启动程序的运行依赖。

## 3. 保留普通 Spring Boot 启动入口

```java
package com.example.myapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

基座通过各模块的自动配置和 SPI 装配。启动类扫描自己的应用包即可，无需把 `com.ouroboros` 加入全包扫描。

独立业务模块提供自己的自动配置入口，扫描该模块的 Service、Controller 等组件，并在以下位置登记：

```text
src/main/resources/META-INF/spring.factories
src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

使用 SPI 的实现还要登记到 `META-INF/services/<接口全限定名>`。具体注册示例见 [后端扩展包的实现注册](../backend-extension-packages#2-实现能力并注册)。

## 4. 让模型资源随业务模块交付

模块自带的菜单、权限、页面和业务模型放在所属模块的 `src/main/metadata/`：

```text
myapp-orders/src/main/
├── java/com/example/myapp/orders/
├── metadata/
│   ├── app-modules.json
│   └── orders/
│       ├── index.menu.json
│       ├── index.authority.json
│       └── index.ui-model.json
└── resources/META-INF/
```

独立工程需要在自己的父 POM 或模块 POM 中配置资源复制。构建后，这些文件应位于 `target/classes/META-INF/ouroboros/metadata/`，并进入业务 JAR。导入 BOM 不会继承潮汐栈根工程的资源复制执行，完整配置见 [模型资源与打包](../../guide/advance/authoring-metadata-conventions/)。

业务 Service 可以调用数据模型、业务动作和逻辑流。权限、动态配置与组织架构继续使用基座能力，具体接口见 [后端开发](../backend-development/)。

## 5. 配置并运行本地后端

把本机连接信息放在不入库的 `config/application-local.yml`，保留一份不含实际凭据的 example 文件供团队参考。先配置数据库和基座运行需要的服务，再安排应用元数据目录、上传文件及运行工作目录。

应用元数据目录由 `ouroboros.metadata.path` 指定。例如，在本地配置中使用：

```yaml
ouroboros:
  metadata:
    path: ${APP_METADATA_HOME}
```

`APP_METADATA_HOME` 指向该实例使用的实际目录。JAR 内的资源通过 classpath 加载；应用目录用于该实例的应用定义与定制，具体文件布局见 [标准基座扩展模式的资源归属](./standard-runtime#划分资源归属)。

先安装本工程模块，再运行启动模块：

```bash
mvn clean install
mvn -pl myapp-webapp spring-boot:run \
  -Dspring-boot.run.profiles=local \
  -Dspring-boot.run.arguments=--spring.config.additional-location=optional:file:../config/
```

第二条命令的配置路径以启动模块的运行目录为基准。IDE 中把工作目录、profile 和配置位置保存为共享运行配置，本机的连接值继续留在私有文件中。

如果使用 `-am spring-boot:run` 从 reactor 启动，应在父工程默认跳过 Boot run，只在启动模块取消跳过，避免 Maven 逐个尝试启动普通业务 JAR。

## 6. 接入前端并检查完整业务

本地后端就绪后，可以用 `ouroboros-web` 前端基座代理到该后端，也可以启动前端基座源码进行联调。需要调试微前端时，再将对应资源路径代理到它的开发服务器。命令和参数见 [开发工具中的前端联调](../development-tools#前端联调工具)。

至少选一个实际业务入口，确认页面、接口、模型读写和权限共同生效。仅看到 Spring Boot 启动成功，还不能判断模型已经加载或用户能够访问页面。本地断点、IDE 启动参数和前端接入步骤见 [内嵌基座调试](../embedded-runtime-debugging)。

## 打包与升级

团队交付自己的完整应用运行包。可以采用带依赖的可执行 JAR，也可以把启动 JAR、第三方依赖、基座依赖和业务依赖分层装配进镜像。使用外置依赖的启动包时，交付与启动脚本必须同时包含对应的依赖目录。

升级时先统一 BOM 与基座模块版本，再核对 Spring Boot、JDK、资源合同及配置变化。完成业务模块测试后，在真实装配的应用中检查模型发现、数据库变更、权限和核心业务。前端基座或微前端随本次升级变化时，一并记录其版本。

## 常见问题

### 引入 BOM 后，为什么基座能力没有出现？

BOM 只管理版本。检查启动模块是否声明了相应运行依赖，以及它的自动配置、SPI 和所需外部服务是否齐全。

### 本地 IDE 能找到业务模型，打成 JAR 后却没有了？

检查 `src/main/metadata` 的复制配置，以及最终 JAR 内的 `META-INF/ouroboros/metadata/`。随后确认部署的是本次构建产物。

### 这个模式还能使用开发平台吗？

可以继续利用模型编辑、资源定义和扩展开发能力，但需要明确平台编辑的应用目录如何进入本项目的构建和交付。IDEA 的 Deploy & Debug 面向平台管理的测试实例；自己的启动程序可直接使用本地调试器。
