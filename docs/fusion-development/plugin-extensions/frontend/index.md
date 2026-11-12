---
title: 前端插件扩展
---

# 前端插件扩展

前端插件为 Schema 页面提供可复用控件。先实现组件的注册名、属性、事件与值变化，再按复用和管理需要选择交付方式。

| 交付方式 | manifest | 安装和使用 |
| --- | --- | --- |
| [平台组件库](./platform-component-library) | 包含 `components.manifest.json` | 平台安装库，应用导入，按清单和实际注册使用 |
| [普通组件包](../../../guide/advance/extend-frontend/amis-component/) | 不要求 manifest | 在应用微前端管理中选择“组件库”，加载后按 `type` 引用 |

两类包都要包含实际渲染代码。manifest 描述组件，不能自动实现注册、值变化或编辑器面板。平台库也不能只把普通包增加一个空清单就视为完成，需满足目标平台的管理信息与加载契约。

## 共同开发步骤

1. 约定组件名称和类型，提供最小 Schema、属性和空值示例。
2. 使用目标 SDK 的组件注册入口实现渲染、交互和清理；表单项验证 `value` 与 `onChange`。
3. 按所选交付方式组织入口、构建配置和清单。
4. 从真实平台页面验证资源、注册、表单提交、只读、禁用及重复挂载。

完整页面、子应用、布局和工作台属于 [前端开发](../../frontend-extension-paths)。Schema 语法与组件属性查 [PrismUI 开发参考](../../../guide/advance/amis-reference/)，平台 SDK 标识以目标工程实际导出为准。
