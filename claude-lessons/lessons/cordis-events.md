# 事件系统

> 返回 [技能树](../../index.html) | 源码位置: `vendor/cordis/src/events.ts`

---

## 一句话总结

Cordis 的事件系统有 **5 种调度模式**，支持拦截、并行、顺序执行等语义，是插件间通信和扩展的核心机制。

---

## 五种调度模式

| 模式 | 方法 | 执行方式 | 返回值 | 典型用途 |
|------|------|----------|--------|----------|
| **emit** | `ctx.emit(name, ...args)` | 同步、并行、不等待 | void | 通知观察者 |
| **parallel** | `ctx.parallel(name, ...args)` | 并发等待所有 listener | Promise\<void\> | 并行收集 |
| **serial** | `ctx.serial(name, ...args)` | 顺序 await，遇 bail 停止 | Promise\<首个bail\> | 串行处理 |
| **bail** | `ctx.bail(name, ...args)` | 同步顺序，遇 bail 停止 | 首个 bail 值 | 快速决策 |
| **waterfall** | `ctx.waterfall(name, ...args, next)` | 洋葱模型，不调用 next() 即阻断 | 最外层返回值 | 拦截/修改 |

---

## 核心概念: bail 值

**bail 值** = 非 null、非 false、非 undefined 的返回值。

当 listener 返回 bail 值时，后续 listener 不再执行。这是「拦截」的机制。

---

## waterfall 详解

waterfall 是**洋葱模型**——每个 listener 包裹下一层：

```typescript
ctx.waterfall('tools/execute', async (args, next) => {
  console.log('before execute')
  const result = await next()  // ← 调用下一层
  console.log('after execute')
  return result
})
```

**不调用 `next()`** = 阻断后续所有 listener（包括框架内置行为）。

这是 harness 工具执行流水线的核心机制：

```
tools/pre-execute → tools/execute → tools/post-execute
     (waterfall)      (waterfall)      (waterfall)
```

---

## serial vs waterfall 的区别

| | serial | waterfall |
|---|--------|-----------|
| 传递值 | 各 listener 独立 | 通过 `next()` 链式传递 |
| 修改能力 | 只能返回 bail 值 | 可以修改输入和输出 |
| 阻断方式 | 返回 bail 值 | 不调用 `next()` |

---

## filter 隔离

通过 `ctx[Context.filter]` 过滤，确保 listener 只接收匹配隔离作用域的事件：

```typescript
// 只接收属于某个 agent 的事件
ctx.on('agent/status', handler, Context.filter.agent(specificAgent))
```

---

## harness 中的事件域

| 事件域 | 用途 | 示例 |
|--------|------|------|
| 会话事件 | 持久化事实（追加到日志） | `turn/start`, `user/message` |
| Agent 事件 | 活跃 Agent 的生命周期 | `agent/created`, `agent/pre-step` |
| 能力事件 | 向 seam 附加策略 | `fs/write-intent`, `tools/execute` |

---

## 类比理解

事件系统像**公司里的对讲机通讯**：
- **emit** = 广播通知（不等人回复）
- **parallel** = 同时给多人发任务，等所有人完成
- **serial** = 流水线作业，一人做完传给下一人
- **bail** = 快速审批，一人说「不」就终止
- **waterfall** = 层层审批，每层都可以修改申请内容

---

## 相关知识点

- [Fiber 生命周期](viewer.html?file=cordis-fiber.md) — 事件如何在 Fiber 卸载时自动清理
- [Agent Loop 循环](viewer.html?file=agent-loop.md) — 轮次流程中的事件时序
- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 能力事件的使用

---

## 参考资料

- 源码: `vendor/cordis/src/events.ts`
- [docs/cordis-api/events.zh.md](../../../docs/cordis-api/events.zh.md)
- [docs/cordis-primer.zh.md#Cordis Waterfall 语义](../../../docs/cordis-primer.zh.md)
