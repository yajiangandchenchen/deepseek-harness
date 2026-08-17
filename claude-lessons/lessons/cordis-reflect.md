# Reflect 反射层

> 返回 [技能树](../../index.html) | 源码位置: `vendor/cordis/src/reflect.ts`

---

## 一句话总结

ReflectService 是 **Proxy handler 的实现者**——它支撑了 `ctx.foo` 属性访问、服务查找、隔离作用域路由和方法 mixin。

---

## 读流程（get trap）

当你访问 `ctx.sessions` 时：

```
1. 特殊属性（symbol、prototype、then、数字字符串、_开头）
   → 直接 Reflect.get（不做拦截）

2. 自有属性（ctx 自身的方法）
   → 返回 traceable 包装

3. 否则走 internal/get waterfall
   → 沿 Fiber 链向上查找 store[name]
   → 同时检查隔离标签是否匹配
```

---

## provide（服务注册）

注册服务时：
1. 分配一个隔离 Symbol 作为 key
2. 写入 `store[key]`
3. 注销时通过 `notify(names)` 唤醒所有依赖方重新计算 epoch

---

## mixin（方法暴露）

将服务方法暴露到 ctx 自身：

```typescript
this.mixin('events', ['on', 'once', 'emit', 'bail', 'waterfall'])
// 效果: ctx.on(...) 等价于 ctx.events.on(...)
```

这让 API 更简洁——不需要每次都写 `ctx.events.emit()`，直接 `ctx.emit()` 就行。

---

## 隔离作用域路由

Reflect 内部维护了隔离字典，确保：
- 不同隔离标签下的插件看到不同的服务实现
- 事件分发时只投递给匹配的 listener

---

## 类比理解

Reflect 像**公司前台的智能接线系统**：
- 你问「我要找 sessions 部门」→ 前台查分机表
- 如果这个部门有隔离（比如「仅限研发部」），前台会检查你的工牌
- mixin = 常用号码设快捷键（拨 1 直通人事，不用拨全号）

---

## 相关知识点

- [Context 上下文](viewer.html?file=cordis-context.md) — Reflect 服务的容器
- [Service 服务基类](viewer.html?file=cordis-service.md) — Reflect 管理的服务实例
- [声明合并](viewer.html?file=cordis-declaration-merging.md) — 让 Reflect 有类型安全

---

## 参考资料

- 源码: `vendor/cordis/src/reflect.ts`
