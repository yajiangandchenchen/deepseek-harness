# 声明合并 (Declaration Merging)

> 返回 [技能树](../../index.html) | 相关文档: [TypeScript 官方文档](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)

---

## 一句话总结

声明合并允许在**不同文件中多次声明同一个接口**，TypeScript 会自动把它们合并成一个。这是 Cordis 实现「一切皆可插件」类型安全的基石。

---

## 为什么需要声明合并？

### 场景 1：插件扩展共享接口

每个插件都想往 `Context` 上挂自己的服务：

```typescript
// 插件 A 在自己的文件里
declare module '@deepseek-ai/cordis' {
  interface Context {
    sessions: SessionService
  }
}

// 插件 B 在自己的文件里
declare module '@deepseek-ai/cordis' {
  interface Context {
    tools: ToolRegistry
  }
}

// 最终结果：ctx 上同时有 sessions 和 tools
```

### 场景 2：第三方库类型扩展

```typescript
// Express 原始定义
interface Request { body: any }

// 你的代码，不需要改 Express 源码
interface Request { user: { id: string } }

// 现在 req.user 不会报错
```

### 场景 3：模拟其他语言的「开放类」

C# 的 partial class、Ruby 的 open class 天然支持跨文件扩展。TypeScript 用声明合并达到同样效果。

---

## 声明合并 vs 类型断言

| | 声明合并 | 类型断言 (as) |
|---|---------|--------------|
| 类型安全 | ✅ 编译期检查 | ❌ 绕过类型检查 |
| 可维护性 | ✅ 集中定义 | ❌ 散落各处 |
| 运行时 | 零开销 | 零开销 |

---

## 在 Cordis 中的三种利用

### 1. Context 接口扩展

```typescript
declare module '@deepseek-ai/cordis' {
  interface Context {
    shell: ShellExecutor  // 让 ctx.shell 有类型
  }
}
```

### 2. Events 接口扩展

```typescript
interface Events {
  'app/ready'(message: string): void
}
// → ctx.emit('app/ready', ...) 获得完整类型推断
```

### 3. Intercept 接口扩展

```typescript
interface Intercept {
  logger: { name?: string; level?: number }
}
// → ctx.intercept('logger', config) 有类型约束
---

## 与「双 aggregate」的关系

声明合并的副作用：如果 Host 和 Client 两侧**在同一个 Program 里**合并 `Context` 接口，会冲突（同一个键对应不同服务类型）。

所以 harness 才需要拆成两个 aggregate——**让声明合并各自独立进行，互不干扰**。

→ 详见 [TypeScript 项目布局](viewer.html?file=tsconfig-layout.md)

---

## 类比理解

声明合并像**多人协作写一本百科全书**：
- 每个人写自己的章节（不同文件）
- 出版社（TypeScript 编译器）自动合并成一本完整的书
- 但如果两个人写了同一个章节且内容矛盾 → 冲突报错

---

## 相关知识点

- [TypeScript 项目布局](viewer.html?file=tsconfig-layout.md) — 为什么需要拆分 aggregate
- [Context 上下文](viewer.html?file=cordis-context.md) — 声明合并的实际应用场景
- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 接口扩展的设计模式

---

## 参考资料

- [TypeScript Declaration Merging 官方文档](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
- [TypeScript Module Augmentation 官方文档](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation)
