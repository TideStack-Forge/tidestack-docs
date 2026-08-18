# JsonSchemas

`JsonSchemas` 提供 JSON Schema 校验能力，适合在运行时对弱结构数据做格式验证。

后端运行时 JSON Schema 校验统一走这个工具类。底层标准库选型为 `com.networknt:json-schema-validator`，调用方不应直接依赖或使用 `fge/java-json-tools`、`jsonschemafriend`、`everit` 等平行校验库。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 什么时候看这页

- 你已经有 JSON Schema，想校验表单、配置或透传对象
- 你想把校验器预先构建好再反复使用
- 你需要拿到 `Try<Void>` 形式的校验结果
- 你需要保留结构化的校验失败信息

## 方法总览

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `validate(Map<String, Object> jsonSchema, Object data)` | `Boolean` | 直接校验 |
| `validate(String jsonSchema, Object data)` | `Boolean` | 直接校验 |
| `validateResult(Map<String, Object> jsonSchema, Object data)` | `JsonSchemaValidationResult` | 返回结构化结果 |
| `validateResult(String jsonSchema, Object data)` | `JsonSchemaValidationResult` | 返回结构化结果 |
| `buildValidator(Map<String, Object> jsonSchema)` | `Function<Object, Boolean>` | 预构建布尔校验器 |
| `buildValidator(String jsonSchema)` | `Function<Object, Boolean>` | 预构建布尔校验器 |
| `buildValidatorTry(Map<String, Object> jsonSchema)` | `Function<Object, Try<Void>>?` | 预构建 `Try` 校验器 |
| `buildValidatorTry(String jsonSchema)` | `Function<Object, Try<Void>>?` | 预构建 `Try` 校验器 |

## 常见使用方式

### 直接校验

适合“一次性判断过不过”的场景。

```java
boolean ok = JsonSchemas.validate(schemaMap, payload);
```

### 结构化错误结果

适合需要把失败原因继续往上抛或者记录日志的场景。

```java
JsonSchemaValidationResult result = JsonSchemas.validateResult(schemaMap, payload);
if (!result.isValid()) {
  throw new IllegalArgumentException(result.toMessageString());
}
```

### 预构建校验器

适合同一个 Schema 会被重复使用的场景，例如：

- 多条记录批量校验
- 某个字段模板参数反复校验
- 某个接口统一验透传对象

```java
Function<Object, Boolean> validator = JsonSchemas.buildValidator(schemaMap);
boolean ok = validator.apply(payload);
```

## 使用建议

- 只想知道“过没过”时，用 `validate(...)`
- 需要错误详情时，用 `validateResult(...)`
- 同一个 Schema 会反复使用时，先 `buildValidator(...)`
- 想保留失败异常时，用 `buildValidatorTry(...)`
- 新增业务模块需要 JSON Schema 校验时，只依赖 `com.ouroboros:ouroboros-util`，不要在模块 POM 中直接新增 JSON Schema 校验库依赖。
- Spring AI 传递引入的 `victools` 属于 Java 类型生成 schema 的链路，不作为本项目业务运行时校验入口。

## 一个细节

当前实现里，`buildValidatorTry(...)` 在 Schema 自身加载失败时会直接返回 `null`，不是返回一个失败的函数。这一点在使用时要额外判空。

## 使用提醒

- `validate(...)` 更适合布尔判断，不适合保留详细失败原因。
- `validateResult(...)` 会保留关键字、实例路径和原始错误消息。
- 需要与 `Try` 风格代码保持一致时，优先考虑 `buildValidatorTry(...)`。
- `buildValidator(...)` 在 Schema 本身非法时会返回一个始终校验失败的函数；`buildValidatorTry(...)` 则会直接返回 `null`。
- 推荐显式声明 `$schema` 为 Draft 2020-12；如果缺失，当前实现会为了兼容历史 schema 而回退到 Draft 7。

## 下一步看哪里

- 想看 JSON 解析：看 [Json](../json/)
