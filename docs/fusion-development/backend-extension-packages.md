---
title: 后端扩展包
sidebar_position: 7
---

# 后端扩展包

后端扩展包是由平台加载的普通 Maven JAR，用于交付业务实现、Spring Bean、SPI 和元数据。平台基座提供运行环境；扩展包通过已有模型、流程或接口被消费。

本页按工程创建、实现注册、构建交付和平台验证组织。具体能力契约见 [后端插件扩展](../guide/advance/extend-backend/)。

## 准备工程与能力契约

向 AI 提供目标平台版本、已有 Maven 工程、扩展接口、同类实现和调用样例。先明确哪些由现有模型或节点完成，哪些确实需要新增实现；约定正常、无效输入和外部依赖失败的结果。

| 包的内容 | 必要的配套文件 |
| --- | --- |
| 固定元数据资源 | 模型资源 JSON 与构建复制配置 |
| SPI 实现 | Java 实现与 `META-INF/services/<接口全名>` |
| 依赖 Spring Bean 的能力 | 自动配置及两份自动配置注册文件 |
| 带编辑器或管理入口的能力 | 对应节点、字段、页面、菜单或权限定义 |

按实际能力组合这些内容。固定字段模板可以由平台已有 Provider 读取，无需仅为放置资源再写一个 Provider。

## 1. 创建 Maven 工程

### 使用平台模板

代码仓库中提供了 `maven-archetypes/ouroboros-module-archetype` 模板。模板会生成普通 Maven `jar` 项目，并带上平台 BOM、Java 21 编译配置、常用 `provided` 依赖和依赖复制配置。

