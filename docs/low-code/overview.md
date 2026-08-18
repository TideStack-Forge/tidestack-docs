---
title: 低代码开发总览
sidebar_position: 2
---

# 低代码开发总览

低代码开发用于交付结构化业务功能：定义业务对象，生成列表和表单，配置自动处理或人工审批，再补齐权限与通知。

## 按任务选择入口

| 你要完成的任务 | 使用能力 | 操作指南 |
| --- | --- | --- |
| 创建应用 | 应用管理 | [创建第一个应用](../getting-started/create-first-application) |
| 定义业务对象和字段 | 业务模型 | [业务模型](../guide/tutorial/business-model/) |
| 配置列表、表单和详情 | 业务模型视图、UI Schema | [开发业务模型](../guide/tutorial/business-model/develop-business-model/) |
| 快速创建轻量采集页面 | 动态表单 | [页面交付方案](./page-delivery-with-dynamic-forms-and-ui-schema#创建动态表单) |
| 建立独立资料库和目录权限 | 文档管理 | [表单、附件与文档能力](./forms-attachments-and-documents#创建文档库) |
| 编排系统自动处理 | 逻辑流 | [逻辑流](../guide/tutorial/logicflow/) |
| 编排人工申请和审批 | 审批流 | [审批流](../guide/module/approval-workflow/) |
| 配置用户、角色和数据范围 | 组织架构、RBAC | [组织架构](../guide/module/organization/) · [用户角色权限](../guide/module/rbac/) |
| 配置运行参数 | 配置项 | [配置项](../guide/tutorial/configuration/) |
| 发送业务通知 | 通知模板与渠道 | [消息通知](../guide/tutorial/notification/) |
| 接入数据库、外部服务、计划任务或消息 | 数据源、外部接口、计划任务、消息队列 | [集成与定时自动化](./integration-and-scheduled-automation) |
| 创建图表和仪表板 | 统计分析 | [统计分析](../guide/module/statistics-analysis/) |
| 发布并运行应用 | 版本管理、运行实例 | [版本管理](./development-platform-menus/version-management) · [运行实例](./development-platform-menus/runtime-instance) |

## 标准交付顺序

1. 明确业务对象、使用角色和关键动作。
2. 创建应用和业务模型。
3. 使用自动视图跑通新建、查询、详情和编辑。
4. 使用逻辑流或审批流承接关键动作。
5. 配置入口权限、数据范围和通知。
6. 验证数据源、外部接口、任务和消息等集成链路。
7. 保存并提交全部变更，发布版本并创建运行实例。
8. 分别使用业务账号和管理员账号完成验收。

每一步的输入、产出和验收项见 [从需求到交付](./from-requirement-to-delivery)。开发菜单位置见 [开发菜单速查](./development-platform-menu-guide)。

## 何时改用代码扩展

出现以下任一情况时，进入 [融合开发](../fusion-development/)：

- 标准组件无法实现必要交互。
- 需要新增可复用字段类型、表达式、脚本上下文或逻辑流节点。
- 需要接入外部 SDK、定制认证协议或专用基础设施。
- 关键逻辑需要独立测试、版本和发布周期。

只扩展超出标准能力的部分；业务模型、权限、菜单和已配置流程继续留在平台中。
