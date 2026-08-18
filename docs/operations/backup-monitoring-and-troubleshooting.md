---
title: 备份、监控与排障
sidebar_position: 7
---

# 备份、监控与排障

本页命令适用于手册提供的 Compose 部署，服务名为 `ouroboros-develop`、`ouroboros-dev-db` 和 `ouroboros-rabbitmq`。使用外部数据库、对象存储或 RabbitMQ 时，在对应服务上执行等价检查。

## 先定义恢复目标

正式环境上线前必须记录以下值，并由业务负责人确认：

| 项目 | 含义 | 记录内容 |
| --- | --- | --- |
| RPO | 最多允许丢失多长时间的数据 | 例如 `15 分钟`、`24 小时` |
| RTO | 故障后必须在多长时间内恢复服务 | 例如 `2 小时` |
| 备份频率 | 数据库、配置和文件分别多久备份一次 | 任务名称和执行时间 |
| 保留周期 | 每日、每周、每月备份各保留多久 | 存储策略 |
| 恢复负责人 | 谁能取得备份和密钥并执行恢复 | 姓名或值班角色 |
| 演练频率 | 多久执行一次完整恢复 | 最近和下次演练日期 |

备份频率必须满足 RPO，完整恢复耗时必须小于 RTO。

## 备份范围

| 对象 | Compose 示例中的位置 | 备份结果 |
| --- | --- | --- |
| 开发平台数据库 | `ouroboros-dev-db` 中的 `ouroboros-develop` | 可导入的 SQL 压缩包 |
| 部署配置 | `docker-compose.yml`、`.env`、可选的 `application.yml` | 配置副本；按凭据管理要求加密 |
| 平台工作区 | `.env` 中 `HOST_WORKSPACE_PATH` 指向的目录 | 文件归档 |
| 上传文件和文档 | 实际配置的本地卷或对象存储桶 | 文件归档或存储快照 |
| 版本证据 | Compose 镜像、容器状态和变更单 | 可定位到镜像标签或摘要的清单 |

不要复制正在运行的 `mysql-data/` 目录代替数据库备份。文件存储不在 `workspace/` 时，必须把实际存储路径单独加入备份任务。

## 执行一次完整备份

进入包含 `docker-compose.yml` 和 `.env` 的部署目录，设置本次备份目录：

```bash
DEPLOY_DIR=/srv/tidestack
BACKUP_ROOT=/srv/tidestack-backups
BACKUP_STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${BACKUP_STAMP}"

cd "$DEPLOY_DIR"
docker compose config --quiet
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
```

### 1. 导出数据库

```bash
docker compose exec -T ouroboros-dev-db sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --events --no-tablespaces ouroboros-develop' \
  | gzip > "$BACKUP_DIR/ouroboros-develop.sql.gz"

test -s "$BACKUP_DIR/ouroboros-develop.sql.gz"
gzip -t "$BACKUP_DIR/ouroboros-develop.sql.gz"
```

两条校验命令均无输出且退出码为 `0`，表示压缩包存在且格式完整；这还不等于数据可以恢复，必须执行恢复演练。

### 2. 归档配置和工作区

```bash
tar -czf "$BACKUP_DIR/deployment-and-workspace.tgz" \
  docker-compose.yml .env workspace

if [ -f application.yml ]; then
  cp application.yml "$BACKUP_DIR/application.yml"
fi

docker compose images > "$BACKUP_DIR/compose-images.txt"
docker compose ps > "$BACKUP_DIR/compose-ps.txt"
chmod 600 "$BACKUP_DIR"/*
```

如果 `HOST_WORKSPACE_PATH` 不等于部署目录下的 `workspace/`，把命令中的 `workspace` 替换成该绝对路径。再对实际的上传目录、文档目录或对象存储执行独立备份。

### 3. 生成完整性校验

```bash
(
  cd "$BACKUP_DIR"
  sha256sum * > SHA256SUMS
  sha256sum -c SHA256SUMS
)
```

输出中每个文件均为 `OK` 才能把本次任务标记为成功。备份应复制到独立故障域，不能只保留在部署主机上。

## 执行恢复演练

先校验备份，再把数据库导入一次性 MySQL 容器。以下命令不会连接正式数据库：

```bash
DEPLOY_DIR=/srv/tidestack
BACKUP_DIR=/srv/tidestack-backups/20260815-020000
BACKUP_STAMP=$(basename "$BACKUP_DIR")

(cd "$BACKUP_DIR" && sha256sum -c SHA256SUMS)

cd "$DEPLOY_DIR"
RESTORE_CONTAINER="ouroboros-restore-${BACKUP_STAMP}"
RESTORE_PASSWORD=$(openssl rand -hex 24)
RESTORE_IMAGE=$(docker compose config --images | grep '/mysql-server:' | head -n 1)
test -n "$RESTORE_IMAGE"

docker run -d --name "$RESTORE_CONTAINER" \
  -e MYSQL_ROOT_PASSWORD="$RESTORE_PASSWORD" \
  -e MYSQL_DATABASE=ouroboros_restore_rehearsal \
  "$RESTORE_IMAGE"

for RESTORE_ATTEMPT in $(seq 1 60); do
  docker exec "$RESTORE_CONTAINER" \
    mysqladmin -uroot -p"$RESTORE_PASSWORD" ping >/dev/null 2>&1 && break
  sleep 1
done

docker exec "$RESTORE_CONTAINER" \
  mysqladmin -uroot -p"$RESTORE_PASSWORD" ping

gzip -dc "$BACKUP_DIR/ouroboros-develop.sql.gz" \
  | docker exec -i "$RESTORE_CONTAINER" \
      mysql -uroot -p"$RESTORE_PASSWORD" ouroboros_restore_rehearsal

docker exec "$RESTORE_CONTAINER" \
  mysql -uroot -p"$RESTORE_PASSWORD" -Nse \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ouroboros_restore_rehearsal';"
```

