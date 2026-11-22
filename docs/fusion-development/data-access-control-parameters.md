---
title: 数据权限参数的定义与使用
---

# 数据权限参数的定义与使用

数据权限参数用来描述一个权限项允许访问哪些记录和字段。例如，角色拥有“查询订单”权限后，还可以被限制为只查看指定区域的订单，并隐藏部分字段。权限定义描述可配置的范围，角色授权保存具体选择，运行时再把选择解析成数据约束。

按字段等值、按多个值筛选、按金额上下限比较，都可以直接使用默认解析器。只有需要把“本部门”“负责区域”等业务含义换算成查询条件时，才需要相应的业务参数解析器。下面先用普通字段完成一次配置，再介绍如何扩展参数和授权界面。用户、主体与接口授权的整体关系见 [权限与访问控制](./authority-subject-and-access-control-design)。

## 数据权限怎样生效

![数据权限参数从权限定义、角色授权到数据操作生效的过程](../.assets/diagrams/fusion-development/data-access-control-flow.svg)

权限定义决定授权界面能配置什么；管理员为角色保存的参数决定该角色的具体范围。执行数据操作时，后端解析这些参数，合并角色授予的范围，再与当前执行身份的授权边界求交，得到最终的行、字段约束。数据模型的 `AccessControl` 插件负责在查询和写入中执行约束。

| 对象 | 表达什么 | 放在哪里 |
| --- | --- | --- |
| `AccessControlDefine` | 此权限能配置哪些字段、哪些行范围参数 | `Authority.getAccessControlDefine()` |
| 角色的 `accessControlParams` | 管理员为此角色选择的具体值 | 角色与权限的授权记录 |
| `AccessControlParams` | 当前执行身份最终允许的字段和行范围 | 统一授权求值的结果 |

定义中出现“区域”，只说明这个权限支持按区域授权，不会自动给角色选择区域，也不等于查询已受限制。相同定义可以用于不同角色，各角色保存自己的参数值。

## 用字段和值直接配置数据范围

假设订单数据模型有 `regionCode`（区域）和 `amount`（金额）两个字段，希望某个角色只能查询区域 A、金额不低于 100 的订单。这种规则直接描述字段条件，使用平台内置的 `DefaultACFilterBuilder` 即可，无需实现 Java 解析器。

### 声明字段参数和授权控件

在查询权限的 `accessControlDefine.filterDefine` 中声明两个参数。参数名与数据模型字段名一致，`settingSchema` 提供角色授权时使用的控件。自定义权限可以随扩展提供以下 `src/main/metadata/sales/order-search.authority.json`：

```json
{
  "fullName": "sales.Order.search",
  "title": "查询订单",
  "apis": ["GET /api/sales/orders"],
  "accessControlDefine": {
    "filterDefine": [
      {
        "name": "regionCode",
        "label": "区域",
        "dataType": "String",
        "settingSchema": [
          {
            "type": "select",
            "name": "accessControlParams.regionCode",
            "label": "区域",
            "required": true,
            "options": [
              {"label": "区域 A", "value": "A"},
              {"label": "区域 B", "value": "B"}
            ]
          }
        ]
      },
      {
        "name": "amount",
        "label": "金额下限",
        "dataType": "Decimal",
        "settingSchema": [
          {
            "type": "input-number",
            "name": "accessControlParams.amount.$gte",
            "label": "最低金额",
            "required": true,
            "min": 0
          }
        ]
      }
    ]
  }
}
```

这里有两处名称需要对应：`filterDefine.name` 使用字段名 `amount`，控件的 `name` 使用 `accessControlParams.amount.$gte`，将输入值保存到金额的“大于等于”条件中。内嵌 Schema 由已有界面生成器读取，也不需要新增 Java 界面插件。

权限全名和接口路径应替换为实际值。如果业务模型已经投射出同名权限，应通过现有定义与扩展链补充参数，避免重复定义。执行查询的数据模型还必须绑定此权限：业务模型沿用相应操作的访问控制配置，独立数据模型则在 `AccessControl` 插件中将 `readAuthority` 设为 `sales.Order.search`。

### 为角色设置区域和金额下限

1. 加载权限定义后，打开角色授权界面，选择“查询订单”权限。
2. 将“区域”设为“区域 A”，“最低金额”填为 `100`，保存角色。
3. 重新打开该授权项，确认两项配置能够回显。

