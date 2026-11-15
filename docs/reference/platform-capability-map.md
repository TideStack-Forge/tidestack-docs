---
title: 平台能力地图
sidebar_position: 2
---

import CapabilityMarket from '@site/src/components/CapabilityMarket';
import useBaseUrl from '@docusaurus/useBaseUrl';

# 平台能力地图

开发一个功能时，可以先从这里找已有能力。前端基座提供页面渲染、导航、交互、认证和实时通信等入口；后端基座提供数据、业务行为、流程、集成及公共技术能力。选中能力后，展开接入条件，确认所需模块和配置，再进入对应指南。

## 从需求找入口

| 要完成的事 | 优先查看 | 需要一起考虑 |
| --- | --- | --- |
| 维护业务记录及其操作 | [业务模型](#be.business.model)、[动态数据模型](#be.data.dynamic)、[业务动作](#be.business.actions) | 关联、唯一约束、事务和数据权限 |
| 给页面增加特殊交互 | [PrismUI 渲染](#fe.schema-render)、[微组件](#fe.micro-component)、[微前端](#fe.micro-app) | 导航、弹窗、请求和卸载清理 |
| 发起人工审批并显示进度 | [内建审批流](#be.execution.approval)、[审批时间线](#fe.workflow-timeline) | 组织架构、候选人、表单与任务权限 |
| 调用外部系统并异步处理结果 | [外部接口](#be.integration.rpc)、[消息队列](#be.integration.mq)、[业务事件](#be.business.events) | 幂等、超时、重试及失败恢复 |
| 定时或稍后执行处理 | [计划任务](#be.integration.cron)、[延迟任务](#be.integration.delayed) | 执行身份、互斥、取消和重复执行 |
| 限制可见记录与可改字段 | [数据访问控制](#be.identity.data-control)、[数据权限插件](#be.data.access-plugin) | 自定义接口对约束的使用、后台身份 |
| 搭建指标与用户工作台 | [统计数据集](#be.analytics.dataset)、[报表视图](#be.analytics.report)、[看板与小组件](#be.analytics.widget) | 资产发布、查询权限、前端展示 |
| 为应用增加 AI 功能 | [对话与向量](#be.ai.invocation)、[知识检索](#be.ai.retrieval)、[工具与策略](#be.ai.tools-policy) | 提供方凭据、知识内容、工具权限与副作用 |

## 能力目录

可按前后端、领域、接入方式筛选，也可以搜索需求、能力名称或 API 标识。多词搜索会保留同时匹配的条目。“使用指南”指向相应接入文档；“相关说明”提供背景和上下文，具体调用仍需核对目标版本的接口或源码。

目录依据当前代码中的实现与扩展契约整理。后端条目需要相应模块完成装配，外部渠道还需要连接配置和凭据；前端 SDK 运行能力通常由宿主挂载时注入。条目存在不代表当前实例已经启用。

<CapabilityMarket />

## 常见组合

### 带审批的业务操作

用业务模型组织记录和操作，用业务动作承接提交行为，再由审批流处理人工任务。页面通过动作可用性调整操作状态，用审批时间线展示进度。提交、审批处理和结果查看分别检查权限；审批完成后的通知可以通过业务事件与消息通知衔接。

### 外部同步与页面进度

通过 RPC 模型定义外部接口，用消息队列或任务承接耗时处理，再通过 WebSocket / STOMP 推送进度。页面先读取当前状态，再衔接实时订阅。外部调用、消息重投和断线重连都可能造成重复处理，业务实现需要明确幂等规则。

### 可演进的业务台账

用数据模型描述字段和关联，按需要启用审计、逻辑删除或历史版本插件。唯一约束保护记录标识，数据权限限定行与字段范围。升级时先审查结构迁移，再安排旧数据回填；初始化定义只补齐缺失的基础数据，不承担已有数据更新。

## 给 AI 使用

机器入口分为<a href={useBaseUrl('/capabilities/index.json')}>精简检索索引</a>、<a href={useBaseUrl('/capabilities/catalog.json')}>完整能力目录</a>和<a href={useBaseUrl('/capabilities/catalog.schema.json')}>目录数据格式</a>。先用索引选候选项，再读取完整条目的接入条件、限制和指南，使用稳定的能力 ID 记录选型结果。具体步骤见[检索与使用能力目录](./capability-catalog)。

## 收录范围

目录覆盖前端公开 SDK、可在运行页面使用的内建组件，以及后端 `core`、`ability`、`security`、公共应用模块和公共开发库中的可复用能力。若干实现共同完成一项任务时合并为一个条目，例如公司、部门、员工选择器；计划任务与延迟任务等使用方式不同的能力分别列出。

开发平台专用设计器、工程脚手架和 IDE / Maven 工具见[开发工具](../fusion-development/development-tools)。测试支撑、兼容别名、聚合依赖模块和第三方库不重复计数。源码中尚为空接口或仅输出占位文本的实现未列为可选能力，例如当前的 `OpenAccessService` 和人员档案占位渲染器。