也可以在应用的 [后端扩展包管理](../low-code/development-platform-menus/backend-extension-package#生成项目) 中选择兼容模板，生成并下载源码 ZIP。生成器只创建源码，仍需在本地构建并安装 JAR。

使用 archetype 时，确认本地 Maven 能访问团队 Maven 仓库，再生成扩展项目。以下示例版本需与目标平台和仓库中可用的模板版本一致：

```bash
mvn archetype:generate \
  -DarchetypeGroupId=com.ouroboros \
  -DarchetypeArtifactId=ouroboros-module-archetype \
  -DarchetypeVersion=2.0.0-rc.1-SNAPSHOT \
  -DgroupId=com.example.tidal.extension \
  -DartifactId=example-backend-extension \
  -Dversion=1.0.0-SNAPSHOT \
  -Dpackage=com.example.tidal.extension \
  -DautoConfigClassName=ExampleBackendExtensionAutoConfiguration
```

生成后建议保留以下结构：

```text
example-backend-extension/
├── pom.xml
└── src/main/
    ├── java/com/example/tidal/extension/
    │   └── ExampleBackendExtensionAutoConfiguration.java
    ├── metadata/
    └── resources/
        └── META-INF/
            ├── spring.factories
            ├── spring/
            │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
            └── services/
```

### 核对 POM 与依赖

一个最小扩展包 `pom.xml` 通常包含这些核心配置：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example.tidal.extension</groupId>
    <artifactId>example-backend-extension</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>21</maven.compiler.release>
        <ouroboros.version>2.0.0-rc.1-SNAPSHOT</ouroboros.version>
    </properties>

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

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.ouroboros</groupId>
            <artifactId>ouroboros-util</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.ouroboros</groupId>
            <artifactId>common-all</artifactId>
            <type>pom</type>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.ouroboros</groupId>
            <artifactId>ouroboros-ability-all-core</artifactId>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

上述版本仅为示例，替换为目标环境兼容值。依赖按下面的原则处理：

| 依赖 | scope 与交付方式 |
| --- | --- |
| 平台已提供的 Spring 和潮汐栈能力 | `provided`，由目标基座提供 |
| 扩展自身代码 | 编译进当前 JAR |
| 扩展独有第三方库 | 按实际需要声明，并准备运行时依赖交付 |
| 测试框架 | `test`，不随运行产物交付 |

通过平台 BOM 管理已有依赖版本。新增第三方库时，核对基座是否已提供以及是否存在版本冲突；普通 JAR 不会自动携带这些依赖。

### Java 21 编译配置

当前平台和扩展模板都以 Java 21 为编译与运行基线。扩展项目使用下面的编译配置：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <release>21</release>
        <source>21</source>
        <target>21</target>
        <parameters>true</parameters>
    </configuration>
</plugin>
```

不要把扩展包降级为 Java 8 或 Java 17 字节码；编译 JDK、`release` 和目标平台运行时必须保持 Java 21。

## 2. 实现能力并注册

先让 AI 实现一个能够被真实模型或流程调用的最小能力，同时编写行为测试。实现点与注册契约如下：

| 能力 | 实现入口 | 配套资源 |
| --- | --- | --- |
| 字段类型 | 固定模板或 `FieldTypeDefinitionProvider` | `.field-type.json`；[字段指南](../guide/advance/extend-backend/extend-field/) |
| 表达式对象 | `ExpressionContextContributor` | 对应 SPI；[表达式指南](../guide/advance/extend-backend/extend-expression/) |
| 脚本对象 | `ScriptContextContributor` | 对应 SPI；[脚本指南](../guide/advance/extend-backend/extend-script/) |
| 逻辑流节点 | `NodeBuilder` | 对应 SPI 与 `.flow-node.json`；[节点指南](../guide/advance/extend-backend/extend-logicflow/) |

SPI 注册文件名是接口全限定名，内容是实现类全限定名，每行一个。例如：

```text
src/main/resources/META-INF/services/com.ouroboros.logicflow.nodes.NodeBuilder
```

```text
com.example.tidal.extension.logicflow.ExampleNodeBuilder
```

### 依赖 Bean 时配置自动装配

扩展包应通过 Spring Boot 自动配置接入平台，而不是要求平台应用手写扫描路径或显式创建 Bean。

创建自动配置类：

```java
package com.example.tidal.extension;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Configuration
@ComponentScan
public class ExampleBackendExtensionAutoConfiguration {
}
```

在 `src/main/resources/META-INF/spring.factories` 注册：

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.tidal.extension.ExampleBackendExtensionAutoConfiguration
```

在 `src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 注册同一个类：

```text
com.example.tidal.extension.ExampleBackendExtensionAutoConfiguration
```

当前 archetype 会同时生成这两个注册文件。新扩展包必须保留二者，并确保类名一致。

自动配置装配 Bean，SPI 让平台发现扩展实现，两者不能互相代替。扩展依赖 Bean 时，按对应专题使用已有代理或装配模式，不要求宿主额外添加包扫描。

## 3. 配套元数据并配置打包

模型资源源码放在 `src/main/metadata/`；Spring 和 SPI 注册文件放在 `src/main/resources/META-INF/`。例如：

```text
src/main/
├── java/com/example/tidal/extension/
│   └── ExampleBackendExtensionAutoConfiguration.java
├── metadata/
│   ├── Example.flow-node.json
│   ├── Example.authority.json
│   ├── Example.menu.json
│   ├── Example.ui-model.json
│   └── Example.ui-schema.json
└── resources/META-INF/
    ├── spring.factories
    ├── spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
    └── services/com.ouroboros.logicflow.nodes.NodeBuilder
```

只提供本能力实际需要的资源。声明菜单、页面和权限时，核对名称、路由、接口与调用实现之间的引用。

独立 Maven 工程不会自动继承主仓库的元数据复制执行。使用模板时保留 `copy-metadata-sources`；手工创建时，在 `build/plugins` 中配置：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-resources-plugin</artifactId>
    <version>3.3.1</version>
    <executions>
        <execution>
            <id>copy-metadata-sources</id>
            <phase>process-resources</phase>
            <goals><goal>copy-resources</goal></goals>
            <configuration>
                <outputDirectory>${project.build.outputDirectory}/META-INF/ouroboros/metadata</outputDirectory>
                <resources>
                    <resource>
                        <directory>${project.basedir}/src/main/metadata</directory>
                        <filtering>false</filtering>
                        <excludes><exclude>**/.gitkeep</exclude></excludes>
                    </resource>
                </resources>
            </configuration>
        </execution>
    </executions>
</plugin>
```

运行时由已有 Provider / Center 发现打包资源。完整后缀、固定文件名和 legacy 支持范围见 [模型资源与打包](../guide/advance/authoring-metadata-conventions/)。

## 4. 构建 JAR 与运行依赖

执行项目测试与普通 JAR 打包：

```bash
mvn clean package
```

扩展自身产物如 `target/example-backend-extension-1.0.0-SNAPSHOT.jar`。不要默认用 Spring Boot repackage 或 shade 打成可执行 JAR / fat JAR，否则可能重复打入基座类和覆盖注册资源。

### 复制并过滤第三方依赖

扩展包有独立运行依赖时，可以使用 `maven-dependency-plugin` 将运行时依赖复制到 `target/lib`：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <version>3.8.1</version>
    <executions>
        <execution>
            <id>copy-dependencies</id>
            <phase>package</phase>
            <goals>
                <goal>copy-dependencies</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.directory}/lib</outputDirectory>
                <includeScope>runtime</includeScope>
            </configuration>
        </execution>
    </executions>
