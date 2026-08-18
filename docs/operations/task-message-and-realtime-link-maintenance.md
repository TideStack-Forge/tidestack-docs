---
title: 任务、消息与实时链路维护
sidebar_position: 7
---

# 任务、消息与实时链路维护

本页适用于启用了计划任务、RabbitMQ 或 WebSocket 的 Compose 环境。页面可访问只证明 HTTP 入口正常，不能证明这三条链路可用。

## 巡检前准备

进入包含 `docker-compose.yml` 和 `.env` 的部署目录：

```bash
DEPLOY_DIR=/srv/tidestack
cd "$DEPLOY_DIR"
docker compose config --quiet
docker compose ps
```

继续巡检前，`ouroboros-develop` 和 `ouroboros-rabbitmq` 必须处于运行状态。先保留最近日志，避免后续重启覆盖故障线索：

```bash
docker compose logs --since 15m --tail 1000 ouroboros-develop \
  > /tmp/ouroboros-develop-last-15m.log
```

## 调度链路

调度链路为：任务定义加载 -> Quartz 触发 -> `LogicFlowJob` -> 逻辑流业务结果。

### 检查运行时加载

```bash
docker compose logs --since 15m --tail 1000 ouroboros-develop \
  | grep -E 'Ouroboros Scheduler Runtime Loaded|计划任务调度器未初始化|ERROR'
```

启动日志应包含 `Ouroboros Scheduler Runtime Loaded`，不得出现 `计划任务调度器未初始化`，也不得持续出现计划任务元数据解析、刷新或执行错误。

### 执行端到端验证

1. 建立专用巡检逻辑流，写入执行时间、任务名和唯一巡检 ID。
2. 创建每分钟触发的巡检任务，任务数据中写入本次巡检 ID。
3. 提交编辑并等待一个完整触发周期。
4. 在业务结果或审计记录中查询该 ID，核对触发时间和输入。
5. 完成后停用巡检任务，避免长期产生无用数据。

成功标志：任务按预期时区触发，逻辑流收到正确任务数据，业务结果只产生一次且可查询。

### 未触发时的检查顺序

1. 计划任务是否已提交，页面是否仍有 `*` 未提交标记。
2. Quartz Cron 和服务器时区是否正确。
3. 启动日志是否显示任务加载或元数据解析失败。
4. Quartz 已触发但没有结果时，继续检查 `LogicFlowJob` 和目标逻辑流错误。

## 消息链路

消息链路为：绑定加载 -> RabbitMQ -> 生产者 -> 队列 -> 消费者 -> 逻辑流业务结果。

### 检查 RabbitMQ

```bash
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose exec -T ouroboros-rabbitmq \
  rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
```

第一条命令必须返回 `Ping succeeded`。第二条命令中，关键消费队列应有消费者；`messages_ready` 或 `messages_unacknowledged` 持续增长表示消息正在堆积或消费未确认。

### 检查平台运行时

```bash
docker compose logs --since 15m --tail 1000 ouroboros-develop \
  | grep -E 'Ouroboros MQ Runtime Loaded|RabbitMQ|consumer|ERROR'
```

启动日志应包含 `Ouroboros MQ Runtime Loaded`，且不得持续出现连接、绑定或消费错误。

### 执行端到端验证

1. 生成唯一消息 ID，例如 `mq-check-20260815-1530`。
2. 通过实际生产者发送包含该 ID 的消息。
3. 在队列列表中确认消息没有持续积压。
4. 在消费者逻辑流的业务结果中查询该 ID。
5. 核对消费次数、处理结果和确认状态。

成功标志：消息成功投递并被消费者处理，业务结果可查询，没有重复写入和未确认消息残留。

### 有积压时的检查顺序

1. RabbitMQ ping 是否成功。
2. 目标队列是否存在，Exchange、路由键、分组和 Binder 名是否匹配。
3. `consumers` 是否大于 `0`。
4. 平台日志是否有绑定加载或逻辑流执行错误。
5. 消费者恢复前先确认消息是否幂等，避免重放造成重复业务结果。

## WebSocket 链路

WebSocket 链路为：代理入口 -> HTTP Upgrade -> 鉴权 -> STOMP 订阅 -> 服务端发送 -> 页面更新。默认入口为 `/websocket/stomp`。

### 检查入口转发

```bash
PLATFORM_URL=http://127.0.0.1:80
curl --http1.1 -i --max-time 5 \
  -H 'Connection: Upgrade' \
  -H 'Upgrade: websocket' \
  -H 'Sec-WebSocket-Version: 13' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' \
  "$PLATFORM_URL/websocket/stomp"
```

`101 Switching Protocols` 表示 Upgrade 成功。`401` 或 `403` 表示入口已到达鉴权链路；`404`、`502` 或超时应先检查代理路径、端口和 Upgrade 请求头。该命令只检查入口，不能证明 STOMP 订阅和消息投递成功。

### 执行端到端验证

1. 使用真实账号打开依赖实时更新的页面。
2. 保持页面在线，从另一会话触发一次明确的状态变化。
3. 确认页面无需手工刷新即可显示新状态。
4. 断开网络后恢复，确认页面重新连接或重新取得服务端真实状态。
5. 使用无权限账号重复订阅，确认无法取得受限消息。

运行实例状态变化可作为可见验证场景。

成功标志：有权限页面实时收到一次更新；断线后最终状态正确；无权限账号无法收到受限内容。

## 变更后最小验证

平台升级、认证调整、RabbitMQ 迁移、代理变更、端口变化或时区变化后，必须完成：

1. 一条巡检任务按时触发并产生业务结果。
2. 一条唯一消息完成生产、消费和业务落库。
3. 一个真实页面完成 WebSocket 状态更新。

任一项失败时，不得仅凭首页可访问判定变更成功。平台升级流程见 [平台升级与回滚](./release-upgrade-and-rollback)，业务应用变更见 [业务应用发布与回退](./application-release-and-rollback)。
