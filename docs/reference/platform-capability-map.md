---
title: 平台能力地图
sidebar_position: 2
---

# 平台能力地图

按业务需求查找可直接使用的能力及开发入口。标准能力不满足时，选择相应扩展方式。

## 数据、页面与文件

| 需求 | 内建能力与入口 | 扩展方式 |
| --- | --- | --- |
| 维护业务对象及关联数据 | [业务模型](../guide/tutorial/business-model/develop-business-model/) | 自定义字段或后端业务实现 |
| 问卷、登记和轻量台账 | [动态表单](../low-code/page-delivery-with-dynamic-forms-and-ui-schema#创建动态表单) | 复杂关系使用业务模型 |
| 定制列表、表单和详情 | [UI Schema](../low-code/page-delivery-with-dynamic-forms-and-ui-schema#覆盖或新增-ui-schema) | 自定义组件或微前端 |
| 上传附件、管理共享资料 | [表单、附件与文档](../low-code/forms-attachments-and-documents) | 外部存储或文档系统集成 |
| 指标与看板 | [统计分析](../guide/module/statistics-analysis/) | 自定义数据接口或可视化组件；上线前确认数据集发布结果 |
| 用户工作台与局部栏目 | [仪表盘、模板与 Widget](../fusion-development/workbench-widgets-and-component-libraries) | 复杂独立页面使用微前端 |

## 流程、集成与自动化

| 需求 | 内建能力与入口 | 扩展方式 |
| --- | --- | --- |
| 人工审批与通知 | [审批流](../guide/module/approval-workflow/) | 自定义节点或审批主体 |
| 校验、计算与业务处理 | [表达式、脚本和逻辑流](../low-code/workflow-rules-and-automation) | 注册上下文对象或逻辑流节点 |
| 数据库和 HTTP 对接 | [数据源、后端接口与外部接口](../low-code/integration-and-scheduled-automation) | 后端扩展包适配新协议 |
| 周期任务 | [计划任务](../low-code/development-platform-menus/scheduled-task) | 程序化创建特殊调度 |
| 异步处理 | [消息队列](../low-code/development-platform-menus/message-queue) | 自定义生产与消费逻辑 |
| 页面实时状态 | [WebSocket / STOMP](../fusion-development/integration-automation-and-realtime#使用-websocket-推送状态) | 自定义业务消息；订阅方法见 [Stomp](../api/frontend/sdk/completion-methods/stomp-and-realtime) |

## 权限、复用与交付

| 需求 | 内建能力与入口 | 扩展方式或限制 |
| --- | --- | --- |
| 用户、角色、数据与字段授权 | [组织、权限与配置](../low-code/organization-permissions-configuration-and-notification) | 自定义认证或主体类型 |
| 多应用复用界面能力 | [平台组件库](../low-code/development-platform-menus/component-library) | 新增组件、动作、公式或校验器 |
| 应用版本留档与运行验证 | [业务应用发布与回退](../operations/application-release-and-rollback) | 数据变更另行管理，生产发布衔接团队部署流程 |
| 业务操作审计 | [业务日志](../operations/business-logs-and-audit-traceability) | 需要完整调用链时接入链路追踪 |
| 平台安装与维护 | [运维管理](../operations/) | 按 Docker 或 Kubernetes 环境配置 |

## 组合示例：订单审核

用业务模型维护订单和明细，用字典统一状态值，用权限项控制查看与审核，用审批流处理人工审核。需要同步 ERP 时，在审核通过后调用外部接口；处理耗时较长时通过任务或消息异步执行，并向页面推送结果。

建模步骤见 [开发业务模型](../guide/tutorial/business-model/develop-business-model/)，集成实现见 [集成、自动化与实时能力](../fusion-development/integration-automation-and-realtime)。新增能力前可查 [平台扩展点总表](../fusion-development/extension-points)。