</plugin>
```

开发平台会通过 Web 端口暴露当前基座运行时依赖清单。`manifestUrl` 就填这个运行清单地址：把你平时访问开发平台的地址拿过来，在后面加上 `/ouroboros/runtime-manifest.json`。

```text
http://127.0.0.1:88/ouroboros/runtime-manifest.json
```

如果是测试或正式环境，按实际域名和端口填写，例如：

```text
https://dev.example.com/ouroboros/runtime-manifest.json
```

扩展项目可以在 `copy-dependencies` 之后接入 `ouroboros-dependency-maven-plugin`，把平台基座已经提供的 jar 从交付目录中剔除：

```xml
<plugin>
    <groupId>com.ouroboros</groupId>
    <artifactId>ouroboros-dependency-maven-plugin</artifactId>
    <version>1.0.0</version>
    <executions>
        <execution>
            <id>filter-platform-provided-dependencies</id>
            <phase>package</phase>
            <goals>
                <goal>filter</goal>
            </goals>
            <configuration>
                <!-- 开发平台访问地址 + /ouroboros/runtime-manifest.json -->
                <manifestUrl>http://127.0.0.1:88/ouroboros/runtime-manifest.json</manifestUrl>
                <inputDirectory>${project.build.directory}/lib</inputDirectory>
                <outputDirectory>${project.build.directory}/extension-lib</outputDirectory>
                <reportFile>${project.build.directory}/ouroboros-dependency-filter-report.json</reportFile>
                <ignoreVersionDifferences>false</ignoreVersionDifferences>
            </configuration>
        </execution>
    </executions>
</plugin>
```

`ouroboros-dependency-maven-plugin` 使用独立版本号，不跟随平台主工程版本发布；当前推荐版本为 `1.0.0`。该插件不参与平台主工程的默认 CI/CD 构建和 deploy，只有维护插件本身时才需要单独发布。

如果使用仓库内的扩展项目模板，过滤插件已经放在 `filter-platform-provided-dependencies` profile 中；通过命令行传入 `-Douroboros.extension.manifestUrl=...` 时自动启用。不传这个参数时，只执行普通 jar 打包和 `target/lib` 依赖复制：

```bash
mvn clean package \
  -Douroboros.extension.manifestUrl=http://127.0.0.1:88/ouroboros/runtime-manifest.json
