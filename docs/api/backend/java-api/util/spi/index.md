# SPI

按 Java 服务注册文件加载扩展实现，Java 导入 `com.ouroboros.util.SPI`。扩展包应按目标扩展点的约定注册服务。

## 方法

| 方法 | 返回值 / 顺序 |
| --- | --- |
| `getServiceStream(Class<T>)` | 实例流，原始加载顺序 |
| `getSortedServiceStream(Class<T>)` | 按 `@Priority` 数值升序 |
| `getReversedServiceStream(Class<T>)` | 按 `@Priority` 数值降序 |
| `getPrimaryService(Class<T>)` | 数值最高的实现；没有时为 `null` |
| 对应的 `getCached*` 方法 | 复用进程内已加载的实例 |

无 `jakarta.annotation.Priority` 时按 `0` 处理。实例流方法还支持额外传入一到三个 `Class` 参数，用于按泛型类型筛选实现。

## 注册示例

以脚本上下文扩展为例：

```java
package com.example.orders;

import java.util.Map;
import com.ouroboros.script.ScriptContextContributor;

public class OrderScriptContext implements ScriptContextContributor {
    @Override
    public Map<String, Object> getBindings() {
        return Map.of("OrderConstants", Map.of("openStatus", "OPEN"));
    }
}
```

在扩展包中创建 `META-INF/services/com.ouroboros.script.ScriptContextContributor`：

```text
com.example.orders.OrderScriptContext
```

平台会通过对应扩展点加载已注册的服务。完整打包方式见 [扩展脚本](../../../../../guide/advance/extend-backend/extend-script/)。

## 读取扩展

```java
import com.ouroboros.script.ScriptContextContributor;
import com.ouroboros.util.SPI;

var contributors = SPI.getCachedSortedServiceStream(ScriptContextContributor.class)
    .toList();
```

缓存没有通用失效入口，不应依赖安装新包后自动热刷新。普通业务调用通常直接使用平台已装配好的能力，无需自行再次扫描服务。
