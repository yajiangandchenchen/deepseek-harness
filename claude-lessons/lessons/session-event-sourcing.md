# 会话事件溯源

> 返回 [技能树](../../index.html) | 源码位置: `packages/core/session/`

---

## 一句话总结

会话日志是**仅追加的事件日志**——所有状态变更通过事件记录，运行时状态都是从事件日志增量投影出来的。这就是「事件溯源」（Event Sourcing）模式。

---

## 什么是事件溯源？

传统方式：存储当前状态（覆盖式）
```
用户表: { name: "张三", age: 25 }  ← 直接覆盖
```

事件溯源：存储导致状态变化的事件（追加式）
```
事件1: UserCreated { name: "张三", age: 20 }
事件2: AgeChanged { from: 20, to: 25 }
```

**当前状态 = 从头播放所有事件**

---

## Session 的核心设计

```typescript
class Session {
  // 追加-only 事件日志
  append(event: SessionEvent): void

  // 从表面投影出 LLM 消息历史
  deriveMessages(): LlmMessage[]

  // fork / 恢复
  fork(source: Session, boundary?): Session
}
```

每个事件**深冻结**（不可变），保证日志的完整性。

---

## 事件类型体系

| 事件 | 类型 | 用途 |
|------|------|------|
| `turn/start`, `turn/end` | 持久 | 轮次边界 |
| `step/start`, `step/end` | 持久 | 步骤边界 |
| `user/message` | 持久 + 表面 | 用户消息 |
| `assistant/chunk` | 持久 | 原始流分块（用于回放） |
| `assistant/message` | 持久 + 表面 | 组装后的助手消息 |
| `tool/call`, `tool/result` | 持久 | 工具调用和结果 |
| `agent/inbox/spliced` | 持久 | Agent 收件箱变更 |

---

## 表面（Surface）机制

只有 `user/message`、`assistant/message`、`tool/result` 是「表面事件」——它们构成了模型看到的对话历史。

通过 `surfaceOp` 标记维护有序消息序列：
- `'append'` → 追加到末尾
- `{ op: 'replace', start, end }` → 替换某段

`deriveMessages()` 从表面投影出 LLM 消息历史。

---

## 模型可见即已记录

**核心不变量**：抵达模型请求的一切都必须能从日志重建。

→ 新增一项模型可见输入就需要新增一个会话事件。

→ 由运行时不变量断言这一点。

---

## 为什么用事件溯源？

| 优势 | 说明 |
|------|------|
| 可恢复 | 从任意点重放日志恢复状态 |
| 可审计 | 每一步操作都有记录 |
| 可分叉 | 日志是共享的，fork 只需引用 |
| 可测试 | 事件是纯数据，容易断言 |
| UI 保真 | 原始 chunk 事件保证回放一致 |

---

## 类比理解

事件溯源像**会计记账**：
- 传统方式：只在总账上改余额（覆盖式）
- 事件溯源：每一笔交易都记录（追加式）
- 当前余额 = 从第一笔交易开始累加
- 表面事件 = 只显示在银行对账单上的交易

---

## 相关知识点

- [Agent Loop 循环](viewer.html?file=agent-loop.md) — 产生这些事件的引擎
- [Cordis 框架核心](viewer.html?file=cordis-context.md) — Session 如何挂到 ctx 上
- [架构总览](viewer.html?file=architecture-overview.md) — 事件溯源在整体架构中的位置

---

## 参考资料

- 源码: `packages/core/session/`
- [docs/subsystems/session.zh.md](../../../docs/subsystems/session.zh.md)
