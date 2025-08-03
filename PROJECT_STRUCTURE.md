# URL Editor 项目结构

## 项目概述

这是一个基于Vue3 + Vite6 + TailwindCSS的monorepo项目，实现了支持键盘快捷操作的URL编辑器。

## 目录结构

```
url-editor/
├── packages/
│   ├── core/           # 核心逻辑层
│   │   ├── src/
│   │   │   ├── types.ts           # 类型定义
│   │   │   ├── url-parser.ts      # URL解析器
│   │   │   ├── template-engine.ts # 模板引擎
│   │   │   ├── keyboard-manager.ts # 键盘管理器
│   │   │   ├── history-manager.ts # 历史记录管理器
│   │   │   └── index.ts           # 入口文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── shared/         # 共享工具
│   │   ├── src/
│   │   │   ├── utils.ts           # 工具函数
│   │   │   └── index.ts           # 入口文件
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/            # Web端应用
│       ├── src/
│       │   ├── components/
│       │   │   ├── URLEditor.vue  # 主编辑器组件
│       │   │   └── URLBlock.vue   # URL区块组件
│       │   ├── App.vue            # 根组件
│       │   ├── main.ts            # 应用入口
│       │   └── style.css          # 全局样式
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── tsconfig.json
│       └── tsconfig.node.json
├── package.json        # 根package.json
├── package.json        # 根package.json (bun workspace配置)
├── setup.sh           # 环境设置脚本
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md
```

## 核心功能模块

### 1. URL解析器 (url-parser.ts)
- 将URL分解为协议、域名、端口、路径、查询参数、锚点等区块
- 支持URL验证和重建
- 维护区块的位置信息

### 2. 模板引擎 (template-engine.ts)
- 预设模板：测试环境、生产环境、本地调试
- 支持变量替换：{domain}、{path}、{date}等
- 模板搜索和应用功能

### 3. 键盘管理器 (keyboard-manager.ts)
- 快捷键绑定和处理
- 区块间跳转：Tab/Shift+Tab
- 协议切换：Space
- 端口操作：↑/↓、Ctrl+↑/↓
- 路径操作：Ctrl+D、Enter
- 域名操作：Ctrl+←/→

### 4. 历史记录管理器 (history-manager.ts)
- URL编辑历史记录
- 本地存储
- 历史搜索功能

## 快捷键说明

| 快捷键 | 功能 |
|--------|------|
| Tab/Shift+Tab | 区块间跳转 |
| Space | 切换协议(http/https) |
| ↑/↓ | 端口号±1 |
| Ctrl+↑/Ctrl+↓ | 快速跳转常用端口 |
| Ctrl+D | 插入日期变量 |
| Enter | 插入斜杠/或& |
| Ctrl+←/Ctrl+→ | 子域名快速跳转 |
| F1~F3 | 应用预设模板 |
| Ctrl+C | 复制完整URL |
| Ctrl+V | 粘贴并自动解析URL |

## 开发指南

### 环境要求
- Node.js >= 18.0.0
- bun >= 1.0.0

### 快速开始
```bash
# 1. 运行环境设置脚本
./setup.sh

# 2. 启动开发服务器
bun run dev

# 3. 构建项目
bun run build
```

### 开发命令
```bash
# 安装依赖
bun install

# 启动开发服务器
bun run dev

# 构建所有包
bun run build

# 运行测试
bun run test

# 代码检查
bun run lint

# 清理构建文件
bun run clean
```

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 6
- **样式框架**: TailwindCSS
- **状态管理**: Pinia
- **包管理**: bun
- **开发语言**: TypeScript
- **项目结构**: Monorepo

## 设计理念

1. **模块化设计**: 核心逻辑与UI分离，便于复用
2. **键盘优先**: 支持全键盘操作，提高编辑效率
3. **区块化编辑**: 将URL分解为独立区块，便于精确编辑
4. **模板化转换**: 支持环境间快速切换
5. **历史记录**: 自动保存编辑历史，支持快速恢复 