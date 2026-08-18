---
title: 安装开发平台
sidebar_position: 4
---

# 安装开发平台

适用对象：需要先把潮汐栈开发平台运行起来的新读者、演示环境搭建者和实施同学。

## 推荐方式

使用 `docker compose` 部署开发平台。安装脚本不作为支持的安装路径。

这种方式更适合：

- 本地体验环境
- 演示环境
- 团队共享的基础开发环境
- 后续还想逐步接入自定义配置、外部数据库或反向代理的场景

如果你需要把数据库、RabbitMQ、镜像仓库和配置文件拆成更细的运维单元，继续看 [安装与初始化](../operations/installation-and-initialization)。

## Compose 会帮你启动什么

当前推荐的 `docker-compose.yml` 会启动三类容器：

1. `ouroboros-develop`：开发平台主容器
2. `ouroboros-dev-db`：MySQL 8.0
3. `ouroboros-rabbitmq`：RabbitMQ 管理版

其中 `ouroboros-develop` 运行镜像构建在 `ouroboros-mothership` 基座之上，因此版本应保持一致。

## 下载文件

- Compose 文件：[docker-compose.yml](.assets/docker-compose.yml)
- 环境变量示例：[docker-compose.env.example](.assets/docker-compose.env.example)

## 准备工作目录

建议先创建一个独立工作目录，并至少准备以下内容：

- `docker-compose.yml`
- `.env`
- `workspace/`
- `mysql-data/`
- `logs/`

目录形态示例：

```text
tidestack-develop/
├── docker-compose.yml
├── .env
├── workspace/
├── mysql-data/
└── logs/
```

## 配置 `.env`

把下载的 `docker-compose.env.example` 重命名为 `.env`，再至少确认以下字段：

- `OUROBOROS_VERSION`：开发平台镜像版本，默认建议与仓库当前版本保持一致
- `PLATFORM_PORT`：开发平台访问端口
- `HOST_WORKSPACE_PATH`：宿主机 `workspace/` 的绝对路径
- `MYSQL_ROOT_PASSWORD`：MySQL root 密码
- `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS`：RabbitMQ 账号和密码

`HOST_WORKSPACE_PATH` 必须写宿主机绝对路径，不要写容器路径。

把示例中的 `replace-with-a-random-password` 全部替换为随机强密码。Compose 会在必填变量缺失时直接报错，不会使用公开默认密码启动。

Mac / Linux 常见写法：

```dotenv
HOST_WORKSPACE_PATH=/Users/yourname/tidestack-develop/workspace
```

Windows 常见写法：

```dotenv
HOST_WORKSPACE_PATH=D:/tidestack-develop/workspace
```

## 启动步骤

### Mac / Linux

```bash
mkdir -p ~/tidestack-develop/{workspace,mysql-data,logs}
cd ~/tidestack-develop
docker compose pull
docker compose up -d
```

### Windows

```powershell
mkdir D:\tidestack-develop
mkdir D:\tidestack-develop\workspace,D:\tidestack-develop\mysql-data,D:\tidestack-develop\logs
cd D:\tidestack-develop
docker compose pull
docker compose up -d
```

## 安装完成后先检查什么

- `docker compose ps` 中三个容器都已启动
- 浏览器可以打开平台登录页
- 能正常进入开发平台主页
- `docker compose logs -f ouroboros-develop` 中没有持续性的数据库或 RabbitMQ 连接报错
- `docker compose exec ouroboros-develop test -S /var/run/docker.sock` 执行成功

## 常用运维命令

启动后常用的命令通常只有这几条：

```bash
docker compose ps
docker compose logs -f ouroboros-develop
docker compose restart ouroboros-develop
docker compose down
```

如果你修改了镜像版本或 compose 配置，通常执行：

```bash
docker compose pull
docker compose up -d
```

## 什么时候从默认 Compose 往外拆

出现下面这些情况时，建议继续看运维章节，把默认 compose 方案拆成更细的部署方案：

- 需要复用已有数据库或 RabbitMQ
- 需要固定镜像仓库、版本配对和发布策略
- 需要接入反向代理、域名、证书或统一安全策略
- 需要在 `application.yml` 中加入更多运行配置

这时继续看 [安装与初始化](../operations/installation-and-initialization)。

## 获取首次登录密码

首次启动且数据库中没有用户时，平台会创建 `admin` 用户并生成随机密码。执行下面的命令查找该次初始化日志：

```bash
docker compose logs ouroboros-develop | grep 'Generated random password'
```

使用日志中的密码首次登录，然后立即在用户管理中修改密码。日志中没有该记录，通常表示当前数据库已经完成过初始化；此时应使用现有管理员账号或执行管理员密码重置流程，不能使用历史固定口令尝试登录。

## 下一步

安装成功后，建议继续：

1. [创建第一个应用](./create-first-application)
2. [完成第一个业务功能](./first-business-feature)

如果你准备继续拆分数据库、RabbitMQ、反向代理或环境配置，接着看 [安装与初始化](../operations/installation-and-initialization)。
