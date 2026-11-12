---
title: 术语与兼容命名
sidebar_position: 5
---

# 术语与兼容命名

潮汐栈与 Ouroboros 在本手册中指同一平台。产品名称已经采用 TideStack / 潮汐栈，现有运行时标识继续按兼容契约使用。AI 编写文档、代码或配置时，需要区分这两种用途。

## 公共名称

- **TideStack / 潮汐栈**：当前产品、文档、官网、skills、开源 handbook 和对外传播使用的名称。
- **Ouroboros / ouroboros**：历史名称，仍用于 Java 包、SDK、镜像、Maven 坐标和元数据路径等运行时标识。

## 不要自动改名的标识

除非任务明确要求迁移，并有对应兼容方案，不要仅因品牌名称变化而改动以下标识：

- Java 包：`com.ouroboros`
- 元数据路径：`META-INF/ouroboros`、`META-INF/ouroboros/metadata`
- 前端 SDK：`ouroboros-sdk`
- Docker 镜像或服务：`ouroboros-develop`、`ouroboros-mothership`、`ouroboros-web`
- Maven groupId、artifactId 和现有模块目录中的 `ouroboros-*`
- 已发布 metadata、API、权限、菜单、配置 key 和数据库字段

## 文档写法

- 用户可见标题、导航、说明优先使用“潮汐栈”。
- 涉及代码、命令、配置、路径、依赖和运行日志时保留真实标识。
- 需要解释旧名时写成“历史运行时标识 Ouroboros”；代码中的真实标识直接保留。
- 不要为了统一文案而让示例命令不可运行。

## AI 判断规则

根据名称所在位置判断，不仅凭用户使用哪个品牌名推断任务范围：

| 场景 | 处理方式 |
| --- | --- |
| 新增文档标题、导航或产品说明 | 使用“潮汐栈”或 `TideStack` |
| 编写 SDK 导入 | 保留 `ouroboros-sdk`，不改成未经发布的包名 |
| 编写 Java 类或依赖配置 | 保留真实的 `com.ouroboros` 包名和 Maven 坐标 |
| 编写元数据目录、菜单 URL 或配置 key | 按目标版本和现有契约使用真实标识 |
| 用户提到 Ouroboros，但未要求改名 | 结合目标应用、版本和任务继续处理 |
| 用户明确要求迁移运行时标识 | 先确认包、资源加载、配置和外部调用的影响范围，再按迁移方案实施 |

验收生成内容时，既要检查可见文案，也要检查命令、导入和资源引用能否在目标环境中使用。产品名称统一不能替代兼容性验证。
