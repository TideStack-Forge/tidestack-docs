---
title: 任务、消息与实时链路维护
sidebar_position: 9
---

# 任务、消息与实时链路维护

本页分别验证计划任务、消息队列和 WebSocket 从触发到业务结果的完整链路。按实际启用的能力执行；页面可访问不能证明这些链路可用。

## 巡检前准备

进入包含 `docker-compose.yml` 和 `.env` 的部署目录：

```bash
DEPLOY_DIR=/srv/tidestack
cd "$DEPLOY_DIR"
docker compose config --quiet
docker compose ps
```

以下平台日志命令以 `ouroboros-develop` 为例。业务应用的任务和消息消费在目标运行实例执行，应换成该实例的容器日志；Kubernetes 后端使用对应 Pod 日志。外部 RabbitMQ 使用实际节点和 virtual host。

先按 [监控与告警](./monitoring-and-alerting) 确认目标实例与依赖可用，再保留最近日志：

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

启用调度模块的启动日志应包含 `Ouroboros Scheduler Runtime Loaded`，不得出现 `计划任务调度器未初始化`，也不得持续出现计划任务元数据解析、刷新或执行错误。启动早于最近 15 分钟时，从完整启动日志中查询；时间窗口内没有加载日志不等于模块未加载。

### 执行端到端验证

1. 建立专用巡检逻辑流，写入执行时间、任务名和唯一巡检 ID。
2. 在测试应用创建巡检任务，任务数据中写入本次巡检 ID，约定一个可观察的触发周期。
3. 提交编辑并等待一个完整触发周期。
4. 在业务结果或审计记录中查询该 ID，核对触发时间和输入。
5. 完成后停用巡检任务，避免长期产生无用数据。

成功标志：任务按预期时区和周期触发，逻辑流收到正确任务数据，每次触发产生预期业务结果且可查询。周期任务可能产生多条记录，应按触发时间核对次数。

### 未触发时的检查顺序

1. 计划任务是否已提交，页面是否仍有 `*` 未提交标记。
2. Quartz Cron 和服务器时区是否正确。
3. 启动日志是否显示任务加载或元数据解析失败。
4. Quartz 已触发但没有结果时，继续检查 `LogicFlowJob` 和目标逻辑流错误。

## 消息链路

消息链路为：绑定加载后，生产者 -> Exchange 与路由 -> 队列 -> 消费者 -> 逻辑流业务结果。

### 检查 RabbitMQ

```bash
docker compose exec -T ouroboros-rabbitmq rabbitmq-diagnostics -q ping
docker compose exec -T ouroboros-rabbitmq \
  rabbitmqctl list_queues name messages_ready messages_unacknowledged consumers
```

第一条命令必须返回 `Ping succeeded`。第二条命令中，关键消费队列应有消费者；`messages_ready` 或 `messages_unacknowledged` 持续增长表示消息正在堆积或消费未确认。

### 检查目标应用运行时

```bash
docker compose logs --since 15m --tail 1000 ouroboros-develop \
  | grep -E 'Ouroboros MQ Runtime Loaded|RabbitMQ|consumer|ERROR'
```

启用消息模块的启动日志应包含 `Ouroboros MQ Runtime Loaded`，且不得持续出现连接、绑定或消费错误。加载日志可能早于当前查询窗口，仍需结合完整启动日志和业务结果判断。

### 执行端到端验证

1. 生成唯一消息 ID，例如 `mq-check-<本次巡检时间>`。
2. 通过实际生产者发送包含该 ID 的消息。
3. 在队列列表中确认消息没有持续积压。
4. 在消费者逻辑流的业务结果中查询该 ID。
5. 核对消费次数、处理结果和确认状态。

成功标志：消息成功投递并被消费者处理，业务结果可查询，没有重复写入和未确认消息残留。

### 有积压时的检查顺序

1. RabbitMQ ping 是否成功。
2. 目标队列是否存在，Exchange、路由键、分组和 Binder 名是否匹配。
3. `consumers` 是否大于 `0`。
4. 目标应用日志是否有绑定加载或逻辑流执行错误。
5. 消费者恢复前先确认消息是否幂等，避免重放造成重复业务结果。

## WebSocket 链路

WebSocket 链路为：代理入口 -> HTTP Upgrade -> 鉴权 -> STOMP 订阅 -> 服务端发送 -> 页面更新。默认入口为 `/websocket/stomp`。

先确认当前应用使用的 broker。默认简单 broker、RabbitMQ STOMP relay 和 Redis Pub/Sub 的依赖不同；使用 relay 时检查其 STOMP 连接，AMQP `5672` 正常不能证明 STOMP relay 可用。

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

将地址替换为目标应用的实际端点。`101 Switching Protocols` 表示 Upgrade 成功；连接在 5 秒后超时不否定此前的握手成功。`401` 或 `403` 可能由代理或应用鉴权返回，应结合日志确认来源；`404`、`502` 或握手前超时先检查路径、端口和 Upgrade 请求头。启用 SockJS 时，还应以浏览器实际使用的协商与传输路径为准。该命令不能证明 STOMP 订阅和消息投递成功。

### 执行端到端验证

1. 使用真实账号打开依赖实时更新的页面。
2. 保持页面在线，从另一会话触发一次明确的状态变化。
3. 确认页面无需手工刷新即可显示新状态。
4. 断开网络后恢复，确认页面重新连接或重新取得服务端真实状态。
5. 使用无权限账号重复订阅，确认无法取得受限消息。

运行实例状态变化可作为可见验证场景。

成功标志：有权限页面实时收到一次更新；断线后最终状态正确；无权限账号无法收到受限内容。

## 变更后最小验证

平台升级、认证调整、RabbitMQ 迁移、代理变更、端口变化或时区变化后，对已启用且受影响的链路完成：

1. 一条巡检任务按时触发并产生业务结果。
2. 一条唯一消息完成生产、消费和业务落库。
3. 一个真实页面完成 WebSocket 状态更新。

任一项失败时，不得仅凭首页可访问判定变更成功。平台升级流程见 [平台升级与回滚](./release-upgrade-and-rollback)，业务应用变更见 [业务应用发布与回退](./application-release-and-rollback)。
