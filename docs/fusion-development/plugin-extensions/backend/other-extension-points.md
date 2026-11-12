---
title: 其他可复用扩展入口
---

# 其他可复用扩展入口

平台还有模型来源、RPC 协议、认证凭据、调度来源与文件策略等扩展。先确定是在使用已有能力，还是增加可供多个应用引用的新能力，再选接口。

| 要增加的能力 | 接口与边界 | 开发起点 |
| --- | --- | --- |
| 新 RPC 元数据来源 | `RPCModelMetadataProvider` | 提供定义，沿用现有加载与刷新 |
| 新 RPC 定义类型 | `RPCModelDefinitionBuilder` | 解释元数据，生成协议定义 |
| 新 RPC 协议执行 | `RpcProtocolInvoker` | 正式执行器选择调用器，不绕过拦截器链 |
| 新 RPC 认证策略 | `RPCAuthCredentialBuilder` | 与既有凭据中心和请求处理链协作 |
| 新计划任务来源 | `ScheduleTaskProvider` | 提供任务，沿用现有聚合与调度生命周期 |
| 新消息中间件 | MQ binder / producer / consumer 适配 | 维持绑定与平台刷新生命周期 |
| 新文件名、路径、URL 策略 | 各 GeneratorBuilder | [文件上传存储扩展](./upload-storage) |
| 新模型开发管理模块 | `*-dev` 模块及正式管理能力 | [开发模块脚手架](../../development-module-scaffold-and-maven-skeleton) |

## 注册前检查

打开目标接口当前加载位置及同类实现，确认由 Java SPI、Spring Bean、已有配置源还是其他机制发现。不同扩展接口的注册方式不同，不能从名称含 Provider 或 Builder 推断统一使用某种注册文件。

新增扩展按 [后端扩展包](../../backend-extension-packages)装配。给出稳定名称、支持范围、依赖、一个可运行的使用样例，以及失败与升级行为；安装后通过实际模型和业务入口验证。

只是调用 RPC、MQ 或计划任务时，从 [后端开发](../../backend-development/)进入，不必实现本页列出的基础能力插件。
