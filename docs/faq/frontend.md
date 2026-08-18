---
sidebar_position: 99.1
---

# 前端

前端 FAQ 优先回答“页面为什么没按预期生效”和“前端扩展该从哪类入口切入”这两类高频问题。

## Q: 什么时候应该继续用 UI Schema，什么时候该切到微前端或自定义前端扩展？

标准列表、表单、详情、审批页和大多数结构化业务页面，优先继续使用 `UI Schema`。当页面存在复杂交互、自定义可视化、专用前端框架依赖，或者需要明显超出标准组件能力的体验时，再考虑微前端或自定义组件扩展。

如果你还在判断边界，建议先看 [融合开发总览](../fusion-development/) 和 [UI Schema](../concepts/ui-schema/)。

## Q: 自定义前端页面或微前端已经发布了，为什么平台里没有按预期生效？

先按下面顺序检查：

1. 对应入口的 [UI 模型](../concepts/ui-model/) 是否已经切换到正确的实现方式。
2. 微前端资源地址、打包产物和静态资源访问路径是否正确。
3. 菜单入口是否已经指向新的页面，并且当前角色有权限访问。
4. 平台缓存、版本发布或运行时装载是否已经刷新到最新资源。

如果你的目标只是替换标准页面中的少量交互，通常不一定需要直接切到微前端，先评估 UI Schema 或组件扩展是否足够。

## Q: 我应该从哪里查前端能力细节？

- 组件能力优先看 [内置组件参考](../api/frontend/buildin-comps/)
- SDK 补全和调用方式优先看 [前端 SDK 参考](../api/frontend/sdk/completion-methods/)
- 如果你想看扩展方式，继续看 [扩展前端](../guide/advance/extend-frontend/)

## Q: 自定义登录页要不要自己实现 `/login/callback` 和 `/login/bind`？

大多数情况下不需要。

当前平台默认只把 `/login` 交给自定义微前端处理，而 `/login/callback` 和 `/login/bind` 仍由基座负责。所以自定义登录页通常重点是：

- 组织登录方式
- 发起本地登录、LDAP 登录或跳转式登录
- 处理当前页的文案、交互和回跳参数

如果你正在做这类接入，建议继续看 [自定义登录页与认证接入](../fusion-development/custom-login-page-and-auth-integration)。

## Q: 我是该先看 SDK 初始化方法，还是自动补全方法？

- 你还在解决“怎么挂到基座里”：先看 [SDK 初始化方法](../api/frontend/sdk/initialization-methods/)
- 你已经挂载成功，正在查 token、登录、跳转、请求等工具：先看 [SDK 自动补全方法](../api/frontend/sdk/completion-methods/)
