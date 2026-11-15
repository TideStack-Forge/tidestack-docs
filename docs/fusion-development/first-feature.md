---
title: 完成第一个融合开发功能
---

# 完成第一个融合开发功能

本教程完成一个“物料登记”页面：用户填写编码和名称，Java Service 校验并保存，页面重新读取物料列表。数据结构用注解声明，接口、页面、菜单和权限随扩展 JAR 一起装配到应用。

完成后，普通账号可以按角色查看或登记物料；没有授权的账号即使直接请求接口，也应被拒绝。示例采用 [标准基座扩展模式](./project-modes/standard-runtime)，用于已经完成本地部署和工程准备的应用。

import useBaseUrl from '@docusaurus/useBaseUrl';

<p><a href={useBaseUrl('/examples/material-registration.zip')}>下载完整示例工程</a>，解压后按下面的步骤构建和装配。压缩包包含本页源码、页面元数据，以及后续测试、初始化和升级指南使用的示例。</p>

## 准备工程与测试应用

准备 Java 21、Maven、可解析平台依赖的 Maven 仓库，以及一个允许新增表和测试数据的独立应用。先用现有账号确认该应用能够启动、登录和打开菜单，再接入本例。

示例的 POM 通过 `ouroboros-bom` 管理版本。将 `ouroboros.version` 改为目标基座配套的依赖版本；默认值取自本项目源码，不能用它推断正在运行的镜像版本。平台镜像标签和 Maven 依赖版本应按团队的版本清单对应。

本例依赖的运行能力包括类型化数据模型、默认 SQL 数据站、Spring MVC、事务、菜单、UI Schema 和权限。标准基座已经提供这些能力时，扩展复用它们；使用裁剪基座时，先补齐运行模块。`ouroboros-data-typed-core` 提供注解，`ouroboros-data-typed-runtime` 才负责运行时扫描和类型化模型注册。

解压后的主要文件如下：

```text
material-registration/
├── pom.xml
├── src/main/java/com/example/material/
│   ├── model/Material.java
│   ├── MaterialService.java
│   ├── MaterialController.java
│   └── MaterialAutoConfiguration.java
├── src/main/metadata/
│   ├── material-read.authority.json
│   ├── material-create.authority.json
│   ├── materials.menu.json
│   ├── materials.ui-model.json
│   └── materials.ui-schema.json
├── src/main/resources/META-INF/
│   ├── spring.factories
│   └── spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports
├── src/test/java/com/example/material/
├── scripts/check-permissions.py
└── extras/materials.data-init.json
```

`extras/` 中的初始化文件默认不参与打包。先完成登记和查询，再按 [数据初始化](./backend-development/data-initialization)决定是否加入演示数据。

## 定义物料数据模型

在 `model/Material.java` 中定义三个字段：内部 ID、编码、名称。

```java
package com.example.material.model;

import com.ouroboros.data.annotation.Field;
import com.ouroboros.data.annotation.Model;
import com.ouroboros.data.annotation.PrimaryKey;

@Model(fullName = "sample.Material", rawName = "sample_material", label = "物料")
public class Material {
  @Field(size = 64)
  @PrimaryKey
  private String id;

  @Field(label = "编码", size = 64)
  private String code;

  @Field(label = "名称", size = 200)
  private String name;

  public String getId() { return id; }
  public void setId(String id) { this.id = id; }
  public String getCode() { return code; }
  public void setCode(String code) { this.code = code; }
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }
}
```

模型全名是 `sample.Material`，物理表名固定为 `sample_material`，使用默认数据站。`@PrimaryKey` 的默认生成策略为 `disabled`，稍后由 Service 提供 UUID。字段默认不允许为空，长度分别为 64、64 和 200。

这是由代码维护的独立数据模型，不需要再在开发平台中创建同名业务模型。已有业务模型及其数据投影继续沿用原定义，避免同名资源相互覆盖。需要关联、唯一约束或审计时，再按 [用注解定义数据模型](./backend-development/data-model-annotations)扩充。

## 编写登记与查询服务

`MaterialService` 注入 `TypedDataModel<String, Material>`，通过平台数据 API 保存和查询，不直接操作数据库。

