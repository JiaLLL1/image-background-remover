# SnapBackground

🖼️ 简单、快速、免费，无需下载安装即可移除图片背景

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange)

## 功能特性

- 📷 拖拽或点击上传图片
- 👀 实时预览原图
- 🎯 一键移除背景
- ⬇️ 下载透明背景 PNG
- 📱 响应式设计，支持移动端

## 技术栈

- **前端**: Next.js 15 (App Router)
- **部署**: Cloudflare Pages
- **AI API**: [Remove.bg](https://www.remove.bg/api)

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/JiaLLL1/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

从 [Remove.bg API](https://www.remove.bg/api) 获取 API Key，然后创建 `.env.local` 文件：

```bash
REMOVE_BG_API_KEY=your_api_key_here
```

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 部署到 Cloudflare Pages

```bash
npm run pages:deploy
```

## 限制

| 项目 | 限制 |
|------|------|
| 单文件大小 | 12MB |
| API 免费额度 | 50次/小时 |

## 项目结构

```
src/app/
├── api/
│   └── remove-background/
│       └── route.ts    # Remove.bg API 代理
├── globals.css         # 全局样式
├── layout.tsx          # 根布局
└── page.tsx            # 主页面
```

## License

MIT
