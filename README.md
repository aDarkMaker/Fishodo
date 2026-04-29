<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="Fishodo" width="128" height="128" />
</p>

<h1 align="center">Fishodo — 摸鱼利器</h1>

<p align="center">
  一个轻量级、高可扩展的跨平台 TODO List 应用
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/license-GPLv3-green" alt="License" />
  <img src="https://img.shields.io/badge/rust-stable-orange" alt="Rust" />
</p>

---

## 核心理念

> **高效处理 TODO，是为了更好地摸鱼。**

Fishodo 不追求功能的大而全，而是专注于：

- **轻量** — 二进制体积 < 10MB，启动速度 < 1s
- **插件化** — 前后端双端可扩展，灵活满足个性化需求
- **高效** — 键盘优先的操作设计，让 TODO 管理行云流水
- **跨平台** — Windows & macOS 原生体验

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 桌面框架 | Tauri v2 | Rust 后端 + WebView 前端，极致轻量 |
| 前端框架 | React 19 + TypeScript | 企业级 UI 开发 |
| 构建工具 | Vite | 极快的 HMR 和构建速度 |
| 包管理 | Bun | 高性能 JS/TS 运行时与包管理 |
| 状态管理 | Zustand | 1KB 级状态管理 |
| UI 方案 | Tailwind CSS v4 + Radix UI | 原子化 CSS + 无样式组件 |
| 代码规范 | ESLint + Prettier | 统一代码风格 |
| 测试 | Vitest + Playwright | 单元测试 + E2E |

## 快速开始

### 环境要求

- **Bun** >= 1.x
- **Rust** >= 1.82
- **Node.js** >= 20（Playwright 等工具需要）

### 安装依赖

```bash
bun install
```

### 开发模式

```bash
# 仅启动前端
bun run dev

# 启动 Tauri 桌面应用（含热更新）
bun run tauri:dev
```

### 构建

```bash
bun run tauri:build
```

### 代码检查 & 格式化

```bash
bun run lint
bun run format
```

### 测试

```bash
bun run test        # 单元测试
bun run test:e2e    # E2E 测试
```

## 项目结构

```
Fishodo/
├── src/                    # React 前端
│   ├── components/         # 通用 UI 组件
│   ├── features/           # 功能模块
│   ├── hooks/              # 全局 Hooks
│   ├── lib/                # 工具库
│   ├── stores/             # 全局状态
│   └── styles/             # 全局样式
├── src-tauri/              # Tauri Rust 后端
│   └── src/
│       ├── commands/       # Tauri 命令
│       └── db/             # 数据库层
├── plugins/                # 插件目录
├── tests/                  # 测试
└── .github/workflows/      # CI/CD
```

## 许可证

本项目使用 [GNU General Public License v3](LICENSE)。

---

<p align="center">Made with ❤️ for better 摸鱼</p>
