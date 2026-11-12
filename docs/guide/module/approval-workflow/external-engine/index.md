---
sidebar_position: 4
---

# 外部流程引擎对接

外部流程引擎对接用于把某条审批流交给外部协作平台执行：潮汐栈负责发起、跟踪结果并回写业务状态，外部平台承担完整的审批过程。

适用场景：企业已在钉钉、企业微信或飞书里维护审批流程，不希望再复制一套流程图到平台。

:::warning
这是“外部引擎作为流程真相源”的能力。以结果型接入的流程不会在[审批中心](../approval-center/)生成待办、表单和审批按钮。
:::

## 三种渠道的接入形态

| 渠道 | `provider` | 适配器 ID | 接入形态 |
| --- | --- | --- | --- |
| 钉钉 OA 审批 | `dingtalk` | `dingtalk-oa` | 配置企业 `corpId`；由钉钉回调把审批结果推回平台 |
| 企业微信审批 | `wecom` | `wecom-approval-third-party` | 第三方应用形态，审批过程由企业微信承载 |
| 飞书原生审批 | `feishu` | `feishu-approval-native` | 飞书审批为权威，另提供发起结果补偿查询 |

三家都通过 HTTP 回调入口接收结果：

```text
POST /api/approval-workflow/external/dingtalk|wecom|feishu/{connectionId}/callback
```

共同前提：外部流程定义已发布且版本可用、平台用户能映射到外部用户标识、回调地址已在外部平台配置完成。

## 两种接入模式

| 模式 | 含义 | 平台侧表现 |
| --- | --- | --- |
| `RESULT_ONLY` | 外部引擎负责完整审批过程，平台只关心最终结果 | 发起一次外部实例，等待回调或对账；不创建本地待办 |
| `FULL_PROCESS` | 平台审批中心呈现外部任务并发起审批动作 | 需要实例查询、任务查询、任务动作、表单读取等端口 |

模式不是可配置项，而是由适配器实际实现的端口派生：只有实现了实例查询、任务查询等端口的适配器才具备 `FULL_PROCESS` 语义，其余一律 `RESULT_ONLY`。因此映射里填写模式与适配器能力不一致的情况不会出现。

当前能力边界：

- 钉钉、企业微信、飞书三个真实渠道当前都只能 `RESULT_ONLY`：支持发起、回调、实例详情查询和用户身份映射。
- 任务查询、任务动作、审批记录查询、外部流程定义发现和真实增量轮询都尚未实现；映射中配置任务动作会在激活校验时被拒绝。
- 结果型接入也不支持发起时覆盖审批人、自选审批人、抄送映射和启动变量，相应入参返回 `EXTERNAL_CAPABILITY_UNSUPPORTED`。
- 早期把本地待办投影到外部平台的镜像机制已删除；`authority=OUROBOROS` 现在只表示“由平台内置引擎执行”，不产生任何外部镜像写入。
- 平台内置引擎只有 Flowable 一个可选实现；外部引擎对接不改变内置引擎的选择规则。

## 连接配置

外部连接统一保存在平台配置项 `enterprise.connections` 中（可增删的列表），每个条目是一个连接快照：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `connectionId` | 是 | 平台内全局唯一的连接标识；只允许字母、数字、点、下划线、连字符，最长 128 位 |
| `provider` | 是 | 流程引擎渠道，取值来自适配器注册表（`dingtalk` / `wecom` / `feishu`） |
| `credentialRef` | 是（有凭据映射器的渠道） | 安全存储引用，例如 `env:FEISHU_MAIN_CREDENTIAL`；禁止填写明文密钥或 token |
| `auth.enabled` | 否 | 是否允许该连接参与 OAuth/SSO 登录；只影响登录认证，不影响审批、通知等业务连接 |

除公共字段外，provider 还可以声明自己的非敏感字段，例如钉钉的 `corpId`（企业标识，用于回调解密和 AppLink）。字段名疑似明文凭据（以 `secret`、`token`、`password`、`key` 等结尾）时直接拒绝保存，凭据必须走 `credentialRef`。

映射通过 `connectionId` 引用连接；凭据解析和健康检查由对应适配器执行。

## 映射激活前的校验

映射状态流转：`DRAFT` / `INVALID` → 正式校验（`VALIDATING`）→ `VALIDATED` → 激活为 `ACTIVE`，之后可 `PAUSED` / `RETIRED`。只有 `VALIDATED` 状态可以激活，同一 `scope + flowKey` 同时只有一条 `ACTIVE` 映射。

激活前会依次校验：适配器存在、流程标识存在、接入模式与动作映射自洽、适配器能力齐备、动作映射合法、结果映射覆盖必需终态、外部定义可用、连接健康检查通过。

常见拒绝原因：

| 错误码 | 触发时机 |
| --- | --- |
| `EXTERNAL_CAPABILITY_UNSUPPORTED` | 适配器缺少该模式所需能力，例如给结果型渠道配置任务动作，或调用渠道未实现的入参覆盖能力 |
| `WORKFLOW_MAPPING_NOT_ACTIVE` | 映射不在可执行状态：非 `VALIDATED` 却尝试激活，或发起时映射不是 `ACTIVE` |
| `EXTERNAL_ACTION_NOT_MAPPED` | 动作映射缺失或非法、动作名不在平台规范动作集内、适配器未声明支持该动作，或 `authority=OUROBOROS` 却配置了动作映射 |
| `ENGINE_CONNECTION_UNAVAILABLE` | 连接快照非法（provider 未注册、字段未声明、`connectionId` 重复或格式非法、缺 `credentialRef`），或激活时健康检查未通过 |

结果映射至少要覆盖 `RUNNING`、`APPROVED`、`REJECTED`、`CANCELED`、`ERROR` 五个状态，否则校验直接失败。

## 运维入口

- 批量校验：`POST /api/approval-workflow/engine-mappings/batch-validate`，返回 `failedCount=0` 才代表全部映射可激活。
- 激活与下线：`POST /api/approval-workflow/engine-mappings/{id}/activate`、`/pause`、`/retire`。
- 灰度与全量迁移：未映射流程的发起策略由配置键 `ouroboros.workflow.approval.external.unmapped-policy` 控制，取值 `internal`（委托内置引擎）或 `reject`（拒绝发起）。
- 完整切换检查清单、回滚步骤和运行中实例说明见仓库内 `docs/runbooks/approval-workflow-external-engine-migration-runbook.md`。

切换前务必确认：外部引擎不可用或发起失败时不会自动回退到内置引擎；运行中的实例继续按发起时绑定的映射版本执行。

## 相关阅读

- [审批流管理](../approval-management/)：定义和部署本地审批流。
- [审批中心](../approval-center/)：结果型外部流程不会在这里产生待办。
- [审批流模型](../../../../concepts/approval-workflow-model/)：先理解本地流程模型，再判断哪些流程适合外移。
