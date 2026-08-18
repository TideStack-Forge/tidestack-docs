---
title: 运维管理
sidebar_position: 1
---

# 运维管理

面向负责部署、发布、升级、巡检、备份和排障的实施与运维人员。

## 按顺序执行

1. [部署架构](./deployment-architecture)：划分平台、依赖和业务应用边界。
2. [环境要求](./environment-requirements)：核对主机、网络、端口、存储和凭据。
3. [安装与初始化](./installation-and-initialization)：启动平台并完成首次登录验证。
4. [业务应用发布与回退](./application-release-and-rollback)：冻结应用版本并验证运行实例。
5. [平台升级与回滚](./release-upgrade-and-rollback)：更换平台镜像并处理平台数据兼容性。
6. [运行能力维护要点](./runtime-capability-maintenance)：维护文件、文档、任务、消息和日志。
7. [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance)：执行专项巡检和端到端验证。
8. [备份、监控与排障](./backup-monitoring-and-troubleshooting)：建立日常检查与恢复闭环。

## 按故障定位

| 现象 | 先查看 |
| --- | --- |
| 首次部署失败、容器无法启动 | [安装与初始化](./installation-and-initialization) |
| 业务版本发布后功能异常 | [业务应用发布与回退](./application-release-and-rollback) |
| 平台升级后无法登录或管理应用 | [平台升级与回滚](./release-upgrade-and-rollback) |
| 定时任务未触发、消息堆积、页面不实时刷新 | [任务、消息与实时链路维护](./task-message-and-realtime-link-maintenance) |
| 文件、文档库或存储容量异常 | [运行能力维护要点](./runtime-capability-maintenance) |
| 需要查日志、恢复备份或处理公共故障 | [备份、监控与排障](./backup-monitoring-and-troubleshooting) |
| 需要追查用户操作和业务结果 | [业务日志与审计回溯](./business-logs-and-audit-traceability) |

本地体验环境只需按 [快速上手](../getting-started/) 启动；团队共享或长期运行环境必须完成本节的备份、发布、回退和专项巡检要求。
