---
title: 开发菜单速查
sidebar_position: 3
---

# 开发菜单速查

按当前任务查找菜单。点击菜单名称可查看界面截图；完整操作优先使用“详细指南”列中的任务文档。

## 入口与建模

| 菜单 | 路径 | 何时使用 | 详细指南 |
| --- | --- | --- | --- |
| [打开应用](./development-platform-menus/open-apps) | 平台级入口 | 创建或进入应用 | [快速上手](../getting-started/#创建客户管理应用) |
| [业务模型](./development-platform-menus/business-model) | 业务模型 | 定义业务对象、字段、关系、页面和标准接口 | [业务模型](../guide/tutorial/business-model/) |
| [数据模型](./development-platform-menus/data-model) | 数据与模型 / 数据模型 | 只读检查生效的数据字段、主键和插件 | [数据模型概念](../concepts/data-model/) |
| [数据字典](./development-platform-menus/data-dictionary) | 数据与模型 / 数据字典 | 维护状态、分类和枚举项 | [数据字典](../guide/tutorial/dict/) |

## 页面与流程

| 菜单 | 路径 | 何时使用 | 详细指南 |
| --- | --- | --- | --- |
| [前端页面](./development-platform-menus/frontend-page) | 界面设计 / 前端页面 | 管理页面入口 | [页面方案选择](./page-delivery-with-dynamic-forms-and-ui-schema) |
| [UI 模型](./development-platform-menus/ui-model) | 界面设计 / 前端页面 / UI 模型 | 管理路由和页面实现方式 | [UI 模型](../concepts/ui-model/) |
| [UI Schema](./development-platform-menus/ui-schema) | 界面设计 / 前端页面 / UI Schema | 用声明式组件定制页面 | [UI Schema](../concepts/ui-schema/) |
| [主题样式](./development-platform-menus/theme-style) | 界面设计 / 主题样式 | 调整应用级视觉配置 | - |
| [逻辑流](./development-platform-menus/logicflow) | 业务逻辑 / 逻辑流 | 编排系统自动处理 | [逻辑流](../guide/tutorial/logicflow/) |
| [审批流](./development-platform-menus/approval-workflow) | 业务逻辑 / 审批流 | 编排人工申请和审批 | [审批流](../guide/module/approval-workflow/) |
| [后端接口](./development-platform-menus/backend-api) | 业务逻辑 / 后端接口 | 切换已发现 Web API 的处理器 | [集成与定时自动化](./integration-and-scheduled-automation#配置后端接口处理器) |

## 组织、集成与配置

| 菜单 | 路径 | 何时使用 | 详细指南 |
| --- | --- | --- | --- |
| [内置角色管理](./development-platform-menus/builtin-role) | 组织架构 / 内置角色管理 | 定义应用角色 | [用户角色权限](../guide/module/rbac/) |
| [内置岗位管理](./development-platform-menus/builtin-position) | 组织架构 / 内置岗位管理 | 定义岗位维度 | [组织架构](../guide/module/organization/) |
| [人员档案表单方案](./development-platform-menus/personnel-profile-form) | 组织架构 / 人员档案表单方案 | 扩展员工档案字段 | [组织架构](../guide/module/organization/) |
| [外部接口](./development-platform-menus/external-api) | 系统集成 / 外部接口 | 定义外部服务调用 | [集成与定时自动化](./integration-and-scheduled-automation#调用外部接口) |
| [消息队列](./development-platform-menus/message-queue) | 系统集成 / 消息队列 | 处理异步生产和消费 | [集成与定时自动化](./integration-and-scheduled-automation#配置消息队列) |
| [消息通知模版](./development-platform-menus/notification-template) | 系统集成 / 消息通知模版 | 配置通知内容和渠道 | [消息通知](../guide/tutorial/notification/) |
| [数据源](./development-platform-menus/datasource) | 基础配置 / 数据源 | 把应用数据源名绑定到平台 JDBC 连接 | [集成与定时自动化](./integration-and-scheduled-automation#绑定数据源) |
| [配置项](./development-platform-menus/config-item) | 基础配置 / 配置项 | 维护可变参数和开关 | [配置项](../guide/tutorial/configuration/) |
| [多语言](./development-platform-menus/i18n) | 基础配置 / 多语言 | 维护用户可见文案的语言资源 | - |

## 应用管理、运维与扩展

| 菜单 | 路径 | 何时使用 | 详细指南 |
| --- | --- | --- | --- |
| [版本管理](./development-platform-menus/version-management) | 应用管理 / 版本管理 | 查看提交历史并管理应用版本 | [业务应用发布与回退](../operations/application-release-and-rollback) |
| [应用配置](./development-platform-menus/app-configuration) | 应用管理 / 应用配置 | 修改应用标题、图标和入口 | [开发应用](../guide/tutorial/apps/) |
| [模块树编排](./development-platform-menus/module-arrangement) | 应用管理 / 模块树编排 | 组织运行态菜单 | [模块编排](../guide/tutorial/arrange-modules/) |
| [计划任务](./development-platform-menus/scheduled-task) | 运维监控 / 计划任务 | 按 Quartz Cron 定时执行逻辑流 | [集成与定时自动化](./integration-and-scheduled-automation#创建计划任务) |
| [业务日志模板](./development-platform-menus/business-log-template) | 运维监控 / 业务日志模板 | 记录业务操作与审计信息 | [业务日志与审计](../operations/business-logs-and-audit-traceability) |
| [微前端](./development-platform-menus/micro-frontend) | 高级功能 / 微前端 | 接入独立前端页面 | [微前端应用](../guide/advance/extend-frontend/micro-app/) |
| [后端扩展包](./development-platform-menus/backend-extension-package) | 高级功能 / 后端扩展包 | 安装应用级后端扩展 | [创建后端扩展包](../fusion-development/backend-extension-packages) |
| [字段类型](./development-platform-menus/field-type) | 高级功能 / 字段类型 | 增加可复用字段能力 | [扩展字段](../guide/advance/extend-backend/extend-field/) |
| [平台组件库](./development-platform-menus/component-library) | 高级功能 / 平台组件库 | 把平台已安装的组件库导入当前应用 | [工作台与 Widget](../fusion-development/workbench-widgets-and-component-libraries) |
| [统计分析](../guide/module/statistics-analysis/) | 统计分析 | 创建数据集、图表和仪表板 | [统计分析](../guide/module/statistics-analysis/) |

**开发文档** 是当前手册的站内入口，不是应用资产。

## 平台管理

| 菜单 | 何时使用 |
| --- | --- |
| [运行实例](./development-platform-menus/runtime-instance) | 查看和管理已有调试实例；新实例从应用开发看板顶部的调试工具栏创建 |
| [应用模版](./development-platform-menus/app-templates) | 管理可复用的应用起点，或从模版创建应用 |
| [平台数据源](./development-platform-menus/platform-datasource) | 维护各环境的真实数据库连接 |
| [平台组件库](./development-platform-menus/platform-component-library) | 安装、检查和卸载可供应用导入的组件库 |
