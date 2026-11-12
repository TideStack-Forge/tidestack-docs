---
title: 监控与告警
sidebar_position: 11
---

# 监控与告警

监控需要分别覆盖平台入口、后端就绪、基础依赖和业务运行结果。首页能打开或容器处于运行状态，都不足以判断平台可用。

本页命令适用于配套 Compose 环境，使用 Bash。外部依赖使用对应服务的监控方式，业务应用使用自身的运行端点。

## 执行一次基础巡检

先进入部署目录，将 `PLATFORM_URL` 改为实际地址和端口。Compose 会读取 `.env`，当前 shell 不会自动获得其中的变量。

```bash
DEPLOY_DIR=/srv/tidestack
PLATFORM_URL=http://127.0.0.1:80
cd "$DEPLOY_DIR"

docker compose ps
curl -fsS --max-time 5 -o /dev/null "$PLATFORM_URL/"
curl -fsS --max-time 5 "$PLATFORM_URL/actuator/health"
docker compose exec -T ouroboros-dev-db sh -c 'mysqladmin -uroot -p"$MYSQL_ROOT_PASSWORD" ping'
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose exec -T ouroboros-rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
df -h "$DEPLOY_DIR"
docker stats --no-stream ouroboros-develop ouroboros-dev-db ouroboros-rabbitmq
```

| 检查项 | 预期结果 | 异常时先查 |
| --- | --- | --- |
| 容器 | 三个服务保持运行，没有反复重启 | 容器退出原因和启动日志 |
| 平台入口 | HTTP 请求成功 | 域名、代理、端口和 Nginx |
| 后端健康 | `/actuator/health` 返回 `UP` | 平台生命周期和依赖初始化 |
| MySQL | `mysqld is alive` | 实际连接地址、权限、容量 |
| RabbitMQ | `Ping succeeded` | 节点状态、认证和资源限制 |
| 队列 | 关键队列有预期消费者，积压没有持续增长 | 消费者日志与处理结果 |
| 容量 | 磁盘、内存有足够余量 | 文件、日志、备份和实例资源 |

启动阶段的健康接口可能返回 `503`。给初始化保留合理时间；持续不就绪时按 [故障排查](./troubleshooting) 处理，避免反复重启掩盖首个异常。

### Docker 运行后端

同机 Socket 部署另执行：

```bash
docker compose exec -T ouroboros-develop test -S /var/run/docker.sock
docker compose exec -T ouroboros-develop sh -c 'test -w /app/deploy && test -d /app/deploy/workspace'
```

两个命令返回 `0` 只表示路径与权限检查通过。平台能否创建实例，仍需用测试应用验证。远程 Docker 使用已配置端点的等价检查。

### Kubernetes 运行后端

在目标集群与命名空间检查 Pod、PVC 和事件，并对照运行实例详情中的资源名称与端点。具体步骤见 [Kubernetes 部署](./deployment-methods/kubernetes#巡检与排障)。

## 采集日志

```bash
docker compose logs --since 15m --tail 1000 ouroboros-develop
docker compose logs --since 15m --tail 500 ouroboros-dev-db ouroboros-rabbitmq
```

镜像启动脚本把服务日志目录设在 `/app/deploy/logs/service`，部署配置也可能把日志输出到标准输出。应同时核对实际 `logs/` 文件和容器日志，采集首个异常、时间、服务、实例及请求关联信息。

业务应用错误应查看目标实例日志；用户操作回溯见 [业务日志与审计回溯](./business-logs-and-audit-traceability)。日志轮转、保留和磁盘告警需要在实际使用的日志系统中配置。

## 配置告警

以下为起始策略，频率和阈值按业务目标调整。每条告警都应有值班接收人、对应排障入口和恢复确认方式。

| 信号 | 起始策略 | 对应动作 |
| --- | --- | --- |
| HTTP 与后端健康 | 连续两次失败；启动期单独处理 | 检查入口和后端就绪 |
| 容器或 Pod | 非计划退出、反复重启、持续未就绪 | 保留日志并检查退出原因 |
| 磁盘 | `80%` 告警，`90%` 升级处理 | 定位增长来源，按保留策略处理 |
| 数据库 | 连接失败、连接耗尽、慢查询持续增加 | 检查数据库及业务访问 |
| 队列 | 预期消费者消失、积压持续增长 | 检查绑定、消费者和业务结果 |
| 备份 | 最近成功备份超过 RPO，或完整性校验失败 | 处理备份失败并核对可恢复时间点 |
| 恢复演练 | 超过约定周期没有成功结果 | 安排隔离恢复并记录耗时 |
| 关键业务 | 任务结果缺失、通知或实时更新失败 | 执行对应端到端验证 |

当前默认公开的 actuator 健康入口是 `GET /actuator/health`。不要把 `/actuator/metrics` 或 `/actuator/prometheus` 当作已经可用的接口；指标采集需要另外配置和鉴权。RabbitMQ 映射 `15692` 也不代表指标插件已经启用。

## 验证业务链路

定期选择一条可识别的测试业务完成查询、写入和权限检查。启用了任务、消息或实时推送的应用，再按 [专项链路维护](./task-message-and-realtime-link-maintenance) 验证触发、消费和页面结果；文件能力按 [文件与文档维护](./runtime-capability-maintenance) 验证。

记录检查时间、目标实例、检查结果与故障单。出现异常后进入 [故障排查](./troubleshooting)；恢复需要配套数据时使用 [备份与恢复](./backup-monitoring-and-troubleshooting)。
