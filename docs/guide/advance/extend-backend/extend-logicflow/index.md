---
sidebar_position: 4
---

# 逻辑流节点扩展

业务流程先组合已有节点、表达式和脚本。需要让多条流程配置同一项新能力时，再实现节点，并同时提供运行时行为与编辑器定义。

## 准备节点契约

让 AI 读取同类节点的 Builder、节点类、元数据和测试，先确认目标版本的接口签名。任务应约定：

- 唯一 `type`、标题、分组和用途。
- 属性配置、默认值、输入输出端口与引用规则。
- 执行时使用的业务服务、返回值和失败行为。
- 节点会被放入哪些流程，以及正常与异常的输入样例。

AI 生成运行时实现、`.flow-node.json` 和测试时，使用同一份契约核对类型及属性名。单个流程中的一次性规则可以保留在流程定义中。

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

## 补齐编辑器定义

节点需要同时可执行、可发现、可配置。按 [模型资源源码约定](../../authoring-metadata-conventions/)提供节点定义，包含属性配置 UI、端口规则、分组、标题、图标与说明。

让 AI 对照 Builder 的匹配条件和节点读取的属性生成定义，再把配置保存为实际逻辑流检查。编辑器字段名、元数据参数和运行时读取位置必须一致。

## 验证完整链路

1. 行为测试覆盖节点构建、正常输入、缺失参数与依赖失败。
2. 安装产物，确认 `NodeFactory` 发现 Builder，并按 `type` 匹配。
3. 在编辑器添加节点，填写配置并连接端口，保存和重新打开。
4. 在真实流程中执行，核对输入、输出、状态和失败分支。
5. 依赖 Spring Bean 时，检查装配与实例中的实际调用。

排查时向 AI 提供节点定义、保存后的流程片段、输入和日志。先确定是发现、配置、连线还是执行问题，再修改对应位置。

模型与执行关系见 [逻辑流模型](../../../../concepts/logicflow-model/)，团队验收见 [任务协作与交付验收](../../../../fusion-development/high-low-code-collaboration)。
