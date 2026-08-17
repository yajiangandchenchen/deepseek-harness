# 架构总览

> 返回 [技能树](../../index.html) | 来源: [docs/architecture.zh.md](../../../docs/architecture.zh.md)

---

## 一句话总结

DeepSeek Harness 是一个**一切均可插件**的 AI Agent 开发平台——模型适配器、工具注册表、会话日志、甚至 agent loop 本身都是插件，都可以从配置替换。

---

## 核心理念

### 1. 一切皆插件

```
dsh = Cordis 框架 + 插件树
```

- 模型适配器 → 插件
- 工具注册表 → 插件
- 会话日志 → 插件
- Agent Loop → 插件
- 甚至 Web 服务器 → 插件

### 2. 不存在特权内核

扩展 dsh 的方式是把插件挂载到其他插件**旁边**，而不是修改核心代码。

### 3. 配置驱动

通过 `cordis.yml` 配置文件决定加载哪些插件、如何组合。

---

## 核心包一览

| 包 | 职责 | ctx 键 |
|----|------|--------|
| `core/session` | 仅追加的 SessionEvent 日志和内存存储 | `ctx.sessions` |
| `core/system-prompt` | 提示词片段与工具 schema 的组装 | `ctx.systemPrompt` |
| `core/tools` | 作用域化的工具注册表和带把关的执行流水线 | `ctx.tools` |
| `core/agent` | Agent 接口、活跃 agent 注册表和 agent/* 事件 | `ctx.agents` |
| `core/agent-loop` | 实现该接口的默认驱动器 | `ctx.agentLoop` |
| `core/scope` | 按 agent 划分作用域的注册原语 | 库，无 ctx 键 |
| `llm/llm` | 消息与流式词汇表，以及适配器 seam | `ctx.llm` |

---

## 三层事件域

| 事件域 | 用途 | 何时使用 |
|--------|------|----------|
| 会话事件 | 持久化事实（追加到日志） | 事实必须在重新加载后仍然存在 |
| Agent 事件 | 携带活跃 Agent | 观察或拦截进行中的工作 |
| 能力事件 | 向 seam 附加策略 | 无需导入循环即可扩展 |

---

## 轮次流程 (Turn Flow)

```
turn/start
  claim input + assemble prompt + tool schemas
  agent/pre-step → reject | enter(messages)
  step/start
    append user/message
    agent/request → llm/stream → assistant/message
    tool/call → tools/pre-execute → tools/execute → tools/post-execute → tool/result
  step/end
  tools owe another request → next step
agent/turn-stopping
turn/end
```

---

## 模型可见即已记录

**核心不变量**：抵达模型请求的一切都必须能从日志重建。

→ 新增一项模型可见输入就需要新增一个会话事件。

---

## 类比理解

Harness 像**一个可定制的工厂**：
- Cordis 框架 = 厂房和电力系统
- 插件 = 各种生产设备（可以随意更换）
- cordis.yml = 生产流程图（决定用哪些设备）
- 会话日志 = 生产记录（每一步都有据可查）

---

## 相关知识点

- [Agent Loop 循环](viewer.html?file=agent-loop.md) — 轮次流程的详细机制
- [会话事件溯源](viewer.html?file=session-event-sourcing.md) — 日志系统的设计
- [Cordis 框架核心](viewer.html?file=cordis-context.md) — 底层框架

---

## 参考资料

- [docs/architecture.zh.md](../../../docs/architecture.zh.md)
- [docs/cordis-primer.zh.md](../../../docs/cordis-primer.zh.md)
