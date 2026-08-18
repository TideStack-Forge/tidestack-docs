---
sidebar_position: 13
title: 逻辑流模型
---

# 逻辑流模型

逻辑流模型描述机器执行的节点、连接、输入输出和错误路径。它适合把校验、查询、映射、分支、外部调用和持久化等步骤编排成可执行流程。

## 作用

- 把多步骤自动处理从散落代码中收敛为可视化流程。
- 为 WebAPI、定时任务、消息消费和业务动作提供执行载体。
- 通过节点注册机制扩展平台可执行能力。
- 让表达式、脚本、数据模型和 RPC 在统一上下文中协作。

## 核心属性

| 属性 | 作用 | 说明 |
| --- | --- | --- |
| `name` / `description` | 流程标识与说明 | 供调用方和管理界面识别。 |
| `entryNode` | 起始节点 | 定义正常执行的入口。 |
| `exitNode` | 成功出口 | 定义正常完成路径。 |
| `errorEntryNode` | 错误入口 | 定义异常处理或错误分支的入口。 |
| `inputDataType` / `outputDataType` | 输入输出契约 | 约束流程接收和返回的数据形态。 |
| `nodes` | 节点集合 | 描述校验、脚本、查询、调用等处理步骤。 |
| `connections` | 连接集合 | 描述节点之间的控制或数据流转。 |
| `nodePositions` | 编辑布局 | 保存设计器中的节点位置，不改变执行语义。 |
| `isEnabled` | 启用状态 | 控制流程是否可被运行时调用。 |

## 与其他模型的关系

- [WebAPI 模型](../webapi-model/) 可以把逻辑流作为接口处理器。
- [业务模型](../business-model/) 的标准动作和自定义动作可以投射到逻辑流。
- [数据模型](../data-model/) 提供记录查询和写入能力，[RPC 模型](../rpc-model/) 提供外部调用能力。
- [审批流模型](../approval-workflow-model/) 管理人员参与的长流程，逻辑流负责其中即时的机器动作。
- [平台支撑资源](../supporting-resources/) 中的逻辑流节点定义决定编辑器和运行时可用的节点类型。

## 逻辑流与脚本、表达式

表达式适合短条件和取值，脚本适合局部计算，逻辑流适合有明确步骤、分支和失败路径的自动过程。三者可以在流程中协作，但不应把整个业务生命周期塞进一个脚本节点。

## 使用入口与契约

- 操作入口：[逻辑流教程](../../guide/tutorial/logicflow/) · [逻辑流菜单](../../low-code/development-platform-menus/logicflow)
- 扩展入口：[扩展逻辑流](../../guide/advance/extend-backend/extend-logicflow/)
- Schema：`logicflow.schema.json`；节点资源使用 `flow-node.schema.json`，完整索引见 [JSON Schema 参考](../../reference/jsonschema/)。
