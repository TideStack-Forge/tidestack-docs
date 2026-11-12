---
sidebar_position: 2
---

# 菜单扩展 API

`menu` 用于设置徽标、查询和修改运行时菜单树；`userMenu` 用于注册头像下拉菜单项。两者均从 `ouroboros-sdk` 导入，在页面 `render` 或 `afterMount` 之后使用。

## 菜单徽标

| 类型 | 配置示例 |
| --- | --- |
| 数字 | `{ type: 'number', value: 3, max: 99, showZero: false }` |
| 红点 | `{ type: 'dot', color: '#00b3ff' }` |
| 文本 | `{ type: 'text', text: 'NEW' }` |
| 缎带 | `{ type: 'ribbon', text: '预览', position: 'top-right' }` |

```js
import { menu } from 'ouroboros-sdk'

menu.setMenuBadge('workbench.todo', { type: 'number', value: 128 }) // 99+
const badge = menu.getMenuBadge('workbench.todo')
menu.setMenuBadge('workbench.todo', null) // 清除
```

菜单引用优先使用 `fullName`，也支持路径等引用。数字徽标默认超过 `99` 显示 `99+`，小于等于 `0` 不显示；要显示 `0`，设置 `showZero: true`。

## 查询菜单树

| 方法 | 结果 |
| --- | --- |
| `getMenu(ref)` | 菜单副本或 `undefined`，包含徽标 |
| `getMenus({ scope, flat? })` | 菜单树或扁平数组 |
| `traverseMenus(visitor, { scope }?)` | 深度优先遍历，回调返回 `false` 跳过子树 |

`scope` 支持 `main`、`secondary`、`all`。`all` 的树结果为 `{ main, secondary }`；`flat: true` 返回数组，各项含从 `1` 开始的 `level`。

```js
const tree = menu.getMenus({ scope: 'all' })
const flat = menu.getMenus({ scope: 'main', flat: true })
menu.traverseMenus((item, parents) => {
  console.log(item.fullName, parents.length)
}, { scope: 'main' })
```

## 运行时增删

```js
const added = menu.addMenuItem({
  scope: 'main',
  item: { fullName: 'orders.help', title: '订单帮助', path: '/orders/help' },
})
if (!added) console.log('菜单未添加，请检查 fullName 和父节点')
menu.removeMenuItem('orders.help')
```

示例要求 `/orders/help` 已有对应页面。`addMenuItem` 可通过 `parentFullName` 指定父节点、`index` 指定插入位置；缺省追加到根节点。`fullName` 必须全局唯一，父节点不存在或引用冲突时返回 `false`。

删除会移除整个子树并清除其徽标。增删仅影响当前前端菜单，不会创建页面、授予权限或持久化菜单配置。

## 用户菜单

```js
import { userMenu } from 'ouroboros-sdk'

const id = userMenu.register({
  key: 'orders-help',
  title: '订单帮助',
  order: 50,
  onClick: async (ctx) => {
    await ctx.openDialog({ title: '订单帮助', body: '如需协助，请联系订单管理员。' })
  },
})
// 不再需要该入口时：
userMenu.unregister(id)
```

| 配置 / 方法 | 用途 |
| --- | --- |
| `key` | 稳定业务键；重复注册覆盖同键条目 |
| `order` | 升序展示，默认 `100` |
| `icon`、`badge`、`divider` | 图标、徽标和分隔线 |
| `visible(ctx)`、`disabled(ctx)` | 按当前用户和主题控制状态 |
| `closeOnClick` | 点击后收起，默认 `true` |
| `getItems()` | 获取按顺序排列的菜单项，含内置项 |
| `unregisterAll(owner)` | 清理指定归属的菜单项 |

普通微前端无需指定 `owner`，SDK 会记录归属并在卸载时清理其注册项。不要清理其他应用的菜单。

## 在 Schema 中设置徽标

```json
{
  "type": "button",
  "label": "标记有新订单",
  "onEvent": {
    "click": {
      "actions": [
        {
          "actionType": "setMenuBadge",
          "args": {
            "fullName": "orders.list",
            "badge": { "type": "dot" }
          }
        }
      ]
    }
  }
}
```

`badge: null` 清除徽标。菜单树增删和用户菜单注册通过 SDK 使用。

## 状态与调用时机

徽标和运行时菜单只存在于当前会话内存中，刷新会丢失。重新登录或切换语言重建菜单时，已有徽标会按引用重新匹配；登出会清空徽标和非内置用户菜单项。

注入前命令会排队，查询返回空结果；其中 `addMenuItem/removeMenuItem` 会先返回 `false`，`register` 返回临时 ID，该 ID 无法撤回已排队注册。需要读取结果或支持撤销时，统一在挂载后调用。
