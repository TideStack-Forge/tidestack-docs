---
title: 后端插件扩展
---

# 后端插件扩展

后端插件为模型、脚本、流程或平台运行时增加可复用能力。按能力的使用位置选择接口，注册方式由具体扩展点决定。

| 要增加的能力 | 教程 |
| --- | --- |
| 可视化编排中的新节点 | [逻辑流节点](./extend-logicflow/) |
| 脚本可调用的共享对象 | [脚本上下文](./extend-script/) |
| 表达式中的公共对象和方法 | [表达式上下文](./extend-expression/) |
| 建模字段、参数及默认界面 | [字段类型](./extend-field/) |
| 执行另一种脚本语言 | [新脚本语言](../../../fusion-development/plugin-extensions/backend/script-languages) |
| 值转换、持久化和物理列类型 | [数据字段类型](../../../fusion-development/plugin-extensions/backend/data-field-types) |
| 数据操作链中的可复用行为 | [数据模型插件](../../../fusion-development/plugin-extensions/backend/data-model-plugins) |
| 构建模型时补字段和插件描述符 | [元数据装饰器插件](../../../fusion-development/plugin-extensions/backend/metadata-decorators) |
| 业务模型的可选编辑与投影功能 | [业务模型插件](../../../fusion-development/plugin-extensions/backend/business-model-plugins) |
| 文件介质、命名、路径与访问地址 | [文件上传存储扩展](../../../fusion-development/plugin-extensions/backend/upload-storage) |
| 主体、Claims 和数据范围解析 | [数据权限扩展](../../../fusion-development/plugin-extensions/backend/data-permissions) |
| 新认证协议或 provider 来源 | [认证方式插件](../../../fusion-development/plugin-extensions/backend/authentication) |
| RPC、调度、消息与新模型来源 | [其他扩展入口](../../../fusion-development/plugin-extensions/backend/other-extension-points) |

## 实现顺序

1. 明确复用场景、稳定名称、输入输出、配置和兼容版本。
2. 查目标接口、加载位置与同类实现，确认 SPI、Bean 或配置源等装配方式。
3. 按 [扩展包指南](../../../fusion-development/backend-extension-packages)实现代码、注册文件与配套资源。
4. 验证行为、打包发现以及模型、脚本、流程中的真实调用。
5. 交付最小使用示例、升级影响和实际验证记录。

应用内实现 Controller、Service，或调用模型、MQ 和调度服务，见 [后端开发](../../../fusion-development/backend-development/)。制作可复用插件时，也保留平台的执行身份、权限、事务和生命周期。