该授权记录保存的 `accessControlParams` 为：

```json
{
  "regionCode": "A",
  "amount": {"$gte": 100}
}
```

默认解析器将已声明的普通字段参数原样作为查询条件。上面的两个字段按 AND 合并，含义是：

```text
regionCode = 'A' AND amount >= 100
```

业务查询自身的筛选条件会继续与这个范围取交集。例如，准备 A 区域金额 80、A 区域金额 150、B 区域金额 200 三条订单，仅持有这项授权的身份应只能查到第二条。验证时使用没有其他更大范围授权的角色和身份，避免其他角色的授予扩大可见范围。

### 等值、集合和比较条件

普通字段参数采用数据查询 DSL 的条件格式：

| 保存的参数 | 条件含义 |
| --- | --- |
| `{"regionCode": "A"}` | 区域等于 A |
| `{"regionCode": ["A", "B"]}` | 区域属于 A 或 B |
| `{"amount": {"$gt": 100}}` | 金额大于 100 |
| `{"amount": {"$gte": 100, "$lte": 1000}}` | 金额在 100 到 1000 之间，包含两端 |

若将区域控件改为多选，需要设置 `multiple: true`、`extractValue: true` 和 `joinValues: false`，让它保存数组。需要金额上限时，再增加一个名称为 `accessControlParams.amount.$lte` 的数值控件。更多条件写法见 [数据查询 DSL](../api/backend/data-query-dsl/) 中的 WHERE 条件说明。

**字段值里的 `$gte`、`$lte` 是比较符，不是自定义权限参数。** 默认解析器只跳过顶层以 `$` 开头的参数名：`amount` 会被接收，里面的比较条件交给查询 DSL 处理；后文的 `$regionScope` 则需要专门的解析器。

默认机制只接收 `filterDefine` 中已声明的普通字段，不能在角色参数中随意添加字段，也不能把 `$or` 等逻辑符直接放到参数顶层。未被任何解析器消费的参数会导致授权失败。它也不会根据字段名自动生成控件，仍需上面的 `settingSchema` 或相应的界面生成器。

## 扩展业务范围参数

当规则需要从组织关系、当前身份或外部服务计算实际数据范围时，可以定义 `$regionScope` 这样的业务参数，再将它转换为模型字段条件。新增规则需要让权限定义、授权控件和解析器使用同一个参数名。已有的部门、员工等规则优先复用平台提供的实现。

编译下面的扩展需要 `ouroboros-web-security-core` 和 `ouroboros-ui-model-schema`，版本与目标基座配套。标准基座已提供的库使用 `provided`；内嵌应用则需实际装配安全运行时，以及提供角色授权界面的 RBAC 管理模块。下面的示例与前面的普通字段示例是两种配置方式，按实际需要选择。

### 1. 在权限中声明参数

已有业务模型可以在各操作的访问控制配置中启用字段控制和内置范围。模型会将相应能力投射到查询、新建、编辑或删除权限。自定义权限则可以随扩展 JAR 提供 `.authority.json`，或通过 `AuthorityProvider` 提供 `Authority` 对象。

下面是随扩展提供的 `src/main/metadata/sales/order-search.authority.json` 示例。使用前应替换为实际权限名和接口路径：

```json
{
  "fullName": "sales.Order.search",
  "title": "查询订单",
  "apis": ["GET /api/sales/orders"],
  "accessControlDefine": {
    "canControlFields": true,
    "commonFields": [
      {"name": "id", "label": "标识", "type": "String"}
    ],
    "controlledFields": [
      {"name": "regionCode", "label": "区域", "type": "String"},
      {"name": "amount", "label": "金额", "type": "Decimal"}
    ],
    "filterDefine": [
      {
        "name": "$regionScope",
        "label": "可访问区域",
        "description": "只允许访问所选区域内的记录",
        "dataType": "String",
        "settingSchema": [
          {
            "type": "select",
            "name": "accessControlParams.$regionScope",
            "label": "可访问区域",
            "multiple": true,
            "extractValue": true,
            "joinValues": false,
            "options": [
              {"label": "区域 A", "value": "A"},
              {"label": "区域 B", "value": "B"}
            ]
          }
        ]
      }
    ]
  }
}
```

