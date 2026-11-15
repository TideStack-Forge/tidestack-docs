---
title: 开发工具
---

# 开发工具

潮汐栈的开发工具覆盖工程生成、元数据编辑、依赖打包和联调。准备新工程时，先选好 [工程模式](./project-modes/)，再按任务选择工具；已有工程可以直接接入其中一项。

## 工具与使用入口

| 工具 | 可以完成的工作 | 适用范围与入口 |
| --- | --- | --- |
| TideStack Develop for IntelliJ IDEA | 创建和可视化编辑元数据，绑定开发平台，部署扩展并连接远程调试 | 本地模型编辑；平台测试实例的 Java 联调 |
| TideStack Develop for VS Code | 创建和可视化编辑元数据，维护项目与平台的绑定配置 | 本地模型编辑；当前未实现部署与远程调试 |
| JSON Schema | 为元数据提供类型提示和结构校验 | IDE、脚本及 AI 生成结果；见 [JSON Schema](../reference/jsonschema/) |
| Maven Archetype | 创建普通后端模块，生成自动配置、依赖和资源打包起点 | `com.ouroboros:ouroboros-module-archetype`；见 [后端扩展包](./backend-extension-packages#使用平台模板) |
| 开发平台项目模板 | 生成后端扩展、微前端、布局、登录页和组件库等源码工程 | 在对应功能的“生成项目”入口选择当前可用模板 |
| 依赖过滤 Maven 插件 | 根据基座运行清单筛掉重复依赖，生成交付目录和报告 | `com.ouroboros:ouroboros-dependency-maven-plugin` |
| 类型化模型编译 | 从 Java `@Model` 类生成 `*Meta` 查询类型和字段 | `maven-compiler-plugin` 接入 `ouroboros-data-typed-meta-processor`；两种工程模式均可使用 |
| 本地前端源码启动脚本 | 将前端基座源码连接到指定后端 | 同时修改宿主前端，或调试前端基座行为 |
| `ouroboros-web` 启动脚本 | 用前端基座镜像代理本地后端及微前端开发服务器 | 后端与业务前端联调，无需构建宿主源码 |
| TideStack Skills | 引导 AI 定义资源、实现业务入口、开发扩展和准备联调 | 已有 AI 工具中的开发辅助；见 [用 AI 完成功能开发](./ai-assisted-development) |

项目模板生成源码后，仍需核对版本、构建和安装；生成成功不等于应用已经具备相应功能。IDE 插件也应使用与项目元数据版本匹配的安装包。

## IDE 元数据编辑

### 安装与选择能力

IntelliJ IDEA 使用 TideStack Develop 插件 ZIP，通过 **Settings / Plugins / Install Plugin from Disk** 安装；VS Code 使用 VSIX，通过扩展视图的 **Install from VSIX** 安装。已有团队分发渠道时，从该渠道取得配套版本。

当前插件源码的运行要求是 IntelliJ IDEA 2023.1 或更高版本、VS Code 1.90 或更高版本。插件自身的运行要求与业务项目的 JDK 要求分别核对。

两端都支持业务模型、菜单、权限、UI 模型、UI Schema、逻辑流及其他已注册 JSON 元数据类型。IDEA 使用“可视化编辑”页签；VS Code 可通过 **Open With** 选择可视化编辑器，并在源码与图形化编辑之间切换。

### 新建与保存模型

1. 在 IDE 中打开目标工程，找到负责该业务的模块。
2. IDEA 在 Project 视图选择 **New / 创建 TideStack 模型**；VS Code 使用 **TideStack Metadata: New File**，或在目录右键菜单中选择对应模型类型。
3. 选择路径并填写模板字段。模块自带的模型通常放在 `src/main/metadata/`，使用所选类型的后缀。
4. 在可视化编辑器维护配置；需要查看完整 JSON 时切回源码编辑器。
5. 使用 IDE 的正常保存操作写入文件，再执行工程的资源打包和验证。

可视化编辑修改的是当前文档。保存本地文件不会自动将资源同步到开发平台；模块资源还要经过构建并进入目标运行环境。

固定集合文件也有专用模板。例如 JAR 自带配置项使用 `configurations.json` 数组，配置分组使用 `configuration-groups.json` 数组。`.config.json` 和 `.config-group.json` 的单项编辑能力适用于对应应用目录文件，不能据此推断 JAR Provider 会读取它们。

### 绑定开发平台

IDEA 在 **Settings / Tools / TideStack Develop Config** 中配置；VS Code 在命令面板执行 **TideStack Develop Config: Configure Project**。

| 文件 | 内容 | 管理方式 |
| --- | --- | --- |
| `.tidestack/develop.json` | `developmentServerUrl`、`appName` | 团队共享，随工程提交 |
| `.tidestack/develop.local.json` | `devKey` | 本机私有，排除出版本管理 |

IDEA 部署调试时，用开发密钥授权获得 profile，再根据应用与 profile 解析实例。`profileId` 和 `containerId` 不需要手填或保存到项目配置中。

绑定完成后，IDEA 的 **Deploy & Debug** 可以构建、上传扩展、重启目标测试实例并附加调试器。VS Code 当前只提供绑定配置入口，部署调试继续使用其他正式工具。完整流程见 [平台测试实例调试](./local-ide-and-platform-debugging)。

## 类型化数据模型编译

`ouroboros-data-typed-meta-processor` 在 Java 编译时处理 `@Model` 和类中声明的 `@Field`，生成同包的 `模型类名Meta`。它通过 `maven-compiler-plugin` 的注解处理器机制接入，适用于内嵌基座和标准基座扩展两种模式。

官方后端模板与 Maven archetype 提供可选的 `typed-data-model` profile：

```bash
mvn clean verify -Ptyped-data-model
```

在现有工程中，声明配套版本的 `ouroboros-data-typed-core`，并将以下配置合入编译插件：

```xml
<configuration>
  <parameters>true</parameters>
  <proc>full</proc>
  <annotationProcessorPaths>
    <path>
      <groupId>com.ouroboros</groupId>
      <artifactId>ouroboros-data-typed-meta-processor</artifactId>
      <version>${ouroboros.version}</version>
    </path>
  </annotationProcessorPaths>
</configuration>
```

处理器与 typed-core 使用配套的平台版本，处理器只用于编译，不放入运行依赖。已有 Lombok 等处理器时保留原有路径；引用生成类的模块，应在 IDE 和 CI 中一致启用 profile，或把配置移入常规构建。

编译后在 `target/generated-sources/annotations/` 检查生成类。生成类型包含模型名、Schema 指纹、类型化字段和查询别名；删除字段或使用不兼容的值类型时，相关查询应编译失败。调用示例见 [数据模型](./backend-development/data-model#使用生成的类型化查询字段)。

此工具不从 JSON 业务模型生成实体，也不负责建表、模型注册或执行查询。`@DataModelScan` 和 typed runtime 仍按 [数据模型指南](./backend-development/data-model) 装配。

## Maven 构建与依赖过滤

`ouroboros-dependency-maven-plugin` 只用于标准基座扩展模式的交付。它的版本为 `1.0.0`，与平台版本独立管理，配合标准的 `maven-dependency-plugin:copy-dependencies` 工作：

```text
运行依赖 → target/lib → 对照基座 runtime manifest → target/extension-lib
```

先在扩展 POM 中配置依赖复制，再绑定该插件的 `filter` goal 到 `package` 阶段。完整 POM 示例见 [后端扩展包的依赖过滤](./backend-extension-packages#复制并过滤第三方依赖)。

| 参数 | 默认值或要求 | 作用 |
| --- | --- | --- |
| `manifestUrl` | 必填 | 支持 HTTP、HTTPS、`file:` URL 或本地文件路径 |
| `inputDirectory` | `${project.build.directory}/lib` | 依赖复制结果 |
| `outputDirectory` | `${project.build.directory}/extension-lib` | 保留下来、准备交付的额外依赖 |
| `reportFile` | `${project.build.directory}/ouroboros-dependency-filter-report.json` | 每个依赖的保留与剔除决策 |
| `ignoreVersionDifferences` | `false` | 同坐标异版本时默认提示并保留，供开发者核对 |
| `cleanOutputDirectory` | `true` | 过滤前清理专用输出目录，避免留下上次构建的依赖 |

开发平台的清单地址是“平台地址 + `/ouroboros/runtime-manifest.json`”。使用前确认该清单与目标基座的实际运行库配套，尤其是平台与应用使用不同版本镜像时。

流水线可以保存本次目标基座对应的清单，按本地文件构建。例如，POM 已配置好插件后：

```bash
mvn package \
  -Douroboros.extension.manifestUrl=./build-input/runtime-manifest.json
```

交付项目自身 JAR 和 `extension-lib` 中保留的依赖，并保存报告。坐标与版本精确匹配时会剔除；同名异版本需要继续处理兼容性。把 `ignoreVersionDifferences` 改为 `true` 会改变剔除规则，应先确认目标基座中的版本能够满足扩展。

内嵌基座模式交付完整应用，需要保留所需运行依赖，不使用这个过滤插件。类型化模型编译与依赖过滤互相独立；标准基座扩展可以同时启用，两者处理的分别是编译期类型和交付期依赖。

## 元数据校验工具

公开 Schema 使用 Draft 2020-12。IDE 的编辑提示之外，可以使用支持该版本的校验器检查文件；手册中的 [JSON Schema 校验示例](../reference/jsonschema/#校验示例) 使用 Ajv。

业务入口 Skill 还带有 Python 校验脚本。准备好其 `scripts/requirements.txt` 中的依赖后，从潮汐栈源码根目录执行：

```bash
python3 skills/tidestack-business-entry-definition/scripts/validate_resource_json.py \
  --schema metadata-schema/menu.schema.json \
  --json /path/to/orders.menu.json
```

它也提供显式的 `--subset` 模式；同目录 JavaScript 脚本只支持子集检查。子集检查可用于初步排错，完整结构验证仍使用 Draft 2020-12 校验器。结构通过后，还需在应用中验证资源引用和业务行为。

## 公共开发库与前端 SDK

业务工程可以直接复用基座已有的工具和公共抽象，减少重复实现及不同模块之间的行为差异。

| 任务 | 复用入口 | 说明与参考 |
| --- | --- | --- |
| JSON 处理与 Schema 校验 | `ouroboros-util` 中的 `Json`、`JsonSchemas` | [JSON](../api/backend/java-api/util/json/)、[JSON Schema 工具](../api/backend/java-api/util/json-schemas/) |
| 集合、日期、路径和 SPI 加载 | `ouroboros-util` 中的 `Maps`、`Lists`、`Dates`、`Paths`、`SPI` | [Java 工具 API](../api/backend/java-api/) |
| Excel 导入导出 | `ouroboros-util-excel` 中的 `ExcelReader`、`ExcelWriter` | 源码模块的 `GUIDE.md` 提供读取、样式和写入示例 |
| ZIP 读取与打包 | `ouroboros-util-zip` 中的 `ZipReader`、`ZipWriter` | 源码模块的 `GUIDE.md` 说明资源释放、路径检查与限制 |
| 统一缓存与自适应分布式锁 | `common-cache` 的 `CacheManager`、`common-lock` 的 `DistributedLockManager` | 复用已装配的实现，按业务划分缓存空间和锁 key |
| 统一响应、异常与错误映射 | `common-web`、`common-exception`、`common-exception-mapper` | 与平台接口及错误处理约定保持一致；见 [Controller 与 Service](./backend-development/spring-beans-and-controllers) |
| 模版、脚本和表达式引擎 | `common-template`、`common-script`、`common-expression` | 复用已装配的引擎及上下文；脚本变量见 [脚本上下文](../api/backend/script-context/) |
| 前端请求、导航、事件与组件注册 | `ouroboros-sdk` | 使用宿主提供的能力，见 [前端 SDK](../api/frontend/sdk/) |

公共模块版本由平台 BOM 统一约束，工程按需要声明依赖。`common-all` 是 POM 聚合，直接包含 Web、表达式、应用、异常、模型和脚本模块；统一缓存、自适应分布式锁、Excel、ZIP 等仍需按需核对依赖，不能只看名称判断已经全部引入。

## 前端联调工具

### 使用前端基座镜像

后端在本机运行、只需要一个完整前端入口时，使用 `skills/tidestack-local-debugging/scripts/start_tidestack_web.sh`。Windows 提供同目录的 `.ps1` 脚本。

从潮汐栈源码根目录执行，先把 `TIDESTACK_WEB_IMAGE` 设置为团队确认的前端基座镜像：

```bash
bash skills/tidestack-local-debugging/scripts/start_tidestack_web.sh \
  --backend-port 18888 \
  --listen-port 18080 \
  --container-name myapp-web-debug \
  --image "$TIDESTACK_WEB_IMAGE"
```

浏览器访问 `http://127.0.0.1:18080`。`--backend-port` 表示宿主机后端端口；也可改用 `--backend-url` 指定完整地址，二者选其一。

同时开发微前端时，追加 `--micro`，路径应与实际注册入口一致：

```bash
--micro /micro/business/=http://host.docker.internal:8082/
```

该 URL 由前端基座容器访问，因此要使用容器能够访问的地址，并确认微前端开发服务器的监听范围和资源路径正确。可以重复指定 `--micro`；已有构建资源也可通过 `--deploy-web-root` 挂载。

脚本默认镜像标签有自己的发布节奏，联调时显式选择配套镜像。结束后按本次指定的容器名停止、移除该调试容器。

### 使用前端基座源码

需要修改宿主前端时，先准备目标 checkout 及其前端依赖，再执行：

```bash
bash skills/tidestack-local-debugging/scripts/start-tidestack-frontend.sh \
  http://127.0.0.1:18888 \
  --repo /path/to/ouroboros \
  --host 127.0.0.1 \
  --port 8081
```

`--repo` 指向包含 `frontends/web/main-app` 的源码工程。独立安装 Skills 后也应显式提供这个位置；脚本不会把业务微前端当作前端基座来启动。

## AI 辅助开发工具

源码的 `skills/` 中按任务提供以下入口，可在支持 Agent Skills 的工具中使用：

| Skill | 适用任务 |
| --- | --- |
| `tidestack`、`tidestack-platform-development` | 根据任务选择资源、后端、前端或联调入口 |
| `tidestack-project-initialization` | 初始化两种工程模式，安排启动、资源、编译和交付 |
| `tidestack-business-entry-definition` | 联动维护模块、菜单、权限与页面引用 |
| `tidestack-metadata-definition` | 按元数据类型定义和校验 JSON |
| `tidestack-backend-development` | 后端工程、类型化模型编译、自动配置、SPI 与依赖打包 |
| `tidestack-frontend-development` | 微前端、布局、登录页和组件 |
| `tidestack-metadata-migration` | 迁移旧 classpath 资源目录与后缀 |
| `tidestack-local-debugging` | 准备前端基座与后端联调 |

给 AI 提供目标版本、工程模式、已有资源与验收输入，生成结果继续经过结构、构建和运行验证。Schema 的下载与校验方式见 [JSON Schema](../reference/jsonschema/)。

## 工具源码入口

需要构建工具本身或核对当前实现时，可以在潮汐栈源码中定位：

| 位置 | 维护内容 |
| --- | --- |
| `ide-plugins/intellij-plugin`、`ide-plugins/vscode-plugin` | 两种 IDE 宿主及各自打包说明 |
| `ide-plugins/common/metadata-editor-schema`、`ide-plugins/common/metadata-editor-runtime` | 两端共用的类型、模板、校验与图形编辑能力 |
| `metadata-schema/` | 公开元数据 Schema 与类型索引 |
| `maven-archetypes/` | Maven 模块模板 |
| `project-templates/` | 开发平台项目模板及验证脚本 |
| `maven-plugins/` | 独立依赖过滤插件 |
| `core/ouroboros-data/ouroboros-data-typed-meta-processor/` | 类型化模型查询元数据的注解处理器 |
| `skills/` | 面向应用开发者的 AI 开发与联调工具 |
| `scripts/agent-feedback/` | 平台仓库的测试、日志、健康与指标工具，使用前核对其环境约定 |

平台仓库的 CI、开源导出、发版和内部检查脚本服务于基座维护。业务应用接入工具时，优先复用面向应用的稳定入口，避免把整套平台维护流程复制到应用工程。
