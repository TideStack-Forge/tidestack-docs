---
title: 平台能力地图
sidebar_position: 2
---

# 平台能力地图

按需求选择现成能力；标准能力无法表达时，再进入正式扩展点。

| 需求 | 平台能力 | 操作入口 | 超出边界时 |
| --- | --- | --- | --- |
| 长期维护业务对象 | 业务模型、数据模型、标准页面 | [开发业务模型](../guide/tutorial/business-model/develop-business-model/) | 字段或页面扩展 |
| 问卷、登记和轻量台账 | 动态表单 | [页面交付方案](../low-code/page-delivery-with-dynamic-forms-and-ui-schema#创建动态表单) | 关系复杂时改用业务模型 |
| 覆盖结构化页面 | 自定义 UI Schema | [页面交付方案](../low-code/page-delivery-with-dynamic-forms-and-ui-schema#覆盖或新增-ui-schema) | 复杂交互改用微前端 |
| 业务附件和共享资料 | 文件上传、文档管理、目录 ACL | [表单、附件与文档](../low-code/forms-attachments-and-documents) | 对象存储、查毒或外部文档系统扩展 |
| 人工审批 | 审批流、组织、角色、通知 | [审批流](../guide/module/approval-workflow/) | 新节点或主体类型扩展 |
| 机器执行规则 | 表达式、脚本、逻辑流 | [流程、规则与自动化](../low-code/workflow-rules-and-automation) | 新上下文或逻辑流节点扩展 |
| 数据库、HTTP 和异步集成 | 数据源、后端接口、外部接口、消息队列 | [集成与定时自动化](../low-code/integration-and-scheduled-automation) | 新协议、中间件或处理器扩展 |
| 周期自动执行 | 计划任务 + 逻辑流 | [计划任务](../low-code/development-platform-menus/scheduled-task) | 一次性或特殊调度使用程序 API |
| 指标、图表和看板 | 数据集、图表、仪表板 | [统计分析](../guide/module/statistics-analysis/) | 正式运行前确认数据集发布链路 |
| 用户首页和局部栏目 | 用户仪表盘、模板、Widget | [工作台与 Widget](../fusion-development/workbench-widgets-and-component-libraries) | 独立子系统改用微前端 |
| 跨应用前端复用 | 平台组件库 | [平台组件库](../low-code/development-platform-menus/component-library) | 独立路由改用微前端 |
| 实时页面更新 | WebSocket / STOMP | [集成、自动化与实时能力](../fusion-development/integration-automation-and-realtime#使用-websocket-推送状态) | 新协议或专用网关扩展 |
| 应用版本留档和测试运行 | 版本管理、运行实例 | [业务应用发布与回退](../operations/application-release-and-rollback) | 生产发布使用团队部署流水线 |
| 操作审计 | 业务日志模板和业务日志 | [业务日志与审计回溯](../operations/business-logs-and-audit-traceability) | 完整调用链使用链路追踪 |

## 开发与运维边界

- 低代码任务：模型、页面、流程、权限、通知、数据源和运行配置。
- 融合开发任务：新字段、上下文、节点、协议、组件、认证或其他可复用程序能力。
- 运维任务：平台和依赖部署、应用发布、平台升级、备份、巡检和恢复。

扩展前查 [平台扩展点总表](../fusion-development/extension-points)；部署和运行维护查 [运维管理](../operations/)。