示例假定受控数据模型确实存在 `id`、`regionCode` 和 `amount`。如果已有业务模型投射出同名权限，应在其现有定义与扩展链中补充能力，避免再定义一份不一致的字段或接口契约。

#### 字段控制定义

| 属性 | 含义 |
| --- | --- |
| `canControlFields` | 是否向授权界面提供字段选择 |
| `commonFields` | 角色字段选择时始终纳入的公共字段 |
| `controlledFields` | 可由管理员选择的受控字段 |
| `fieldSelectionRequired` | 是否要求显式字段选择；需要这一规则的权限须明确声明 |

字段条目中的 `name` 必须对应模型字段名，`label` 用于显示，`type` 和 `description` 描述字段类型与用途。`commonFields` 不会在最终授权边界求交后重新补回已被边界排除的字段。

#### 行范围参数定义

`AccessControlFilterDefine` 描述一项行范围参数：

| 属性 | 含义 |
| --- | --- |
| `name` | 参数标识，必须与授权表单保存的键及解析器处理的键一致 |
| `label`、`description` | 授权时显示的名称与说明 |
| `dataType` | 参数的数据类型说明 |
| `originalFieldType`、`originalField` | 来源模型类型和字段引用，供对应界面生成器使用 |
| `settingSchema` | 直接嵌入此参数的配置控件 |
| 其他属性 | 由自定义界面生成器或解析器按约定消费的扩展属性 |

普通模型字段参数可以复用默认解析器。示例使用 `$regionScope`，表示需要专门处理的业务范围规则；默认解析器会跳过以 `$` 开头的键，因此还要注册后文的解析器。

参数定义的来源可以扩展：实现 `AuthorityProvider` 提供权限及其 `AccessControlDefine`，并登记到 `META-INF/services/com.ouroboros.security.authority.AuthorityProvider`。无需为参数另建一套注册表。

默认业务模型投影只识别已有的预设范围；在其 `filters` 中增加一个新的 `$regionScope` 键，不会自动得到上面的参数定义。新规则应通过权限定义或既有投影扩展接入，再与界面生成器、解析器配套。

### 2. 让授权界面提供配置控件

角色授权界面读取权限树上的 `accessControlSettingSchema`。平台通过 `AccessControlDefineUtils` 组装控件：先选择一个支持当前定义的 `ACSettingSchemaGenerator`，再为每个行范围参数选择一个 `ACFilterSettingSchemaGenerator`。

| 需求 | 方式 |
| --- | --- |
| 单个参数只需固定的选择框或输入框 | 在参数定义中提供 `settingSchema` |
| 多个权限共用一种参数编辑方式，或选项需要动态取得 | 实现 `ACFilterSettingSchemaGenerator` |
| 定制字段控制等权限级配置区域 | 实现 `ACSettingSchemaGenerator` |

示例中的内嵌 Schema 由现有 `EmbedFilterSettingSchemaGenerator` 读取，无需新增 Java 界面插件。控件的 `name` 以 `accessControlParams.` 开头；多选值保存为数组，不能意外保存成逗号分隔的字符串。

需要复用 Java 生成器时，可以替换内嵌 Schema。例如：

```java
package com.example.security;

import java.util.List;
import java.util.Map;
import jakarta.annotation.Priority;
import com.ouroboros.security.authority.accesscontrol.AccessControlDefine;
import com.ouroboros.security.authority.accesscontrol.AccessControlFilterDefine;
import com.ouroboros.security.authority.accesscontrol.setting.ACFilterSettingSchemaGenerator;
import com.ouroboros.uischema.schema.FormItemNode;
import com.ouroboros.uischema.schema.SchemaNode;

@Priority(1000)
public final class RegionScopeSettingSchemaGenerator implements ACFilterSettingSchemaGenerator {
    @Override
    public boolean supports(AccessControlDefine define, AccessControlFilterDefine filter) {
        return "$regionScope".equals(filter.getName());
    }

    @Override
    public List<SchemaNode> generate(AccessControlDefine define, AccessControlFilterDefine filter) {
        var item = new FormItemNode();
        item.setType("select");
        item.setName("accessControlParams.$regionScope");
        item.setLabel(filter.getLabel());
        item.setProp("multiple", true);
        item.setProp("extractValue", true);
        item.setProp("joinValues", false);
        item.setProp("options", List.of(
            Map.of("label", "区域 A", "value", "A"),
            Map.of("label", "区域 B", "value", "B")
        ));
        return List.of(item);
    }
}
```

