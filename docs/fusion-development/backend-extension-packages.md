---
title: 创建后端扩展包
sidebar_position: 7
---

# 创建后端扩展包

后端扩展包是可安装、可装配的 Maven `jar`，用于交付 Spring Bean、SPI 和平台资源。它遵循 Spring Boot Starter 式装配，不是工具类集合。

## 什么时候应该做成后端扩展包

- 需要补新的字段、表达式、脚本上下文或逻辑流节点
- 需要把某项集成能力做成可复用运行时能力
- 需要让多个应用或多个场景共用同一套后端扩展
- 希望扩展结果可以被平台统一装配，而不是散落在业务代码里

如果只是单个业务里的临时逻辑，通常先评估配置、脚本或现成节点是否已经足够。

## 先判断你做的是哪种扩展包

### 纯资源 / 纯 SPI 扩展包

适合这类场景：

- 只提供字段模板、节点定义或其他 `META-INF/ouroboros/*` 资源
- 只注册 `ExpressionContextContributor` / `ScriptContextContributor` / `NodeBuilder` 这类 SPI
- 不需要额外 Spring Bean 和自动装配

这种包的重点是资源文件和 `META-INF/services/*`。

### Starter 风格扩展包

适合这类场景：

- 扩展能力依赖 Spring Bean
- 需要自动装配配置类
- 需要把多个 SPI、资源和 Bean 作为一个完整能力分发

这种包除了 SPI，还通常要补：

