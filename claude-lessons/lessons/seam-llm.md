# LLM 能力 Seam

> 返回 [技能树](../../index.html) | 源码位置: `packages/llm/`

---

## 一句话总结

LLM 能力是 harness 中**注册表模式**的 Seam 典范——多个适配器（DeepSeek、Pi-AI、Replay）可以同时共存，通过 provider route 选择使用哪个。

---

## 包结构

| 包 | 角色 | 说明 |
|----|------|------|
| `dsh-llm` | Service Definition + Consumer | `LlmRuntime` 服务 + `LlmAdapter` 抽象类 |
| `dsh-llm-deepseek` | Provider | DeepSeek 官方 API 适配器 |
| `dsh-llm-pi-ai` | Provider | pi-ai 库适配器 |
| `dsh-llm-replay` | Provider | 回放测试适配器（用于测试） |

---

## Service Definition

```typescript
export class LlmRuntime extends Service {
  // 注册一个适配器，绑定到多个 provider route
  registerAdapter(
    providers: string[],
    adapter: LlmAdapter
  ): AdapterRegistrationHandle

  // 流式生成
  stream(options: GenerateOptions): AsyncIterable<StreamChunk>
}

export abstract class LlmAdapter {
  abstract stream(options: GenerateOptions): AsyncIterable<StreamChunk>
  providerInfo(provider: string): LlmProviderInfo
  resolveModel(provider: string, model: string): Promise<LlmResolvedModelInfo>
}
```

---

## 注册表模式（与 Shell 单例的对比）

| | Shell | LLM |
|---|-------|-----|
| 模式 | 单例 | 注册表 |
| 同时存在 | 只能 1 个 Provider | 多个 Provider 共存 |
| 选择方式 | 配置决定 | `GenerateOptions.provider` 动态选择 |
| 重复注册 | 抛出错误 | 允许多个 |

---

## Provider 注册流程

```typescript
// dsh-llm-deepseek 的 apply 函数
export function apply(ctx: Context, config: DeepSeekConfig) {
  const adapter = new DeepSeekAdapter(config)
  ctx.llm.registerAdapter(
    ['deepseek-official', 'deepseek-chat'],  // provider routes
    adapter
  )
}
```

---

## Waterfall 事件: llm/stream

```typescript
// 拦截和修改 LLM 流
ctx.on('llm/stream', async (options, stream, next) => {
  const result = await next()
  // 可以在这里实现重试、回放、路由等
  return result
})
```

---

## 类比理解

LLM 的注册表模式像**一个翻译公司**：
- Service Definition = 翻译服务标准（接稿、交稿、质保）
- Provider = 各个译员（英语译员、日语译员、法律专业译员）
- Consumer = 客户（通过 `provider` 参数选择译员）
- 多个译员可以同时存在，按需选择

---

## 相关知识点

- [Seam 三角色概念](viewer.html?file=seam-concept.md) — 通用的 Seam 模式
- [Shell 能力](viewer.html?file=seam-shell.md) — 单例模式的对比
- [事件系统](viewer.html?file=cordis-events.md) — llm/stream waterfall

---

## 参考资料

- 源码: `packages/llm/`
- [docs/subsystems/llm-streaming.zh.md](../../../docs/subsystems/llm-streaming.zh.md)
