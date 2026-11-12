---
sidebar_position: 99.2
---

# 后端常见问题

## 扩展包已安装，Spring Bean 为什么没有加载？

先确认安装到了当前应用使用的运行环境，并且实例已加载新版本。然后检查实际交付的 JAR：

```bash
jar tf target/my-extension-1.0.0.jar | rg 'META-INF/(spring|services)|AutoConfiguration'
unzip -p target/my-extension-1.0.0.jar META-INF/spring.factories
unzip -p target/my-extension-1.0.0.jar \
  META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

文件名替换为本项目产物。两个自动配置文件应注册同一个配置类，该类需要装配目标 Bean；有 SPI 的扩展还要保留对应的 `META-INF/services/<接口全名>`。

扩展交付普通 JAR，平台已提供的依赖按模板使用 `provided`。检查打包过程是否漏掉资源、覆盖服务注册文件或重复打入基座依赖，不要仅因使用了某个 Starter 就拆出另一份扩展。

完整范例见 [创建后端扩展包](../fusion-development/backend-extension-packages)。

## 扩展类存在，编辑器或运行时为什么找不到它？

按“产物已加载 → 扩展已注册 → 资源已声明 → 使用处已引用”检查：

1. 实际运行实例是否加载了该版本 JAR，日志中是否有类加载或依赖冲突。
2. 对应扩展是否要求 SPI 注册、Spring 配置或元数据资源。
3. 字段、逻辑流节点等是否提供了编辑器所需的定义。
4. 业务模型、脚本或页面引用的名称是否与定义一致。

声明路径和调用契约见 [后端插件扩展](../guide/advance/extend-backend/)。

## 字段在建模界面可见，运行时为什么不能用？

检查字段定义是否随运行产物交付。只放在 JAR 的 `META-INF/ouroboros/metadata/dev/` 下，不能代替运行时资源；通用字段定义按扩展指南放入 `META-INF/ouroboros/metadata/`，或通过目标字段扩展契约提供。

同时核对运行目录中的 `field-types/*.field-type.json`、字段类型标识和实现依赖。重新发布后，在目标实例中验证字段的读写及校验行为。参见 [扩展字段](../guide/advance/extend-backend/extend-field/)。

## 为什么查不到数据模型？

Java 的 `DataModelCenter.getDataModel(name)` 返回 `Optional`；脚本的 `DataModelCenter.get(name)` 返回模型或 `null`。先核对模型全名、数据站和加载状态，再读写数据。

```groovy
def orders = DataModelCenter.get('main:sales.Order')
if (orders == null) {
    Exceptions.business('订单模型未加载，请检查应用版本和数据站')
}
def order = orders.get('order-001').get()
```

示例要求 `main` 数据站中已加载 `sales.Order`。模型不存在与记录不存在应分别处理；具体返回值见 [DataModelCenter](../api/backend/data-model/data-model-center/) 和 [DataModel](../api/backend/data-model/data-model/)。

## 延迟模型拿到了，为什么同步调用仍报错？

`TypedDataModelCenter.getDeferredDataModel(...)` 可以先返回延迟模型，但模型就绪前，同步方法会抛出 `IllegalStateException`。将调用放到模型可用之后，或使用对应的 `*Async` 方法等待结果。不要在构造器中立即执行同步查询。

方法与前置条件见 [TypedDataModelCenter](../api/backend/data-model/typed-data-model-center/)。

## 表达式为什么得到 null？

属性不存在或中间对象为空时，表达式可能得到 `null`。检查当前调用提供了哪些变量、属性名是否正确，以及关联数据是否存在。业务必填值应显式校验：

```groovy
def employee = OrganizationHolder.getEmployee()
if (employee == null) {
    Exceptions.business('请先绑定员工信息')
}
def employeeId = employee.getId()
```

`${...}` 中可用对象见 [表达式上下文](../api/backend/expression-context/)，复杂分支可改用 [脚本](../api/backend/script-context/)。

## 自定义脚本变量为什么被同名平台对象覆盖？

`logger`、`DataModelCenter`、`AuthContext` 等名称由平台提供。同名入参不能替换这些全局对象，业务入参使用 `orderInput`、`queryOptions` 等明确名称。

自定义可复用对象通过 [扩展脚本](../guide/advance/extend-backend/extend-script/) 注册；可用名称见 [脚本上下文](../api/backend/script-context/)。

## 认证成功，为什么仍然没有数据或操作权限？

登录只确认身份。继续检查用户的角色与权限、业务主体绑定、字段范围和数据过滤条件。员工、公司与登录用户属于不同身份，接口传参不能混用其 ID。

前端隐藏按钮不等于服务端授权。权限配置、主体扩展与排查顺序见 [权限与访问控制](../fusion-development/authority-subject-and-access-control-design)。
