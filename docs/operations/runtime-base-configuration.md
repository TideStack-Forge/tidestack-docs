---
title: 统一运行基座配置项
sidebar_position: 14
---

# 统一运行基座配置项

统一运行基座镜像 `ouroboros-mothership` 提供后端运行环境、Nginx、配置加载和通用能力。业务应用与开发平台都继承这一层；开发平台额外配置及覆盖值见 [开发平台配置项](./development-platform-configuration)。

本页收录基座启动参数、通用部署配置和常用能力参数。表中的“基座值”来自镜像内置配置；未由镜像设置的参数注明代码默认值。安装时显式设置的值、应用配置和环境变量仍可覆盖它们。可选能力需要相应模块已装配。

## 配置位置与优先级

### 镜像启动时读取哪些文件

镜像入口按下表顺序加载 Spring 配置文件，后加载的文件覆盖前面的同名属性。可选文件存在时才加入加载列表。

| 顺序 | 容器内位置 | 用途 |
| --- | --- | --- |
| 1 | `classpath:application.yml` | Jar 内置配置 |
| 2 | `/app/base/service/application-base.yml` | 统一运行基座默认值 |
| 3 | `/app/metadata/application.yml` | 应用或开发平台内置配置 |
| 4 | `/app/application.yml`、`/app/config/*.yml` | 应用自定义配置 |
| 5 | `/app/deploy/application.yml`、`/app/deploy/config/*.yml` | 部署环境配置 |
| 6 | `/app/deploy/instance.yml` | 实例生成的配置 |

推荐在持久化部署目录维护 `application.yml`；Compose 示例将该目录挂载到 `/app/deploy`。配置路径由镜像启动脚本显式传入，不应只按 Spring Boot 的默认搜索目录判断。

### 环境变量与配置文件

下文各配置表的“容器环境变量”列给出完整变量名，可用于 Compose 的 `environment` / `env_file`、`docker run -e` 或 Kubernetes 的 `env`。Java 系统属性和容器环境变量可以覆盖 Spring 配置文件；两者同时设置时，Java 系统属性优先。镜像启动脚本读取的 `XMS`、`ENABLE_NGINX` 等变量应直接传入容器，写入 `application.yml` 不会配置这些脚本参数。

例如，Compose 传入了 `SPRING_DATASOURCE_URL` 时，修改 `application.yml` 的 `spring.datasource.url` 不会覆盖该环境变量。`.env` 用于 Compose 插值，只有通过 `environment` 或 `env_file` 等方式传入的变量才进入容器。

Spring Boot 标准环境变量命名规则是：点号 `.` 换成下划线 `_`，移除连字符 `-`，全部转成大写；驼峰单词之间不额外加下划线。例如：

| Spring 配置键 | 容器环境变量 |
| --- | --- |
| `spring.servlet.multipart.max-file-size` | `SPRING_SERVLET_MULTIPART_MAXFILESIZE` |
| `ouroboros.upload.fileSystem.rootPath` | `OUROBOROS_UPLOAD_FILESYSTEM_ROOTPATH` |