- 自动装配类
- `META-INF/spring.factories`
- `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- Maven 依赖管理
- 必要的 `META-INF/ouroboros/*` 资源

多数真正可复用的后端能力包，最后都会长成这一类。

## 先理解后端扩展包的最小形态

一个典型的后端扩展包，至少会包含下面几类东西：

- Maven 模块与 `pom.xml`
- 自动装配类
- `META-INF/spring.factories`
- `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- 按需要补充的 SPI 注册文件
- 按需要补充的 `META-INF/ouroboros/*` 资源声明

也就是说，它的关键不只是“写了一个 Bean”，而是要让平台知道：

- 启动时该怎么装配它
- 运行时该怎么发现它
- 哪些模型、资源或扩展点会消费它

一个常见骨架大致会长这样：

```text
my-capability/
├── pom.xml
└── src/main/
    ├── java/com/example/mycapability/
    │   ├── MyCapabilityAutoConfiguration.java
    │   └── ...能力实现...
    └── resources/
        └── META-INF/
            ├── spring.factories
            ├── spring/
            │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
            ├── services/
            │   ├── com.ouroboros.expression.ExpressionContextContributor
            │   ├── com.ouroboros.script.ScriptContextContributor
            │   └── com.ouroboros.logicflow.nodes.NodeBuilder
            └── ouroboros/
                ├── logic-flow-node-define/
                ├── menu-model/
                ├── ui-model/
                ├── ui-schema/
                └── authority/
```

并不是每个扩展包都要同时具备这些文件，但你做的那类能力需要什么，就必须把那一层闭环补全。

## 创建 Maven 项目

后端扩展包是普通 Maven `jar` 项目，不是独立启动应用。平台基座提供 Spring Boot、潮汐栈核心能力和运行时基础设施；扩展包只交付自己的业务代码、自动配置、SPI 实现和元数据资源。

### 使用平台 archetype

代码仓库中提供了 `maven-archetypes/ouroboros-module-archetype` 模板。模板会生成普通 Maven `jar` 项目，并带上平台 BOM、Java 21 编译配置、常用 `provided` 依赖和依赖复制配置。

平台使用者只需要确认本地 Maven 能访问团队 Maven 仓库，然后直接生成扩展项目：

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
    └── resources/
        └── META-INF/
            ├── spring.factories
            ├── spring/
            │   └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
            ├── services/
            └── ouroboros/
```

### 手工创建项目

如果不使用 archetype，至少保留以下约定：

- `packaging` 使用 `jar`
- 通过 `ouroboros-bom` 导入平台依赖版本
- 平台基座已经提供的依赖使用 `provided`
- 不打 fat jar
- 自动配置类同时注册到 `META-INF/spring.factories` 和 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- SPI 实现注册到 `META-INF/services/<接口全名>`
- 平台元数据放到 `META-INF/ouroboros/` 下

## Maven 依赖怎么配

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

### 依赖 scope 规则

| 依赖类型 | 推荐 scope | 说明 |
|---|---:|---|
| Spring Boot、Spring Framework | `provided` | 平台基座负责提供，不应打进扩展包 |
| 潮汐栈核心、公共能力、能力聚合包 | `provided` | 由目标平台版本统一控制 |
| 扩展包自己的代码 | 默认 | 编译进当前 jar |
| 扩展包独有的第三方库 | 默认或运行时部署提供 | 需要确认不会与平台已有依赖冲突 |
| 测试框架 | `test` | 只用于本项目测试 |

不要在扩展项目中重新声明平台基础依赖版本。新增第三方依赖时，优先确认平台 BOM 是否已有版本管理；如果没有，扩展包需要明确说明该依赖由扩展包独立承担。

## 自动装配和 SPI

- `spring.factories` 与 `AutoConfiguration.imports` 注册 Spring Boot 自动配置类。
- `META-INF/services/*` 注册平台在运行时发现的 SPI 实现。

它们经常同时出现，但并不等价。

例如：

- 一个字段类型资源包可能几乎不需要 Spring Bean，但需要资源路径和 `FieldTypeDefinitionProvider`
- 一个配置能力节点包可能既要自动装配拿到 `ConfigurationService`，又要注册 `NodeBuilder`

### 自动装配类

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

### SPI 注册

如果扩展包实现了平台 SPI，必须在 `META-INF/services/` 中注册。文件名是接口全限定名，文件内容是实现类全限定名，每行一个。

示例：扩展逻辑流节点构建器。

```text
src/main/resources/META-INF/services/com.ouroboros.logicflow.nodes.NodeBuilder
```

```text
com.example.tidal.extension.logicflow.ExampleNodeBuilder
```

SPI 适合提供“多来源、多实现、可追加”的扩展点。只做启动期 Bean 装配时，优先使用自动配置；不要为了单一实现额外创建 SPI。

## 常见扩展落点怎么选

### 字段扩展

适合补新的字段类型、字段模板和字段行为。

常见抓手是：

- 字段类型资源
- `FieldTypeDefinitionProvider`

### 表达式扩展

适合给 `${...}` 表达式注入新的全局变量、工具对象或上下文能力。

常见抓手是：

- `ExpressionContextContributor`
- `META-INF/services/com.ouroboros.expression.ExpressionContextContributor`

### 脚本扩展

适合给脚本运行时补新的上下文对象或工具能力。

常见抓手是：

- `ScriptContextContributor`
- `META-INF/services/com.ouroboros.script.ScriptContextContributor`

### 逻辑流扩展

适合补新的逻辑流节点，让业务开发者在可视化编排里直接用。

常见抓手是：

- `NodeBuilder`
- `META-INF/services/com.ouroboros.logicflow.nodes.NodeBuilder`
- `src/main/metadata/*.flow-node.json`

## 平台元数据放哪里

typed 模型元数据统一放在 `src/main/metadata/`，构建后进入 `META-INF/ouroboros/metadata/`。legacy UI、菜单、权限等固定资源仍放在 `src/main/resources/META-INF/ouroboros/`。扩展包只应声明自己拥有的菜单、权限、页面、配置或节点定义，不要覆盖平台内置资源。

常见资源约定包括：

| 场景 | 注册位置 |
|---|---|
| Java SPI 实现 | `META-INF/services/<接口全名>` |
| Spring Boot 自动配置 | `META-INF/spring.factories`、`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` |
| 逻辑流节点定义 | `src/main/metadata/*.flow-node.json` |
| 菜单模型 | `META-INF/ouroboros/menu-model/*.json` |
| 开发控制台菜单 | `src/main/metadata/*.dev-menu.json` |
| UI 模型 | `META-INF/ouroboros/ui-model/**/*.json` |
| UI Schema | `META-INF/ouroboros/ui-schema/**/*.json` |
| 权限定义 | `META-INF/ouroboros/authority/*.json` |
| 配置元数据 | `META-INF/ouroboros/configuration*.json` |

一个带管理页面的后端扩展通常会包含：

```text
src/main/resources/META-INF/ouroboros/
├── app-modules.json
├── authority/
│   └── exampleExtension.json
├── menu-model/
│   └── exampleExtension.json
├── ui-model/
│   └── exampleExtension.json
└── ui-schema/
    └── exampleExtension.json
```

开发控制台扩展还会使用：

```text
src/main/resources/META-INF/ouroboros/
├── dev-menu-model/
│   └── ExampleExtension.json
└── ui-model/dev/{appName}/
    └── example-extension.json
```

资源命名应稳定、语义清晰，避免使用临时名称或历史兼容名称作为正式合同。

## 打包和交付

扩展包默认打普通 jar：

```bash
mvn clean package
```

输出类似：

```text
target/example-backend-extension-1.0.0-SNAPSHOT.jar
```

如果扩展包有自己的运行时第三方依赖，可以使用 `maven-dependency-plugin` 将运行时依赖复制到 `target/lib`：

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

发布到 Maven 私服：

```bash
mvn clean deploy
```

对外交付时应同时说明：

- 兼容的平台版本
- Maven 坐标
- 是否需要额外第三方运行时依赖
- 是否包含 `META-INF/ouroboros/` 元数据
- 是否实现了 SPI，以及对应扩展点名称
- 是否需要平台应用显式添加依赖或重启

## 编译配置

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

## 一个推荐的交付顺序

1. 先明确扩展点属于字段、表达式、脚本、逻辑流还是开发模块。
2. 建一个独立 Maven 模块，先把依赖和包名结构稳定下来。
3. 写最小能力实现，例如一个 wrapper、一个 builder 或一个字段模板。
4. 补 `META-INF/services/*` 和必要的 `META-INF/ouroboros/*` 资源。
5. 如果依赖 Spring Bean，再补自动装配类，并同时维护两份 Spring Boot 自动配置注册文件。
6. 在目标运行环境安装后做最小验证。
7. 最后再补复杂参数、更多节点或更多资源。

## 本地验证

扩展包交付前至少完成以下验证：

```bash
mvn clean test
mvn clean package
```

再检查 jar 内容是否包含自动配置、SPI 和元数据：

```bash
jar tf target/example-backend-extension-1.0.0-SNAPSHOT.jar | grep 'META-INF'
```

重点确认：

- `META-INF/spring.factories` 存在且配置类名称正确
- `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 存在，且指向同一个自动配置类
- 所有 SPI 实现都已在 `META-INF/services/` 注册
- `META-INF/ouroboros/` 下的 JSON 资源路径符合平台约定
- jar 中没有误打入平台基础依赖类
- 单元测试覆盖扩展包的核心行为和资源装载契约

集成到平台应用验证时，在目标平台应用中添加依赖：

```xml
<dependency>
    <groupId>com.example.tidal.extension</groupId>
    <artifactId>example-backend-extension</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

启动后检查自动配置日志、Spring Bean、SPI 行为、菜单/权限/UI 元数据是否生效。

## Spring Bean 未加载

按顺序检查：

- 没有 `META-INF/spring.factories`
- 没有 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`
- `EnableAutoConfiguration` 没配对
- 打包或合并资源时，其他 Starter 覆盖了当前扩展包的注册文件

其他高频问题：

- SPI 文件路径正确，但里面写错了实现类全限定名。
- 字段模板、节点资源等放错了 `META-INF/ouroboros/*` 路径。
- 扩展包已经安装，但实际运行的应用并没有引用或启用对应能力。
- 后端扩展已生效，但开发平台侧没有相应 UI 入口，团队仍然觉得“不可用”。
- 把扩展包打成 fat jar，导致平台基础依赖重复、版本冲突或 SPI 资源覆盖。

## 排查顺序

1. 确认扩展包已经安装到当前运行环境。
2. 确认两份 Spring Boot 自动配置文件指向同一个配置类。
3. 确认需要的 SPI 文件存在，且实现类全限定名正确。
4. 确认资源位于正确的 `META-INF` 目录。
5. 确认页面、模型、脚本、流程或配置实际引用了该扩展能力。

## 和开发模块脚手架的区别

后端扩展包主要解决的是“运行时能力怎么扩展”。

如果你要做的是开发平台里的 `*-dev` 模块，例如模型管理、VCS 提交、锁定、开发态 CRUD 和片段页面，那更适合看开发模块脚手架，而不是普通运行时扩展包。

一个简单判断方式是：

- 你要补的是“运行时能力” -> 看这页
- 你要补的是“开发平台里可管理的一类模型” -> 看脚手架页

## 推荐阅读顺序

1. 先看 [扩展后端](../guide/advance/extend-backend/)
2. 再按能力类型进入 [扩展字段](../guide/advance/extend-backend/extend-field/)、[扩展表达式](../guide/advance/extend-backend/extend-expression/)、[扩展脚本](../guide/advance/extend-backend/extend-script/)、[扩展逻辑流](../guide/advance/extend-backend/extend-logicflow/)
3. 遇到装配问题时，再回看 [后端 FAQ](../faq/backend/)

## 下一步看哪里

- 想继续看开发平台模块骨架：看 [开发模块与 Maven 脚手架](./development-module-scaffold-and-maven-skeleton)
- 想先判断是否真的需要写代码：看 [何时用低代码，何时写代码](./when-to-use-code)
- 想直接进入具体扩展点：看 [扩展后端](../guide/advance/extend-backend/)