```

默认策略是精确匹配 `groupId:artifactId:version` 时剔除；如果扩展包依赖和基座清单只有 `groupId:artifactId` 相同但版本不同，插件会输出 warning，并保留扩展包自己的 jar。确认可以复用基座版本时，可以把 `ignoreVersionDifferences` 设为 `true`，这类同名异版本依赖也会被剔除。

交付时优先上传扩展 jar 和 `target/extension-lib` 中保留下来的 jar；`target/ouroboros-dependency-filter-report.json` 会记录每个 jar 的 copy/exclude 决策，便于核对哪些依赖由基座提供、哪些依赖仍需随扩展包上传。

不要默认使用 `spring-boot-maven-plugin` 重新打包为可执行 jar，也不要默认使用 shade 生成 fat jar。扩展包应保持为可被平台装载的库 jar，避免把平台已经提供的类和依赖重复打入包内。

只有实际执行过滤后才使用 `target/extension-lib` 作为交付依赖目录。未启用过滤时，核对 `target/lib` 并按目标基座依赖清单准备需要上传的 JAR。过滤报告还需人工或 AI 结合目标版本审阅，不能只根据同名异版本的 warning 判定兼容。

### 发布到私服

团队使用 Maven 私服交付时，执行：

```bash
mvn clean deploy
```

记录 Maven 坐标、兼容平台版本、第三方依赖、SPI 和资源，以及宿主是否需要更新依赖或重启。

## 5. 检查产物并在平台调用

先检查构建 JAR：

```bash
jar tf target/example-backend-extension-1.0.0-SNAPSHOT.jar
```

| 检查 | 预期结果 |
| --- | --- |
| 自动配置 | 两份注册文件存在并指向同一配置类；纯资源包按需提供 |
| SPI | 文件名、实现类和扩展接口一致 |
| 元数据 | 位于 `META-INF/ouroboros/metadata/`，名称、后缀和内容正确 |
| 依赖 | 平台已提供的基础类没有重复进入扩展包，所需外部 JAR 已准备 |
| 行为 | 测试覆盖输入、输出和失败分支 |

再按 [后端扩展包管理](../low-code/development-platform-menus/backend-extension-package) 安装到测试应用。源码组装宿主时，也可通过 Maven 依赖引入：

```xml
<dependency>
    <groupId>com.example.tidal.extension</groupId>
    <artifactId>example-backend-extension</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

确认实例加载目标版本，再从模型、页面、表达式、脚本或流程完成真实调用。验证结果应包括平台发现能力、业务输入输出、失败场景和权限。

## 本地 IDE 与线上平台联调

使用 IntelliJ IDEA 的 TideStack Develop 插件，将本地产物上传到平台测试实例并附加远程调试器。先核对应用、profile、源码与产物，再通过真实请求触发断点。具体连接、更新和结束会话的步骤见 [本地 IDE 与线上平台联调](./local-ide-and-platform-debugging)。

## 排查装配或调用失败

| 现象 | 检查顺序 |
| --- | --- |
| Bean 未加载 | 产物版本 → 两份自动配置文件 → 配置类与依赖 → 启动错误 |
| SPI 未发现 | 接口文件名 → 实现类全名 → 类是否打包 → 加载日志 |
| 字段或节点缺失 | 元数据复制 → 后缀和标识 → 开发态与运行时范围 |
| 能力加载但业务未变化 | 目标实例 → 模型或页面引用 → 实际请求与结果 |
| 安装后依赖冲突 | 基座版本 → 扩展依赖 → 过滤报告与最终上传 JAR |

让 AI 使用源码、JAR 清单、安装版本、调用输入和日志定位最先失败的环节，修复后重新构建并复验。

## 交付与后续维护

交付实现、行为测试、JAR、运行依赖及配套资源，记录实际验证和恢复步骤。环境与版本准备见 [开发平台辅助能力](./development-platform-support-capabilities)，验收见 [任务协作与交付验收](./high-low-code-collaboration)。

需要新增可管理模型及开发态 CRUD、VCS 锁定、提交、回滚和页面时，继续使用 [开发模块脚手架](./development-module-scaffold-and-maven-skeleton)。
