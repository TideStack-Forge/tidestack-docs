# PluginDescriptor

`com.ouroboros.data.model.PluginDescriptor` 声明插件名称和配置。用于模型的 `pluginDescriptors` 或 `DataModel.withPlugins(...)`；名称必须对应当前应用中已注册的模型插件。

## 构造和属性

| 接口 | 说明 |
| --- | --- |
| `new PluginDescriptor()` | 创建空声明，再设置名称和参数 |
| `new PluginDescriptor(String name)` | 使用插件名称创建 |
| `new PluginDescriptor(String name, Map<String, Object> config)` | 使用名称和配置创建 |
| `getName()` / `setName(String name)` | 插件名称 |
| `getConfig()` / `setConfig(Map<String, Object> config)` | 插件配置；未设置时 getter 返回空 Map |
| `deepCopy()` | 复制声明及配置 |

配置字段由对应插件定义，没有适用于所有插件的通用 `field` 或 `enabled` 参数。

## Java 示例

以下辅助方法适合扩展代码按已知插件名称追加行为。`pluginName` 和 `config` 由该扩展支持的插件契约决定：

```java
import java.util.Map;
import com.ouroboros.data.model.DataModel;
import com.ouroboros.data.model.PluginDescriptor;

DataModel withPlugin(DataModel model, String pluginName, Map<String, Object> config) {
    var descriptor = new PluginDescriptor(pluginName, config);
    return model.withPlugins(descriptor);
}
```

使用返回的模型对象执行后续操作。插件声明不包含插件实现，也不会安装扩展包；插件须先在目标环境中可用。

## 复制声明

`deepCopy()` 复制名称和配置，适合在扩展中生成独立配置。修改原声明或副本都不会安装插件实现。

移除插件可能改变权限、校验和删除行为，使用 `withoutPlugins(...)` 前应确认影响。模型定义中的使用位置见 [DataModelMeta](../data-model-meta/)。
