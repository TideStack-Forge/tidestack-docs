---
sidebar_position: 5
---

# Java API

这页收录的是在手册中已经整理出来、并且适合直接查阅的 Java 接口与工具类。

如果你当前主要写的是表达式或脚本，这页更适合作为“对象长什么样、工具类还有哪些方法”的补充手册；如果你写的是后端 Java 代码，它则更接近可直接对照使用的参考页。

## 当前收录范围

- 工具类：适合在表达式、脚本或服务实现中复用
- 实体接口：适合快速确认运行时对象的基本结构

如果你当前要找的是扩展 SPI 或装配入口，例如 `NodeBuilder`、`ExpressionContextContributor`、`ScriptContextContributor`，更适合先回到 [融合开发](../../../fusion-development/) 和 [扩展后端](../../../guide/advance/extend-backend/)。

## 先按使用环境理解

| 环境 | 更常看的内容 | 说明 |
| ---- | ---- | ---- |
| 表达式 `${...}` | `Dates`、`Converter`、认证 / 组织对象 | 表达式默认上下文对象比较少 |
| 脚本 | `Dates`、`Converter`、`Maps`、认证 / 组织 / 模型对象 | 脚本上下文比表达式更完整 |
| Java 后端代码 | 全部工具类和实体接口 | 不受脚本默认注入范围限制 |

当前默认脚本上下文直接注入的是：

- `Dates`
- `Converter`
- `Maps`

当前表达式上下文默认直接可用的是：

- `Dates`
- `Converter`

像 `Json`、`JsonBag`、`Functions`、`Paths`、`SPI` 这些更偏后端代码复用，不会默认作为表达式 / 脚本全局对象全部暴露出来。

## 工具类

| 类名                          | 说明               |
| ----------------------------- | ------------------ |
| [Dates](./util/dates)         | 日期相关工具类     |
| [Converter](./util/converter) | 类型转换相关工具类 |
| [Maps](./util/maps)           | Map 相关工具类     |
| [Lists](./util/lists)         | List 相关工具类    |
| [Json](./util/json)           | JSON 序列化与反序列化工具 |
| [JsonBag](./util/json-bag)    | JSON 弱结构包装器  |
| [JsonSchemas](./util/json-schemas) | JSON Schema 校验工具 |
| [Functions](./util/functions) | 函数组合与 Vavr 适配工具 |
| [Paths](./util/paths)         | 文件路径与 URL 路径工具 |
| [SPI](./util/spi)             | Java SPI 加载工具 |

## 实体接口

| 接口名                                                       | 说明         | 所属模块     |
| ------------------------------------------------------------ | ------------ | ------------ |
| [OuroborosAuthentication](./entity/ouroboros-authentication) | 认证信息接口 | 安全模块     |
| [Company](./entity/company)                                  | 公司实体接口 | 组织架构模块 |
| [Department](./entity/department)                            | 部门实体接口 | 组织架构模块 |
| [Employee](./entity/employee)                                | 员工实体接口 | 组织架构模块 |

## 使用建议

- 想查表达式和脚本里怎么拿到这些对象，继续看 [表达式上下文](../expression-context/) 和 [脚本上下文](../script-context/)
- 想查这些对象背后的模型关系，回到 [核心概念](../../../concepts/)
- 只有 `Dates`、`Converter`、`Maps` 会在当前默认脚本上下文里直接作为全局对象注入；其他工具类主要面向 Java 后端代码

## 一条推荐阅读路径

1. 先通过 [脚本上下文](../script-context/) 或 [表达式上下文](../expression-context/) 确认你当前能直接拿到什么对象。
2. 再回到这页查对应 Java 类型、工具类方法和实体结构。
3. 如果最终发现自己真正要解决的是“如何把这些对象扩展到平台里”，再转到 [扩展后端](../../../guide/advance/extend-backend/)。