将实现类名写入：

```text
META-INF/services/com.ouroboros.security.authority.accesscontrol.setting.ACFilterSettingSchemaGenerator
```

权限级生成器使用同包下 `ACSettingSchemaGenerator` 的 SPI 文件。当前界面生成器按 `@Priority` 从大到小选择第一个匹配者，并不会把所有匹配实现的输出叠加。示例优先级高于内嵌 Schema 生成器的 `999`；实际扩展应限定 `supports`，避免接管无关参数或替换掉其他权限所需的字段控件。

### 3. 为角色保存具体范围

将扩展安装到目标实例并加载权限后，在角色授权界面选择该权限，设置可访问区域和字段，再保存角色。随后重新打开授权项，确认表单能回显。

本例选择区域 A 和金额字段后，该授权记录的 `accessControlParams` 类似：

```json
{
  "$regionScope": ["A"],
  "$fieldControl": ["amount"]
}
```

这里存的是参数值，不重复存储整个参数定义或表单 Schema。配置界面只负责收集值，不能替代后端校验。

角色拥有权限且参数为空时，现有契约表示此权限不附加范围限制；没有被授予权限则应拒绝，两者含义不同。字段控制未显式选择字段时默认不限制；需要强制选择的权限用 `fieldSelectionRequired` 表达。示例的区域解析器则约定：参数缺席表示不增加区域限制，参数存在但数组为空表示无可访问记录。

### 4. 把参数解析为行约束

实现 `AccessControlFilterBuilder`，处理自己负责的键，并移除已消费的参数。下面的解析器将区域选择转为 `regionCode` 条件：

```java
package com.example.security;

import java.util.List;
import java.util.Map;
import com.ouroboros.security.authority.accesscontrol.AccessControlDefine;
import com.ouroboros.security.authority.accesscontrol.RowConstraint;
import com.ouroboros.security.authority.accesscontrol.filter.AccessControlFilterBuilder;
import com.ouroboros.security.exception.AuthorizationDeniedException;

public final class RegionScopeFilterBuilder implements AccessControlFilterBuilder {
    private static final String KEY = "$regionScope";

    @Override
    public RowConstraint resolve(Map<String, Object> params, AccessControlDefine define) {
        if (!params.containsKey(KEY)) {
            return RowConstraint.all();
        }
        if (define.getFilterDefine().stream().noneMatch(f -> KEY.equals(f.getName()))) {
            throw new AuthorizationDeniedException("此权限未声明区域范围参数");
        }
        Object value = params.remove(KEY);
        if (!(value instanceof List<?> values)
            || values.stream().anyMatch(v -> !(v instanceof String s) || s.isBlank())) {
            throw new AuthorizationDeniedException("区域范围必须是明确标识的数组");
        }
        return values.isEmpty() ? RowConstraint.none()
            : RowConstraint.filter(Map.of("regionCode", List.copyOf(values)));
    }

    @Override
    public Map<String, Object> build(Map<String, Object> params, AccessControlDefine define) {
        var rows = resolve(params, define);
        if (rows.mode() == RowConstraint.Mode.NONE) {
            throw new AuthorizationDeniedException("没有可访问的区域记录");
        }
        return rows.condition();
    }
}
```

将实现类名写入：

```text
META-INF/services/com.ouroboros.security.authority.accesscontrol.filter.AccessControlFilterBuilder
```

这条 SPI 链按 `@Priority` 从小到大依次调用解析器，并将同一份角色设置中的行约束按 AND 合并；它与界面生成器的选择方式不同。解析结束仍有未消费参数时会拒绝授权。实现只移除自己的键，不清空整份 Map；需要“无记录”时返回 NONE，不用空条件表达。`RowScopeResolver` 是该接口的语义别名，沿用同一条解析链。

区域值来自组织关系或其他服务时，解析器还要校验标识及其有效范围。需要当前部门或员工身份但无法取得时，应返回 NONE 或拒绝访问，不能删掉条件后退回 ALL。现有 `$byEmployee`、`$byDepartment`、`$byCompany` 优先复用组织架构模块的解析器。

## 在数据操作中落实约束