最后一条命令必须返回大于 `0` 的表数量。随后在隔离环境中使用备份配置和工作区启动平台，验证登录、应用打开、模型读取和一次最小发布。记录恢复开始时间、完成时间、数据时间点和所有失败步骤；总耗时必须满足 RTO。

演练结束后删除一次性容器：

```bash
docker rm -f "$RESTORE_CONTAINER"
unset RESTORE_PASSWORD
```

## 日常巡检

在部署目录执行：

```bash
docker compose ps
curl -fsS --max-time 5 -o /dev/null "http://127.0.0.1:${PLATFORM_PORT:-80}/"
docker compose exec -T ouroboros-dev-db sh -c 'mysqladmin -uroot -p"$MYSQL_ROOT_PASSWORD" ping'
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose exec -T ouroboros-develop test -S /var/run/docker.sock
docker compose exec -T ouroboros-rabbitmq \
  rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
df -h "$DEPLOY_DIR" "$BACKUP_ROOT"
docker stats --no-stream ouroboros-develop ouroboros-dev-db ouroboros-rabbitmq
```

正常结果：三个容器均为 `Up`；HTTP、MySQL、RabbitMQ 和 Docker Socket 命令退出码均为 `0`；队列有消费者且积压不会持续增长；磁盘和内存未达到告警阈值。

至少配置以下告警：

| 信号 | 告警条件 |
| --- | --- |
| 平台 HTTP | 连续两次探测失败 |
| 容器状态 | 退出、反复重启或健康检查失败 |
| 磁盘 | 使用率达到 `80%` 告警，达到 `90%` 升级处理 |
| RabbitMQ | 无消费者或 `messages_ready` 持续增长 |
| 数据库 | 连接失败、连接耗尽或慢查询持续增加 |
| 备份 | 最近一次成功备份早于 RPO，或校验失败 |
| 恢复演练 | 超过规定周期仍未成功演练 |

## 按症状排障

### 平台地址无法访问

```bash
docker compose ps ouroboros-develop
docker compose logs --since 15m --tail 500 ouroboros-develop
curl -v --max-time 5 "http://127.0.0.1:${PLATFORM_PORT:-80}/"
```

容器不是 `Up` 时先根据日志修复启动错误；本机访问成功但外部失败时检查防火墙、反向代理和域名；本机也失败时检查端口占用和应用启动日志。

### 页面可打开，但登录或管理接口报错

```bash
docker compose exec -T ouroboros-dev-db sh -c 'mysqladmin -uroot -p"$MYSQL_ROOT_PASSWORD" ping'
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose logs --since 15m --tail 500 ouroboros-develop \
  | grep -Ei 'error|exception|failed|timeout|denied'
```

MySQL 和 RabbitMQ 必须分别返回 `mysqld is alive` 和 `Ping succeeded`。日志中的认证失败应回查 `.env` 与实际凭据，连接超时应回查服务地址、网络和端口。

### 应用无法发布或启动

```bash
docker compose exec -T ouroboros-develop test -S /var/run/docker.sock
docker compose exec -T ouroboros-develop sh -c 'test -w /app/deploy && test -d /app/deploy/workspace'
docker ps -a --no-trunc
docker compose logs --since 30m --tail 1000 ouroboros-develop \
  | grep -Ei 'docker|container|image|permission|error|exception|failed'
```

Socket 和目录检查必须返回 `0`。容器未创建时检查 Docker Socket 与工作区路径；容器已退出时查看该业务容器日志；拉取失败时检查镜像标签、仓库凭据和网络。

### 异步任务或通知停止处理

```bash
docker compose exec -T ouroboros-rabbitmq \
  rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
docker compose logs --since 30m --tail 1000 ouroboros-rabbitmq
docker compose logs --since 30m --tail 1000 ouroboros-develop \
  | grep -Ei 'rabbit|queue|consumer|scheduler|error|exception|failed'
```

`consumers` 为 `0` 时检查消费端是否启动；`messages_ready` 持续增长时检查消费者异常；`messages_unacknowledged` 长时间不下降时检查处理阻塞或确认逻辑。更完整的链路见 [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance)。

### 磁盘快速增长

```bash
df -h "$DEPLOY_DIR"
du -xhd1 "$DEPLOY_DIR" | sort -h
docker system df
```

先定位增长来源，再按日志保留、备份保留、文件生命周期或镜像治理策略处理。不要在未确认业务归属前删除卷、工作区、上传文件或数据库目录。

## 相关文档

- [安装与初始化](./installation-and-initialization)
- [业务应用发布与回退](./application-release-and-rollback)
- [平台升级与回滚](./release-upgrade-and-rollback)
- [业务日志与审计回溯](./business-logs-and-audit-traceability)
