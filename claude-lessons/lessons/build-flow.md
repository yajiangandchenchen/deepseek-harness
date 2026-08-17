# 构建流程

> 返回 [技能树](../../index.html) | 来源: [docs/development.zh.md](../../../docs/development.zh.md)

---

## 一句话总结

从源码到可运行产物经历三个阶段：**tsc 发射 JS → tsdown 打包 → Vite 构建前端**，Host 先于 Client 构建（因为 Client 依赖 Host 生成的类型产物）。

---

## 完整构建链路

```
pnpm run build
│
├── build:lib
│   ├── build:lib:host
│   │   ├── tsc -b tsconfig.host.json        → 编译 Node 端代码，输出到 lib/types/
│   │   └── tsdown (DSH_BUILD_FACE=host)     → 消费 lib/types/，运行 Typert，输出到 lib/
│   │
│   └── build:lib:client
│       ├── tsc -b tsconfig.client.json      → 编译浏览器端代码，输出到 lib/types/
│       └── tsdown (DSH_BUILD_FACE=client)   → 生成浏览器 bundle，输出到 lib/
│
└── build:web
    └── pnpm --filter @deepseek-ai/dsh-web-frontend run build  → Vite 构建前端
```

---

## 第一阶段: tsc 发射

```
tsc -b tsconfig.host.json
```

- 按 Project References 构建所有 Host 包
- 输出 `.js` 和 `.d.ts` 到 `lib/types/`
- 使用 `composite: true` + `incremental: true` 支持增量构建

---

## 第二阶段: tsdown 打包

**tsdown** 是 Vite 生态的打包工具（类似 Rolldown）。

### Host 模式

```
入口: lib/types/{index,invariant,startup}.js
输出: lib/index.js, lib/invariant.js, ...
插件: Typert（分析类型，生成反射产物和 Remote 投影）
```

### Client 模式

```
入口: 各包声明的浏览器入口
输出: 浏览器 bundle
Typert: 不运行
```

### Typert 是什么？

Typert 是项目的类型工具——它读取 TypeScript 类型信息，自动生成：
1. **反射产物**：让运行时也能知道类型信息
2. **Host-for-Client Remote 投影**：让 Client 能像本地调用一样调用 Host 的方法

---

## 第三阶段: Vite 构建前端

```
apps/web → Vite + React → dist/
```

通过 `resolve.alias` 将 workspace 包解析到源码（`src/`），让 CSS 走 Vite 管线。

---

## 产物结构

```
<package>/
├── src/           # 源码
├── lib/
│   ├── types/     # tsc 发射的 JS（中间产物）
│   ├── index.js   # tsdown 最终产物
│   └── *.d.ts     # 类型声明
└── dist/          # 前端包专用（apps/web）
```

---

## 为什么 Host 必须先构建？

因为 `api/remotes` 的 Client 入口会导入 Host tsdown 才会生成的 `/remote` 声明。如果 Host 没先构建，Client 找不到这些类型就会报错。

---

## 类比理解

构建流程像**汽车工厂**：
- tsc = 把设计图（源码）加工成零件（JS）
- tsdown = 把零件组装成引擎和底盘（bundle）
- Typert = 生产引擎的专用模具（只在 Host 阶段需要）
- Vite = 最终喷漆和内饰（前端美化）
- 必须先装引擎（Host），才能装仪表盘连线（Client）

---

## 相关知识点

- [TypeScript 项目布局](viewer.html?file=tsconfig-layout.md) — 双 aggregate 架构
- [Profile/Bundle/Preset](viewer.html?file=profile-bundle-preset.md) — 构建产物的配置方式
- [架构总览](viewer.html?file=architecture-overview.md) — 构建结果如何运行

---

## 参考资料

- [docs/development.zh.md#TypeScript 项目布局](../../../docs/development.zh.md)
- 根目录 `package.json` 的 scripts 字段
- `tsdown.config.ts`
