---
title: 平台升级与回滚
sidebar_position: 6
---

# 平台升级与回滚

平台升级只变更开发平台版本及其运行配置。业务应用发布、MySQL 升级和 RabbitMQ 升级必须使用独立变更单和独立验证结果，不得混在同一次平台升级中。

## 升级输入

执行前填写并保存：

| 项目 | 必填内容 |
| --- | --- |
| 当前版本 | `.env` 中的 `OUROBOROS_VERSION` |
| 目标版本 | 已确认存在的完整镜像标签 |
| 变更范围 | 平台镜像、配置和数据库迁移说明 |
| 维护窗口 | 开始时间、结束时间、影响用户 |
| 备份 | 升级前数据库、配置、工作区和镜像清单的位置 |
| 回滚条件 | 哪些验证失败会立即回滚 |
| 负责人 | 执行人、验证人和回滚决策人 |

目标版本的发布说明未说明数据库兼容性时，不得假设旧版本能够读取升级后的数据库。

## 升级前检查

在包含 `docker-compose.yml` 和 `.env` 的部署目录执行：

```bash
DEPLOY_DIR=/srv/tidestack
TARGET_VERSION=2.0.0-rc.1-SNAPSHOT

cd "$DEPLOY_DIR"
CURRENT_VERSION=$(awk -F= '$1 == "OUROBOROS_VERSION" { print $2 }' .env)
test -n "$CURRENT_VERSION"
docker compose config --quiet
docker compose ps
docker compose images
```

继续执行升级前，必须满足：三个服务状态正常；没有未处理的运行故障；[完整备份](./backup-monitoring-and-troubleshooting#执行一次完整备份) 已成功；备份至少通过校验，正式环境还应有近期恢复演练结果。

先拉取目标镜像，不切换运行容器：

```bash
OUROBOROS_VERSION="$TARGET_VERSION" docker compose pull ouroboros-develop
docker image inspect \
  "registry.cn-hangzhou.aliyuncs.com/ouroboros/ouroboros-develop:${TARGET_VERSION}" \
  --format '{{index .RepoDigests 0}}'
```

拉取失败、镜像摘要不符合发布记录或目标架构无对应镜像时，停止升级。

## 执行升级

1. 停止应用配置、模型发布和平台管理操作。
2. 记录当前版本、容器状态和备份目录。
3. 更新 `.env` 中的版本并只重建开发平台服务。

```bash
cp .env ".env.before-${TARGET_VERSION}"
sed -i.bak \
  "s/^OUROBOROS_VERSION=.*/OUROBOROS_VERSION=${TARGET_VERSION}/" .env
grep '^OUROBOROS_VERSION=' .env

docker compose config --quiet
docker compose up -d --no-deps ouroboros-develop
docker compose ps ouroboros-develop
docker compose logs --since 10m --tail 500 ouroboros-develop
```

`grep` 必须显示目标版本，容器必须保持 `Up`，启动日志不得持续出现数据库迁移、依赖连接或自动配置错误。

## 升级后验证

按顺序执行，任一关键项失败即进入回滚判断：

1. `curl -fsS --max-time 5 -o /dev/null "http://127.0.0.1:${PLATFORM_PORT:-80}/"` 返回 `0`。
2. 使用管理员账号登录开发平台，打开应用管理和业务模型管理。
3. 打开一个升级前已存在的应用，确认模型、页面、菜单和权限配置可读取。
4. 在测试应用中完成一次最小变更、发布和运行验证。
5. 执行数据库、RabbitMQ 和 Docker Socket 巡检命令，结果全部正常。
6. 检查升级后日志，没有持续增长的 `ERROR`、迁移失败或连接异常。

验证通过后恢复平台操作，并在约定观察窗口内持续检查登录、发布、应用运行、队列积压和错误日志。观察窗口结束前保留旧镜像和升级前备份。

## 回滚判断

| 现象 | 处理 |
| --- | --- |
| 新容器无法启动、无法登录或核心入口不可用 | 立即回滚 |
| 数据库迁移失败 | 停止服务；根据迁移兼容性恢复数据库后回滚镜像 |
| 单个非核心功能异常且有明确规避方式 | 由回滚决策人判断是否在维护窗口内修复 |
| 业务应用大面积无法运行或发布 | 立即回滚 |
| 仅外部代理、DNS 或防火墙异常 | 修复外部入口，不回滚平台数据 |

## 执行回滚

### 数据库未发生不兼容变更

把 `.env` 恢复为升级前版本并重建平台服务：

```bash
cp ".env.before-${TARGET_VERSION}" .env
grep '^OUROBOROS_VERSION=' .env
docker compose config --quiet
docker compose up -d --no-deps ouroboros-develop
docker compose ps ouroboros-develop
docker compose logs --since 10m --tail 500 ouroboros-develop
```

再次执行升级后验证清单，确认平台已经回到原版本且业务应用可用。

### 数据库已经发生不兼容变更

1. 停止 `ouroboros-develop`，禁止继续写入。
2. 保存失败现场的日志和数据库副本。
3. 在隔离环境验证升级前备份可恢复。
4. 恢复升级前数据库、配置和工作区。
5. 使用原版本镜像启动平台并执行完整验证。

具体备份和恢复校验命令见 [备份、监控与排障](./backup-monitoring-and-troubleshooting)。数据库恢复会覆盖升级后的写入，必须由回滚决策人确认数据时间点和丢失范围。

## 完成标准

升级或回滚只有同时满足以下条件才算完成：

- 平台版本与变更单一致。
- 登录、应用管理、模型读取、最小发布和应用运行均通过。
- MySQL、RabbitMQ、Docker Socket 和磁盘巡检正常。
- 错误日志和队列积压没有持续增长。
- 执行记录包含镜像摘要、备份位置、验证结果和完成时间。
- 观察窗口结束后再按团队保留策略清理旧镜像和临时文件。
