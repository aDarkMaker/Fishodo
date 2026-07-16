<p align="center">
  <h1 align="center">Fishodo — 摸鱼利器</h1>
</p>

<p align="center">
  一个轻量级、高可扩展的跨平台 TODO List 应用
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/license-GPLv3-green" alt="License" />
  <img src="https://img.shields.io/badge/wails-v2.13-red" alt="Wails" />
  <img src="https://img.shields.io/badge/go-1.25-00ADD8" alt="Go" />
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
| 桌面框架 | Wails v2.13 | Go 后端 + WebView 前端 |
| 后端语言 | Go 1.25 | 高性能、跨平台编译 |
| 数据库 | SQLite | 嵌入式数据库，零配置 |
| 前端框架 | React 19 + TypeScript | UI 开发 |
| 构建工具 | Vite 7 | 极快的 HMR 和构建速度 |
| 包管理 | Bun | JS/TS 运行时与包管理 |

## 快速开始

### 环境要求

- **Go** >= 1.25
- **Wails CLI** >= 2.13
- **Bun** >= 1.x

### 安装依赖

```bash
go mod tidy
cd frontend && bun install
```

### 开发模式

```bash
wails dev
```

### 构建

```bash
wails build
```

## 项目结构

```
Fishodo/
├── main.go              # Wails 应用入口
├── app.go               # App 生命周期与方法绑定
├── wails.json           # Wails 配置
├── go.mod
├── internal/            # Go 业务逻辑（按包拆分）
├── frontend/            # React 前端
│   ├── src/
│   │   ├── App.tsx      # 根组件
│   │   ├── main.tsx     # 前端入口
│   │   └── style.css
│   └── wailsjs/         # Wails 自动生成的 JS 绑定
└── build/               # 构建产物（已 gitignore）
```

## 许可证

本项目使用 [GNU General Public License v3](LICENSE)。

---

<p align="center">Made with ❤️ for better 摸鱼</p>
