# Service 服务基类

> 返回 [技能树](../../index.html) | 源码位置: `vendor/cordis/src/service.ts`

---

## 一句话总结

所有挂载到 `ctx` 上的命名 API 都应继承 `Service`。**构造即注册**——服务在构造函数中自动把自己挂到 Context 上，随 Fiber 卸载时自动注销。

---

## 核心结构

```typescript
import { Service } from '@deepseek-ai/cordis'

class Counter extends Service {
  constructor(ctx: Context, name: 'counter') {
    super(ctx, name)  // 这一行执行后，ctx.counter 就可用了
  }
}
```

### 构造函数做了什么？

1. 调用 `ctx.reflect.provide(name, this, check)` — 把 `this` 注册到 Context 的服务存储中
2. 如果类定义了 `[Service.invoke]`，则返回**可调用实例**（如 `ctx.logger('message')` 直接调用）
3. 服务随所属 Fiber 卸载自动从 Context 上移除

---

## 关键符号/属性

| 符号 | 作用 |
|------|------|
| `Service.init` | 实例构造后执行的初始化方法 |
| `Service.check` | 可用性谓词（返回 false 则依赖方无法加载） |
| `Service.invoke` | 使服务可调用的方法体（如 `ctx.logger(msg)`） |
| `Service.config` | 拦截配置的 phantom 类型参数（类型层面的配置约束） |
| `Service.resolveConfig(base?, head?)` | 合并祖先 intercept 配置 |

---

## 配置合并

`resolveConfig` 沿 `intercept` 原型链向上收集所有同名配置：

```
根级 intercept: { timeout: 30 }
  └── 子级 intercept: { retries: 3 }
        └── 最终合并: { timeout: 30, retries: 3 }
```

越靠近根的越先应用，最后用 `Config.merge`（若定义）或 `Object.assign` 合并。

---

## 类比理解

Service 就像**公司里的每个员工**：
- 入职（构造）时自动登记到花名册（Context）
- 有工牌（name）和岗位职责（invoke）
- 离职（Fiber 卸载）时自动从花名册移除
- 可以接受上级特别指令（intercept 配置）

---

## 相关知识点

- [Context 上下文](viewer.html?file=cordis-context.md) — Service 挂在哪个容器上
- [Fiber 生命周期](viewer.html?file=cordis-fiber.md) — Service 何时被创建和销毁
- [Seam 三角色概念](viewer.html?file=seam-concept.md) — Service 如何构成能力接口

---

## 参考资料

- 源码: `vendor/cordis/src/service.ts`
- [docs/cordis-api/service.zh.md](../../../docs/cordis-api/service.zh.md)
