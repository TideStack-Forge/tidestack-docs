---
title: 融合开发
sidebar_position: 1
---

# 融合开发

融合开发用于实现平台内建模型、页面和节点无法直接表达的需求。

## 按任务选择入口

| 任务 | 查看 |
| --- | --- |
| 判断是否需要写代码 | [何时用低代码，何时写代码](./when-to-use-code) |
| 查正式扩展点 | [平台扩展点总表](./extension-points) |
| 接入独立页面、布局或组件 | [前端融合开发方式](./frontend-extension-paths) |
| 创建可安装的后端能力 | [创建后端扩展包](./backend-extension-packages) |
| 创建开发态 `*-dev` 模块 | [开发模块与 Maven 脚手架](./development-module-scaffold-and-maven-skeleton) |
| 接入登录页或认证方式 | [自定义登录页与认证接入](./custom-login-page-and-auth-integration) |
| 接入 AD 域认证 | [AD 域认证适配](./ad-domain-auth-adaptation-guide) |
| 处理主体、Claims 和细粒度权限 | [权限、主体与访问控制](./authority-subject-and-access-control-design) |
| 组合调度、消息和实时通信 | [集成、自动化与实时能力](./integration-automation-and-realtime) |
| 创建工作台、Widget 或跨应用组件库 | [工作台、Widget 与平台组件库](./workbench-widgets-and-component-libraries) |

## 实施要求

1. 明确内建能力无法满足的具体边界。
2. 选择平台已有扩展点，不修改或绕过主运行链路。
3. 为扩展实现编写单元测试和最小集成验证。
4. 注册自动配置、SPI 和元数据资源。
5. 说明兼容平台版本、安装方式、配置项和回滚方法。
6. 让业务模型、菜单、权限和发布流程继续通过平台管理。

完整工作方式见 [融合开发总览](./overview)。
