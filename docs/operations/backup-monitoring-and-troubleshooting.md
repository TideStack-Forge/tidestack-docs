---
title: 备份与恢复
sidebar_position: 12
---

# 备份与恢复

恢复需要配套的数据、应用定义、文件和配置。只保存数据库或应用 ZIP，无法恢复完整运行环境。日常巡检见 [监控与告警](./monitoring-and-alerting)，故障定位见 [故障排查](./troubleshooting)。

本页命令以配套 Compose 为例，使用 Linux Bash 和 `sha256sum`。macOS 可用 `shasum -a 256` 和 `shasum -a 256 -c` 替换校验命令。外部数据库、存储和消息服务使用其对应备份机制。

## 定义恢复目标

上线前由业务负责人确认：

| 项目 | 需要记录的内容 |
| --- | --- |
| RPO | 最多允许丢失多长时间的数据，例如 `15 分钟` 或 `24 小时` |
| RTO | 从故障到恢复服务允许的总耗时，例如 `2 小时` |
| 备份频率与保留周期 | 数据库、配置、文件和消息分别采用的策略 |
| 恢复负责人 | 谁能取得备份、密钥并执行恢复 |
| 演练周期 | 最近一次成功结果与下次演练时间 |

备份频率应满足 RPO，完整恢复耗时应满足 RTO。发生数据覆盖前，还要确认恢复时间点之后哪些写入可以丢失或需要补录。

## 确认备份范围

| 对象 | 需要保留的内容 | 恢复时核对 |
| --- | --- | --- |
| 平台数据库 | `ouroboros-develop` 数据库、必要账号与授权记录 | 版本兼容、用户、应用管理与日志 |
| 业务数据库 | 每个应用实际使用的数据库 | 数据结构、业务数据与迁移版本 |
| 部署配置 | Compose、`.env`、`application.yml`、`config/`、实例配置及实际使用的扩展 | 依赖地址、路径、环境和凭据引用 |
| 开发工作区 | `HOST_WORKSPACE_PATH` 对应内容、版本库、应用 ZIP | 应用快照、Git tag 与模型可读取 |
| 上传与文档 | 实际文件目录、对象存储、文档元数据与 ACL | 文件内容、元数据与权限一致 |
| RabbitMQ | 定义、节点身份与需要保留的消息数据 | 绑定、消费者及消息处理结果 |
| 版本与执行记录 | 镜像标签、摘要、部署配置版本与数据时间点 | 可以确定恢复所用的完整版本组合 |

不要复制运行中的 `mysql-data/` 代替数据库备份。RabbitMQ 定义导出不包含队列消息；需要恢复消息时，还必须按实际服务的机制备份数据并验证恢复。

## 执行一次完整备份

先暂停本次备份范围内的配置变更、业务写入、任务和消息消费，或使用已经验证的一致性快照方案。数据库单次事务导出不保证它与其他数据库、工作区和文件处于同一时间点；跨对象恢复依赖完整的一致性方案。

以下步骤在同一个专用 Bash 会话中执行。`set -euo pipefail` 会在失败时中止，避免数据库导出失败却生成一个看似有效的 gzip 文件。任何步骤失败都不能把本次备份标记为完成。

### 1. 准备目录和版本记录

```bash
set -euo pipefail
umask 077
DEPLOY_DIR=/srv/tidestack
BACKUP_ROOT=/srv/tidestack-backups
BACKUP_STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/${BACKUP_STAMP}"

cd "$DEPLOY_DIR"
docker compose config --quiet
mkdir -p "$BACKUP_ROOT"
mkdir -m 700 "$BACKUP_DIR"
docker compose images > "$BACKUP_DIR/compose-images.txt"
docker compose config --images > "$BACKUP_DIR/compose-image-refs.txt"
docker compose ps -a > "$BACKUP_DIR/compose-ps.txt"
docker inspect --format '{{.Config.Image}}' "$(docker compose ps -q ouroboros-dev-db)" \
  > "$BACKUP_DIR/mysql-image.txt"
```

确认 `mysql-image.txt` 为本次备份实际使用的数据库镜像，并另记录镜像摘要。备份目录应为本次新建，不复用旧目录。

### 2. 导出平台数据库

```bash
docker compose exec -T ouroboros-dev-db sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --quick --routines --events --no-tablespaces ouroboros-develop' \
  | gzip > "$BACKUP_DIR/ouroboros-develop.sql.gz"

test -s "$BACKUP_DIR/ouroboros-develop.sql.gz"
gzip -t "$BACKUP_DIR/ouroboros-develop.sql.gz"
```

此命令仅备份平台数据库。按清单逐一备份业务数据库；外部数据源需要使用对应凭据和工具。压缩包完整不代表 SQL 可恢复，后续必须执行导入演练。

### 3. 归档配置、工作区和文件

下面的工作区路径适用于默认布局；使用外部工作区时，改为实际路径并在恢复记录中保留映射关系。

