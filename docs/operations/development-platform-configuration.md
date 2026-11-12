---
title: 开发平台配置项
sidebar_position: 15
---

# 开发平台配置项

开发平台镜像 `ouroboros-develop` 继承 [统一运行基座配置](./runtime-base-configuration)，并增加应用工作区、运行实例、调试会话和项目模板等配置。本页说明平台专有配置及其覆盖关系。

开发平台自身的数据库、RabbitMQ、认证与文件存储仍使用基座的通用参数。平台启动配置、配置中心参数和创建实例时的输入分别生效；修改平台默认值不会自动迁移已有实例。

各表的“容器环境变量”列可直接用于 Compose 的 `environment` / `env_file`、`docker run -e` 或 Kubernetes 的 `env`。命名规则和列表注入方式见 [环境变量与配置文件](./runtime-base-configuration#环境变量与配置文件)。配置中心参数没有对应的 Spring 环境变量，单独在后文标明。

## 部署变量

下表来自手册配套 Compose。除明确传入容器的变量外，其余变量仅用于 Compose 插值，不能直接视为 Spring 配置键。

| `.env` 变量 | 示例值或要求 | 容器中的变量或用途 |
| --- | --- | --- |
| `OUROBOROS_VERSION` | 必填，使用目标发行版本 | 仅 Compose 插值，拼接开发平台镜像标签 |
| `ARCH_AFFIX` | 默认空，ARM64 镜像存在时用 `-arm64` | 仅 Compose 插值，拼接镜像架构后缀 |
| `PLATFORM_PORT` | `80` | 仅 Compose 插值，映射宿主机端口到平台容器 `80` |
| `DEBUG_PORT` | `15005` | 仅 Compose 插值，本机映射到平台 `5005`；JDWP 仍由容器内 `DEBUG` / `ENABLE_DEBUG` 控制 |
| `MYSQL_PORT` | `13306` | 仅 Compose 插值，MySQL 本机访问端口；平台内部仍连接 `3306` |
| `HOST_WORKSPACE_PATH` | 必填，宿主机绝对路径 | 平台容器：`HOST_WORKSPACE_PATH`，用于 Docker 运行实例的宿主机工作区 |
| `MYSQL_ROOT_PASSWORD` | 必填，随机强密码 | MySQL 容器：`MYSQL_ROOT_PASSWORD`；平台容器：`SPRING_DATASOURCE_PASSWORD` |
| `RABBITMQ_DEFAULT_USER` | 必填，独立账号 | RabbitMQ 容器：`RABBITMQ_DEFAULT_USER`；平台容器：`SPRING_RABBITMQ_USERNAME` |
| `RABBITMQ_DEFAULT_PASS` | 必填，随机强密码 | RabbitMQ 容器：`RABBITMQ_DEFAULT_PASS`；平台容器：`SPRING_RABBITMQ_PASSWORD` |

部署目录、网络和持久化要求见 [Docker Compose 部署](./deployment-methods/docker-compose)。平台与配套 `ouroboros-mothership` 基座使用相容版本，镜像拉取不会自动更新已有业务实例。

## 平台自身配置

下表给出开发平台镜像的内置值；加载位置为 `/app/metadata/application.yml`，可被部署配置和环境变量覆盖。

| 配置键 | 容器环境变量 | 平台镜像内置值 | 说明 |
| --- | --- | --- | --- |
| `spring.application.name` | `SPRING_APPLICATION_NAME` | `ouroboros-develop` | 平台自身应用名 |
| `spring.servlet.multipart.max-file-size` | `SPRING_SERVLET_MULTIPART_MAXFILESIZE` | `200MB` | 覆盖基座的 `2GB`，限制平台单文件上传 |
| `spring.servlet.multipart.max-request-size` | `SPRING_SERVLET_MULTIPART_MAXREQUESTSIZE` | `200MB` | 覆盖基座的 `2GB`，限制平台上传请求 |
| `spring.mvc.async.request-timeout` | `SPRING_MVC_ASYNC_REQUESTTIMEOUT` | `-1` | Spring MVC 异步请求超时配置；代理超时仍需单独处理 |
| `ouroboros.platform.cache.token.secret` | `OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET` | 来自 `OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET`；未设置时使用兼容默认值 `ouroboros-develop-platform-cache-token` | 平台缓存管理条目令牌的签名密钥，共享环境应显式替换 |

配套 Compose 尚未传入缓存管理密钥。若通过 `.env` 配置，需要同时在现有平台服务的 `environment` 中补充映射，保留该服务的其他字段：

```yaml
services:
  ouroboros-develop:
    environment:
      OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET: ${OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET:?Set a private cache token secret}
```

也可直接在部署 `application.yml` 中设置 `ouroboros.platform.cache.token.secret`。密钥变化后旧的缓存条目令牌可能失效，应重新取得条目信息。

## 工作区与开发入口

这些参数保留当前实现读取的属性名。`HOST_WORKSPACE_PATH` 由环境变量读取，不能只写成 `application.yml` 的同名普通属性。

| Spring 配置键 | 容器环境变量 | 平台镜像值 / 代码默认值 | 说明 |
| --- | --- | --- | --- |
| `ouroboros.dev.workspaceRoot` | `OUROBOROS_DEV_WORKSPACEROOT` | 镜像 `/app/deploy/workspace`；代码兜底 `./workspace` | 平台进程看到的工作区根目录 |
| —（直接读取环境变量） | `HOST_WORKSPACE_PATH` | 无固定值 | 同一份工作区在 Docker 宿主机上的绝对路径 |
| `ouroboros.dev.debugSupportFilesDir` | `OUROBOROS_DEV_DEBUGSUPPORTFILESDIR` | 镜像 `/app/debug-support`；代码兜底 `./debug-support` | 调试支持文件目录 |
| `ouroboros.dev.developSupportFilesDir` | `OUROBOROS_DEV_DEVELOPSUPPORTFILESDIR` | 镜像 `/app/develop-support`；代码兜底 `./develop-support` | 开发支持文件目录 |
| `ouroboros-dev.template.dir` | `OUROBOROSDEV_TEMPLATE_DIR` | 默认 `<工作区根目录>/templates` | 应用模板目录，与项目生成模板目录分别维护 |
| `ouroboros.dev.platformUrl` | `OUROBOROS_DEV_PLATFORMURL` | 代码默认空 | 生成开发密钥相关 IDE 配置时使用的平台访问地址 |
| `ouroboros.dev.debugKeyDefaultExpiryDays` | `OUROBOROS_DEV_DEBUGKEYDEFAULTEXPIRYDAYS` | 代码默认 `90` 天 | 生成开发密钥时的默认有效期 |

Docker 默认布局中，容器内 `/app/deploy/workspace` 和宿主机 `HOST_WORKSPACE_PATH` 必须对应同一份内容。代码还接受工作区相关历史别名 `ouroboros-dev.workspace-root`、`ouroboros-dev.debug-support-root`、`ouroboros-dev.develop-support-root`，但只有前表首选键缺失时才回退；镜像已设置首选键时应修改首选键。

| 历史配置键 | 容器环境变量 |
| --- | --- |
| `ouroboros-dev.workspace-root` | `OUROBOROSDEV_WORKSPACEROOT` |
| `ouroboros-dev.debug-support-root` | `OUROBOROSDEV_DEBUGSUPPORTROOT` |
| `ouroboros-dev.develop-support-root` | `OUROBOROSDEV_DEVELOPSUPPORTROOT` |

## 开发运行后端

### Docker

| 配置键 | 容器环境变量 | 默认值与覆盖 | 说明 |
| --- | --- | --- | --- |
| `ouroboros.dev.runtime.default-backend` | `OUROBOROS_DEV_RUNTIME_DEFAULTBACKEND` | 代码与镜像均为 `DOCKER` | 运行后端兜底值；测试应用还受配置中心与创建参数影响 |
| `ouroboros.dev.container.docker-api.host` | `OUROBOROS_DEV_CONTAINER_DOCKERAPI_HOST` | 代码兜底 `tcp://127.0.0.1:2375`；平台镜像内置 `tcp://host.docker.internal:2375`；手册 Compose 显式覆盖为 `unix:///var/run/docker.sock` | 实际 Docker Engine API 地址 |
| `ouroboros.dev.container.docker-api.username` | `OUROBOROS_DEV_CONTAINER_DOCKERAPI_USERNAME` | 未设置 | Docker 客户端读取的账号字段；不等同于已经建立 TLS 或受控网络 |
| `ouroboros.dev.container.docker-api.password` | `OUROBOROS_DEV_CONTAINER_DOCKERAPI_PASSWORD` | 未设置 | Docker 客户端读取的密码字段 |
| `ouroboros-dev.container.default-network-name` | `OUROBOROSDEV_CONTAINER_DEFAULTNETWORKNAME` | 未指定时尝试读取平台容器网络，失败后回退 `ouroboros-dev` | 创建 Docker 实例使用的网络 |

Compose 使用 `OUROBOROS_DEV_CONTAINER_DOCKERAPI_HOST` 传入 API 地址。Linux / macOS 同机部署使用 Socket；远程或团队环境使用受保护的 Docker 接入方式。镜像内保留的 `2375` 地址是兼容默认值，不是团队环境推荐配置。

注意 `ouroboros-dev` 与 `ouroboros.dev` 是两个现存配置前缀。前者对应的标准环境变量前缀为 `OUROBOROSDEV_`，后者为 `OUROBOROS_DEV_`。工作区历史别名、应用模板、实例网络和实例专用 MQ 的变量名应按各表填写。

平台还可以通过前缀 `ouroboros-dev.container.rabbitmq` 设置运行实例的 RabbitMQ 连接：

| 相对配置键 | 容器环境变量 | 作用 |
| --- | --- | --- |
| `addresses` | `OUROBOROSDEV_CONTAINER_RABBITMQ_ADDRESSES` | AMQP 地址列表，例如 `mq-1:5672,mq-2:5672` |
| `hosts` | `OUROBOROSDEV_CONTAINER_RABBITMQ_HOSTS` | 平台传给实例的主机列表参数，需按实例实际读取方式使用 |
| `host` | `OUROBOROSDEV_CONTAINER_RABBITMQ_HOST` | AMQP 主机 |
| `port` | `OUROBOROSDEV_CONTAINER_RABBITMQ_PORT` | AMQP 端口 |
| `virtual-host` | `OUROBOROSDEV_CONTAINER_RABBITMQ_VIRTUALHOST` | RabbitMQ virtual host |
| `username` | `OUROBOROSDEV_CONTAINER_RABBITMQ_USERNAME` | RabbitMQ 账号 |
| `password` | `OUROBOROSDEV_CONTAINER_RABBITMQ_PASSWORD` | RabbitMQ 密码 |

`addresses`、`hosts`、`host` 至少一项非空时启用实例专用 MQ 配置。三项均为空时，平台从自身 `spring.rabbitmq.*` 读取连接参数传给实例。只要启用了专用地址，就使用专用组中的非空字段，不会逐字段补齐平台的账号和密码；因此应完整提供所需连接信息。

### Kubernetes

前缀为 `ouroboros.dev.runtime.kubernetes`。

| 相对配置键 | 容器环境变量 | 代码默认值 | 平台镜像内置值 | 说明 |
| --- | --- | --- | --- | --- |
| `namespace` | `OUROBOROS_DEV_RUNTIME_KUBERNETES_NAMESPACE` | `default` | `ouroboros-dev` | 运行资源命名空间 |
| `shared-pvc-name` | `OUROBOROS_DEV_RUNTIME_KUBERNETES_SHAREDPVCNAME` | `ouroboros-dev-runtime-workspace` | 沿用代码值 | 共享工作区 PVC |
| `mounted-workspace-root` | `OUROBOROS_DEV_RUNTIME_KUBERNETES_MOUNTEDWORKSPACEROOT` | `/workspace` | `/workspace` | 实例内工作区挂载根路径 |
| `helper-ready-timeout` | `OUROBOROS_DEV_RUNTIME_KUBERNETES_HELPERREADYTIMEOUT` | `45s` | `30s` | 开发助手就绪等待时长 |
| `ingress-host-suffix` | `OUROBOROS_DEV_RUNTIME_KUBERNETES_INGRESSHOSTSUFFIX` | 空 | 沿用代码值 | 实例访问域名后缀 |

命名空间、PVC、集群客户端、权限和访问入口需要预先准备，配置键不会自动完成这些工作。测试应用选择 Kubernetes 时，还要检查配置中心中的默认后端，不能仅修改 `default-backend`。接入与验证步骤见 [Kubernetes 部署](./deployment-methods/kubernetes)。

## 调试与后端 API 会话

前缀为 `ouroboros.dev.runtime.debug`，以下来自代码默认值。

| 相对配置键 | 容器环境变量 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `max-lifetime-seconds` | `OUROBOROS_DEV_RUNTIME_DEBUG_MAXLIFETIMESECONDS` | `1800` 秒 | 创建会话未显式指定时的最大存活时间 |
| `idle-timeout-seconds` | `OUROBOROS_DEV_RUNTIME_DEBUG_IDLETIMEOUTSECONDS` | `600` 秒 | 创建会话未显式指定时的空闲超时 |
| `broker-host` | `OUROBOROS_DEV_RUNTIME_DEBUG_BROKERHOST` | `127.0.0.1` | TCP 隧道使用的 broker 地址 |
| `bind-scope` | `OUROBOROS_DEV_RUNTIME_DEBUG_BINDSCOPE` | `LOOPBACK_ONLY` | 属性对象保留的字段；默认 TCP broker 装配未读取，修改它不会切换绑定范围 |
| `loopback-only` | `OUROBOROS_DEV_RUNTIME_DEBUG_LOOPBACKONLY` | `true` | 属性对象保留的字段；默认 TCP broker 装配未读取 |

当前默认 TCP broker 固定使用 `LOOPBACK_ONLY` 绑定范围，应以 [运行实例](../low-code/development-platform-menus/runtime-instance) 返回的会话端点和访问提示为准。

会话的创建、到期和关闭与平台自身 JDWP 开关分别控制，修改 `DEBUG_PORT` 不会替代会话管理。

## 稳定域名网关

前缀为 `ouroboros.dev.runtime.gateway`，默认关闭。启用 APISIX 时需同时满足 `enabled: true`、`provider: apisix`，并配置管理地址、密钥和路由前缀。

| 相对配置键 | 容器环境变量 | 代码默认值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `OUROBOROS_DEV_RUNTIME_GATEWAY_ENABLED` | `false` | 是否启用网关接入 |
| `provider` | `OUROBOROS_DEV_RUNTIME_GATEWAY_PROVIDER` | 空 | APISIX 装配条件要求精确填写 `apisix` |
| `stable-domain-host-suffix` | `OUROBOROS_DEV_RUNTIME_GATEWAY_STABLEDOMAINHOSTSUFFIX` | 空 | 稳定访问域名后缀 |
| `apisix.base-url` | `OUROBOROS_DEV_RUNTIME_GATEWAY_APISIX_BASEURL` | 空 | APISIX Admin API 地址 |
| `apisix.admin-key` | `OUROBOROS_DEV_RUNTIME_GATEWAY_APISIX_ADMINKEY` | 空 | Admin API 密钥 |
| `apisix.route-id-prefix` | `OUROBOROS_DEV_RUNTIME_GATEWAY_APISIX_ROUTEIDPREFIX` | 空 | 当前平台管理的路由 ID 前缀 |
| `apisix.connect-timeout-millis` | `OUROBOROS_DEV_RUNTIME_GATEWAY_APISIX_CONNECTTIMEOUTMILLIS` | `2000` 毫秒 | 连接超时 |
| `apisix.read-timeout-millis` | `OUROBOROS_DEV_RUNTIME_GATEWAY_APISIX_READTIMEOUTMILLIS` | `5000` 毫秒 | 读取超时 |

网关参数不负责配置 DNS 或证书。使用稳定域名时，还需核对实例暴露策略、上游端点与用户网络实际访问结果。

当前 APISIX 自动路由集成仅处理 `DOCKER` 后端的 `TEST_APP`，上游为共享 Docker 网络中的测试应用容器 `80` 端口。Kubernetes 的稳定域名由其 Ingress 路径处理，两者的部署图和接入边界见 [部署架构](./deployment-architecture)。

## 项目生成模板

前缀为 `ouroboros.dev.project-generation.local-template-catalog`。这些参数管理生成前后端扩展项目使用的本地模板目录，与应用模板 `ouroboros-dev.template.dir` 无关。

| 相对配置键 | 容器环境变量 | 平台镜像内置值 | 说明 |
| --- | --- | --- | --- |
| `enabled` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_ENABLED` | `true` | 启用本地模板目录；代码装配条件要求显式为 `true` |
| `root` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_ROOT` | `/app/project-templates` | 模板根目录 |
| `catalog` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_CATALOG` | `/app/project-templates/catalog/stable-catalog.json` | 稳定模板目录清单 |
| `artifact-root` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_ARTIFACTROOT` | `/app/project-templates/artifacts` | 模板制品根目录，必须位于模板根目录内 |
| `cache` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_CACHE` | `/app/runtime/project-generation-template-cache` | 模板下载与读取缓存目录 |
| `template-origin` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_TEMPLATEORIGIN` | `https://templates.example.invalid` | 内置模板的来源标识，不表示存在可访问的公共模板站点 |
| `target-platform-version` | `OUROBOROS_DEV_PROJECTGENERATION_LOCALTEMPLATECATALOG_TARGETPLATFORMVERSION` | `2.0.0` | 模板兼容性判断使用的目标平台版本，不会切换当前平台镜像 |

覆盖模板目录后，应确认清单、制品、兼容版本和缓存路径配套。项目生成过程需要写入模板根目录下的运行状态及缓存目录，挂载时应为实际写入位置准备权限。

## 配置中心中的平台默认值

以下键通过平台配置服务读取，应使用配置中心维护；当前没有直接通过容器环境变量注入这些键的映射，不能把键名转成大写后当作 Spring 环境变量，也不能当作同名 Spring YAML 参数。现有配置中心值优先于默认值，下面的默认值不表示升级后会覆盖原有设置。

| 配置键 | 容器环境变量 | 默认值或回退方式 | 作用 |
| --- | --- | --- | --- |
| `dev-app-management.dev-helper.container.image` | 不支持；在配置中心设置 | 运行时按当前制品版本和 CPU 架构生成基座引用 | 开发助手默认镜像 |
| `dev-app-management.test-app.container.image` | 不支持；在配置中心设置 | 运行时按当前制品版本和 CPU 架构生成基座引用 | 测试应用默认镜像 |
| `dev-app-management.test-app.preferred-runtime-backend` | 不支持；在配置中心设置 | `DOCKER` | 测试应用默认后端，可选 `DOCKER`、`KUBERNETES` |
| `dev-app-management.test-app.default-exposure-strategy` | 不支持；在配置中心设置 | `TEMP_PORT` | 测试应用默认暴露策略，可选 `TEMP_PORT`、`STABLE_DOMAIN` |
| `dev-app-management.test-app.port-range` | 不支持；在配置中心设置 | `8000-9000` | Docker 临时端口模式下的默认端口分配范围 |
| `dev-app-management.test-app.default-datasource.driver-class-name` | 不支持；在配置中心设置 | 元数据默认 `com.mysql.cj.jdbc.Driver`；无可用值时回退平台数据源驱动 | 测试应用默认数据源驱动 |
| `dev-app-management.test-app.default-datasource.url-template` | 不支持；在配置中心设置 | 无可用值时从平台 JDBC URL 推导 | 测试应用数据库连接模板，使用 `${dbName}` 占位符 |
| `dev-app-management.test-app.default-datasource.username` | 不支持；在配置中心设置 | 无可用值时回退平台数据源账号 | 测试应用默认数据源账号 |
| `dev-app-management.test-app.default-datasource.password` | 不支持；在配置中心设置 | 无可用值时回退平台数据源密码 | 测试应用默认数据源密码 |
| `dev-app-management.test-app.memory-datasource.driver-class-name` | 不支持；在配置中心设置 | `org.h2.Driver` | 内存数据源驱动 |
| `dev-app-management.test-app.memory-datasource.url` | 不支持；在配置中心设置 | `jdbc:h2:mem:sandbox;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;IGNORECASE=TRUE;` | 内存数据源连接 |
| `dev-app-management.test-app.log-cache-lines` | 不支持；在配置中心设置 | `200` 行 | 后台缓存的测试应用最近日志行数 |

镜像动态默认值依赖当前制品版本信息；历史元数据还保留旧镜像标签，部署时应在配置中心核对有效值并确认镜像可拉取，不要把历史标签作为目标版本。

测试应用创建时的选择顺序为：

| 对象 | 从高到低的读取顺序 |
| --- | --- |
| 后端类型 | 创建请求 → 配置中心 `preferred-runtime-backend` → Spring `default-backend` |
| 暴露策略 | 创建请求 → 配置中心 `default-exposure-strategy` → `TEMP_PORT` |
| 镜像 | 创建请求 → 配置中心 `test-app.container.image` |
| 默认数据源 | 配置中心各字段的可用值 → 平台 `spring.datasource.*` 对应值或 URL 推导 |

配置中心默认后端通常为 `DOCKER`，会优先于 Spring 的 `default-backend`。更改默认后端、镜像或数据源后，以新建测试实例验证，不假定已有实例已变化。

## 配置示例与生效验证

### 通过容器环境变量配置

将以下字段合并到现有 Compose 平台服务中，保留数据库、RabbitMQ、镜像和挂载等字段。工作区路径必须与现有挂载对应，Docker Socket 也需要单独挂载。

```yaml
services:
  ouroboros-develop:
    environment:
      HOST_WORKSPACE_PATH: ${HOST_WORKSPACE_PATH:?Set the host workspace path}
      OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET: ${OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET:?Set a private cache token secret}
      OUROBOROS_DEV_WORKSPACEROOT: /app/deploy/workspace
      OUROBOROS_DEV_PLATFORMURL: https://develop.example.com
      OUROBOROS_DEV_CONTAINER_DOCKERAPI_HOST: unix:///var/run/docker.sock
      OUROBOROS_DEV_RUNTIME_DEFAULTBACKEND: DOCKER
      OUROBOROS_DEV_RUNTIME_DEBUG_MAXLIFETIMESECONDS: "1800"
      OUROBOROS_DEV_RUNTIME_DEBUG_IDLETIMEOUTSECONDS: "600"
      OUROBOROS_DEV_RUNTIME_DEBUG_BROKERHOST: 127.0.0.1
      OUROBOROS_DEV_RUNTIME_GATEWAY_ENABLED: "false"
```

切换为 Kubernetes 后端时，使用 `OUROBOROS_DEV_RUNTIME_DEFAULTBACKEND: KUBERNETES`，并按上表传入 `OUROBOROS_DEV_RUNTIME_KUBERNETES_NAMESPACE`、`OUROBOROS_DEV_RUNTIME_KUBERNETES_SHAREDPVCNAME` 等变量。测试应用还需在配置中心设置 `preferred-runtime-backend`，其优先级高于这一 Spring 兜底值。

### 通过配置文件配置

以下片段放入平台部署目录的 `application.yml`，保留现有数据库、RabbitMQ 等配置。同机 Docker Socket 还需由 Compose 挂载；若已有同名环境变量，以环境变量为准。

```yaml
ouroboros:
  dev:
    workspaceRoot: /app/deploy/workspace
    platformUrl: https://develop.example.com
    container:
      docker-api:
        host: unix:///var/run/docker.sock
    runtime:
      default-backend: DOCKER
      debug:
        max-lifetime-seconds: 1800
        idle-timeout-seconds: 600
        broker-host: 127.0.0.1
      gateway:
        enabled: false
```

### 生效验证

按实际维护对象完成生效操作与验证：

1. Compose 环境变量变化后执行 `docker compose up -d --force-recreate ouroboros-develop`，只执行 `restart` 不会更新环境变量；Spring 文件变化后按部署流程重启或重建平台。
2. 可执行 `docker compose exec ouroboros-develop printenv OUROBOROS_DEV_WORKSPACEROOT` 核对非敏感变量，再检查工作区挂载、平台依赖连接和日志，确认没有更高优先级配置覆盖或配置加载异常。
3. 核对配置中心有效的后端、镜像、端口范围和数据源。
4. 使用测试应用新建运行实例，检查后端、镜像、环境和实际端点。
5. 完成登录、查询、一次写入，以及受影响的调试、模板生成或网关访问验证。

已有实例的更新、重建和数据保留见 [业务应用发布与回退](./application-release-and-rollback)。
