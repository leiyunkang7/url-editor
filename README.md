# URL Editor - 智能URL编辑器

一个支持键盘快捷操作的现代化URL编辑器，实现区块化编辑、智能控件切换和模板化转换功能。

## ✨ 核心功能特性

### 🎯 区块化编辑系统
- **智能URL解析**: 自动将URL分解为独立区块：协议://域名:端口/路径?参数#锚点
- **焦点管理**: Tab/Shift+Tab 在区块间智能跳转，当前区块高亮显示
- **区块控件**: 每个区块触发专属操作，提升编辑效率

### 🎨 模板引擎
- **预设模板库**: 支持多环境快速切换
- **快捷操作**: F1~F5应用预设模板，一键切换环境
- **智能变量**: {domain}自动提取当前域名，{path}保留原路径

### ⌨️ 高级交互体验
- **动态校验**: 输入端口时非数字键自动过滤
- **历史记忆**: Ctrl+H 显示近期编辑的URL记录
- **锚点导航**: #后按Tab快速生成页面锚点

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- bun >= 1.0.0

### 安装和运行
```bash
# 1. 克隆项目
git clone <repository-url>
cd url-editor

# 2. 运行环境设置脚本
./setup.sh

# 3. 启动开发服务器
bun run dev
```

## ⌨️ 快捷键说明

| 快捷键 | 功能描述 |
|--------|----------|
| Tab/Shift+Tab | 区块间智能跳转 |
| Space | 切换协议(http/https) |
| ↑/↓ | 端口号±1快速调整 |
| Ctrl+↑/Ctrl+↓ | 快速跳转常用端口(80,443,3000,8080) |
| Ctrl+D | 插入当前日期变量 |
| Enter | 智能插入斜杠/或&符号 |
| Ctrl+←/Ctrl+→ | 子域名快速跳转 |
| F1~F3 | 应用预设环境模板 |
| Ctrl+C | 复制完整URL到剪贴板 |
| Ctrl+V | 粘贴并自动解析URL结构 |

## 🏗️ 技术架构

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 6
- **样式框架**: TailwindCSS
- **状态管理**: Pinia
- **包管理**: bun
- **开发语言**: TypeScript
- **项目结构**: Monorepo

## 📁 项目结构

```
url-editor/
├── packages/
│   ├── core/           # 核心逻辑层
│   │   ├── src/
│   │   │   ├── url-parser.ts      # URL解析器
│   │   │   ├── keyboard-manager.ts # 键盘管理器
│   │   │   ├── template-engine.ts  # 模板引擎
│   │   │   ├── history-manager.ts  # 历史记录管理
│   │   │   └── types.ts           # 类型定义
│   ├── shared/         # 共享工具库
│   │   └── src/
│   │       └── utils.ts           # 通用工具函数
│   └── web/            # Web端应用
│       ├── src/
│       │   ├── components/        # Vue组件
│       │   │   ├── URLEditor.vue  # 主编辑器组件
│       │   │   └── URLBlock.vue   # URL区块组件
│       │   └── App.vue            # 根组件
├── setup.sh           # 环境设置脚本
└── README.md
```

详细的项目结构请查看 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## 🎯 设计理念

1. **模块化设计**: 核心逻辑与UI分离，便于复用和测试
2. **键盘优先**: 支持全键盘操作，提高编辑效率
3. **区块化编辑**: 将URL分解为独立区块，便于精确编辑
4. **模板化转换**: 支持环境间快速切换，提升开发效率
5. **历史记录**: 自动保存编辑历史，支持快速恢复

## 📖 文档

- [项目结构](./PROJECT_STRUCTURE.md) - 详细的项目架构说明
- [功能演示](./DEMO.md) - 功能演示和使用示例

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🆕 更新日志

### v1.0.0 (2025-01-08)
- ✨ 初始版本发布
- 🎯 实现区块化URL编辑
- ⌨️ 支持键盘快捷键操作
- 🎨 集成模板引擎
- 📝 完善项目文档 