```bash
BACKUP_PATHS=(docker-compose.yml .env workspace)
for BACKUP_PATH in application.yml config instance.yml logback.xml extend; do
  if [ -e "$BACKUP_PATH" ]; then
    BACKUP_PATHS+=("$BACKUP_PATH")
  fi
done
tar -czf "$BACKUP_DIR/deployment-and-workspace.tgz" "${BACKUP_PATHS[@]}"
tar -tzf "$BACKUP_DIR/deployment-and-workspace.tgz" > "$BACKUP_DIR/archive-contents.txt"
```

再对实际上传目录、文档库或对象存储执行文件备份；它们可能位于 `workspace/` 之外。按 [文件与文档维护](./runtime-capability-maintenance) 逐项核对，不要遗漏默认上传目录下的文件。

归档可能包含密码、私钥或本地 Git 凭据，应按凭据管理策略加密并限制访问。

### 4. 保留消息服务恢复材料

使用示例 RabbitMQ 时可导出定义：

```bash
docker compose exec -T ouroboros-rabbitmq \
  rabbitmqctl export_definitions /tmp/tidestack-definitions.json
docker compose cp ouroboros-rabbitmq:/tmp/tidestack-definitions.json \
  "$BACKUP_DIR/rabbitmq-definitions.json"
```

需要保留的队列消息另按 RabbitMQ 数据备份流程处理。仅导出定义不满足消息恢复要求；记录是否保留消息、消息时间点及重放时的幂等处理方案。

### 5. 校验并转存

完成清单中的全部备份后执行：

```bash
chmod 600 "$BACKUP_DIR"/*
(
  cd "$BACKUP_DIR"
  sha256sum ./* > SHA256SUMS
  sha256sum -c SHA256SUMS
)
```

每个文件应返回 `OK`。把备份转存到独立故障域，并在目标位置再次校验；同时记录一致性时间点、对象清单、遗漏项和执行结果。确认成功后恢复此前暂停的操作。

## 执行恢复演练

恢复演练使用隔离数据库、配置、网络和文件副本。先隔离外部通知、计划任务、消息消费者及集成出口，避免演练环境对真实业务产生写入。

### 1. 校验并导入一次性数据库

以下命令使用新的 Bash 会话，`BACKUP_DIR` 替换为本次目标备份。一次性容器不映射端口，也不挂载正式数据卷。

```bash
set -euo pipefail
BACKUP_DIR=/srv/tidestack-backups/20261112-020000
(cd "$BACKUP_DIR" && sha256sum -c SHA256SUMS)

RESTORE_CONTAINER="ouroboros-restore-$(date +%Y%m%d-%H%M%S)"
RESTORE_PASSWORD=$(openssl rand -hex 24)
RESTORE_IMAGE=$(cat "$BACKUP_DIR/mysql-image.txt")
test -n "$RESTORE_IMAGE"

docker run -d --name "$RESTORE_CONTAINER" \
  -e MYSQL_ROOT_PASSWORD="$RESTORE_PASSWORD" \
  -e MYSQL_DATABASE=ouroboros_restore_rehearsal \
  "$RESTORE_IMAGE"

for RESTORE_ATTEMPT in $(seq 1 60); do
  if docker exec "$RESTORE_CONTAINER" mysqladmin -uroot -p"$RESTORE_PASSWORD" ping >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "$RESTORE_CONTAINER" mysqladmin -uroot -p"$RESTORE_PASSWORD" ping
gzip -dc "$BACKUP_DIR/ouroboros-develop.sql.gz" \
  | docker exec -i "$RESTORE_CONTAINER" mysql -uroot -p"$RESTORE_PASSWORD" ouroboros_restore_rehearsal

docker exec "$RESTORE_CONTAINER" mysql -uroot -p"$RESTORE_PASSWORD" -Nse \
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ouroboros_restore_rehearsal';"
```

表数量应大于 `0`，再核对关键表和预期记录。以上只验证平台数据库可导入；业务数据库、账号权限、文件、消息和完整平台启动仍需分别演练。

### 2. 恢复完整环境

1. 在独立目录解压配置和工作区，恢复上传文件与文档库副本。
2. 把所有数据库、消息、文件路径和外部接口改为隔离环境地址。
3. 使用记录的镜像版本和摘要启动平台；不直接在正式目录解压覆盖。
4. 验证登录、应用打开、模型读取和一次最小运行。
5. 验证业务数据、文件下载、文档 ACL 和业务日志。
6. 对任务、消息和实时更新执行受控端到端检查。
7. 记录开始与完成时间、可恢复数据时间点和所有失败步骤，核对 RPO 与 RTO。

失败时保留演练日志与备份，不进入正式数据覆盖。确认演练结果后，仅删除本次创建的一次性容器：

```bash
docker rm -f "$RESTORE_CONTAINER"
unset RESTORE_PASSWORD
```

正式恢复沿用演练通过的步骤，并先确认停写、数据损失范围和切换方案。恢复后按 [监控与告警](./monitoring-and-alerting) 检查运行状态，完成受影响业务验证后再恢复写入。
