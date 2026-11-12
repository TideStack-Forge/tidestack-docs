---
title: 数据权限扩展插件
---

# 数据权限扩展插件

数据权限扩展将可配置的数据范围规则解析为行约束，再由查询和响应链路落实。用户、角色、主体和接口权限的整体关系见 [权限与访问控制](../../authority-subject-and-access-control-design)。

## 1. 选择扩展层

| 需求 | 入口 |
| --- | --- |
| 新的业务主体或用户绑定来源 | `SubjectProvider`、`UserSubjectProvider` |
| 当前用户的新 Claims 来源 | `ClaimsProvider` |
| 新权限定义来源 | `AuthorityProvider` |
| 自定义数据范围规则解析 | `AccessControlFilterBuilder`，可实现 `RowScopeResolver` 语义别名 |

已有部门或员工范围先复用组织模块解析器，不在每个 Controller 内重复拼接权限逻辑。

## 2. 实现行约束解析

核心接口位于 `com.ouroboros.security.authority.accesscontrol.filter`：

```java
Map<String, Object> build(Map<String, Object> params, AccessControlDefine define);
RowConstraint resolve(Map<String, Object> params, AccessControlDefine define);
```

`resolve` 是默认方法，行结果有 `ALL`、`FILTER`、`NONE` 三种语义。默认实现把 build 返回的空 Map 解释为 ALL，因此“当前用户没有可访问记录”不能返回空 Map，应明确返回 `RowConstraint.none()`，或在无法完成解析时拒绝访问。

实现规则时：

1. 只读取并消费自己负责的配置键；成功处理后从传入 params 移除这些键。
2. 没有自己的规则时返回 ALL，交给其他解析器继续处理。
3. 规则要求主体而主体缺失时返回 NONE 或拒绝，不能退化为不限制。
4. 正常规则返回使用模型字段名构成的 QueryDSL 条件。

平台组合解析结果；解析后仍有未消费参数会拒绝授权，避免未知规则被忽略。实现只负责自己规则，不清空其他插件的参数。

## 3. 注册并让权限使用规则

注册文件：

```text
META-INF/services/com.ouroboros.security.authority.accesscontrol.filter.AccessControlFilterBuilder
```

写入实现类名，按既有优先级约定排序。在权限的 `AccessControlDefine` 与授权配置中提供对应规则及字段配置，再由业务查询消费 `getRowConstraint()` 与字段限制。

`getFilters()` 遇到 NONE 会拒绝访问，不能将其异常捕获后改为空查询。新增主体、Claims 等来源各自遵循对应正式注册方式，不因统称插件就都注册到这个 SPI。

## 验证

用同角色不同主体、无绑定主体、无权限和管理员账号访问同一数据集。核对行范围、字段允许与禁止、count、分页和导出。覆盖未知配置、缺少解析器、ALL/FILTER/NONE 的组合，并从直接 API 请求验证，不能只检查页面显隐。
