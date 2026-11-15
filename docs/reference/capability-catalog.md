---
title: 检索与使用能力目录
sidebar_position: 3
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 检索与使用能力目录

能力目录帮助人和 AI 回答三个问题：平台是否已有适用能力，需要怎样接入，还有哪些条件必须补齐。目录中的 ID 可用于需求拆解、方案评审和生成任务，具体参数与执行行为仍以目标版本的接口契约为准。

## 目录文件

| 文件 | 用途 |
| --- | --- |
| <a href={useBaseUrl('/capabilities/index.json')}>index.json</a> | 精简索引。包含能力 ID、名称、前后端、领域、简介、适用场景和接入方式，适合先检索候选能力。 |
| <a href={useBaseUrl('/capabilities/catalog.json')}>catalog.json</a> | 完整目录。补充入口、前提、限制、源码、相关指南和组合建议。 |
| <a href={useBaseUrl('/capabilities/catalog.schema.json')}>catalog.schema.json</a> | 完整目录的 JSON Schema，供导入和维护时校验数据。 |

手册中的筛选页面与下载文件共用一份能力数据。`source.revision` 记录盘点时的基础提交，`basis: working-tree` 表示还包含当时工作区内容；它不是产品发行版本号。当前目录为源码核对结果，`runtimeVerified: false` 表示未逐项在部署实例调用验收。

## 如何选择能力

1. **说明任务。** 写清输入、输出、操作角色、部署环境及外部系统。例如“订单超时半小时后关闭，用户页面能看到结果”。
2. **检索候选能力。** 从索引中找延迟任务、业务动作和实时消息，再查各自完整条目。不要只依赖名字相似。
3. **检查前提和限制。** 确认目标版本包含所需模块、调度实现、身份与权限，判断是否需要外部服务或额外插件。
4. **读取使用契约。** 优先读 `docs.coverage: guide` 的指南。只有 `related` 时，继续查目标版本源码或 API；不能把相关介绍当作完整调用示例。
5. **给出组合与验证。** 列出选中的 ID、各自职责、仍需编写的业务逻辑，以及失败、重试、权限和并发的验证办法。

上面的超时处理可以选择 `be.integration.delayed` 调度一次性处理，以 `be.business.actions` 承接状态变更，再用 `be.integration.websocket` 和 `fe.stomp` 刷新页面。还需要业务代码判断订单是否已经完成，处理任务重复触发，并选择明确的后台身份；仅组合调度和推送不能保证业务状态正确。

## 条目字段

| 字段 | 含义 |
| --- | --- |
| `id` | 稳定能力标识，如 `be.integration.delayed`。变更展示名称时保留 ID。 |
| `side`、`category` | 前端或后端，以及所属业务 / 技术领域。 |
| `summary`、`useWhen` | 能做什么，什么情况下适合使用。 |
| `entryPoints` | Java / SDK 标识、组件类型或配置入口。自然语言入口不是可直接执行的方法签名。 |
| `access` | `metadata`、`java`、`sdk`、`schema`、`module` 或 `spi`，一项能力可以有多种接入方式。 |
| `availability` | `host`：由前端基座提供；`assembled`：按后端模块装配；`optional`：按需装配或配置。均不代表部署实例已启用。 |
| `requires`、`limits` | 使用前提、已知限制与常见误用。 |
| `modules` | 源码所属模块的仓库路径，便于定位依赖与实现；不是完整 Maven 依赖清单。 |
| `sources` | 相对于本项目仓库根的源码路径，供拿到对应源码的开发者核对。不是网站 URL。 |
| `docs` | `path` 相对于手册 `docs`；`guide` 表示接入指南，`related` 表示相关说明。发布后的阅读链接由能力地图提供。 |
| `related` | 建议一起考虑的能力 ID。只表示相关组合，不是完整依赖图。 |
| `verification` | `source-reviewed` 表示基于源码核对。部署可用性另行验证。 |

## 本地检索示例

下载目录后，可以用 `jq` 先查某个领域的名称与适用场景：

```bash
jq '.capabilities[] | select(.category == "integration") |
  {id, name, side, useWhen}' index.json
```

确定候选 ID 后，读取完整条目：

```bash
jq '.capabilities[] | select(.id == "be.integration.delayed")' catalog.json
```

给 AI 的任务可以写成：

```text
请依据能力目录，为“订单超时半小时后关闭并刷新页面”选择已有能力。
目标平台版本、部署方式和工程依赖见当前项目说明。

先检索 index.json，再读取候选条目的完整条件与指南。
给出能力 ID、选择理由、所需模块、配置、业务实现和验证步骤。
缺少 API 契约或部署证据时明确指出，不猜测方法签名，不假设模块已启用。
```

## 与 AI 工具调用的关系

能力目录适合做知识检索、上下文选择和方案选型。若要把某项能力交给 AI 执行，还需要为它提供明确的工具输入输出、认证、授权和执行边界。特别是业务写入、审批、文件下载和外部调用，应由后端或工具适配实现相应检查；目录条目和模型自描述本身不授予这些权限。

当前 MCP 条目描述平台接入外部 MCP 工具的能力，不表示平台已把这份目录中的能力自动发布为 MCP 服务。
