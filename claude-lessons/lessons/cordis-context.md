# Context 上下文容器

> 返回 [技能树](../../index.html) | 源码位置: `vendor/cordis/src/context.ts`

---

## 一句话总结

Context 是整个 Cordis 框架的**依赖容器**——它是一个 Proxy 对象，所有服务都挂在它上面（如 `ctx.sessions`、`ctx.tools`），插件通过它访问其他插件提供的服务。

---

## 核心概念

### 1. Context 是 Proxy

```typescript
const root = new Context()  // 构造时返回 Proxy(self)
```

当你访问 `ctx.sessions` 时，Proxy 会拦截这个读取操作，从内部的「服务注册表」里查找名为 `sessions` 的服务并返回。

### 2. 子上下文（extend）

```typescript
const child = root.extend({ name: 'my-scope' })
```

- 子上下文**原型继承**父级——父级有的服务，子级都能访问
- 子级自己注册的服务**不会污染**父级
- 类比：子作用域像「分公司」，能调用总公司的服务，但自己的决策不影响总公司

### 3. 隔离（isolate）

```typescript
ctx.isolate('shell', 'sandbox-label')
```

为某个服务创建**独立的实现空间**——不同隔离标签下的插件看到的 `ctx.shell` 可以是不同的实现。

### 4. 拦截（intercept）

```typescript
ctx.intercept('shell', { timeout: 30000 })
```

为下游插件**注入服务的配置**，类似中间件/装饰器模式。

### 5. 生命周期

Context 本身不直接销毁，资源回收靠其上的 **Fiber** 实现。

---

## Context 的内部结构

```
Context (Proxy)
  ├── isolate: Map<服务名, 隔离标签>    ← 作用域隔离
  ├── intercept: Map<服务名, 配置>      ← 配置拦截
  ├── reflect: ReflectService           ← Proxy handler 实现
  ├── registry: Registry                ← 插件注册表
  ├── events: Events                    ← 事件系统
  ├── logger: Logger                    ← 日志服务
  └── rootFiber: Fiber                  ← 根 Fiber (uid=0, state=ACTIVE)
```

---

## 类比理解

把 Context 想象成一个**公司大厅**：
- 你（插件）走进大厅，说「我要找 sessions 服务」→ 前台（Reflect）帮你查注册表
- 每个部门（子 Context）有自己的隔间，互不干扰
- 总经理办公室（intercept）可以给某些部门下达特殊规定

---

## 相关知识点

- [Service 服务基类](viewer.html?file=cordis-service.md) — 服务如何注册到 Context
- [Fiber 生命周期](viewer.html?file=cordis-fiber.md) — Context 如何管理插件的加载和卸载
- [Reflect 反射层](viewer.html?file=cordis-reflect.md) — Proxy 背后的实现机制

---

## 参考资料

- 源码: `vendor/cordis/src/context.ts`
- [docs/cordis-api/context.zh.md](../../../docs/cordis-api/context.zh.md)
