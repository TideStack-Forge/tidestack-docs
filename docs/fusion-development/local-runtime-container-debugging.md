---
title: 本地基座容器调试
sidebar_position: 2
---

# 本地基座容器调试

标准基座扩展模式的聚合工程通常包含 `metadata/`、`service/`、前端工程和部署脚本。`service` 产出普通 JAR，由基座加载到自己的 JVM 中。调试时连接的是基座 JVM；业务扩展无需单独启动一个服务。

## 1. 装配本地运行目录

沿用工程已有的构建入口，把业务 JAR 和过滤后仍需交付的依赖放入 `metadata/extend/`。再将应用资产同步到专用本地目录：

```text
myapp/
├── metadata/                        # 应用资产及本次构建的 extend/
├── service/                         # 后端扩展源码
└── .local-runtime/
    ├── compose.yml
    └── deploy/
        ├── application.yml          # 本机数据库及运行配置
        └── metadata/
            ├── app.metadata.json
            ├── business-model/
            ├── ui-schema/
            ├── extend/              # 业务 JAR 和额外依赖
            └── micro-web/package/   # 已构建的微前端包
```

把 `.local-runtime/` 排除在版本管理之外，或只提交不含凭据的配置模板。基座版本升级后，按新基座的运行清单重新构建和过滤依赖，清理专用装配目录中的旧 JAR，避免新旧依赖同时进入运行环境。

## 2. 配置基座容器与 JDWP

下面是一份本地联调用的 Compose 示例。先把 `TIDESTACK_RUNTIME_IMAGE` 设置为与业务工程配套的标准基座镜像，再创建 `.local-runtime/compose.yml`：

```yaml
services:
  runtime:
    image: ${TIDESTACK_RUNTIME_IMAGE:?请设置配套的标准基座镜像}
    environment:
      TZ: Asia/Shanghai
      DEBUG: "false"
      ENABLE_DEBUG: "false"
      JAVA_OPTS: >-
        -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
    ports:
      - "127.0.0.1:8890:80"
      - "127.0.0.1:8891:8080"
      - "127.0.0.1:5890:5005"
    volumes:
      - ./deploy:/app/deploy
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

`JAVA_OPTS` 在容器内开启 JDWP，并监听容器网络接口；宿主机只在回环地址开放 `5890`。示例关闭另外两项调试开关，避免重复添加 JDWP agent。`suspend=n` 允许应用先启动，IDE 随后连接；需要跟踪 JVM 启动阶段时可以临时改为 `suspend=y`，此时进程会等待调试器连接。

在 `deploy/application.yml` 中配置本地测试数据库及应用需要的外部服务。数据库在宿主机时，容器中的连接地址使用 `host.docker.internal`。应用元数据仍从 `/app/metadata/` 加载；标准镜像在没有内置应用元数据时，将挂载的 `/app/deploy/metadata/` 作为应用目录，具体目录约定见 [标准基座扩展模式](./project-modes/standard-runtime#放入标准运行基座)。

## 3. 启动容器并附加 IDEA

在工程根目录同步资产并启动：

```bash
mkdir -p .local-runtime/deploy/metadata
rsync -a metadata/ .local-runtime/deploy/metadata/
docker compose -f .local-runtime/compose.yml up -d
docker compose -f .local-runtime/compose.yml logs -f runtime
```

日志出现 JDWP 的监听提示后，在 IDEA 的 **Run → Edit Configurations** 中添加 **Remote JVM Debug**：

| 配置项 | 示例值 |
| --- | --- |
| Debugger mode | Attach to remote JVM |
| Transport | Socket |
| Host | `127.0.0.1` |
| Port | `5890` |
| Use module classpath / 关联模块 | 包含当前扩展源码的模块 |

启动该调试配置，然后访问 `http://127.0.0.1:8890/`。容器内的前端基座通过 nginx 将 `/api/`、文件和 WebSocket 请求转发给后端；需要直接调用后端时，使用 `http://127.0.0.1:8891/`。在业务代码设置断点，再从页面或 API 触发。

## 4. 让后续修改生效

每次修改 Java 代码后，按下面的顺序更新：

```text
修改源码 → 构建扩展及依赖 → 更新 metadata/extend/
        → 同步本地运行目录 → 重启基座 → 重新附加调试器 → 触发请求
```

已有工程应优先使用它的构建与装配脚本。脚本完成后，再同步资产并重启：

```bash
# 目标必须是本工程专用的本地联调目录；--delete 会删除目标中的多余文件
rsync -a --delete metadata/ .local-runtime/deploy/metadata/
docker compose -f .local-runtime/compose.yml restart runtime
```

只修改业务模型、UI Schema 等元数据时，可以省去 Java 构建，继续同步并重启。只修改微前端时，可以启动它的开发服务器，再由前端基座代理资源路径，配置方式见 [前端联调工具](./development-tools#前端联调工具)。

Compose 的镜像、端口、挂载或环境变量改变后，用 `up -d` 重新创建相应容器，单纯 `restart` 不会更新这些配置。结束调试后断开 IDEA；停止本地容器可执行 `docker compose -f .local-runtime/compose.yml down`。

## 常见问题

### 能打开应用，为什么 Remote JVM Debug 连接失败？

先检查 JVM 日志中是否出现 JDWP 监听提示，再核对容器端口映射及 IDEA 中的 Host 和 Port。示例使用 `127.0.0.1:5890` 连接容器内的 `5005`，Web 与 API 端口不用于调试连接。

### 已连接调试器，为什么断点没有命中？

确认请求进入这个本地容器，检查挂载目录中的扩展 JAR 是否来自当前源码，以及更新后是否已经重启基座。再检查目标代码所在模块是否已关联到 IDEA 的调试配置。

### 本地测试启动类能运行，放进容器后却找不到类或模型？

本地测试 classpath 可能包含未交付的依赖或资源。检查扩展 JAR、过滤后的依赖、自动配置与 SPI 注册，以及 JAR 中的元数据路径。排查方式见 [开发实践](./development-practices)。

## 验证调试结果

取消断点暂停后，从容器中的真实页面或 API 重跑原问题及相邻正常场景，检查响应、数据和权限。记录基座镜像版本、应用元数据与扩展产物，确认本次验证使用的是准备交付的装配组合。安装与回退见 [应用发布与回滚](../operations/application-release-and-rollback)。