```java
package com.example.material;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.material.model.Material;
import com.ouroboros.data.model.TypedDataModel;
import com.ouroboros.exception.BusinessException;

@Service
public class MaterialService {
  private final TypedDataModel<String, Material> materials;

  public MaterialService(TypedDataModel<String, Material> materials) {
    this.materials = materials;
  }

  @Transactional(rollbackFor = Exception.class)
  public Material create(String code, String name) {
    var material = new Material();
    material.setId(UUID.randomUUID().toString());
    material.setCode(required(code, "编码", 64));
    material.setName(required(name, "名称", 200));
    return materials.insert(material).get();
  }

  public List<Material> list() {
    return materials.query(Map.of("orderBy", "code", "limit", 100)).get();
  }

  private static String required(String value, String label, int maxLength) {
    if (value == null || value.isBlank()) {
      throw new BusinessException(label + "不能为空");
    }
    String normalized = value.strip();
    if (normalized.length() > maxLength) {
      throw new BusinessException(label + "不能超过 " + maxLength + " 个字符");
    }
    return normalized;
  }
}
```

校验先去掉首尾空白，再检查必填和长度。数据操作返回 `Try`，`.get()` 会把失败传播给调用方；异常离开事务方法后才能触发相应回滚。不要在这里将失败转换为空结果或成功响应。

列表按编码排序，最多读取 100 条，便于先贯通一项功能。实际应用需要继续增加分页、筛选和相应测试。当前示例也未限制编码唯一性；这项业务规则应通过模型约束实现，不能靠“先查询再插入”保证并发唯一。

## 提供带权限的 HTTP 接口

在 `MaterialController.java` 中分别绑定查询和登记权限：

```java
package com.example.material;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.material.model.Material;
import com.ouroboros.security.annotation.Authority;
import com.ouroboros.web.ItemsWebApiResult;
import com.ouroboros.web.WebApiResult;

@RestController
@RequestMapping("/api/custom/materials")
public class MaterialController {
  private final MaterialService service;

  public MaterialController(MaterialService service) { this.service = service; }

  @Authority("sample.Material.read")
  @GetMapping
  public ItemsWebApiResult<Material> list() {
    return ItemsWebApiResult.ok(service.list());
  }

  @Authority("sample.Material.create")
  @PostMapping
  public WebApiResult<Material> create(@RequestBody CreateMaterial input) {
    return WebApiResult.ok(service.create(input.code(), input.name()));
  }

  public record CreateMaterial(String code, String name) { }
}
```

列表成功时返回 `{"code":0,"data":{"items":[...]}}`，登记成功时 `data` 是新物料。前端基座的请求适配会识别平台响应格式，页面无需再写一份响应转换器。

这里的授权粒度是“能否查看物料”和“能否登记物料”。查询不包含按部门、人员或组织过滤的行级权限；需要这类范围控制时，继续按 [数据权限参数的定义与使用](./data-access-control-parameters)落实到查询和返回字段。

## 注册模型和 Spring Bean

`MaterialAutoConfiguration.java` 负责声明模型扫描包，并导入 Service 与 Controller：

```java
package com.example.material;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import com.ouroboros.data.annotation.DataModelScan;

@Configuration
@DataModelScan("com.example.material.model")
@Import({MaterialService.class, MaterialController.class})
public class MaterialAutoConfiguration { }
```

把全限定类名写入两个注册文件。`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` 的内容为：

```text
com.example.material.MaterialAutoConfiguration
```

