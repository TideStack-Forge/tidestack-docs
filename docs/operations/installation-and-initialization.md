---
title: 安装与初始化
sidebar_position: 5
---

# 安装与初始化

安装与初始化的核心目标是：让平台可访问、基础依赖可用、开发入口正常工作，并且后续环境维护有明确边界。

## 推荐先从 Compose 方案开始

当前运维主线推荐先以 `docker-compose.yml` 作为最小可维护部署单元，而不是直接手写整套 `docker run`。

这样做的好处是：

- 目录、端口、依赖关系更清晰
- 升级和回滚更容易复现
- 团队成员更容易共享同一套启动方式
- 后续拆分数据库、RabbitMQ 或接入反向代理时，也有一个稳定起点

快速上手入口请先看 [安装开发平台](../getting-started/install-develop-platform)。

## 先理解运行镜像关系

当前开发平台运行时涉及两个关键镜像：

- `ouroboros-mothership`：运行基座，实际承载启动 Jar 和基础运行层
- `ouroboros-develop`：开发平台镜像，构建在 `ouroboros-mothership` 之上，负责补充开发平台所需资源和层

无论你使用默认 compose，还是后续改成独立中间件部署，这两个镜像都应保持同一版本。

## 推荐的工作目录结构

推荐至少准备以下内容：

- `docker-compose.yml`
- `.env`
- `workspace/`
- `mysql-data/`
- `logs/`
- `application.yml`：可选，只有在你需要补充更复杂配置时再创建

其中：

- `docker-compose.yml` 负责定义容器、端口、网络和挂载
- `.env` 负责放版本号、端口和密码等可变参数
- `workspace/` 是开发平台宿主机工作区
- `mysql-data/` 是 MySQL 数据目录
- `logs/` 通过 `/app/deploy` 挂载链路落到宿主机

## 推荐的 Compose 组成

当前推荐 compose 文件通常包括三个服务：

- `ouroboros-develop`
- `ouroboros-dev-db`
- `ouroboros-rabbitmq`

它们一般位于同一个 `ouroboros-dev` 网络中，主容器把当前工作目录挂载到 `/app/deploy/`，再通过 `HOST_WORKSPACE_PATH` 告诉平台宿主机工作区的绝对路径。

这条挂载链路很重要：

- `/app/deploy`：容器内的部署目录
- `HOST_WORKSPACE_PATH`：宿主机真实路径，供开发平台后续创建调试容器时使用

如果两者配置不一致，平台可能能启动，但后续应用调试与容器创建会出问题。

## `.env` 里最需要确认的几个字段

- `OUROBOROS_VERSION`：平台镜像版本
- `PLATFORM_PORT`：开发平台访问端口
- `HOST_WORKSPACE_PATH`：宿主机 `workspace/` 绝对路径
- `MYSQL_ROOT_PASSWORD`：MySQL root 密码
- `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`：RabbitMQ 访问信息

`HOST_WORKSPACE_PATH` 必须写宿主机绝对路径。对 Windows 环境，建议使用 `D:/path/to/workspace` 这种正斜杠写法。

数据库和 RabbitMQ 密码必须在首次启动前显式设置。示例 Compose 不再提供公开默认密码，缺少必填变量时会直接停止解析。

## 启动与初始化命令

常见启动方式：

```bash
docker compose pull
docker compose up -d
```

初始化后，建议立即检查：

- `docker compose ps` 中三个容器都正常运行
- 平台登录页可访问
- 应用管理和核心开发入口可进入
- 数据库与 RabbitMQ 连接没有明显报错
- Docker API 可用，能够为应用创建运行容器
- 宿主机 `workspace/` 目录权限正常，开发平台可以写入工作区数据

使用同机 Docker 时，再确认平台容器能看到 Docker Socket：

```bash
docker compose exec ouroboros-develop test -S /var/run/docker.sock
```

## 什么时候需要补 `application.yml`

默认 compose 示例已经把最小数据库和 RabbitMQ 连接配置写进了容器环境变量，所以首次启动通常不必再手写 `application.yml`。

但出现下面这些场景时，建议在工作目录中增加 `application.yml`：

- 需要改成外部数据库或外部 RabbitMQ
- 需要补充更多 Spring Boot 或平台配置
- 需要把部分运行参数从 compose 环境变量中迁移出来

这时由于当前工作目录已经挂载到 `/app/deploy/`，平台会自动读取这个文件。

## 外部化依赖时的最小配置思路

如果你不再使用 compose 自带的 MySQL 或 RabbitMQ，通常只需要做两件事：

1. 从 `docker-compose.yml` 中移除对应服务，或停止映射对应端口
2. 在 `.env` 或 `application.yml` 中把连接地址改成实际依赖地址

最小配置骨架可参考：

```yaml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://<数据库地址>:3306/ouroboros-develop?useUnicode=true&characterEncoding=utf-8&nullCatalogMeansCurrent=true
    username: root
    password: <密码>
    migration-strategy: AUTO
  rabbitmq:
    host: <RabbitMQ地址>
    port: 5672
    username: guest
    password: guest
```

:::warning
当前安装方式下，开发平台通常会在开发数据库中自动创建应用测试数据库，因此数据库用户需要具备创建数据库权限。
:::

## 什么时候再继续往下拆

出现下面这些情况时，建议把默认 compose 方案继续拆成更细的正式部署方案：

- 需要独立托管数据库、RabbitMQ 或对象存储
- 需要接入反向代理、域名和证书
- 需要区分开发、测试、演示等多套环境
- 需要纳入正式升级、回滚和备份流程

即使继续往下拆，也建议保留当前这几个基本约束：

- `ouroboros-develop` 与 `ouroboros-mothership` 版本配套
- 开发平台容器仍然有稳定的 `/app/deploy/` 挂载目录
- `HOST_WORKSPACE_PATH` 始终指向宿主机真实工作区

## 首次管理员登录

首次启动且数据库中没有用户时，平台会创建 `admin` 用户并生成随机密码。通过初始化日志取得密码：

```bash
docker compose logs ouroboros-develop | grep 'Generated random password'
```

首次登录后立即修改密码。团队环境还应把管理员账号、密码轮换和应急重置纳入统一凭据管理，不得沿用历史固定口令。

## 继续阅读

- [业务应用发布与回退](./application-release-and-rollback)
- [平台升级与回滚](./release-upgrade-and-rollback)
- [备份、监控与排障](./backup-monitoring-and-troubleshooting)
