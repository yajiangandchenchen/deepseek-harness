# Fiber 生命周期

> 返回 [技能树](../../index.html) | 源码位置: `vendor/cordis/src/fiber.ts`

---

## 一句话总结

Fiber 是**单次插件调用的运行时实例**——管理依赖等待、配置校验、生命周期 effect 和清理。每次 `ctx.plugin()` 调用产生一个独立 Fiber。

---

## 状态机

```
PENDING → LOADING → ACTIVE → UNLOADING → DISPOSED
   ↓          ↓
 FAILED     FAILED
```

| 状态 | 含义 |
|------|------|
| `PENDING` | 等待依赖服务可用 |
| `LOADING` | 执行插件的 apply 回调 |
| `ACTIVE` | 加载完成，对外提供服务 |
| `UNLOADING` | 执行清理函数（disposers） |
| `DISPOSED` | 已销毁，uid 置 null |
| `FAILED` | 配置校验或启动报错 |

---

## Runtime 与 Fiber 的关系

- **Runtime**：同一插件的共享记录（按 callback 引用去重），包含该插件的所有 Fiber 列表
- **Fiber**：每次 `plugin()` 调用产生一个独立运行时实例

```
插件 A 的 Runtime
  ├── Fiber #1 (来自 ctx.plugin(A))
  ├── Fiber #2 (来自另一个 ctx.plugin(A))
  └── ...
```

---

## effect 系统

`fiber.effect(execute, label?)` 注册一个带清理的副作用：

```typescript
fiber.effect(async () => {
  const conn = await createConnection()
  return () => conn.close()  // ← 这个返回的函数就是 disposer
})
```

关键特性：
- 所有 disposer **逆序执行**（LIFO — 后注册的先清理）
- 支持异步 disposer
- 重复调用 disposer 是 no-op（幂等）

---

## epoch 机制

epoch = 各依赖 fiber uid 拼接的指纹。当依赖变化时：
1. epoch 变化 → 触发依赖方的 reload
2. 依赖方重新执行 apply → 收集新的 effect

这就是 Cordis 的**热更新（HMR）**基础。

---

## 创建/恢复事务

```
prepare() → setup (用户回调) → commit() → publish()
  发布顺序: sessions.enter → agents.enter → sessions.announce → agents.announce → agent/session-start
  回滚保障: 任何阶段失败都会反向拆除（逆序）
```

---

## 类比理解

Fiber 像**一个临时工的工作周期**：
- 等待上岗条件（PENDING）
- 开始干活（LOADING → ACTIVE）
- 离职时归还工具、清理工位（UNLOADING → DISPOSED）
- 公司倒闭（FAILED）

---

## 相关知识点

- [Context 上下文](viewer.html?file=cordis-context.md) — Fiber 属于哪个 Context
- [Service 服务基类](viewer.html?file=cordis-service.md) — Fiber 管理的服务实例
- [事件系统](viewer.html?file=cordis-events.md) — Fiber 卸载时触发的事件

---

## 参考资料

- 源码: `vendor/cordis/src/fiber.ts`
- [docs/cordis-api/fiber.zh.md](../../../docs/cordis-api/fiber.zh.md)
