# Seam 三角色概念

> 返回 [技能树](../../index.html) | 来源: [docs/capability-seams.zh.md](../../../docs/capability-seams.zh.md)

---

## 一句话总结

**Seam（能力缝）** 是一种包含三种角色的**可替换能力**模式：Service Definition（声明接口）+ Service Provider（实现接口）+ Consumer（使用接口）。替换一个 Provider 就能改变整个产品的行为。

---

## 三角色详解

### 1. Service Definition（服务定义）

- **职责**：声明抽象接口、共享类型、事件词汇
- **位置**：独立包，如 `@deepseek-ai/dsh-shell`
- **特点**：
  - 定义抽象类（如 `ShellExecutor`）
  - 所有共享类型定义在这里
  - 通过 `declare module` 扩展 Context 接口
- **绝不是** TypeScript `interface`——它是一个 Cordis `Service` 抽象类

### 2. Service Provider（服务提供方）

- **职责**：实现抽象接口，提供具体能力
- **位置**：独立实现包，如 `@deepseek-ai/dsh-bash-local`
- **特点**：
  - 继承或实现 Service Definition 的抽象类
  - 通过 `apply()` 函数注册到 Context
  - **可替换、可组合**

### 3. Consumer（消费方）

- **职责**：使用服务，面向最终用户（模型或人类）
- **位置**：工具包，如 `@deepseek-ai/dsh-tool-bash`
- **特点**：
  - 通过 `ctx.xxx` 访问服务
  - **不依赖具体 Provider 实现**
  - 可以消费多个 Provider 的能力

---

## 典范示例: Shell 能力

```
packages/shell/
├── shell/           ← Service Definition (ShellExecutor 抽象类)
├── bash-local/      ← Provider (本地 bash 执行器)
├── bash-sandbox/    ← Provider (沙箱 bash 执行器, 继承 bash-local)
└── tool-bash/       ← Consumer (面向模型的 bash 工具)
```

**切换执行环境只需要换 Provider**：
- 用 `bash-local` → 直接在本地执行
- 用 `bash-sandbox` → 在沙箱中执行
- Consumer (`tool-bash`) 的代码**一行都不用改**

---

## 设计原则

### 依赖倒置

高层模块不依赖低层模块的具体实现——都依赖抽象接口。

### 开闭原则

- 对扩展开放：轻松添加新的 Provider
- 对修改封闭：添加新 Provider 无需修改 Consumer

### 单一职责

- Definition 只关心「是什么」（接口）
- Provider 只关心「怎么做」（实现）
- Consumer 只关心「用什么」（消费）

---

## 单例 vs 注册表

| 模式 | 代表 | 访问方式 | 重复注册 |
|------|------|----------|----------|
| 单例 | Shell, FS, Subprocess | `ctx.shell` | 抛出错误 |
| 注册表 | LLM, Web, Subagent | `ctx.llm.registerAdapter()` | 允许多个 |

---

## 类比理解

Seam 像**USB 接口标准**：
- **Service Definition** = USB 接口规范（尺寸、电压、协议）
- **Provider** = 具体设备（U盘、键盘、摄像头）
- **Consumer** = 电脑的 USB 端口
- 换一个设备（Provider），电脑（Consumer）不用改

---

## 相关知识点

- [Shell 能力](viewer.html?file=seam-shell.md) — 单例模式的 seam 示例
- [LLM 能力](viewer.html?file=seam-llm.md) — 注册表模式的 seam 示例
- [Service 服务基类](viewer.html?file=cordis-service.md) — Service Definition 的基类

---

## 参考资料

- [docs/capability-seams.zh.md](../../../docs/capability-seams.zh.md)
- 源码: `packages/shell/`, `packages/llm/`, `packages/fs/`