表中按这一规则列出可直接使用的名称。不要自行将每个连字符或驼峰边界改成下划线；部分读取方式接受的历史别名不适用于所有参数。本文保留部分平台参数现有的驼峰配置键，因为它们由精确属性名读取，不能假定改成其他 YAML 拼写也等价。绑定规则见 [Spring Boot 外部化配置](https://docs.spring.io/spring-boot/3.5/reference/features/external-config.html)。

列表和数组参数可用逗号分隔的环境变量值，例如 `OUROBOROS_SECURITY_TOKEN_ACCESSTOKENCLAIMS: "sub,subject_type,subject_id"`；配置后替换整个列表。需要明确表达 JSON 数组时，可通过 `SPRING_APPLICATION_JSON` 注入，例如 `'{"ouroboros":{"upload":{"anonymousPrefixes":["public/**"]}}}'`。JSON 属性优先于普通环境变量，不要同时为同一参数设置两种值。

## 容器启动与 JVM

| 环境变量 | 默认行为 | 说明 |
| --- | --- | --- |
| `ENABLE_NGINX` | `true` | 启动镜像内的 Nginx；设为 `false` 后需自行提供前端服务和后端入口 |
| `XMS` | 未设置 | JVM 初始堆大小，例如 `512m` |
| `XMX` | 未设置 | JVM 最大堆大小，例如 `2g`；与容器资源限制配套 |
| `JAVA_OPTS` | 空 | 追加 JVM 参数，避免与脚本生成参数冲突 |
| `DEBUG` / `ENABLE_DEBUG` | 均为 `false` | 任一为 `true` 时开启 JDWP，容器内端口固定为 `5005` |
| `SHOW_CMD` | `false` | 打印完整 Java 启动命令；调试模式也会打印 |
| `ENABLE_DEPLOY_EXTEND` | 按元数据来源确定 | 是否加载 `/app/deploy/extend`；内置元数据存在时默认 `false`，从部署目录挂入元数据时默认 `true` |
| `CUSTOM_CLASS_PATH` | 空 | 优先加载的自定义目录，多个目录用分号分隔，仅加入实际存在的目录 |
| `CUSTOM_BASE_CLASS_PATH` | 空 | 托底加载的自定义目录，同样用分号分隔 |
| `TZ` | 基座未设置 | 容器时区；手册 Compose 示例设为 `Asia/Shanghai` |

调试端口需要单独设置访问范围和映射。容器声明端口不代表宿主机已经开放它，也不代表调试会话已创建。

日志配置文件按 `/app/base/service/logback.xml` → `/app/logback.xml` → `/app/deploy/logback.xml` 选择，后者存在时覆盖前者。默认服务与 Web 日志位于 `/app/deploy/logs/`，采集与保留见 [监控与告警](./monitoring-and-alerting)。

## HTTP 与基础依赖

| Spring 配置键 | 容器环境变量 | 基座值或要求 | 说明 |
| --- | --- | --- | --- |
| `server.port` | `SERVER_PORT` | `8080` | Java 后端端口；Nginx 默认转发到此端口，修改时需同步代理 |
| `spring.application.name` | `SPRING_APPLICATION_NAME` | `ouroboros-mothership` | 应用标识；业务实例通常由平台传入自己的名称 |
| `spring.profiles.active` | `SPRING_PROFILES_ACTIVE` | 基座未设置 | 实际运行 Profile，由部署环境决定 |
| `spring.servlet.multipart.max-file-size` | `SPRING_SERVLET_MULTIPART_MAXFILESIZE` | `2GB` | 单个上传文件大小；开发平台覆盖为 `200MB` |
| `spring.servlet.multipart.max-request-size` | `SPRING_SERVLET_MULTIPART_MAXREQUESTSIZE` | `2GB` | 单次上传请求大小；开发平台覆盖为 `200MB` |
| `spring.cache.type` | `SPRING_CACHE_TYPE` | `simple` | Spring 缓存类型；共享缓存需另行配置相应实现 |
| `spring.datasource.type` | `SPRING_DATASOURCE_TYPE` | 部署时设置 | 手册 Compose 使用 `com.alibaba.druid.pool.DruidDataSource` |
| `spring.datasource.driver-class-name` | `SPRING_DATASOURCE_DRIVERCLASSNAME` | 部署时设置 | MySQL 示例为 `com.mysql.cj.jdbc.Driver` |
| `spring.datasource.url` | `SPRING_DATASOURCE_URL` | 部署时设置 | 指向当前实例的实际数据库 |
| `spring.datasource.username` | `SPRING_DATASOURCE_USERNAME` | 部署时设置 | 数据库账号 |
| `spring.datasource.password` | `SPRING_DATASOURCE_PASSWORD` | 部署时设置 | 数据库密码 |
| `spring.datasource.migration-strategy` | `SPRING_DATASOURCE_MIGRATIONSTRATEGY` | SQL 数据站未指定时使用 `AUTO` | 支持 `AUTO`、`DISABLED`，保留大写；自动迁移需具备相应 DDL 权限 |
| `spring.datasource.dialect` | `SPRING_DATASOURCE_DIALECT` | 代码默认 `auto` | 显式指定默认数据源的 SQL 方言 |
| `ouroboros.data.sql.dialect` | `OUROBOROS_DATA_SQL_DIALECT` | 代码默认 `auto` | 前一项为空或为 `auto` 时使用的方言配置 |
| `spring.liquibase.enabled` | `SPRING_LIQUIBASE_ENABLED` | `false` | 与平台数据模型迁移机制分别处理，不能用它代替 `migration-strategy` |
| `spring.rabbitmq.host` | `SPRING_RABBITMQ_HOST` | 按实际服务设置 | AMQP 主机；平台消息、应用消息和日志等能力使用 |
| `spring.rabbitmq.port` | `SPRING_RABBITMQ_PORT` | 按实际服务设置 | AMQP 端口，通常为 `5672` |
| `spring.rabbitmq.virtual-host` | `SPRING_RABBITMQ_VIRTUALHOST` | 按实际服务设置 | RabbitMQ virtual host |
| `spring.rabbitmq.username` | `SPRING_RABBITMQ_USERNAME` | 按实际服务设置 | RabbitMQ 账号 |
| `spring.rabbitmq.password` | `SPRING_RABBITMQ_PASSWORD` | 按实际服务设置 | RabbitMQ 密码 |
| `spring.data.redis.host` | `SPRING_DATA_REDIS_HOST` | 基座未配置；Spring 默认 `localhost` | Redis 主机，仅在启用相关能力时配置 |
| `spring.data.redis.port` | `SPRING_DATA_REDIS_PORT` | 基座未配置；Spring 默认 `6379` | Redis 端口 |
| `spring.data.redis.database` | `SPRING_DATA_REDIS_DATABASE` | 基座未配置；Spring 默认 `0` | Redis 数据库编号 |
| `spring.data.redis.username` | `SPRING_DATA_REDIS_USERNAME` | 未设置 | Redis ACL 账号 |
| `spring.data.redis.password` | `SPRING_DATA_REDIS_PASSWORD` | 未设置 | Redis 密码 |
| `spring.data.redis.url` | `SPRING_DATA_REDIS_URL` | 未设置 | Redis 连接 URL；设置后覆盖独立的 host、port、username、password、database 参数 |
| `spring.data.redis.ssl.enabled` | `SPRING_DATA_REDIS_SSL_ENABLED` | Spring 默认 `false` | 是否使用 TLS |

镜像内 Nginx 的上传上限和外层反向代理也会限制请求大小，调整 Spring 参数后应验证完整入口链路。

## 元数据、静态资源与文件

| 配置键 | 容器环境变量 | 基座值或代码默认值 | 说明 |
| --- | --- | --- | --- |
| `ouroboros.metadata.sourceType` | `OUROBOROS_METADATA_SOURCETYPE` | `fileSystem` | 元数据来源 |
| `ouroboros.metadata.path` | `OUROBOROS_METADATA_PATH` | `/app/metadata/` | 应用元数据根目录；镜像未内置该目录时，入口脚本可连接部署目录下的 `metadata/` |
| `ouroboros.microWeb.autoDeploy` | `OUROBOROS_MICROWEB_AUTODEPLOY` | `true` | 微前端资源自动部署 |
| `ouroboros.microWeb.deployPath` | `OUROBOROS_MICROWEB_DEPLOYPATH` | `/app/deploy/web/` | 微前端静态资源部署目录 |
| `ouroboros.resource.app-default-base-directory` | `OUROBOROS_RESOURCE_APPDEFAULTBASEDIRECTORY` | 代码默认 `resources` | 应用默认资源目录 |
| `ouroboros.resource.runtime-override-base-directory` | `OUROBOROS_RESOURCE_RUNTIMEOVERRIDEBASEDIRECTORY` | 代码默认 `data/resources` | 运行环境覆盖资源目录 |
| `ouroboros.upload.storageType` | `OUROBOROS_UPLOAD_STORAGETYPE` | `fileSystem` | 上传文件存储类型；其他类型需要对应实现 |
| `ouroboros.upload.fileSystem.rootPath` | `OUROBOROS_UPLOAD_FILESYSTEM_ROOTPATH` | `/app/deploy/data/uploads` | 本地上传文件根目录，需持久化 |
| `ouroboros.upload.filePathStrategy` | `OUROBOROS_UPLOAD_FILEPATHSTRATEGY` | `default` | 文件路径策略 |
| `ouroboros.upload.filePathPrefix` | `OUROBOROS_UPLOAD_FILEPATHPREFIX` | 空 | 文件路径前缀 |
| `ouroboros.upload.filePathTemplate` | `OUROBOROS_UPLOAD_FILEPATHTEMPLATE` | `{yyyy}/{MM}/{dd}` | 文件路径模板 |
| `ouroboros.upload.fileNameStrategy` | `OUROBOROS_UPLOAD_FILENAMESTRATEGY` | `default` | 文件命名策略 |
| `ouroboros.upload.fileNameTemplate` | `OUROBOROS_UPLOAD_FILENAMETEMPLATE` | `{rawName}-{timestamp}.{ext}` | 文件名称模板 |
| `ouroboros.upload.fileUrlStrategy` | `OUROBOROS_UPLOAD_FILEURLSTRATEGY` | `default` | 访问 URL 生成策略 |
| `ouroboros.upload.fileUrlPrefix` | `OUROBOROS_UPLOAD_FILEURLPREFIX` | `/api/file` | 访问 URL 前缀 |
| `ouroboros.upload.anonymousPrefixes` | `OUROBOROS_UPLOAD_ANONYMOUSPREFIXES` | `["**"]` | 匿名访问匹配范围；部署时按实际文件权限要求设置 |

资源目录的解析还受对应应用上下文影响，不应把表中的相对路径直接视为宿主机路径。文件路径、挂载与数据库元数据的一致性检查见 [文件与文档维护](./runtime-capability-maintenance)。

## 认证与初始化

| 配置键 | 容器环境变量 | 基座值或代码默认值 | 说明 |
| --- | --- | --- | --- |
| `ouroboros.security.token.accessTokenExpire` | `OUROBOROS_SECURITY_TOKEN_ACCESSTOKENEXPIRE` | 基座 `28800` 秒 | Access Token 有效期；未加载基座配置时，代码默认 `10800` 秒 |
| `ouroboros.security.token.refreshTokenExpire` | `OUROBOROS_SECURITY_TOKEN_REFRESHTOKENEXPIRE` | 基座 `86400` 秒 | Refresh Token 有效期；代码默认 `604800` 秒 |
| `ouroboros.security.token.accessTokenClaims` | `OUROBOROS_SECURITY_TOKEN_ACCESSTOKENCLAIMS` | 代码默认 `["sub", "subject_type", "subject_id"]` | Access Token 包含的身份声明类型 |
| `ouroboros.security.rbac.autoCreateUser.enabled` | `OUROBOROS_SECURITY_RBAC_AUTOCREATEUSER_ENABLED` | 代码默认 `true` | 启用自动创建用户与管理员角色绑定 |
| `ouroboros.security.rbac.autoCreateUser.userName` | `OUROBOROS_SECURITY_RBAC_AUTOCREATEUSER_USERNAME` | 代码默认 `admin` | 自动维护的管理员账号 |
| `ouroboros.security.rbac.autoCreateUser.password` | `OUROBOROS_SECURITY_RBAC_AUTOCREATEUSER_PASSWORD` | 空 | 新建用户时为空则生成随机密码；非空时也会修改已存在用户的密码 |
| `ouroboros.platform.cache.token.secret` | `OUROBOROS_PLATFORM_CACHE_TOKEN_SECRET` | 基座未设置 | 平台缓存管理条目令牌的签名密钥；装配该管理能力时必须非空 |

自动创建用户逻辑会在平台上下文刷新时检查账号。显式保留 `autoCreateUser.password` 会影响已有账号密码，不应把它当成只生效一次的初始化参数。首次登录与随机密码获取见 [Docker Compose 部署 / 首次登录](./deployment-methods/docker-compose#6-首次登录)。

开发平台为缓存管理签名密钥提供了镜像内的兼容默认值，共享环境应显式设置自己的密钥，具体方式见 [开发平台配置项](./development-platform-configuration#平台自身配置)。

## WebSocket 与消息代理

以下配置仅在 WebSocket 模块装配后使用。前缀为 `ouroboros.websocket`，表中未特别说明的值来自代码默认值。

| 配置键 | 容器环境变量 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `broker-type` | `OUROBOROS_WEBSOCKET_BROKERTYPE` | `simple` | 可选 `simple`、`rabbitmq-stomp-relay`、`redis-pubsub`；按此小写形式填写，影响后端装配条件 |
| `endpoint-path` | `OUROBOROS_WEBSOCKET_ENDPOINTPATH` | `/websocket/stomp` | WebSocket 入口，修改后同步代理与客户端 |
| `allowed-origin-patterns` | `OUROBOROS_WEBSOCKET_ALLOWEDORIGINPATTERNS` | `*` | 允许的来源模式 |
| `sockjs-enabled` | `OUROBOROS_WEBSOCKET_SOCKJSENABLED` | `true` | 启用 SockJS 支持 |
| `instance-id` | `OUROBOROS_WEBSOCKET_INSTANCEID` | 运行时回退到 `spring.application.name` | 多实例通信使用的实例标识，应确保唯一 |
| `rabbitmq.host` | `OUROBOROS_WEBSOCKET_RABBITMQ_HOST` | `localhost` | STOMP relay 主机，与 AMQP 连接分别配置 |
| `rabbitmq.port` | `OUROBOROS_WEBSOCKET_RABBITMQ_PORT` | `61613` | STOMP relay 端口，与 AMQP `5672` 分别配置 |
| `rabbitmq.virtual-host` | `OUROBOROS_WEBSOCKET_RABBITMQ_VIRTUALHOST` | `/` | STOMP 使用的 virtual host |
| `rabbitmq.system-login` | `OUROBOROS_WEBSOCKET_RABBITMQ_SYSTEMLOGIN` | `system` | 系统 STOMP 连接账号 |
| `rabbitmq.system-passcode` | `OUROBOROS_WEBSOCKET_RABBITMQ_SYSTEMPASSCODE` | 未设置 | 系统 STOMP 连接密码 |
| `rabbitmq.client-login` | `OUROBOROS_WEBSOCKET_RABBITMQ_CLIENTLOGIN` | `client` | 客户端 STOMP 连接账号 |
| `rabbitmq.client-passcode` | `OUROBOROS_WEBSOCKET_RABBITMQ_CLIENTPASSCODE` | 未设置 | 客户端 STOMP 连接密码 |
| `rabbitmq.user-destination-broadcast` | `OUROBOROS_WEBSOCKET_RABBITMQ_USERDESTINATIONBROADCAST` | `/topic/user-destination` | 用户目的地广播地址 |
| `rabbitmq.user-registry-broadcast` | `OUROBOROS_WEBSOCKET_RABBITMQ_USERREGISTRYBROADCAST` | `/topic/user-registry` | 用户注册表广播地址 |
| `rabbitmq.system-heartbeat-send-interval` | `OUROBOROS_WEBSOCKET_RABBITMQ_SYSTEMHEARTBEATSENDINTERVAL` | `10000` 毫秒 | 系统发送心跳间隔 |
| `rabbitmq.system-heartbeat-receive-interval` | `OUROBOROS_WEBSOCKET_RABBITMQ_SYSTEMHEARTBEATRECEIVEINTERVAL` | `10000` 毫秒 | 系统接收心跳间隔 |
| `rabbitmq.registry-exchange` | `OUROBOROS_WEBSOCKET_RABBITMQ_REGISTRYEXCHANGE` | `websocket.registry` | 注册信息 Exchange |
| `redis.topic-broadcast-channel` | `OUROBOROS_WEBSOCKET_REDIS_TOPICBROADCASTCHANNEL` | `websocket:topic` | 主题广播频道 |
| `redis.user-broadcast-channel` | `OUROBOROS_WEBSOCKET_REDIS_USERBROADCASTCHANNEL` | `websocket:user` | 用户消息广播频道 |
| `redis.session-broadcast-channel` | `OUROBOROS_WEBSOCKET_REDIS_SESSIONBROADCASTCHANNEL` | `websocket:session` | 会话广播频道 |
| `redis.user-registry-channel` | `OUROBOROS_WEBSOCKET_REDIS_USERREGISTRYCHANNEL` | `websocket:user-registry` | 用户注册表频道 |
| `redis.registry-key-prefix` | `OUROBOROS_WEBSOCKET_REDIS_REGISTRYKEYPREFIX` | `websocket:registry` | 注册信息键前缀 |
| `redis.registry-entry-ttl` | `OUROBOROS_WEBSOCKET_REDIS_REGISTRYENTRYTTL` | `60s` | 注册信息有效期 |
| `redis.heartbeat-interval` | `OUROBOROS_WEBSOCKET_REDIS_HEARTBEATINTERVAL` | `20s` | 注册信息心跳间隔 |

Redis 连接本身使用 `spring.data.redis.*`。RabbitMQ relay 还需要 STOMP 能力与对应凭据，不能仅凭 AMQP 可用判断配置完成。验证步骤见 [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance)。

## 其他常用能力

以下均为对应模块的代码默认值，只有装配该能力时才适用。

| 配置键 | 容器环境变量 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `ouroboros.document-management.enabled` | `OUROBOROS_DOCUMENTMANAGEMENT_ENABLED` | `true` | 文档管理模块开关 |
| `ouroboros.document-management.storage-type` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGETYPE` | `filesystem` | 文档存储实现选择 |
| `ouroboros.document-management.persistence-type` | `OUROBOROS_DOCUMENTMANAGEMENT_PERSISTENCETYPE` | `typed-model` | 文档元数据持久化实现选择 |
| `ouroboros.document-management.enable-web-api` | `OUROBOROS_DOCUMENTMANAGEMENT_ENABLEWEBAPI` | `true` | 文档管理 API 开关 |
| `ouroboros.document-management.storage.filesystem.base-path` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGE_FILESYSTEM_BASEPATH` | `/app/deploy/data/document-libraries` | 文档库本地存储根目录，应用配置可能覆盖 |
| `ouroboros.document-management.storage.filesystem.path-strategy` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGE_FILESYSTEM_PATHSTRATEGY` | `HASH` | 支持 `HASH`、`DATE`、`FLAT` |
| `ouroboros.document-management.storage.filesystem.buffer-size` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGE_FILESYSTEM_BUFFERSIZE` | `8192` 字节 | 文件 IO 缓冲区 |
| `ouroboros.document-management.storage.filesystem.calculate-checksum` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGE_FILESYSTEM_CALCULATECHECKSUM` | `true` | 是否计算文件校验和 |
| `ouroboros.document-management.storage.filesystem.temp-path` | `OUROBOROS_DOCUMENTMANAGEMENT_STORAGE_FILESYSTEM_TEMPPATH` | 未设置 | 文件上传临时目录 |
| `ouroboros.scheduler.quartz.default-group` | `OUROBOROS_SCHEDULER_QUARTZ_DEFAULTGROUP` | `Ouroboros` | Quartz 默认任务组 |
| `ouroboros.data-model.snowflake.worker-id` | `OUROBOROS_DATAMODEL_SNOWFLAKE_WORKERID` | `0` | Snowflake 工作节点编号 |
| `ouroboros.data-model.snowflake.datacenter-id` | `OUROBOROS_DATAMODEL_SNOWFLAKE_DATACENTERID` | `0` | Snowflake 数据中心编号，多节点需协调分配 |
| `ouroboros.business-event.delivery.batch-size` | `OUROBOROS_BUSINESSEVENT_DELIVERY_BATCHSIZE` | `100` | 持久业务事件每批处理数量 |
| `ouroboros.business-event.delivery.lease-seconds` | `OUROBOROS_BUSINESSEVENT_DELIVERY_LEASESECONDS` | `60` 秒 | 业务事件处理租约 |
| `ouroboros.business-event.delivery.max-retry-count` | `OUROBOROS_BUSINESSEVENT_DELIVERY_MAXRETRYCOUNT` | `6` | 业务事件最大重试次数 |
| `ouroboros.business-event.mutation.max-ids` | `OUROBOROS_BUSINESSEVENT_MUTATION_MAXIDS` | `500` | 单条变更事实允许的 ID 数量上限，必须为正数 |
| `ouroboros.business-event.mutation.max-payload-bytes` | `OUROBOROS_BUSINESSEVENT_MUTATION_MAXPAYLOADBYTES` | `65536` 字节 | 单条变更事实负载上限，必须为正数 |

表中的实现选择项不代表相应外部服务已配置，具体可用实现由应用依赖决定。

## 配置示例与生效验证

### 通过容器环境变量配置

以下为现有 Compose 服务的 `environment` 片段，将 `business-app` 替换为实际服务名，并保留服务的镜像、挂载、网络等字段。开发平台也可使用这些基座参数。

```yaml
services:
  business-app:
    environment:
      SPRING_DATASOURCE_TYPE: com.alibaba.druid.pool.DruidDataSource
      SPRING_DATASOURCE_DRIVERCLASSNAME: com.mysql.cj.jdbc.Driver
      SPRING_DATASOURCE_URL: jdbc:mysql://db.internal:3306/business_app?useUnicode=true&characterEncoding=utf-8&nullCatalogMeansCurrent=true
      SPRING_DATASOURCE_USERNAME: app_user
      SPRING_DATASOURCE_PASSWORD: ${APP_DB_PASSWORD:?Set APP_DB_PASSWORD}
      SPRING_DATASOURCE_MIGRATIONSTRATEGY: AUTO
      SPRING_RABBITMQ_HOST: mq.internal
      SPRING_RABBITMQ_PORT: "5672"
      SPRING_RABBITMQ_USERNAME: app_user
      SPRING_RABBITMQ_PASSWORD: ${APP_MQ_PASSWORD:?Set APP_MQ_PASSWORD}
      SPRING_SERVLET_MULTIPART_MAXFILESIZE: 200MB
      SPRING_SERVLET_MULTIPART_MAXREQUESTSIZE: 200MB
      OUROBOROS_UPLOAD_FILESYSTEM_ROOTPATH: /app/deploy/data/uploads
      OUROBOROS_WEBSOCKET_BROKERTYPE: simple
      OUROBOROS_SECURITY_RBAC_AUTOCREATEUSER_ENABLED: "true"
```

在 Compose 项目的 `.env` 中提供 `APP_DB_PASSWORD` 和 `APP_MQ_PASSWORD`，由上述映射传给容器。`env_file` 中则应直接写表中完整的容器变量名，例如 `SPRING_DATASOURCE_PASSWORD=实际密码`。布尔值和纯数字在 Compose 的 `environment` 中使用字符串。

### 通过配置文件配置

以下为部署目录中的 `application.yml` 片段。密码占位符需要由容器环境变量提供；使用 Compose 中已有的同名 `SPRING_*` 变量时，以其值为准。

```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://db.internal:3306/business_app?useUnicode=true&characterEncoding=utf-8&nullCatalogMeansCurrent=true
    username: app_user
    password: ${APP_DB_PASSWORD}
    migration-strategy: AUTO
  rabbitmq:
    host: mq.internal
    port: 5672
    username: app_user
    password: ${APP_MQ_PASSWORD}

ouroboros:
  upload:
    fileSystem:
      rootPath: /app/deploy/data/uploads
  websocket:
    broker-type: simple
    endpoint-path: /websocket/stomp
```

### 生效验证

环境变量变化后需要重建容器，单独执行 `docker compose restart` 不会更新容器环境。执行 `docker compose up -d --force-recreate <服务名>`，或通过 Kubernetes Deployment 的 `env` 更新触发滚动发布。配置文件变化后按部署流程重启或重建目标实例。

重建后可通过 `docker compose exec <服务名> printenv OUROBOROS_UPLOAD_FILESYSTEM_ROOTPATH` 检查非敏感变量是否进入容器，再核对实际镜像、挂载、配置来源及启动日志，验证依赖连接、上传和受影响业务。变量已进入容器不等于配置一定生效，还需排查更高优先级的系统属性或 `SPRING_APPLICATION_JSON`。运行实例创建参数与配置中心的覆盖关系见 [开发平台配置项](./development-platform-configuration#配置中心中的平台默认值)。
