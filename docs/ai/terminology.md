---
title: 术语与兼容命名
sidebar_position: 2
---

# 术语与兼容命名

## 公共名称

- **TideStack / 潮汐栈**：当前产品、文档、官网、skills、开源 handbook 和对外传播使用的名称。
- **Ouroboros / ouroboros**：历史名称，也是当前大量运行时标识、包名、SDK、镜像、Maven 坐标和元数据路径的一部分。

## 不要自动改名的标识

除非存在专门迁移任务，不要改动这些运行时标识：

- Java 包：`com.ouroboros`
- 元数据路径：`META-INF/ouroboros`、`META-INF/ouroboros/metadata`
- 前端 SDK：`ouroboros-sdk`
- Docker 镜像或服务：`ouroboros-develop`、`ouroboros-mothership`、`ouroboros-web`
- Maven groupId、artifactId 和现有模块目录中的 `ouroboros-*`
- 已发布 metadata、API、权限、菜单、配置 key 和数据库字段

## 文档写法

- 用户可见标题、导航、说明优先使用“潮汐栈”。
- 涉及代码、命令、配置、路径、依赖和运行日志时保留真实标识。
- 第一次出现旧名时写成“legacy Ouroboros”或“历史运行时标识 Ouroboros”。
- 不要为了统一文案而让示例命令不可运行。

## AI 判断规则

如果用户说“ouroboros”，通常是在指现有平台或代码库；如果用户说“TideStack”，通常是在指新品牌和对外文档。两者在当前 handbook 中默认指同一平台，但命名所在层级不同。
