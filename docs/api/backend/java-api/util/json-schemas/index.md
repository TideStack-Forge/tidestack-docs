# JsonSchemas

在 Java 扩展中校验 JSON 数据，导入 `com.ouroboros.util.JsonSchemas`。Schema 可以是 Map 或 JSON 字符串；建议显式声明 Draft 2020-12。

## 方法

| 方法 | 返回值 | 用途 |
| --- | --- | --- |
| `validate(schema, data)` | `Boolean` | 只判断是否通过 |
| `validateResult(schema, data)` | `JsonSchemaValidationResult` | 获取结构化错误 |
| `buildValidator(schema)` | `Function<Object, Boolean>` | 编译一次，重复校验 |
| `buildValidatorTry(schema)` | `Function<Object, Try<Void>>?` | 以 `Try` 表达校验结果 |
| `isValidSchema(Map<String, Object> schema)` | `boolean` | 检查 Schema 本身 |

## 校验示例

```java
import java.util.Map;
import com.ouroboros.util.JsonSchemas;

String schema = """
    {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "type": "object",
      "properties": {"amount": {"type": "number", "exclusiveMinimum": 0}},
      "required": ["amount"]
    }
    """;
var result = JsonSchemas.validateResult(schema, Map.of("amount", -1));
if (!result.isValid()) {
    throw new IllegalArgumentException(result.toMessageString());
}
```

错误结果包含关键字、实例路径和错误消息。业务代码可以把错误转换为应用使用的校验异常。

## 重复校验与失败行为

```java
var validator = JsonSchemas.buildValidator(schema);
boolean valid = validator.apply(Map.of("amount", 100)); // true
```

Schema 自身加载失败时，`buildValidator` 返回始终为 `false` 的函数；`buildValidatorTry` 返回 `null`，调用前必须判空。未声明 `$schema` 时按 Draft 7 处理。

校验不会自动填入 `default`，也不会校验跨资源引用或业务权限。平台元数据 Schema 的下载、说明字段和使用示例见 [JSON Schema](../../../../../reference/jsonschema/)。