正式执行时，统一授权求值先确认权限，再合并角色授予的范围，并与当前执行身份携带的授权边界求交。多个角色对同一权限的授予通常取并集；同一角色设置中多个独立范围条件取交集。业务代码消费最终结果，不再自行遍历角色计算一份权限。

行约束有 ALL、FILTER、NONE；字段约束有 ALL、ONLY、NONE。NONE 不能转换为空 Map 后继续执行不受限查询。`getFilters()` 遇到 NONE 会拒绝访问，需要保留这种拒绝语义。

### 使用已绑定访问控制的数据模型

业务模型启用相应操作的访问控制后，会通过既有模型装饰链配置数据模型的 `AccessControl` 插件。独立数据模型使用这个插件时，按需绑定 `readAuthority`、`createAuthority`、`updateAuthority` 和 `deleteAuthority`；某个操作未绑定权限名，就不能依赖它替该操作落实控制。

插件在正式数据操作链中处理授权：读取和 count 应用行范围与字段限制；新建检查写入字段和新记录范围；更新、删除收紧目标条件，并校验写入。NONE 的读取返回空结果、count 返回 0，写入则拒绝。受控字段不能通过额外查询、排序或聚合入口绕回读取。

### 自定义 Controller、Service 或逻辑流

自定义代码仍然沿用同一套数据权限：入口确认能否执行操作，数据访问落实记录和字段范围。先检查目标数据模型是否已经绑定 `AccessControl` 插件；已绑定时，Controller、Service 和逻辑流直接调用该模型即可。多源报表、外部服务等未被模型插件覆盖的路径，则需要自行使用后端计算出的约束。

#### Controller 关联权限，Service 调用受控模型

Controller 方法用 `@Authority` 关联查询权限，例如：

```java
import org.springframework.web.bind.annotation.GetMapping;
import com.ouroboros.security.annotation.Authority;

@Authority("sales.Order.search")
@GetMapping("/api/custom/orders")
public Object searchOrders() {
    return orderQueryService.searchOpenOrders();
}
```

`orderQueryService` 是已注入的业务 Service。其查询方法可以像普通模型查询一样编写：

```java
import java.util.Map;
import com.ouroboros.data.model.DataModelCenter;
import com.ouroboros.exception.BusinessException;

var orders = DataModelCenter.getDataModel("sales.Order")
    .orElseThrow(() -> new BusinessException("订单模型尚未加载"));
return orders.query(Map.of(
    "where", Map.of("status", "OPEN"),
    "limit", 20
)).get();
```

这个写法的前提是 `sales.Order` 已配置 `AccessControl.readAuthority = sales.Order.search`。插件会把“状态为 OPEN”和当前身份的授权范围取交集，并执行字段控制。Service 不需要再次读取角色配置或重复拼接同一份数据权限条件。Controller 和 Bean 的完整注册方式见 [Controller 与 Service](./backend-development/spring-beans-and-controllers)。

`@Authority` 用于关联 HTTP 入口，不会自动给任意 Service 方法附加数据过滤。Service 被其他接口、逻辑流或后台任务调用时，也要通过受控的数据访问路径执行，不能依赖某一个 Controller 曾经做过鉴权。

#### 手工处理查询时，取得指定权限的结果

确实需要自行执行约束时，从当前认证对象取得指定权限的 `AccessControlParams`。以下代码用于已有认证对象的调用上下文：

```java
import com.ouroboros.security.context.CurrentSecurityContextHolder;
import com.ouroboros.security.exception.AuthorizationDeniedException;

var authentication = CurrentSecurityContextHolder.findAuthentication()
    .orElseThrow(() -> new AuthorizationDeniedException("当前上下文没有认证对象"));
var params = authentication.getAccessControlParams("sales.Order.search");
```

带权限名的方法会计算该权限的最终访问范围；没有授予权限、权限不存在或被执行边界排除时，会抛出授权异常。它返回的是后端授权结果，不能用客户端提交的 `accessControlParams` 代替，也不应重新遍历角色计算一份范围。

无参 `getAccessControlParams()` 使用当前入口的权限判定。可被多个入口复用的 Service、处理多个权限的逻辑流，宜明确传入权限全名；不要把“当前接口的范围”当成任意模型、任意操作都能使用的范围。

#### 将行范围与业务条件求交，再限制字段

