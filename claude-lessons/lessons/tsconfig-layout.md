# TypeScript 项目布局

> 返回 [技能树](../../index.html) | 来源: [docs/development.zh.md](../../../docs/development.zh.md)

---

## 一句话总结

整个仓库被拆成 **Host**（Node 端）和 **Client**（浏览器端）两个独立的编译单元，用 TypeScript 的 Project Reference 机制管理，避免两侧的声明合并互相冲突。

---

## 为什么要拆分？

因为 Cordis 的插件系统用 **声明合并** 扩展 `Context` 接口：

```typescript
// Host 侧: 注册的是 Node 端的服务
interface Context {
  sessions: NodeSessionService;
  fs: NodeFileSystem;
}

// Client 侧: 注册的是浏览器端的服务
interface Context {
  sessions: ClientSessionService;
  fs: ClientFileSystem;
}
```

如果放在**同一个** TypeScript Program 里，编译器会尝试把两份声明合并 → 同一个键 `sessions` 对应不同类型 → **冲突报错**。

拆成两个 Program 后，各自编译各自的，互不干扰。

---

## 五个 tsconfig 文件

| 文件 | 角色 | 编译代码？ |
|------|------|-----------|
| `tsconfig.json` | 最顶层 solution 根，引用两个 aggregate | ❌ 只做引用 |
| `tsconfig.host.json` | Node 端代码（服务端、CLI） | ✅ 是独立 program |
| `tsconfig.client.json` | 浏览器端代码（前端 UI） | ✅ 是独立 program |
| `tsconfig.base.json` | 共享 compilerOptions 和 paths 映射 | ❌ 纯配置，不编译 |
| `tsconfig.base.client.json` | 浏览器编译选项（JSX、DOM 类型等） | ❌ 纯配置 |

### 类比理解

想象一个**双语学校**：
- `tsconfig.base.json` = 学校规章制度（通用，不区分学部）
- `tsconfig.host.json` = 中文部的课程表
- `tsconfig.client.json` = 英文部的课程表
- `tsconfig.json` = 校长办公室，知道两个学部在哪但不亲自上课

---

## 三条纪律

### 纪律 1: base 永远不加 `include` / `files`

**原因**: base 被所有包继承，如果在 base 里写了 `include: ["src"]`，所有包就只编译 `src/`，其他目录（如 `tests/`）会被漏掉。

**类比**: 员工手册不能写「所有人穿拖鞋」，否则财务部也得穿。

### 纪律 2: 全仓分析脚本以 host 或 client 为「种子」

**原因**: 构建整个仓库的类型图谱（`ts.Program`）时，如果选根 solution 为入口，会同时看到 Host 和 Client 两侧 → 声明合并冲突。

**类比**: 开会只能选一个会议室，不能把说中文和说英文的人塞进同一个房间。

### 纪律 3: 新包只登记进一个 aggregate

即使一个包会同时产出 Node 和浏览器两份产物，它也只登记在 Client 里，两份产物在 Client 阶段一起生成。

---

## 构建顺序

```
1. tsc -b tsconfig.host.json     → 编译 Node 端代码，输出到 lib/types/
2. tsdown (host)                  → 打包 Node 端 + 运行 Typert 生成类型反射
3. tsc -b tsconfig.client.json   → 编译浏览器端代码
4. tsdown (client)                → 打包浏览器端 bundle
5. pnpm run build:web            → Vite 构建前端应用
```

**为什么是这个顺序？** 因为 Client 可能依赖 Host 生成的类型产物（Typert Remote 投影），所以 Host 必须先构建完。

---

## 相关知识点

- [Seam 三角色概念](seam-concept.md) — 接口与实现分离的设计
- [构建流程](build-flow.md) — 从源码到可运行产物的完整链路
- [Profile/Bundle/Preset](profile-bundle-preset.md) — 三层配置体系

---

## 参考资料

- [docs/development.zh.md#TypeScript 项目布局](../../../docs/development.zh.md)
- [TypeScript Project References 官方文档](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript Declaration Merging 官方文档](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
