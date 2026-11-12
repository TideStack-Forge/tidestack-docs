---
title: 新增脚本语言支持
---

# 新增脚本语言支持

已有语言的公共对象使用 [脚本上下文扩展](../../../guide/advance/extend-backend/extend-script/)。需要让平台识别另一种语言时，才实现执行与编译接口。

## 1. 确定语言与执行契约

约定唯一语言名、依赖引擎版本、脚本输入 bindings、返回值、异常、资源释放和并发模型。平台已有 `js`、`javascript`、`groovy`；仅增加一个工具对象不需要新增语言。

## 2. 实现两个接口

```java
public interface ScriptRunner {
  String getLanguage();
  Try<Object> execute(String script, Map<String, Object> bindings);
}

public interface ScriptCompiler {
  String getLanguage();
  Function<Map<String, Object>, Try<Object>> compile(String script);
}
```

接口位于 `com.ouroboros.script`，`Try` 来自 Vavr。这是接口契约摘录。执行器将 bindings 按引擎要求注入；编译器返回可接受本次 bindings 的执行函数。不要把某次用户的数据保存在全局编译对象中。

分别处理语法错误、运行错误和宿主对象调用失败，保留原因。线程不安全的引擎实例按其生命周期隔离；脚本执行权限和可访问对象遵守目标宿主约定，不能假定新增引擎天然提供沙箱。

## 3. 注册语言实现

在 JAR 中提供以下 SPI 文件，每个文件写入相应实现的全限定类名：

```text
META-INF/services/com.ouroboros.script.ScriptRunner
META-INF/services/com.ouroboros.script.ScriptCompiler
```

两者的 `getLanguage()` 返回相同稳定名称。平台 `Scripts.execute()`、`Scripts.compile()` 按 language 路由。需要编辑器显示新选项时，还应更新对应宿主的语言选项，不能只验证底层可执行。

## 验证

在目标脚本宿主分别直接执行与编译后执行，比较正常输入、空值及异常结果。并发调用和重复编译时检查上下文隔离、资源释放和缓存。验证 SPI 已打包、语言名正确、宿主可选且业务结果一致，再交付依赖、示例和兼容版本。
