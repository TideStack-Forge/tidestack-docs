---
title: 文件上传存储扩展
---

# 文件上传存储扩展

文件上传存储扩展为不同介质提供一致的上传、读取、临时文件和分片能力。先区分存储实现与路径、名称、访问 URL 策略，两类变化使用不同接口。

## 当前接入条件

`UploadStorageService` 提供存储契约，但当前默认 `UploadController` 内部直接创建 `FileSystemUploadStorageService`，下载控制器也使用文件系统实现。仅新增一个同接口 Bean 或 SPI 文件，不会替换默认 `/api/upload` 与下载链路。

因此，已有应用支持的路径、文件名和 URL 策略可以按下一节直接扩展；增加新的存储介质时，应先确认目标版本是否已有正式的存储选择机制。当前实现尚需在平台主装配位置完善选择，并将上传、下载、临时转正式等调用统一接入后，才能作为默认端点的存储插件使用。本教程不将该能力描述为安装 JAR 即可切换。

## 1. 只调整命名、路径或访问 URL

| 变化 | 构建器 |
| --- | --- |
| 正式文件名 | `StorageFileNameGeneratorBuilder` |
| 存储路径 | `StorageFilePathGeneratorBuilder` |
| 对外访问地址 | `FileAccessUrlGeneratorBuilder` |

接口位于 `com.ouroboros.upload.generator`。实现 `support(strategyName)` 与 `build()`，并在对应 `META-INF/services/接口全限定名` 中注册构建器。应用选择该策略后，现有控制器通过正式 Builder 发现实现。

名称、路径生成器处理业务上下文与原始文件名，需防止路径越界。URL 生成器不应把服务器本地绝对路径直接返回给调用方。

## 2. 实现新存储介质

`com.ouroboros.upload.UploadStorageService` 的能力包括：

| 操作 | 契约重点 |
| --- | --- |
| `addFile`、`getFileContent`、`deleteFile` | 正式文件的路径、流及失败语义 |
| `addTempFile`、`getTempFileContent`、`deleteTempFile` | 临时标识、有效期和清理 |
| `permanentlyTempFile` | 临时文件转正式文件 |
| 分片 start、add、finish、abort | 会话、分片校验、合并与取消，区分临时和正式文件 |

按接口返回的 `Either` 保留失败，不将存储失败伪装为成功地址。明确流关闭责任、临时清理、重复合并与文件不存在行为。现有文件系统实现可作为契约参照。

## 3. 验证完整链路

存储实现测试要覆盖上传后下载、临时转正式、分片乱序与重复、取消、清理、删除、路径越界和介质不可用。完成主装配后，必须通过实际上传和下载端点验证，不能仅从测试代码直接调用新实现就认定平台已切换。

交付时列明目标版本支持的装配方式与尚需完成的主链路改动，业务文件字段继续使用平台的文件类型和引用语义。
