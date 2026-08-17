# Subagent 能力 Seam

> 返回 [技能树](../../index.html) | 源码位置: `packages/subagent/`

---

## 一句话总结

Subagent 能力展示了 Seam 模式的**极致多样性**——同一个接口背后可以有完全不同的实现：进程内 spawn、进程内 fork、ACP 协议、甚至 Claude Code 本身。

---

## 包结构

| 包 | 角色 | 说明 |
|----|------|------|
| `dsh-subagent` | Service Definition | `SubagentRuntime` 服务 + `SubagentProvider` 接口 |
| `dsh-subagent-spawn-in-process` | Provider | 进程内新建子 agent |
| `dsh-subagent-fork-in-process` | Provider | 进程内 fork 子 agent |
| `dsh-subagent-acp` | Provider | 通过 ACP 协议委派 |
| `dsh-subagent-claude-code` | Provider | 委派给 Claude Code |
| `dsh-subagent-codex` | Provider | 委派给 Codex |
| `dsh-tool-subagent` | Consumer | 面向模型的 subagent 工具 |

---

## Service Definition

```typescript
export interface SubagentProvider {
  readonly name: string
  readonly capabilities: SubagentCapabilities  // 声明支持的能力

  start(request: ResolvedSubagentStartRequest): Promise<SubagentRun>
  prepareContinuable?(request: ContinuableCreateRequest): Promise<ContinuableCreateSpec>
}

export class SubagentRuntime extends Service {
  registerProvider(provider: SubagentProvider): () => void
  start(name: string, request: SubagentStartRequest): Promise<SubagentRun>
  startContinuable(spec: ContinuableStartSpec): Promise<ContinuableStart>
}
```

---

## 能力声明

每个 Provider 声明其支持的能力：

```typescript
export const capabilities: SubagentCapabilities = {
  outputSchema: true,     // 支持结构化输出
  depthLimit: 3,          // 最大嵌套深度
  toolFilter: true,       // 支持工具过滤
  persona: true           // 支持自定义 persona
}
```

服务在启动前验证请求的能力是否被支持——**不支持就拒绝**。

---

## 一次性 vs 可延续

| | 一次性 (start) | 可延续 (startContinuable) |
|---|---------------|--------------------------|
| 生命周期 | 执行完就结束 | 可以继续对话 |
| 方法 | `start()` | `startContinuable()` |
| 判断 | 所有 Provider 都支持 | 需要实现 `prepareContinuable` |

---

## 类比理解

Subagent 像**外包任务管理系统**：
- Service Definition = 任务交付标准
- Provider = 不同的外包团队（内部团队、外部公司、个人顾问）
- Consumer = 项目经理（通过 `name` 选择外包团队）
- 能力声明 = 外包团队的资质证书
- 可延续 = 长期合作 vs 一次性外包

---

## 相关知识点

- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 通用的 Seam 模式
- [Agent Loop 循环](viewer.html?file=agent-loop.md) — subagent 如何驱动子循环
- [LLM 能力](viewer.html?file=seam-llm.md) — 注册表模式的另一个示例

---

## 参考资料

- 源码: `packages/subagent/`
- [docs/subsystems/subagent.zh.md](../../../docs/subsystems/subagent.zh.md)
