---
sidebar_position: 99.3
title: 运维常见问题
---

# 运维常见问题

## 容器已启动，为什么平台仍不可用？

容器处于运行状态不代表应用及依赖已就绪。先看平台日志，再检查数据库、消息服务和入口代理。以下命令适用于手册的 Compose 部署，服务名按实际清单调整：

```bash
docker compose ps -a
docker compose logs --since 15m --tail 500 ouroboros-develop
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
```

通过实际平台地址检查 HTTP 结果：

```bash
export PLATFORM_URL='https://platform.example.com'
curl -i --max-time 5 "$PLATFORM_URL/actuator/health"
```

保留发生时间、请求路径、HTTP 状态和对应日志，再按 [故障排查](../operations/troubleshooting) 定位。入口若限制健康端点，需要在允许的网络和认证条件下检查。

## 平台能打开，为什么应用实例创建或启动失败？

先确认应用使用 Docker 还是 Kubernetes 后端，再检查该后端的连接权限、资源和运行日志。

Docker 部署重点检查 Engine API 是否可达、基座镜像是否可用、工作区是否可写及挂载是否一致。`HOST_WORKSPACE_PATH` 填宿主机工作区绝对路径，并与平台容器工作区对应同一份文件。

Kubernetes 部署检查集群连接、命名空间、RBAC、镜像拉取和存储挂载。平台数据库可用不代表业务应用的数据源可用。

对应说明见 [Docker Compose](../operations/deployment-methods/docker-compose)、[远程 Docker](../operations/deployment-methods/remote-docker) 和 [Kubernetes](../operations/deployment-methods/kubernetes)。

## 页面正常，为什么任务、消息或实时状态异常？

| 症状 | 优先检查 |
| --- | --- |
| 定时任务未执行 | 任务启用状态、调度时间和时区、运行实例日志 |
| 消息积压 | 队列和绑定、消费者数量、未确认消息、消费异常 |
| 页面状态不更新 | WebSocket 握手、认证、订阅目的地、服务端发送记录 |

RabbitMQ 的只读检查示例：

```bash
docker compose exec -T ouroboros-rabbitmq rabbitmqctl \
  list_queues name messages_ready messages_unacknowledged consumers
```

默认 WebSocket 入口为 `/websocket/stomp`。代理需要支持连接升级；连上以后还要确认认证和业务订阅成功。任务、消息和页面反馈的完整排查见 [任务、消息与实时链路维护](../operations/task-message-and-realtime-link-maintenance)。

## 应用发布后异常，什么时候回退？

记录本次应用版本、运行实例、镜像和配置变更，先判断是否由本次发布引起。回退前核对新旧版本的数据兼容性，尤其是表结构、初始化数据和外部系统副作用。

应用版本回退不会自动撤销数据库变更或已经发出的消息。按 [业务应用发布与回退](../operations/application-release-and-rollback) 执行并验证关键业务流程；平台自身升级走 [平台升级与回滚](../operations/release-upgrade-and-rollback)。

## 升级前需要备份什么？

至少保存数据库、配置和环境变量、上传附件等持久化文件、镜像标签及部署清单。需要恢复的业务应用也应保留版本和外部连接配置。

备份是否可用以恢复验证为准。具体范围和操作见 [备份与恢复](../operations/backup-monitoring-and-troubleshooting)。

## 排障该看服务日志还是业务日志？

启动失败、依赖连接、容器创建和执行异常查看服务日志；核对操作者、业务对象及操作结果查看业务日志。两者按发生时间、业务标识和请求标识关联。

记录问题时附环境版本、时间、复现步骤、影响范围及脱敏后的响应和日志。业务操作回溯见 [业务日志与审计回溯](../operations/business-logs-and-audit-traceability)，持续巡检见 [运维管理](../operations/)。
