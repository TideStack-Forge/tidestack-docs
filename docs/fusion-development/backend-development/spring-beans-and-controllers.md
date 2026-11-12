---
title: Controller 与 Service
---

# Controller 与 Service

扩展 JAR 可以直接编写 Spring MVC Controller 和业务 Service。仅向应用增加普通 HTTP 接口时，不需要先创建逻辑流、脚本或节点插件。

## 1. 注册业务 Service

下面用一个无状态的订单编号格式服务展示普通 Bean，真实业务服务可继续注入数据模型、RPC 和其他依赖：

```java
package com.example.orders;

import org.springframework.stereotype.Service;

@Service
public class OrderNumberService {
  public String display(String orderId) {
    return "订单：" + orderId;
  }
}
```

## 2. 注册带权限的 Controller

```java
package com.example.orders;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ouroboros.security.annotation.Authority;

@RestController
@RequestMapping("/api/custom/orders")
public class OrderController {
  private final OrderNumberService service;

  public OrderController(OrderNumberService service) { this.service = service; }

  @Authority("sales.Order.read")
  @GetMapping("/{id}/display")
  public Map<String, String> display(@PathVariable("id") String id) {
    return Map.of("display", service.display(id));
  }
}
```

示例返回普通 JSON Map；需要平台标准响应封装时，沿用项目的 WebAPI 返回规范。`@Authority` 将接口关联到权限项，同名权限可聚合多个 API。仍需提供权限定义并给角色授权，注解不会自动授予所有登录用户访问权。

## 3. 让扩展包装配 Bean

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import({OrderNumberService.class, OrderController.class})
public class OrdersAutoConfiguration {
}
```

将自动配置的全限定类名写入 `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`，同时按模板保留 `META-INF/spring.factories` 中同一自动配置登记，具体依赖与打包方式见 [扩展包指南](../backend-extension-packages)。示例使用显式导入；已有工程采用限定包扫描时可沿用，避免把整个依赖树都扫描进来。

## 4. 与模型协作

Service 可以直接通过 [数据模型 API](./data-model)读写，也可以调用 [业务动作](./business-model)、[逻辑流](./logicflow-model)或 [RPC](./rpc-model)。需要让模型调用 Service 时，使用正式动作绑定、脚本上下文或节点插件。

普通 Controller 不会自动进入业务动作运行时。需要动作的权限、前置条件和事件契约时，应显式调用动作，避免直接调用实现方法绕过这些约束。

## 验证

安装 JAR 后确认 Bean 和路由已注册，分别用有权限、无权限及未登录账号调用示例地址。核对权限项确实关联此方法与路径，后台服务的数据访问落实行和字段限制。然后验证业务失败的异常映射、事务回滚和更新后的重复装配问题。
