---
sidebar_position: 4
---

# 表达式上下文

这页收录的是 `${...}` 表达式运行时可直接使用的上下文对象和工具。

## 什么时候看这页

- 你在字段默认值、规则表达式或模板表达式里写 `${...}`
- 你想确认表达式里能直接取当前用户、组织或编码生成器
- 你需要区分“表达式上下文”和“脚本上下文”的边界

如果你写的是完整脚本，而不是单个表达式，请优先看 [脚本上下文](../script-context/)。

## 常见入口

- 当前用户与认证信息：看 `AuthenticationHolder`
- 当前组织信息：看 `OrganizationHolder`
- 日期与类型转换：看 `Dates`、`Converter`
- 编码生成：看 `codeGen`

## AuthenticationHolder

请参照 [脚本上下文](../script-context) 中的 `AuthenticationHolder` 章节。

## OrganizationHolder

请参照 [脚本上下文](../script-context) 中的 `OrganizationHolder` 章节。

## Dates

日期相关工具方法，请参考 [Dates 工具类](../java-api/util/dates)。

## Converter

类型转换相关工具方法，请参照 [Converter 工具类](../java-api/util/converter)。

## codeGen

| 方法                                                                           | 返回值类型 | 说明             |
| ------------------------------------------------------------------------------ | ---------- | ---------------- |
| [get(String codeTemplate)](#getstring-codetemplate)                            | String?    | 获取下一个编码值 |
| [get(String codeTemplate, Map context)](#getstring-codetemplate-map-context)   | String?    | 获取下一个编码值 |
| [peek(String codeTemplate)](#peekstring-codetemplate)                          | String?    | 预览下一个编码值 |
| [peek(String codeTemplate, Map context)](#peekstring-codetemplate-map-context) | String?    | 预览下一个编码值 |

### get(String codeTemplate)

获取下一个编码值，并递增序列号。

**参数说明**

| 参数名       | 类型   | 说明     |
| ------------ | ------ | -------- |
| codeTemplate | String | 编码模板 |

例子： `PREFIX-{yyyyMMdd}-<0001>` 会输出 `PREFIX-20240416-0001`

编码模板说明：

- `{yyyyMMdd}` 表示年月日(Java 中 [DateTimeFormatter](https://docs.oracle.com/javase/8/docs/api/java/time/format/DateTimeFormatter.html#patterns) 的格式化字符串)；
- 支持嵌入SpEL表达式，表达式以$\{}包裹，当传入上下文的时候，在表达式中可以引用上下文中的字段；
- `<0001>`; 表示4位序列号，以1开始，默认步长为1；
- 若要指定步长，使用 `<0001,2>` 表示以1开始，步长为2；
- 序列号默认以模板中其他部件为序列器名进行递增生成；
- 支持指定序列器名 `<序列器名:0001>`；
- 支持通过表达式获取序列器名：`<${表达式}:0001>`。

### get(String codeTemplate, Map context)

获取下一个编码值，并递增序列号，同时传入表达式上下文。

**参数说明**
| 参数名 | 类型 | 说明 |
| ------------ | ------ | ------------ |
| codeTemplate | String | 编码模板 |
| context | Map | 表达式上下文 |

当在字段的默认值中使用编码生成器时，当前记录可以通过 $record 变量访问，例如：

```javascript
codeGen.get('PREFIX-{yyyyMMdd}-<0001>', $record)
```

### peek(String codeTemplate)

预览下一个编码值，不递增序列号。

### peek(String codeTemplate, Map context)

预览下一个编码值，不递增序列号，同时传入表达式上下文。

## 下一步看哪里

- 想看脚本环境的完整对象集合：看 [脚本上下文](../script-context/)
- 想看 Java 接口定义：看 [Java API](../java-api/)
- 想理解这些对象背后的模型：看 [核心概念](../../../concepts/)
