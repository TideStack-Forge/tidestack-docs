# DataModelCenter

按模型名称获取已加载的 [DataModel](../data-model/)。Java 导入 `com.ouroboros.data.model.DataModelCenter`；脚本中直接使用同名全局对象。

## 方法

| Java 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `getDataModel(String name)` | `Optional<DataModel>` | 未加载或名称不存在时为空 |
| `getDataModelMap()` | `Map<String, DataModel>` | 只读模型映射；模型可以有多个名称入口 |
| `hasSnapshot()` | `boolean` | 是否已建立模型快照 |
| `refresh()` | `void` | 刷新模型映射，由模型加载流程使用 |

名称支持 `crm.Order` 和 `main:crm.Order` 两种形式。后者的 `main` 是数据站名，适合区分来自不同数据站的同名模型。名称查找不区分大小写。

## Java 示例

```java
import java.util.Map;
import com.ouroboros.data.model.DataModelCenter;

var orders = DataModelCenter.getDataModel("main:crm.Order")
    .orElseThrow(() -> new IllegalStateException("未找到订单模型"));
var rows = orders.query(Map.of("where", Map.of("status", "OPEN"))).get();
```

模型名称和字段须在当前应用中存在。业务请求直接获取模型即可，无需每次调用 `refresh()`。

## 脚本示例

脚本提供 `get(String name)`，返回 `DataModel` 或 `null`，与 Java 的 `Optional` 返回形式不同。

```groovy
def orders = DataModelCenter.get('main:crm.Order')
if (orders == null) {
    Exceptions.business('未找到订单模型')
}
orders.query([where: [status: 'OPEN'], limit: 20]).get()
```

已知 Java 模型类时，见 [TypedDataModelCenter](../typed-data-model-center/)。