`META-INF/spring.factories` 的内容为：

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
com.example.material.MaterialAutoConfiguration
```

示例不在 Bean 构造函数中查询数据。基座先装配 Bean，再完成模型准备；实际数据操作应在应用准备就绪后执行。

## 接入页面、菜单与权限

### 声明页面路由

`materials.ui-model.json` 声明 `/sample/materials`：

```json
{
  "path": "/sample/materials",
  "title": "物料登记",
  "type": "amis"
}
```

`amis` 是当前 UI 模型使用的类型标识。页面使用 PrismUI，类型标识仍按运行契约填写。

### 编写列表与登记表单

`materials.ui-schema.json` 用 `name` 关联同一路由，`schema` 放页面内容。下面是可直接使用的定义：

```json
{
  "name": "/sample/materials",
  "schema": {
    "type": "page",
    "title": "物料登记",
    "body": {
      "type": "crud",
      "id": "materialList",
      "api": "get:/api/custom/materials",
      "syncLocation": false,
      "headerToolbar": [
        "reload",
        {
          "type": "button",
          "label": "登记物料",
          "level": "primary",
          "actionType": "dialog",
          "dialog": {
            "title": "登记物料",
            "body": {
              "type": "form",
              "api": "post:/api/custom/materials",
              "body": [
                {"type": "input-text", "name": "code", "label": "编码", "required": true, "maxLength": 64},
                {"type": "input-text", "name": "name", "label": "名称", "required": true, "maxLength": 200}
              ]
            }
          },
          "reload": "materialList"
        }
      ],
      "columns": [
        {"name": "code", "label": "编码"},
        {"name": "name", "label": "名称"}
      ],
      "footerToolbar": []
    }
  }
}
```

表单的 `code`、`name` 与请求 DTO 对应。提交成功关闭弹窗后，重新加载 `materialList`。本例没有分页条，与后端最多返回 100 条的约定一致。

### 增加菜单

`materials.menu.json` 中的 `url` 指向页面路由：

```json
{
  "fullName": "sample.materials",
  "title": "物料登记",
  "url": "/sample/materials",
  "icon": "fa fa-cubes",
  "placement": "main",
  "order": 50
}
```

### 定义两个权限项

`material-read.authority.json` 同时控制查询接口、页面和菜单：

```json
{
  "fullName": "sample.Material.read",
  "title": "查看物料",
  "apis": ["GET /api/custom/materials"],
  "uiViews": ["/sample/materials"],
  "menuItems": ["sample.materials"]
}
```

`material-create.authority.json` 控制登记接口：

```json
{
  "fullName": "sample.Material.create",
  "title": "登记物料",
  "apis": ["POST /api/custom/materials"]
}
```

权限定义和 `@Authority` 使用完全相同的名称。资源加载后仍需在应用的角色授权界面分配权限，文件不会自动给普通用户授权。本例保留登记按钮，让后端拒绝未获登记权限的请求；产品页面可再按权限调整按钮显示，后端校验仍需保留。

## 构建并装配到应用

在示例目录执行：

```bash
mvn clean verify -Douroboros.version=<目标基座配套的依赖版本>
jar tf target/material-registration-1.0.0-SNAPSHOT.jar
```

构建应通过测试。JAR 中应有 `MaterialAutoConfiguration.class`、两个自动配置注册文件，以及 `META-INF/ouroboros/metadata/` 下的五个 JSON。示例 POM 已配置元数据复制，未使用 Spring Boot repackage。

将该 JAR 加入当前应用的 `metadata/extend/`，保留应用已有的元数据和环境配置。使用平台管理的测试实例时，按 [平台测试实例调试](./local-ide-and-platform-debugging)构建上传并重启；使用本机容器时，按 [本地基座容器调试](./local-runtime-container-debugging)更新挂载目录并重启基座进程。替换 JAR 后只刷新浏览器，不会让 JVM 自动加载新类。

本例没有额外的第三方运行依赖。实际工程增加此类依赖后，应按 [扩展包依赖过滤](./backend-extension-packages#复制并过滤第三方依赖)准备随包交付的部分。

启动后检查模型加载和迁移日志：应能找到 `sample.Material`，默认数据源中出现 `sample_material`。如果模型缺失，先查 JAR 是否进入实际加载目录、自动配置是否装配、扫描包和 typed runtime 是否存在，再检查模型定义。

## 配置角色并走完页面流程

在测试应用中准备三个普通账号，使用不同角色，避免管理员的全局权限掩盖遗漏：

| 账号用途 | 授权 |
| --- | --- |
| 查看物料 | `sample.Material.read` |
| 登记物料 | `sample.Material.read`、`sample.Material.create` |
| 验证拒绝访问 | 不授予以上两项权限 |

用登记账号重新登录，打开 **物料登记**，点击 **登记物料**，输入 `MAT-001` 和 `示例物料`。提交后列表应出现新记录，刷新页面后记录仍在。再输入空白名称，确认页面必填校验或后端业务校验拒绝提交。

用只读账号打开页面，确认可以查询；直接向 `POST /api/custom/materials` 提交登记请求，应被拒绝。用未授权账号检查菜单和直接查询接口，未登录时再检查一次。完整的自动化请求脚本和断言见 [自动化测试](./automated-testing)。

## 从真实请求调试并交付

在 `MaterialService.create` 设置断点，从登记页面提交一次请求。调试器应停在校验和数据写入处；继续执行后，检查 HTTP 响应和列表结果。若断点未命中，先核对浏览器请求的目标实例、实例内 JAR 和 IDE 源码版本，再检查 JDWP 连接。

交付前运行全部测试，将扩展 JAR 与应用元数据、基座 digest、环境配置版本一起记录。用一份干净装配的应用再次验证登录、登记、查询和拒绝访问。需要升级已有数据时，先执行 [模型变更与应用升级](./model-evolution-and-upgrade)中的演练。
