# Paths

拼接和标准化文件路径、URL 字符串。Java 导入 `com.ouroboros.util.Paths`。

## Paths.File

```java
import com.ouroboros.util.Paths;

var path = Paths.File.of("workspace", "app", "config.json");
String name = path.getName(); // config.json
String suffix = path.getSuffix(); // json
boolean exists = path.exists();
```

| 方法 | 返回值 |
| --- | --- |
| `Paths.File.of(String... segments)` | `Paths.File` |
| `getPath()` / `getParent()` / `getName()` | 路径、父路径和文件名 |
| `getSuffix()` | 小写扩展名 |
| `toFile()` | `java.io.File` |
| `exists()` / `isFile()` / `isDirectory()` | 文件状态 |

文件路径从系统根分隔符开始拼接，例如 Unix 上得到 `/workspace/app/config.json`。需要相对于工作目录解析时，使用 `java.nio.file.Path.of(...)`；不要假定这两个 API 的相对路径语义相同。

## Paths.Url

```java
var url = Paths.Url.of("https://example.com/", "/api/", "orders/");
String text = url.toString(); // https://example.com/api/orders/
var javaUrl = url.toUrl();
```

`of(String... segments)` 合并路径段、移除重复分隔符，并保留协议头和末段的尾 `/`。`toUrl()` 返回 `java.net.URL`，格式不合法时抛出 `UncheckedIOException`。

路径拼接不执行文件读写，也不负责 URL 参数编码。查询参数和不可信路径段应按调用目标的要求单独编码或校验。
