---
title: 环境要求
sidebar_position: 4
---

# 环境要求

在正式部署或团队使用前，建议先把依赖、网络、存储和运行边界确认清楚。

## 核心依赖

### Docker

至少需要一个可正常运行的 Docker 环境，并确认：

- `docker` 命令可执行
- Docker 服务稳定可用
- 开发平台能够访问 Docker Engine API

### 数据库

当前最常见的安装路径通常会准备一套 MySQL 8.0 环境，并要求数据库用户具备：

- 创建数据库权限
- 创建表和迁移表结构权限
- 正常读写平台数据库的权限

### 消息队列

当前最常见的安装路径通常会准备一套 RabbitMQ 环境，历史示例里常见镜像是 `rabbitmq:3-management`。

如果你的团队已经统一接入了其他托管式数据库、消息能力或经过内部封装的依赖组件，请以团队实际部署方案为准。

## 典型端口与连接点

以下端口是当前安装路径中最常见的一组：

- `80`：开发平台访问入口
- `/var/run/docker.sock`：同机 Docker Engine 访问入口，不开放 TCP 端口
- `3306`：MySQL
- `5672`：RabbitMQ
- `15672`：RabbitMQ 管理界面
- `15692`：RabbitMQ 监控相关端口

如果这些端口在你的环境中已经被占用，需要在安装时一并调整映射和配置。

## 典型目录与持久化建议

如果使用当前推荐的 compose 方案，通常至少要为以下内容准备持久化空间或固定目录：

- `docker-compose.yml`
- `.env`
- `workspace`
- `mysql-data`：数据库数据
- `logs`：日志目录

团队长期环境里，建议不要把这些目录仅放在临时磁盘或易失性容器层中。

其中 `HOST_WORKSPACE_PATH` 需要指向宿主机 `workspace/` 的绝对路径，不能写容器内路径。

## 网络与访问策略

在团队环境中，建议提前确认：

- 平台容器、数据库和 RabbitMQ 是否在同一 Docker 网络中
- 网络命名、网段和主机名是否固定
- Docker Socket 是否只挂载给受信任的平台容器
- 浏览器访问入口、反向代理和安全策略是否已经明确

当前推荐 compose 和多数示例默认使用以下名称：

- Docker 网络：`ouroboros-dev`
- 数据库主机名：`ouroboros-dev-db`
- RabbitMQ 主机名：`ouroboros-rabbitmq`

如果你的正式环境不沿用这些名称，需要同步修改 `application.yml` 和相关发布配置。

远程 Docker 必须通过 TLS、受限代理或企业容器平台接入。禁止在团队环境中开放无认证的 `tcp://0.0.0.0:2375`。

## 本地体验环境

适合快速试用，优先关注：

- Docker 可用
- 浏览器可访问平台入口
- 具备最小依赖即可

## 团队长期环境

适合持续开发与联调，优先关注：

- 稳定存储和数据持久化
- 可维护的网络与端口策略
- 备份、回滚和升级窗口

## 继续阅读

- [安装与初始化](./installation-and-initialization)
- [部署架构](./deployment-architecture)
