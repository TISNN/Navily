# Navily

一个现代化的个人仪表板应用，集成了 AI 对话、书签管理、待办事项、笔记等功能，支持完全自定义的拖拽式布局。

## ✨ 功能特性

### 🎯 核心功能

- **📱 可拖拽模块系统** - 三列布局（左、中、右），所有模块可自由拖拽排列
- **🤖 AI 对话助手** - 支持多个 AI 模型，包括 GPT、Deepseek 等系列
- **🔖 智能书签管理** - 分类管理、收藏标记、搜索过滤、网格/列表视图
- **✅ 待办事项** - 简洁的任务管理，支持完成状态切换
- **📝 每日笔记** - Markdown 格式的笔记记录
- **⏱️ 焦点计时器** - 番茄钟工作法，提升专注力
- **🌤️ 天气显示** - 基于当前位置的实时天气信息
- **💾 数据持久化** - 所有数据本地存储，支持导入/导出

### 🎨 界面特色

- **深色主题** - 护眼的深色界面设计
- **响应式布局** - 适配不同屏幕尺寸
- **流畅动画** - 优雅的过渡效果和交互反馈
- **模块化设计** - 每个功能都是独立模块，可自由组合

## 🚀 快速开始

### 环境要求

- Node.js 16+ 
- npm 或 yarn

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/TISNN/Navily.git
   cd Navily
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问应用**
   
   打开浏览器访问 `http://localhost:3000`

### 构建生产版本

```bash
npm run build
npm run preview
```

## 🤖 AI 功能配置

Navily 集成了 AI 对话功能，支持多个模型：

### 支持的模型

**Premium 级别**（每日 5 次）
- GPT-5.1
- GPT-5
- GPT-4o
- GPT-4.1

**Standard 级别**（每日 30 次）
- Deepseek-R1
- Deepseek-V3
- Deepseek-V3-2-Exp

**Basic 级别**（每日 200 次）
- GPT-4o-Mini
- GPT-3.5-Turbo
- GPT-4.1-Mini
- GPT-4.1-Nano
- GPT-5-Mini
- GPT-5-Nano

### API 配置

应用默认使用 ChatAnywhere API（`https://api.chatanywhere.tech`），已内置免费 API Key。

如需使用自己的 API Key，可以在 AI 聊天模块的设置中配置。

## 📦 项目结构

```
Navily/
├── components/          # React 组件
│   ├── AIChat.tsx      # AI 对话组件
│   ├── BookmarksModule.tsx  # 书签模块
│   ├── DailyNotes.tsx  # 笔记组件
│   ├── FocusTimer.tsx  # 计时器组件
│   ├── WelcomeWidget.tsx    # 欢迎/天气组件
│   └── ...
├── services/           # 服务层
│   ├── aiService.ts    # AI 服务
│   ├── storageService.ts    # 存储服务
│   └── ...
├── types.ts            # TypeScript 类型定义
├── App.tsx             # 主应用组件
└── vite.config.ts      # Vite 配置
```

## 🎯 使用指南

### 模块拖拽

- **拖拽模块**：将鼠标悬停在模块左上角，出现拖拽图标后即可拖拽
- **调整布局**：模块可以在左、中、右三列之间自由移动
- **重新排序**：在同一列内拖拽模块可以调整显示顺序
- **布局保存**：所有布局调整会自动保存到本地存储

### 书签管理

- **添加书签**：点击右上角 "+" 按钮
- **分类管理**：支持 Work、Study、Life、Custom 等分类
- **收藏标记**：点击书签的星标图标标记为收藏
- **搜索过滤**：使用顶部搜索框快速查找书签
- **视图切换**：支持网格视图和列表视图

### AI 对话

- **选择模型**：在输入框上方选择要使用的 AI 模型
- **查看使用量**：显示当前模型的剩余使用次数
- **对话历史**：所有对话记录保存在本地

### 数据管理

- **导出数据**：设置菜单 → Export Data（导出为 JSON）
- **导入数据**：设置菜单 → Import Data（从 JSON 文件恢复）

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite
- **拖拽功能**: @dnd-kit
- **图标库**: Lucide React
- **样式**: Tailwind CSS（内联样式）

## 📄 许可证

本项目采用 MIT 许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- GitHub: [@TISNN](https://github.com/TISNN)
- 项目地址: https://github.com/TISNN/Navily

---

**Navily** - 你的个人工作空间，由你完全掌控 🚀
