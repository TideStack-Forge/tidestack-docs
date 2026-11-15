---
title: 内嵌基座调试
sidebar_position: 3
---

# 内嵌基座调试

内嵌基座由应用自己的 Spring Boot 启动模块装配业务与基座依赖。IDE 直接启动这个进程，业务代码和基座能力在同一个 JVM 中运行，可以从启动阶段开始跟踪。工程搭建见 [内嵌基座模式](./project-modes/embedded-runtime)。

## 1. 准备启动模块与资源

先导入 Maven 工程，统一 BOM 与基座模块版本，确认启动模块包含业务模块和本次需要的运行依赖。模块自带元数据应已复制到 `target/classes/META-INF/ouroboros/metadata/`；应用目录中的模型与定制资源，则由 `ouroboros.metadata.path` 指定。

在私有的 `config/application-local.yml` 中配置本机环境，例如：

```yaml
server:
  port: 18888

spring:
  datasource:
    url: ${LOCAL_DB_URL}
    username: ${LOCAL_DB_USERNAME}
    password: ${LOCAL_DB_PASSWORD}

ouroboros:
  metadata:
    path: ${APP_METADATA_HOME}
```

`APP_METADATA_HOME` 指向本地应用元数据目录。数据库驱动、连接池、上传目录及其他能力的配置沿用工程已有设置；运行进程使用本机地址访问服务，不使用容器内部的地址。

## 2. 创建本地 Debug 配置

在 IDEA 中为工程实际的启动类创建 **Application** 或 **Spring Boot** 运行配置：

| 配置项 | 示例或要求 |
| --- | --- |
| Main class | 启动模块已有的 `MyApplication` |
| JRE | 与工程一致，当前主线使用 Java 21 |
| Use classpath of module | 启动模块，包含业务模块及基座运行依赖 |
| Working directory | 工程根目录 |
| Program arguments | `--spring.profiles.active=local --spring.config.additional-location=optional:file:./config/` |
| Environment variables | `APP_METADATA_HOME`、`LOCAL_DB_URL`、`LOCAL_DB_USERNAME`、`LOCAL_DB_PASSWORD` 的本机值 |

把可共享的运行配置与本机凭据分开保存。若使用 **Spring Boot** 配置的 Active profiles 字段，填写 `local` 即可，无需在参数中重复指定。

先设置断点，再用 **Debug** 启动。这里由 IDE 管理调试连接，无需上传 JAR、创建平台测试实例或额外配置远程 JDWP 端口。修改业务模块后重新编译并重启本地应用，确保资源和类来自本次构建。

标准基座扩展工程也可以在 `src/test/java` 中提供测试启动类，用测试 classpath 装配基座后本地调试。这个入口用于开发验证，正式交付仍是普通扩展 JAR；容器装配与依赖兼容性继续到标准基座中检查。

## 3. 连接前端并触发业务

应用在 `18888` 端口启动后，将前端基座代理到该后端。已有前端环境时修改它的后端目标；使用配套联调工具时，可以从潮汐栈源码根目录执行：

```bash
bash skills/tidestack-local-debugging/scripts/start_tidestack_web.sh \
  --backend-port 18888 \
  --listen-port 18080 \
  --container-name myapp-web-debug \
  --image "$TIDESTACK_WEB_IMAGE"
```

`TIDESTACK_WEB_IMAGE` 使用与后端配套的前端基座镜像。浏览器访问 `http://127.0.0.1:18080/`，登录后从真实菜单触发业务，检查断点、响应和数据变化。需要同时调试微前端或前端基座源码时，继续使用 [前端联调工具](./development-tools#前端联调工具)。

## 常见问题

### 应用启动了，为什么没有命中业务代码中的断点？

确认使用 IDE 的 Debug 启动了正确的启动类，前端代理和接口客户端指向这个进程的端口。再核对启动模块的 classpath、业务模块的编译结果，以及请求实际执行的分支。

### IDE 中可以运行，打包后却缺少类或模型？

检查启动模块是否声明了所需运行依赖，以及业务 JAR 中是否包含自动配置、SPI 和 `META-INF/ouroboros/metadata/` 资源。IDE 的编译输出和测试依赖可能掩盖正式包中的缺项，打包后还要按正式启动方式验证。排查方式见 [开发实践](./development-practices)。

## 验证调试结果

修改完成后重新编译并启动应用，取消断点暂停，重跑原问题、相邻正常场景及权限用例。随后使用正式运行包检查启动、模型发现与核心业务，记录本次依赖、元数据和前端版本。交接要求见 [任务协作与交付验收](./high-low-code-collaboration)。
