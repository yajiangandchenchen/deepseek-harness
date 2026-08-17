# 文件系统能力 Seam

> 返回 [技能树](../../index.html) | 源码位置: `packages/fs/`

---

## 一句话总结

文件系统能力通过**事件驱动的 waterfall**实现写入策略控制，支持乐观并发控制（版本守卫），是安全策略的典范。

---

## 包结构

| 包 | 角色 | 说明 |
|----|------|------|
| `dsh-fs` | Service Definition | `FileSystem` 抽象类 |
| `dsh-fs-local` | Provider | 本地文件系统实现 |
| `dsh-fs-sandbox` | Provider | 沙箱文件系统 |
| `dsh-tool-fs` | Consumer | 面向模型的文件工具 |
| `dsh-tool-str-replace-editor` | Consumer | 字符串替换编辑器 |

---

## Service Definition

```typescript
export abstract class FileSystem extends Service {
  abstract resolve(path: string): Promise<FsTarget>
  abstract readText(target: FsTarget): Promise<string>
  abstract writeText(target: FsTarget, content: string, expected?: FsWriteIntent): Promise<FsWriteOutcome>
  abstract editText(target: FsTarget, edit: FsEditRequest): Promise<FsEditOutcome>
}
```

---

## 事件驱动扩展

### Waterfall 事件（拦截决策）

```typescript
// 写入前的决策——可以拒绝或修改写入意图
'fs/write-intent'(target: FsTarget, actor: object | undefined, next: () => FsWriteIntent | undefined): Promise<FsWriteIntent | undefined>

// 编辑前的决策——版本守卫
'fs/edit-intent'(target: FsTarget, actor: object | undefined, next: () => { version: FsVersion } | undefined): Promise<{ version: FsVersion } | undefined>
```

### Emit 事件（观察记录）

```typescript
// 观察文件操作——用于审计、日志
'fs/observed'(target: FsTarget, observation: FsObservation, actor: object | undefined): void
```

---

## 乐观并发控制

使用 `FsVersion` 不透明令牌实现版本守卫：

```typescript
// 写入时检查版本——防止并发修改冲突
writeText(target, content, {
  replaceIfVersion: expectedVersion  // 只有版本匹配时才写入
})

// 创建时检查不存在
writeText(target, content, {
  createIfAbsent: true  // 只有文件不存在时才创建
})
```

---

## 类比理解

文件系统 Seam 像**银行保险箱系统**：
- Service Definition = 保险箱操作规范（存、取、查）
- Provider = 不同银行的保险箱（本地银行、云端银行）
- Waterfall 事件 = 存取款审批流程（可以拒绝可疑操作）
- 乐观并发控制 = 版本号防止双人同时修改同一份文件

---

## 相关知识点

- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 通用的 Seam 模式
- [事件系统](viewer.html?file=cordis-events.md) — waterfall 和 emit 的区别
- [Shell 能力](viewer.html?file=seam-shell.md) — 另一个单例 Seam

---

## 参考资料

- 源码: `packages/fs/`
- [docs/subsystems/filesystem.zh.md](../../../docs/subsystems/filesystem.zh.md)
