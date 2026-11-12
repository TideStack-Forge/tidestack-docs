---
title: 平台组件库（带 manifest）
---

# 平台组件库（带 manifest）

平台组件库将一组可复用控件及其清单打包，安装到开发平台后供应用导入。`components.manifest.json` 描述库包含的组件，运行时代码仍需按真实的名称和类别完成注册。

需要仅向当前应用装载组件时，使用 [普通组件包](../../../guide/advance/extend-frontend/amis-component/)。两者共享组件实现方法，安装入口和管理信息不同。

## 1. 实现组件并生成清单

先按普通组件包教程实现组件。平台组件库使用目标版本提供的工程模板及加载契约；模板如果提供 `components`、`install(registry)` 等导出，沿用它，不额外拼接另一套生命周期。

将下面的清单置于构建入口所在目录，使宿主能在 entry 目录读取 `components.manifest.json`：

```json
{
  "renderers": [
    {"name": "order-status", "label": "订单状态", "description": "显示订单状态", "tags": ["订单"]}
  ],
  "formItems": [
    {"name": "order-number", "label": "订单编号", "tags": ["订单", "表单"]}
  ],
  "optionsControls": []
}
```

`renderers`、`formItems`、`optionsControls` 分别声明展示渲染器、表单项和选项控件。`name` 必须与实际注册名一致；`label` 用于展示，`description` 和 `tags` 用于介绍和检索。清单不能替代组件代码或编辑器定义。

## 2. 构建并安装

1. 核对目标平台生成模板中的管理文件、库名称、版本和入口资源路径。
2. 构建工程，检查 ZIP 中包含入口 HTML、脚本、样式及可读取的清单，而非只有源码。
3. 在开发平台的 **平台组件库** 上传 ZIP，核对库信息、组件清单与资源地址。
4. 在测试应用的 **高级功能 / 平台组件库** 导入该库。
5. 用最小 Schema 引用 `order-status` 或 `order-number`，分别检查渲染、值变化和提交。

安装界面见 [平台组件库管理](../../../low-code/development-platform-menus/platform-component-library)，应用关联见 [应用组件库](../../../low-code/development-platform-menus/component-library)。平台安装、应用导入、运行时注册、编辑器配置是不同检查项。

## 3. 升级与移除

升级前查清使用应用，在测试应用验证新版本兼容旧 Schema，再回归受影响页面。应用按库名称关联时，不能假定每个应用都能固定独立旧版本。

从应用移除关联前先迁移 Schema 引用，平台卸载前确认所有应用都已清理依赖。保留旧包及配套配置，并在目标版本确认降级或恢复方式；仅保存旧 ZIP 不能保证可以直接降级。

## 验证

- 清单名称与实际注册名、类别相符，资源路径在平台部署后可访问。
- 组件导入后能渲染，表单项能回填、修改、重置和提交。
- 禁用、只读、空值、接口失败和无权限状态符合组件契约。
- 重新进入页面不重复注册，升级及恢复后旧页面可用。

交付构建包、属性说明、最小 Schema、引用应用清单及实际验证记录。工作台内如何组合这些控件，见 [工作台与 Widget](../../workbench-widgets-and-component-libraries)。
