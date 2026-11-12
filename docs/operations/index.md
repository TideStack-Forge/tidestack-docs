---
title: 运维管理
sidebar_position: 1
---

# 运维管理

本栏目面向负责潮汐栈部署、发布和持续运行的实施与运维人员。首次部署从环境准备开始，日常维护和故障处理可直接进入对应任务。

## 开发平台部署

| 任务 | 文档 | 完成结果 |
| --- | --- | --- |
| 选择平台、运行后端和访问入口 | [部署架构](./deployment-architecture) | 对照 Docker、APISIX、Kubernetes 各模式的架构图确定部署方案 |
| 在同一主机安装平台和 Docker 运行实例 | [Docker Compose 部署](./deployment-methods/docker-compose) | 完成环境准备、安装、首次登录和临时端口访问验证 |
| 为 Docker 测试应用提供稳定域名 | [Docker + APISIX 部署](./deployment-methods/docker-apisix) | 配置共享网络、网关、DNS 与路由生命周期 |
| 将运行实例放到另一台 Docker 主机 | [远程 Docker Engine 部署](./deployment-methods/remote-docker) | 对齐 API 接入、共享目录和跨主机依赖 |
| 使用集群承载运行实例或自行编排平台 | [Kubernetes 部署](./deployment-methods/kubernetes) | 配置客户端、共享 PVC、NodePort / Ingress，明确平台编排要求 |

“部署方式”下各篇按环境要求、配置、初始化和验证组织。个人体验可以直接使用 [快速上手](../getting-started/)；团队共享环境先选择部署方式，完成平台和实例验收，再建立监控、备份和恢复流程。

## 配置参考

| 配置对象 | 文档 | 查询内容 |
| --- | --- | --- |
| 统一运行基座 `ouroboros-mothership` | [统一运行基座配置项](./runtime-base-configuration) | 配置加载顺序、JVM、依赖、认证、文件和实时通信参数 |
| 开发平台 `ouroboros-develop` | [开发平台配置项](./development-platform-configuration) | 平台覆盖值、工作区、Docker / Kubernetes、调试、模板和配置中心默认值 |

开发平台继承基座的通用配置，两篇参考分别标注镜像内置值和代码默认值。安装步骤见上一组，查具体参数时从这里进入。

## 发布与变更

| 变更对象 | 文档 | 需要分别记录的版本 |
| --- | --- | --- |
| 应用模型、页面、流程、权限和扩展包 | [业务应用发布与回退](./application-release-and-rollback) | 应用快照、基座镜像、业务数据库 |
| 开发平台镜像和运行配置 | [平台升级与回滚](./release-upgrade-and-rollback) | 平台镜像、配置、平台数据库 |

发布应用版本会创建元数据快照；运行实例使用哪个镜像、工作区和数据库，需要单独确认。平台升级也需要单独验证应用运行结果。

## 日常维护

| 维护对象 | 文档 | 主要检查 |
| --- | --- | --- |
| 上传文件和文档库 | [文件与文档维护](./runtime-capability-maintenance) | 持久化路径、容量、权限和文件一致性 |
| 计划任务、消息消费和实时推送 | [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance) | 从触发到业务结果的完整链路 |
| 用户操作及业务结果 | [业务日志与审计回溯](./business-logs-and-audit-traceability) | 模板匹配、业务键、脱敏和查询 |

## 监控与恢复

| 当前需要 | 文档 | 完成结果 |
| --- | --- | --- |
| 建立巡检和告警 | [监控与告警](./monitoring-and-alerting) | 能识别入口、依赖、运行实例和容量异常 |
| 执行备份、恢复或演练 | [备份与恢复](./backup-monitoring-and-troubleshooting) | 数据、配置、工作区和文件可以配套恢复 |
| 处理访问、登录、启动或积压故障 | [故障排查](./troubleshooting) | 根据证据定位故障层，恢复后验证业务结果 |

本栏目中的 Compose 命令以配套示例的服务名为准。使用外部依赖或 Kubernetes 运行后端时，在对应组件上执行检查；业务应用的问题应查看目标实例的日志和数据源。
