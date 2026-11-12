---
title: 故障排查
sidebar_position: 13
---

# 故障排查

先确定故障发生在开发平台、基础依赖还是某个业务实例，再读取相应日志。平台升级和应用发布后的异常，还应对照本次变更与升级前状态。

## 保存现场

以下命令用于配套 Compose 的 Bash 环境。修改部署目录和实际访问端口后执行：

```bash
DEPLOY_DIR=/srv/tidestack
PLATFORM_URL=http://127.0.0.1:80
INCIDENT_DIR="/tmp/tidestack-incident-$(date +%Y%m%d-%H%M%S)"
cd "$DEPLOY_DIR"
mkdir -m 700 "$INCIDENT_DIR"
docker compose ps -a > "$INCIDENT_DIR/compose-ps.txt"
docker compose images > "$INCIDENT_DIR/compose-images.txt"
docker compose logs --since 30m --tail 2000 > "$INCIDENT_DIR/compose.log" 2>&1
```

记录故障开始时间、影响应用、复现动作、最近变更和目标实例。日志可能包含初始化口令或业务数据，分享前先脱敏。重启、回放消息或恢复数据前，先保存相应组件的失败现场。

## 选择排查入口

| 现象 | 检查顺序 |
| --- | --- |
| 平台地址无法访问 | 本机入口 → 容器 → 代理与网络 |
| 首页正常，登录或管理接口失败 | 后端健康 → 平台日志 → 数据库与 RabbitMQ |
| 应用无法创建或运行 | 目标实例 → 运行后端 → 基座镜像与工作区 → 业务数据源 |
| 定时任务、消息或实时更新异常 | 对应链路的触发、处理和业务结果 |
| 文件下载失败或磁盘增长 | 实际存储路径 → 元数据与权限 → 容量来源 |
| 发布或升级后出现故障 | 变更对象 → 兼容性 → 对应回退流程 |

## 平台地址无法访问

```bash
docker compose ps -a ouroboros-develop
docker compose logs --since 15m --tail 500 ouroboros-develop
curl -v --max-time 5 "$PLATFORM_URL/"
```

- 容器未运行或反复退出：从启动日志的首个异常检查配置、依赖连接和初始化。
- 本机入口正常，外部访问失败：检查域名、防火墙、反向代理与 TLS。
- 本机也连接失败：检查 `docker compose ps` 显示的端口、主机端口占用和 Nginx 日志。

修复后分别验证本机入口、用户实际入口和后端健康。

## 首页正常，登录或管理接口失败

```bash
curl -i --max-time 5 "$PLATFORM_URL/actuator/health"
docker compose exec -T ouroboros-dev-db sh -c 'mysqladmin -uroot -p"$MYSQL_ROOT_PASSWORD" ping'
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose logs --since 15m --tail 1000 ouroboros-develop
```

健康接口持续 `503` 时检查平台生命周期和启动异常；依赖 ping 成功也不能证明平台账号有足够权限，应继续查看平台实际连接错误。

认证失败时核对实际凭据与配置优先级；`.env` 变化不会自动修改已有数据库或 RabbitMQ 账号。连接超时时检查容器中的服务名和端口；示例平台连接 MySQL 的容器端口为 `3306`，宿主机的 `13306` 用于主机访问。

只有 `401`、`403` 或部分用户失败时，再区分未登录、认证失败和权限不足，结合请求状态与 [业务日志](./business-logs-and-audit-traceability) 检查。已有数据库的管理员密码不应通过清空数据库重置。

## 应用无法创建或运行

先打开 [运行实例](../low-code/development-platform-menus/runtime-instance) 详情，确认应用、环境、后端、镜像、端点和状态。

### Docker 后端

```bash
docker compose exec -T ouroboros-develop test -S /var/run/docker.sock
docker compose exec -T ouroboros-develop sh -c 'test -w /app/deploy && test -d /app/deploy/workspace'
docker ps -a --no-trunc
docker compose logs --since 30m --tail 1000 ouroboros-develop
```

这里的 Socket 命令适用于默认同机部署。检查结果按以下分支处理：

1. 实例未创建：检查平台 Docker API 连接错误、工作区路径和基座镜像是否已拉取。
2. 镜像拉取失败：核对标签、CPU 架构、仓库权限和网络。
3. 实例已创建但退出：在 `docker ps -a` 找到对应容器，再读取该容器日志。
4. 实例运行但应用失败：检查业务实例自己的环境配置、数据源、初始化和迁移日志。

`HOST_WORKSPACE_PATH` 与容器内工作区必须指向同一份文件。平台数据库正常不代表业务应用的数据源正常。

### Kubernetes 后端

按实例详情中的 Deployment、Service、Ingress 和命名空间检查 Pod、事件及 PVC，见 [Kubernetes 部署](./deployment-methods/kubernetes#巡检与排障)。Docker Socket 检查不适用于这个后端。

恢复后验证实例端点、登录、查询、一次写入和受影响业务流程。不要用“重新初始化”代替普通重启，它可能覆盖开发数据。

## 任务、消息或实时更新异常

```bash
docker compose exec -T ouroboros-rabbitmq rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
docker compose logs --since 30m --tail 1000 ouroboros-rabbitmq
```

| 信号 | 下一步 |
| --- | --- |
| 关键队列 `consumers` 为 `0` | 检查消费实例是否启动、绑定是否加载 |
| `messages_ready` 持续增长 | 检查消费异常、吞吐和下游依赖 |
| `messages_unacknowledged` 长时间不下降 | 检查处理阻塞、超时和确认行为 |
| 任务未触发 | 检查元数据提交、Cron、时区和目标应用调度日志 |
| 页面不实时更新 | 检查代理 Upgrade、鉴权、STOMP 订阅与实际发送 |

按 [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance) 继续验证。消息回放前确认业务幂等性；不要通过清空队列消除积压现象。

## 文件异常或磁盘快速增长

```bash
df -h "$DEPLOY_DIR"
du -h -d 1 "$DEPLOY_DIR" | sort -h
docker system df
```

先区分数据库、上传文件、文档库、日志、备份或镜像占用，再按各自保留策略处理。存储在其他挂载点时检查实际路径。文件与文档的路径、元数据和 ACL 检查见 [文件与文档维护](./runtime-capability-maintenance)。

不要在未确认归属和恢复能力前删除数据卷、工作区或数据库目录。

## 发布或升级后异常

- 应用元数据、基座镜像或业务数据异常：按 [业务应用发布与回退](./application-release-and-rollback) 判断恢复对象。
- 开发平台镜像或平台数据库异常：按 [平台升级与回滚](./release-upgrade-and-rollback) 判断兼容性。
- 需要恢复数据：先确认备份时间点与允许丢失范围，按 [备份与恢复](./backup-monitoring-and-troubleshooting) 在隔离环境验证。

关闭故障前，重新执行 [基础巡检](./monitoring-and-alerting#执行一次基础巡检) 和受影响业务验证，记录原因、处理动作、恢复版本与数据时间点。
