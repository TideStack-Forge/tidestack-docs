---
sidebar_position: 4
---

# 扩展逻辑流

扩展逻辑流适用于现有节点无法覆盖的通用处理能力。它解决的是“补一个可复用的新节点”，而不是替代业务人员在单个流程里做普通编排。

## 什么时候应该新增节点

- 多个流程都要重复完成同一类处理
- 需要把外部系统调用、复杂数据处理或平台能力封装成稳定节点
- 希望业务开发人员在可视化编排里直接使用，而不是每次都写脚本

如果某段逻辑只在一个流程里出现一次，通常先用现有节点配合脚本组合，避免节点体系持续膨胀。

## 常见实现抓手

- 后端执行侧的核心入口是 `NodeBuilder<T extends FlowNode>`。
- 通过实现 `support(FlowNodeMeta)` 和 `build(FlowModel, FlowNodeMeta, NodeReferenceCatalog)` 决定节点匹配与实例化；节点显式接收 owner、元数据和引用目录。
- 通过 `META-INF/services/com.ouroboros.logicflow.nodes.NodeBuilder` 注册后，`NodeFactory` 会把它纳入运行时节点发现。
- 如果希望节点能在可视化编辑器中顺畅配置，通常还要同步提供节点定义、端口规则和属性配置；后端节点可执行，不代表开发端已经可配置。

## 一个最小逻辑流节点怎么做

### 1. 定义节点执行类

通常会有一个真正执行逻辑的节点类，以及一个 `Builder` 负责按 `type` 构建它。

```java
public static class Builder implements NodeBuilder<Node> {
  @Override
  public Boolean support(FlowNodeMeta meta) {
    return "getConfig".equalsIgnoreCase(meta.getType());
  }

  @Override
  public Node build(FlowModel owner, FlowNodeMeta metadata, NodeReferenceCatalog references) {
    return new Node(owner, metadata, references);
  }
}
```

`support(...)` 里匹配的 `type`，必须和前端节点元数据里的类型保持一致，否则运行时根本找不到这个节点。

### 2. 注册 SPI

文件路径：

```text
META-INF/services/com.ouroboros.logicflow.nodes.NodeBuilder
```

文件内容：

```text
com.example.flow.nodes.MyNode$Builder
```

运行时的 `NodeFactory` 会把 SPI 加载到内建节点列表前面一起参与匹配。

### 3. 需要 Spring Bean 时，按“外层组件 + 内部 Builder”组织

很多节点运行时需要访问配置、通知、RPC 或其他 Spring Bean。一个常见做法是：

1. 用外层 `@Component` 或自动装配类接住 Spring Bean。
2. 把 Bean 存到静态字段或可访问的代理里。
3. `Builder` 和真正的节点实例只消费这层代理。

仓库里的 `GetConfigNode` 就是这种结构。

## 只做后端执行还不够

逻辑流扩展有一件特别容易忽略的事：后端能执行，不等于业务开发者已经能在开发平台里顺畅配置。

如果你希望节点真正成为团队可复用的能力，通常还要继续补：

- 节点定义
- 属性配置 UI
- 输入输出端口规则
- 编辑器中的分组、标题、图标和说明

否则结果往往是：

- 运行时能跑
- 但开发平台里没有对应节点，或节点虽然出现却无法配置

## 设计建议

- 一个节点只做一件清晰的事，输入输出约定要稳定
- 把可视化配置项控制在业务开发者能理解和调试的范围内
- 优先把通用能力沉淀成节点，把一次性流程细节留在具体逻辑流里

## 验证清单

1. 节点类型是否已经被运行时识别，`support(meta)` 能正确命中。
2. 节点执行时依赖的 Spring Bean 是否已装配。
3. 编辑器里是否已经出现对应节点。
4. 节点属性面板、端口规则和运行结果是否一致。
5. 节点被放进真实业务流程后，输入输出是否符合预期。

## 常见坑

- `support(meta)` 的 `type` 和前端元数据里的节点类型不一致。
- SPI 文件漏配，导致运行时完全找不到节点。
- 节点后端已实现，但前端编辑器没有节点定义或配置面板。
- 一个节点承载过多职责，结果参数越来越复杂、业务人员越来越难配。

## 相关文档

- [逻辑流模型](../../../../concepts/logicflow-model/)
- [逻辑流教程](../../../tutorial/logicflow/)
- [高低开协同模式](../../../../fusion-development/high-low-code-collaboration/)
