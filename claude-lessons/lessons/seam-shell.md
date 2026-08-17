# Shell 能力 Seam

> 返回 [技能树](../../index.html) | 源码位置: `packages/shell/`

---

## 一句话总结

Shell 能力是 harness 中 **Seam 三角色分离的典范**——通过单例模式管理命令执行，切换执行环境只需替换 Provider。

---

## 包结构

| 包 | 角色 | 说明 |
|----|------|------|
| `dsh-shell` | Service Definition | 定义 `ShellExecutor` 抽象类 |
| `dsh-bash-local` | Provider | 本地 bash 执行器 |
| `dsh-bash-sandbox` | Provider | 沙箱 bash 执行器（继承 bash-local） |
| `dsh-tool-bash` | Consumer | 面向模型的 bash 工具 |

---

## Service Definition 接口

```typescript
// packages/shell/shell/src/index.ts
export abstract class ShellExecutor extends Service {
  // 把用户请求解析为可执行规格
  abstract resolve(request: ShellExecRequest): ShellExecSpec

  // 运行命令并返回结果
  abstract run(spec: ShellExecSpec): Promise<ShellRunResult>

  // 启动一个进程（用于交互式场景）
  abstract start(spec: ShellExecSpec): ShellProcess
}
```

---

## Provider 实现对比

### bash-local（本地执行）

```typescript
export class LocalBashExecutor extends ShellExecutor {
  static inject = ['subprocess']  // 声明依赖 ctx.subprocess

  async run(spec: ShellExecSpec) {
    return this.ctx.subprocess.spawn(spec.command, spec.args)
  }
}
```

### bash-sandbox（沙箱执行）

```typescript
export class SandboxBashExecutor extends LocalBashExecutor {
  static inject = ['sandbox']  // 额外依赖沙箱

  async run(spec: ShellExecSpec) {
    // 先包装命令，再调用父类的 run
    const confinedSpec = await this.ctx.sandbox.confine(spec)
    return super.run(confinedSpec)
  }
}
```

**关键**：SandboxBashExecutor 继承 LocalBashExecutor，只多了一步「沙箱包装」，其余逻辑复用。

---

## Consumer 使用

```typescript
// packages/shell/tool-bash/src/index.ts
export const inject = ['tools', 'shell', 'systemPrompt', 'shellEnv']

export function apply(ctx: Context) {
  ctx.tools.register('bash', {
    description: '在 shell 中执行命令',
    parameters: { command: { type: 'string' } },
    async execute(args) {
      // 通过 ctx.shell 访问服务，不关心具体是哪个 Provider
      const spec = ctx.shell.resolve(args)
      return ctx.shell.run(spec)
    }
  })
}
```

---

## 单例模式

每个 Context 只能有一个 Shell Provider：
- 第二个 Provider 加载时会抛出重复注册错误
- 通过 `ctx.shell` 直接访问

---

## 类比理解

像**一台电脑 + 可替换的操作系统**：
- Service Definition = 硬件接口标准（USB、HDMI）
- Provider = Windows / Linux / macOS
- Consumer = 应用程序（不关心底层是哪个 OS）
- 单例 = 一台电脑同时只能运行一个 OS

---

## 相关知识点

- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 通用的 Seam 模式
- [LLM 能力](viewer.html?file=seam-llm.md) — 注册表模式的对比
- [文件系统能力](viewer.html?file=seam-fs.md) — 另一个单例 Seam

---

## 参考资料

- 源码: `packages/shell/`
- [docs/subsystems/shell.zh.md](../../../docs/subsystems/shell.zh.md)
