# Agent Loop 循环

> 返回 [技能树](../../index.html) | 源码位置: `packages/core/agent-loop/`

---

## 一句话总结

Agent Loop 是驱动智能体工作的**引擎**——它按照 turn/step 模型，不断从收件箱取消息、组装提示词、调用 LLM、执行工具，直到没有工作可做。

---

## Turn/Step 模型

| 概念 | 定义 |
|------|------|
| **Step（步骤）** | 一次模型请求 + 它引发的工具执行 |
| **Turn（轮次）** | 包含零个或多个 step 的工作周期，从领取输入开始，到不再欠下任何工作时关闭 |

一个 turn 可能包含多个 step——如果模型响应中调用了工具，工具执行完后模型可能需要再次决策。

---

## 完整流程图

```
kick() → turn() 循环
  ├── turn/start 事件（持久化）
  │
  ├── step 循环
  │   ├── preStep()
  │   │   ├── 从 Inbox 认领消息
  │   │   ├── 组装系统提示词 (systemPrompt.assemble)
  │   │   └── agent/pre-step waterfall（可拒绝/修改消息）
  │   │
  │   ├── step/start 事件（持久化）
  │   ├── 追加 user/message 事件
  │   │
  │   ├── step()
  │   │   ├── 从日志投影模型历史 (deriveMessages)
  │   │   ├── agent/request waterfall（可修改请求）
  │   │   ├── LLM.stream() → assistant/chunk(s)
  │   │   ├── 组装 assistant/message 事件
  │   │   └── [如果有工具调用] → executeToolCalls()
  │   │       ├── tool/call 事件
  │   │       ├── tools/pre-execute waterfall
  │   │       ├── tools/execute waterfall（工具实际执行）
  │   │       ├── tools/post-execute waterfall
  │   │       └── tool/result 事件
  │   │
  │   └── step/end 事件（持久化）
  │
  ├── agent/turn-stopping serial 事件（决定是否停止）
  └── turn/end 事件（持久化）
```

---

## 并行工具调用调度

当模型在一次响应中调用多个工具时：

```
工具分类:
  ├── parallel (并发安全) → 有界滚动池同时执行
  │   └── maxParallelToolCalls 限制并发数
  └── exclusive (独占) → 形成屏障，等待完成

结果按模型顺序提交（ordered commit）
```

---

## Inbox（双列表收件箱）

```
Inbox
  ├── next-turn: 等待独立轮次的消息
  └── next-step: 等待下一个步骤边界的消息

通过 agent/inbox/spliced 事件持久化
```

- `followup(msg)` → 排入 next-turn + 唤醒驱动器
- `steer(msg)` → 排入 next-step（下一个 step 边界处理）
- `inject(msg)` → 注入上下文（不唤醒，落入下一次请求）

---

## Phase 状态机

```
idle ⇄ running (驱动中，正在执行 turn/step)
idle ⇄ maintenance (非轮次维护任务)
```

---

## 创建/恢复事务

```
prepare() → setup (用户回调) → commit() → publish()

发布顺序（严格）:
  1. sessions.enter
  2. agents.enter
  3. sessions.announce
  4. agents.announce
  5. agent/session-start

回滚保障: 任何阶段失败都会反向拆除（逆序）
```

---

## 类比理解

Agent Loop 像**一个厨师的工作流程**：
- turn = 处理一桌客人的所有订单
- step = 做一道菜的过程
- Inbox = 订单队列（新订单 vs 加急单）
- 工具调用 = 使用各种厨具（炉灶、烤箱可以并行使用，但菜刀同一时间只能一个人用）
- 并行工具调度 = 多个厨师同时工作

---

## 相关知识点

- [架构总览](viewer.html?file=architecture-overview.md) — Agent Loop 在整体架构中的位置
- [会话事件溯源](viewer.html?file=session-event-sourcing.md) — Loop 产生的事件
- [事件系统](viewer.html?file=cordis-events.md) — waterfall 和 serial 的区别

---

## 参考资料

- 源码: `packages/core/agent-loop/`
- [docs/subsystems/core.zh.md](../../../docs/subsystems/core.zh.md)
- [docs/agent-lifecycle.zh.md](../../../docs/agent-lifecycle.zh.md)
