# Paths

`Paths` 提供统一的文件路径和 URL 路径构造能力，适合在后端代码里做跨平台路径拼装和标准化。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

## 先理解它的结构

`Paths` 本身是抽象父类，实际使用时主要看两个内部类型：

- `Paths.File`
- `Paths.Url`

它们都会做基础的路径拼接和重复分隔符标准化。

不过要注意，这组工具不是 `java.nio.file.Paths` 的简单替代品，它更偏“字符串标准化 + 平台统一路径拼装”。

## Paths.File

### 创建方式

```java
var filePath = Paths.File.of("workspace", "app", "config.yml");
```

### 常用方法

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `toFile()` | `java.io.File` | 转成 JDK `File` |
| `getPath()` | `String` | 获取完整路径 |
| `getParent()` | `String` | 获取父路径 |
| `getName()` | `String` | 获取文件名 |
| `getSuffix()` | `String` | 获取扩展名（小写） |
| `exists()` | `boolean` | 是否存在 |
| `isFile()` | `boolean` | 是否为文件 |
| `isDirectory()` | `boolean` | 是否为目录 |

### 一个容易忽略的细节

当前实现里，`Paths.File.of(...)` 会从系统分隔符根开始拼，也就是更接近：

- Unix / macOS: `/workspace/app/config.yml`
- Windows: `\\workspace\\app\\config.yml` 或当前盘符根路径下的等价路径

它不是“保留相对路径”的简单字符串拼接工具。如果你需要严格的相对路径语义，要先确认这是否符合你的预期。

## Paths.Url

### 创建方式

```java
var url = Paths.Url.of("https://example.com", "api", "v1", "users");
```

### 常用方法

| 方法 | 返回值类型 | 说明 |
| ---- | ---------- | ---- |
| `toUrl()` | `URL` | 转成 JDK `URL` |
| `toString()` | `String` | 获取标准化后的 URL 字符串 |

当前实现会尽量保留：

- 协议头，例如 `https://`
- 末尾的 `/`

例如：

```java
Paths.Url.of("https://example.com/", "/api/", "v1/", "users/")
```

最终会标准化成类似：

```text
https://example.com/api/v1/users/
```

## 使用提醒

- `Paths.File` 会标准化连续分隔符，并去掉多余尾分隔符。
- `Paths.Url` 会保留协议头和最后一个非空段的尾 `/`。
- `getSuffix()` 只是按最后一个 `.` 取后缀并转小写，不会做更复杂的 MIME 或多重扩展名判断。

## 使用建议

- 拼文件路径时优先用 `Paths.File`
- 拼 URL 时优先用 `Paths.Url`
- 需要兼容不同平台分隔符时，这组工具会比手写字符串拼接更稳

## 下一步看哪里

- 想看 SPI 与资源加载工具：看 [SPI](../spi/)