下面展示已有 Service 方法中的手工查询片段。`orders` 是目标数据模型，`params` 来自上一步；该例限定为具有 `id`、`regionCode`、`amount`、`status` 字段的单模型读取，筛选条件固定为 `status = OPEN`：

```java
import java.util.List;
import java.util.Map;
import com.ouroboros.data.record.RecordList;
import com.ouroboros.security.authority.accesscontrol.RowConstraint;
import com.ouroboros.security.exception.AuthorizationDeniedException;

var scope = params.getRowConstraint()
    .and(RowConstraint.filter(Map.of("status", "OPEN")));
if (scope.mode() == RowConstraint.Mode.NONE) {
    return RecordList.empty();
}

var fields = params.getFieldConstraint();
if (!fields.allows("status")) {
    throw new AuthorizationDeniedException("不允许按状态查询");
}
var selected = List.of("id", "regionCode", "amount").stream()
    .filter(fields::allows)
    .toList();
if (selected.isEmpty()) {
    throw new AuthorizationDeniedException("没有可返回的订单字段");
}

return orders.query(Map.of(
    "where", scope.condition(),
    "select", selected,
    "limit", 20
)).get();
```

`RowConstraint.and(...)` 保留两个条件的完整结构。例如，权限要求 `amount >= 100`，业务筛选要求 `amount <= 1000`，最终必须同时满足。用 `putAll` 或普通 Map 覆盖合并，会丢失同一字段上的一部分条件。必须先处理 NONE，再读取 `condition()`；NONE 的条件载荷也是空 Map，单独取出会丢失“无记录”的含义。

字段控制同样要在访问数据时落实。上例从固定候选字段中选出允许字段，并检查业务筛选所用的 `status`。`FieldConstraint.allows(...)` 同时处理允许集和排除集，不能仅判断 `getAllowedFields()` 中是否包含 `*`。返回对象中额外拼入的字段、关联对象和统计值也要按各自权限处理。

这段代码只展示固定查询。开放给客户端的筛选、排序、分组、聚合和关联查询，还需要逐项检查所引用的字段与模型；仅裁剪 `select` 无法覆盖这些访问。跨模型时，各模型按自己的权限求值和执行约束，不能把订单范围不加转换地套到其他模型上。已有模型插件继续负责其原有控制，不要为复用这段示例而移除插件。

#### 在逻辑流中连接授权结果与数据节点

目标数据模型已绑定权限时，“查询数据”“分页查询数据”等节点会通过模型插件执行约束，无需再用授权节点重复拼接条件。需要手工处理的数据路径，可以使用“认证上下文”分组下的节点：

| 节点 | 输出 | 后续用途 |
| --- | --- | --- |
| 访问控制过滤器 `authFilter` | 行范围条件 Map | 与业务条件按 AND 组合，传给数据查询的 `where` |
| 允许访问字段 `authAllowedFields` | 允许字段列表，可能包含 `*` | 与业务需要的字段取交集，形成 `select` |
| 不允许访问字段 `authDisallowedFields` | 在当前约束可转换为禁止列表时返回该列表 | 补充排除字段；允许列表含 `*` 时仍须检查排除项 |

以手工组装订单查询为例：

1. 在“访问控制过滤器”节点中，将“权限名”设为 `sales.Order.search`，“结果包装key”设为 `permissionWhere`。
2. 在“允许访问字段”节点中使用同一个权限名，“结果包装key”设为 `allowedFields`。
3. 用“合并对象”节点汇集这两项包装结果和业务参数，再交给映射或脚本节点分别组装查询条件和字段列表。汇集时保留 `permissionWhere`、`allowedFields` 等不同的键；条件求交仍需显式构造 AND。需要排除字段时，再取得并应用禁止列表。
4. 把组装后的查询对象传入“查询数据”或“分页查询数据”节点。

例如，授权节点取得下列结果，业务另要求金额不超过 1000：

```json
{
  "permissionWhere": {
    "regionCode": "A",
    "amount": {"$gte": 100}
  },
  "allowedFields": ["id", "amount"]
}
```

映射或脚本节点应组装出这样的查询对象：

```json
{
  "where": {
    "AND": [
      {"amount": {"$lte": 1000}},
      {"regionCode": "A", "amount": {"$gte": 100}}
    ]
  },
  "select": ["id", "amount"],
  "limit": 20
}
```

