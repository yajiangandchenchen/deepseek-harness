# Profile / Bundle / Preset 三层配置体系

> 返回 [技能树](../../index.html) | 来源: [docs/architecture.zh.md](../../../docs/architecture.zh.md)

---

## 一句话总结

Profile（配置）列出要加载的 Bundle（组合包），Bundle 提供具体的插件配置，Preset 定义单个 Agent 的工具和提示词——三层叠加形成最终的插件树。

---

## 三层关系

```
Profile（配置文件）
  ├── bundles: [dsh-base, dsh-web-app]  ← 组合包列表
  ├── cordis.patch.yml                  ← 用户 patch
  └── package.json                      ← 树外插件依赖

Bundle（组合包）
  └── cordis.patch.yml                  ← 按 id 插入/覆盖配置行

Preset（agent 组装）
  └── agent.cordis.yml                  ← 单个 agent 的工具/提示词
```

---

## Profile（配置文件）

**位置**：`$DSH_HOME/profiles/<name>/`

**内置模板**：`web`、`headless` 随发行版交付。

**组成**：
- `package.json`：声明 `dsh.profile.bundles` 列表
- `cordis.yml`：空根配置（仅 `[]`）
- `cordis.patch.yml`：用户 patch 层

### 加载顺序（从底到顶）

```
1. 空根 []
2. dsh.profile.bundles 中各组合包的 patch（按顺序）
3. profile 自身的 cordis.patch.yml
4. home 级的 $DSH_HOME/cordis.patch.yml
5. --patch 指定的覆盖层
```

---

## Bundle（组合包）

**本质**：npm 包，在 `package.json` 中声明 `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`。

### 内置组合包

| 包 | 职责 |
|----|------|
| `dsh-base` | 每个 profile 最先应用：模型适配器、工具、持久化、策略、settings、凭据、遥测、subagent |
| `dsh-web-app` | 浏览器表层：webserver、API 网关、workspace、浏览器插件名录 |
| `dsh-headless` | 一次性任务模式：编码 persona、code-runtime、headless-runner |

### Patch 语义

```yaml
# 插入新条目
- insert:
    id: my-plugin
    name: '@deepseek-ai/dsh-xxx'
    config: { key: value }

# 替换某行的整个 config（非深度合并！）
- id: existing-plugin
  config: { new: config }

# 禁用某行
- id: unwanted-plugin
  disabled: true
```

---

## Preset（Agent 组装）

**位置**：`apps/cli/config/agent-presets/`（系统内置）+ `$DSH_HOME/.agent-presets/`（用户）

**本质**：一个目录，其中放置 `agent.cordis.yml`，定义该 agent 的工具与提示词段落。

**信任模型**：
- `system`：随发行版交付，只读
- `user`：本地编写，等同于 shell 访问权限

---

## 配置树组合全过程

```
composeEntries:
  从空条目列表开始
    → 通过 include 的 applyEntryPatches 依次应用各层 patch
    → 保证组合、标志推导、配置 dump 与实际启动一致
```

---

## 类比理解

三层配置像**定制一台电脑**：
- Profile = 用途定位（游戏电脑？办公电脑？）
- Bundle = 预装软件包（显卡驱动、游戏平台）
- Preset = 某个具体软件的开发环境配置
- cordis.patch.yml = 用户自己装的小工具

---

## 相关知识点

- [构建流程](viewer.html?file=build-flow.md) — 如何把这些配置变成可运行产物
- [TypeScript 项目布局](viewer.html?file=tsconfig-layout.md) — 包的编译方式
- [架构总览](viewer.html?file=architecture-overview.md) — 配置体系在整体架构中的位置

---

## 参考资料

- [docs/architecture.zh.md#Profile 与组合包](../../../docs/architecture.zh.md)
- [docs/config-catalog.zh.md](../../../docs/config-catalog.zh.md)
- `packages/bundle/`
