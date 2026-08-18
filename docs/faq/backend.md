---
sidebar_position: 99.2
---

# 后端

后端 FAQ 优先回答融合开发和扩展运行时相关问题。

## Q: 为什么我的扩展包中的 Spring Bean 没有被加载？

扩展包会被当作一个 Spring Boot Starter 进行加载，因此扩展包中必须要有 `META-INF/spring.factories` 文件，并为其配置 `org.springframework.boot.autoconfigure.EnableAutoConfiguration`。

但有的时候即便配置了，也会出现扩展包中的 Spring Bean 没有被加载的情况，这时候需要检查一下扩展包的依赖中是否存在其他的 Spring Boot Starter，如果存在其他的 Spring Boot Starter，其 `META-INF/spring.factories` 会覆盖扩展包中的 `META-INF/spring.factories`，导致扩展包中的 Spring Bean 没有被加载。

这时候需要把扩展包中的 Spring Boot Starter 依赖排除掉，然后把该 Starter 也作为一个扩展包添加到平台中即可。

## Q: 为什么我明明写了扩展代码，但平台能力里还是看不到？

除了 `spring.factories` 之外，还要继续检查：

1. 扩展包是否已经被正确安装到当前运行环境。
2. 你扩展的是哪一类能力，是否还需要额外的 SPI 注册、资源文件或元数据声明。
3. 当前页面、接口或模型是否真的已经引用到了这个扩展能力。

如果你还在选择扩展方式，可以先回到 [扩展后端](../guide/advance/extend-backend/) 和 [融合开发总览](../fusion-development/)。

如果你当前卡的不是具体能力点，而是“扩展包应该怎么打”“什么时候该走开发模块脚手架”，建议继续看 [创建后端扩展包](../fusion-development/backend-extension-packages) 和 [开发模块与 Maven 脚手架](../fusion-development/development-module-scaffold-and-maven-skeleton)。

## Q: 权限、主体和 Claims 相关扩展，应该先从哪一层切入？

先不要急着从控制器或登录页改起，建议先分清四层：

1. 登录方式和认证入口
2. 用户、角色与权限定义
3. 用户与业务主体绑定关系
4. 访问控制结果如何下沉到字段和数据过滤

从当前代码结构看，这类能力通常分别落在：

- `AuthorityProvider / AuthorityCenter`
- `UserCenter`
- `UserSubjectProvider / UserSubjectCenter`
- `SubjectProvider / SubjectCenter`
- `ClaimsProvider / ClaimsAggregator`

如果你当前还在判断边界，先看 [权限、主体与访问控制设计](../fusion-development/authority-subject-and-access-control-design)。

## Q: 我应该先查脚本上下文、表达式上下文，还是 Java API？

- 你在写 `${...}`：先看 [表达式上下文](../api/backend/expression-context/)
- 你在写脚本：先看 [脚本上下文](../api/backend/script-context/)
- 你在确认对象和工具类定义：先看 [Java API](../api/backend/java-api/)

如果你还在“该不该写代码、该扩哪一层”之间做选择，先回到 [融合开发](../fusion-development/)。

## Q: 为什么字段在开发平台里能看到，运行时却用不了？

这通常是因为你补的是开发态字段来源，而不是运行时字段来源。

先分清两类路径：

1. 开发态常见来源：应用工作区 `field-types/*.field-type.json`、JAR 内 `META-INF/ouroboros/metadata/dev/*.field-type.json`、JAR 内通用 `META-INF/ouroboros/metadata/*.field-type.json`
2. 运行时常见来源：运行目录 `field-types/*.field-type.json`、JAR 内 `META-INF/ouroboros/metadata/*.field-type.json`、自定义 `FieldTypeDefinitionProvider`

如果你只补了开发态那条链路，建模界面里可能看得到字段，但运行时并不会自动加载。

这类问题优先看：

- [扩展字段](../guide/advance/extend-backend/extend-field/)
- [创建后端扩展包](../fusion-development/backend-extension-packages)

## Q: 为什么 `TypedDataModelCenter.getDeferredDataModel(...)` 拿到对象后，同步方法一调用就报错？

这是延迟模型的预期行为。

当前实现里：

- `*Async` 方法会返回 `CompletableFuture`
- 同步方法在模型尚未就绪时会抛出 `IllegalStateException`

如果你现在还处在模型刷新之前，应该优先：

1. 改用异步方法
2. 或等待模型刷新完成后再调用同步方法

相关文档：

- [TypedDataModelCenter](../api/backend/data-model/typed-data-model-center/)
- [数据模型 API](../api/backend/data-model/)

## Q: 为什么表达式里访问了一个不存在的属性，没有直接报错，而是得到 `null`？

这是当前表达式运行时的实现特征。

平台表达式基于 SpEL，并额外加了一层“读取不到属性时返回 `null`”的访问器。所以很多情况下：

- 对象存在但属性不存在
- 中间链路某一段没有值

最终都会表现成表达式结果为 `null`，而不是立刻抛出属性读取异常。

排查时优先确认：

1. 你引用的上下文对象是否真的存在
2. 当前字段或属性名是否写对
3. 这段逻辑是不是已经更适合改成脚本

相关文档：

- [表达式上下文](../api/backend/expression-context/)
- [表达式教程](../guide/tutorial/expression/)

## Q: 为什么我给脚本传了一个同名变量，运行时还是优先用了平台上下文对象？

这是因为脚本上下文会把 `ScriptContextContributor` 提供的对象覆盖到传入 bindings 之前。

也就是说，如果你传入：

- `logger`
- `DataModelCenter`
- `AuthContext`

而平台上下文里本身也注入了同名对象，那么通常会优先拿到平台注入的版本。

如果你遇到这种情况，最稳妥的做法是：

1. 避免和平台全局对象重名
2. 在脚本里把业务自定义变量起成更明确的名字

相关文档：

- [脚本上下文](../api/backend/script-context/)
- [扩展脚本](../guide/advance/extend-backend/extend-script/)