“结果包装key”只是在输出外增加一层 Map，并不自动映射到查询参数。授权节点只输出自身结果，不保留传入的业务参数，因此需要分别连接到汇合节点。`permissionWhere` 内部的值才是权限条件；不能把整个包装对象直接当成 `where`，也不能把三个授权节点直接连到查询节点就认为完成了控制。`authFilter` 在无可访问记录时会失败，不能将这类失败替换成 `{}` 后继续查询。

允许字段为有限集合时优先使用该允许集。若授权结果缺少转换为完整禁止列表所需的字段定义，`authDisallowedFields` 可能拒绝输出；此时不能将错误改成空禁止列表。字段规则复杂时，优先让受控模型执行，或在 Java 中直接使用 `FieldConstraint`。

#### 分别处理统计、导出与写入

| 操作 | 需要落实的约束 |
| --- | --- |
| 分页、count、导出 | 使用相同的最终行范围；统计和导出涉及的字段也须允许访问，不能只限制页面列表 |
| 按 ID 读取 | 将 ID 条件与行范围求交；知道记录 ID 不代表有权读取 |
| 更新、删除 | 将目标条件与对应操作的行范围求交；更新还要检查写入字段及变更后的数据范围 |
| 新建、批量新建 | 检查写入字段，并证明每条新记录满足新建权限的范围；新建操作没有可供追加的 WHERE 条件 |

读取、新建、更新和删除可以绑定不同权限，应按实际操作取值。当前模型插件对新建记录的范围校验支持等值、IN 及其 AND / OR 组合；大小比较等条件可以用于查询，但不支持直接用于新建记录或修改受控维度时的范围证明，遇到这类写入会拒绝。前面的金额下限示例用于查询权限，不能据此推断它也适用于新建权限。

自定义写入应优先进入已有模型或业务动作，让插件和动作契约共同执行检查。手工实现时，不能只在写入前查一次“是否有权限”，随后按原始 ID 或原始条件修改数据；实际写入的目标条件仍须包含授权范围。

#### 后台执行使用明确的身份

计划任务、消息消费和异步调用可能没有 HTTP 请求上下文。通过平台已有执行身份机制取得当前 `SecurityIdentity` 后，可以使用统一求值器：

```java
import com.ouroboros.security.authorize.AuthorizationEvaluator;
import com.ouroboros.security.context.CurrentSecurityContextHolder;

var params = AuthorizationEvaluator.standard()
    .evaluate(CurrentSecurityContextHolder.getRequiredIdentity(),
        AuthorizationEvaluator.PLATFORM_API, "sales.Order.search")
    .requirePermit();
```

之后仍按前面的方式落实行、字段约束。`getRequiredIdentity()` 不会替任务创建身份；没有执行身份时应停止并检查任务的身份配置。后台流程应明确填写权限名，不依赖无参方法推断当前接口，也不要缓存上次请求的认证对象，或在缺少身份时退回管理员身份。

## 验证从界面到数据的完整链路

| 检查场景 | 应观察的结果 |
| --- | --- |
| 打开角色授权项 | 参数控件出现，字段名和选项正确 |
| 保存并重新打开 | 数组、布尔等值类型保持一致，已有配置正确回显 |
| 同角色的不同身份 | 动态主体规则按实际身份解析 |
| 区域 A 的角色查询 A、B 两类记录 | 查询、分页、count 和导出都只覆盖 A |
| 普通字段的等值、集合、上下限条件 | 默认解析器接收参数，查询结果符合字段条件 |
| 自定义 `$regionScope` 的空区域数组 | 按本例解析器约定无可访问记录，不退化为全量查询 |
| 未授予权限 | 接口与数据操作拒绝访问 |
| 畸形值、未知参数、缺少解析器 | 明确拒绝，不忽略条件继续查询 |
| 更新区域、批量写入、删除 | 记录与字段均受相应操作权限约束 |
| 多角色和受限执行边界 | 结果符合授予取并集、边界求交的契约 |

修改 Java 解析器、Schema 生成器或 SPI 后重新构建并重启目标实例，确认加载的是新 JAR。参数定义存在但界面不出现时，检查权限发现与生成器匹配；界面能保存但数据未收紧时，检查参数值、解析器注册及数据操作插件的权限绑定。
