# Cover Letter Studio

AI-powered cover letter generator with 4-step workflow.

## 部署到 Vercel

### 方式一：GitHub 一键部署（推荐）

1. **创建 GitHub 仓库**
   - 登录 GitHub
   - 创建新仓库（如 `cover-letter-studio`）
   - 上传以下文件：
     - `index.html`
     - `api/generate.js`
     - `vercel.json`

2. **在 Vercel 部署**
   - 登录 [Vercel](https://vercel.com)
   - 点击 "Add New..." → "Project"
   - 选择刚创建的 GitHub 仓库
   - 点击 "Deploy"

3. **配置环境变量（关键步骤）**
   - 部署完成后，进入项目 Dashboard
   - 点击 "Settings" → "Environment Variables"
   - 添加变量：
     - **Name**: `MINIMAX_API_KEY`
     - **Value**: 你的 MiniMax API Key（从 https://platform.minimax.io 获取）
   - 点击 "Save"
   - 进入 "Deployments"，点击最新部署旁的 "..." → "Redeploy" 重新部署

### 方式二：Vercel CLI 部署

```bash
npm i -g vercel
vercel login
vercel
```

按照提示操作，同样需要配置环境变量。

## 使用方法

1. 打开部署后的网站
2. 在 Step 0 输入：
   - Job Description（职位描述）
   - Experience Document（工作经历）
   - Resume（简历）
3. 点击 "Next: Strategy" 进入 Step 1
4. 点击 "Generate with AI" 生成动机点和价值主张
5. 进入 Step 2，点击 "Generate with AI" 生成求职信
6. 进入 Step 3 查看诊断反馈
7. 进入 Step 4 导出最终版本

## 功能特点

- 🤖 AI 生成：使用 MiniMax API 生成专业求职信
- 📝 4 步流程：输入准备 → 战略对齐 → 草稿检查 → 诊断审查
- 🌍 双语支持：英文求职信 + 中文翻译
- 📊 匹配度分析：JD 关键词覆盖、硬技能证据、文化信号
- 📋 导出功能：支持 TXT/HTML/Markdown 格式
- 💾 本地存储：数据保存在浏览器localStorage

## 环境变量说明

| 变量名 | 必填 | 说明 |
|--------|------|------|
| MINIMAX_API_KEY | 是 | MiniMax API Key，从 platform.minimax.io 获取 |

## 获取 MiniMax API Key

1. 访问 https://platform.minimax.io
2. 注册/登录账号
3. 进入 "API Keys" 页面
4. 创建新的 API Key
5. 将 Key 复制到 Vercel 环境变量中

## 免费额度

MiniMax 提供免费额度，新用户通常有：
- 赠送 token 额度
- 免费模型调用

具体额度以 MiniMax 官方为准。

## 本地开发

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行
vercel dev
```

## 文件结构

```
cover-letter-studio/
├── index.html          # 前端页面
├── api/
│   └── generate.js    # Vercel Serverless Function
├── vercel.json         # Vercel 配置
└── README.md           # 说明文档
```

## 技术栈

- 前端：纯 HTML/CSS/JavaScript（无框架）
- 后端：Vercel Serverless Functions (Node.js)
- AI：MiniMax API (abab6.5s-chat 模型)
- 部署：Vercel

## 注意事项

- API Key 存储在 Vercel 环境变量中，不会暴露在客户端代码
- 前端调用 `/api/generate` 时，后端处理 API 请求
- 如果 API 调用失败，会自动回退到模板生成模式
