---
title: 环境准备
sidebar_position: 3
---

# 环境准备

适用对象：第一次在本地或团队环境中启动潮汐栈的读者。

## 最小准备项

- 一台能够运行 Docker 的机器
- 可访问镜像源和相关依赖的网络环境
- 浏览器和基础命令行能力
- 如果要运行开发平台，需确保本机或目标主机允许访问 Docker Engine API

## 先判断你属于哪种场景

### 本地体验

适合：

- 个人试用
- 功能演示
- 快速验证一个简单业务流程

推荐方式：

- 优先使用 Docker Desktop
- 按照 [安装开发平台](./install-develop-platform) 的 compose 路径快速启动

### 团队环境

适合：

- 多人协作
- 长期联调
- 需要稳定的数据、消息队列和持久化目录

推荐方式：

- 使用 Docker Engine
- 结合 [运维管理](../operations/) 规划依赖、端口、存储与升级方式

## Docker 安装建议

### Docker Desktop

适合本地体验环境，优点是安装和管理都更简单。Mac、Windows 和 Linux 桌面环境都可以优先选择 Docker Desktop。

### Docker Engine

适合团队开发服务器或不需要图形界面的环境。常见 Linux 服务器安装后，还需要额外确认：

- Docker 服务能够正常启动
- 当前用户具有执行 Docker 命令的权限
- 目标机器网络策略允许开发平台访问所需端口

## 准备 Docker Engine 访问

开发平台需要调用 Docker Engine 创建和管理调试实例。手册提供的 Compose 文件会把宿主机的 `/var/run/docker.sock` 挂载到平台容器，不需要开放 TCP `2375` 端口。

开始安装前执行：

```bash
docker info
```

命令成功返回服务端信息后，再继续安装。

:::warning
Docker Socket 可以控制宿主机上的容器，权限接近宿主机管理员权限。只把它挂载给受信任的平台容器；不要把 `/var/run/docker.sock` 暴露给业务容器，也不要启用无 TLS 的 `tcp://0.0.0.0:2375`。
:::

如果团队环境使用远程 Docker，必须通过 TLS、受限代理或企业容器平台接入。快速上手 Compose 不支持无认证的远程 Docker。

## 验证容器能访问 Docker

启动开发平台后执行：

```bash
docker compose exec ouroboros-develop test -S /var/run/docker.sock
```

命令退出码为 `0`，且平台日志中没有 Docker 连接错误，说明 Socket 已正确挂载。

## 下一步

环境准备完成后，继续看 [安装开发平台](./install-develop-platform)。

如果你准备的是团队共享环境或长期运行环境，继续看 [安装与初始化](../operations/installation-and-initialization)。
