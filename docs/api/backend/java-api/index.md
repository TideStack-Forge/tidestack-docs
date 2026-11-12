---
sidebar_position: 5
title: Java API
---

# Java API

本节提供后端扩展可复用的工具类，以及脚本中常见的认证和组织对象。工具类来自 `com.ouroboros:ouroboros-util`，Java 导入路径为 `com.ouroboros.util.<类名>`，版本沿用应用依赖管理。

## 工具类索引

| 类 | 用途 |
| --- | --- |
| [Converter](./util/converter/) | 将输入转为数字、布尔值或字符串 |
| [Dates](./util/dates/) | 日期转换、格式化、时间戳和日期区间 |
| [Maps](./util/maps/) · [Lists](./util/lists/) | 合并、筛选、复制和嵌套结构访问 |
| [Json](./util/json/) · [JsonBag](./util/json-bag/) | JSON 解析、序列化和弱结构数据访问 |
| [JsonSchemas](./util/json-schemas/) | 校验 JSON 数据并读取错误详情 |
| [Functions](./util/functions/) | 函数组合和参数适配 |
| [Paths](./util/paths/) | 文件路径和 URL 拼接 |
| [SPI](./util/spi/) | 加载已注册的 Java 扩展实现 |

```java
import com.ouroboros.util.Json;

var payload = Json.tryToMap("{\"status\":\"OPEN\"}").get();
```

需要保留解析错误时，使用 `tryTo*` 并处理 `Try`，或用 `.get()` 将失败继续抛出。

## 认证和组织对象

| 接口 | 获取方式 |
| --- | --- |
| [OuroborosAuthentication](./entity/ouroboros-authentication/) | `AuthenticationHolder.getAuthentication()` |
| [Employee](./entity/employee/) | `OrganizationHolder.getEmployee()` |
| [Department](./entity/department/) | `OrganizationHolder.getDepartment()` |
| [Company](./entity/company/) | `OrganizationHolder.getCompany()` |

这些获取方式适用于已启用相应能力的脚本和表达式。组织信息可能未绑定，使用前判空。

## 使用环境

表达式默认提供 `Dates`、`Converter`；脚本还提供 `Maps`。其他工具类在 Java 中导入使用，并非默认脚本全局变量。完整可用对象见 [表达式上下文](../expression-context/) 和 [脚本上下文](../script-context/)。

数据读写见 [数据模型 API](../data-model/)，新增扩展的安装与注册见 [扩展后端](../../../guide/advance/extend-backend/)。
