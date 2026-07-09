# AGENTS.md - AI-REP 角色建构库测验系统

## 项目概览
基于凯利个人建构心理学的智能化角色建构库测验系统（AI-REP），通过 DeepSeek LLM 驱动的对话式访谈，引导用户完成 REP 测验全流程。

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19 + TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **LLM**: DeepSeek-V4-Pro API (OpenAI 兼容格式)
- **Styling**: 全局主题变量，teal 色系

## 目录结构
```
src/
├── app/
│   ├── api/chat/route.ts     # LLM 对话 API (SSE 流式)
│   ├── interview/page.tsx     # 对话式访谈页面（核心）
│   ├── report/page.tsx        # 报告展示页面
│   ├── page.tsx               # 首页
│   ├── layout.tsx             # 根布局
│   └── globals.css            # 全局样式 + 主题变量
├── components/ui/             # shadcn/ui 组件
├── hooks/
│   └── use-chat.ts            # 对话 Hook (SSE 流式消费)
├── lib/
│   ├── deepseek.ts            # DeepSeek API 客户端
│   ├── prompts.ts             # Prompt 配置（7大模块）
│   ├── session.ts             # 会话数据类型定义
│   ├── roles-data.json        # 中国本土高频角色关系库 (87角色)
│   └── utils.ts               # 工具函数
└── server.ts                  # 自定义服务端入口
```

## 核心流程
1. **人口学信息采集** (demographics) - 自然对话采集年龄/性别/职业等
2. **角色提名** (role_nomination) - 匹配角色库，用户填写20-30个人名
3. **三元比较** (triad_comparison) - 24组三元组比较，提取构念
4. **构念评分** (rating) - 1-7分矩阵评分
5. **报告生成** (report) - 可视化报告

## 环境变量
- `DEEPSEEK_API_KEY` - DeepSeek API 密钥
- `DEEPSEEK_BASE_URL` - API 基础 URL (默认 https://api.deepseek.com)
- `DEEPSEEK_MODEL` - 模型名称 (默认 deepseek-v4-pro)

## 页面设计
- **首页**: 深色主题，装饰性背景图案，渐变光晕，步骤卡片带悬浮动效
- **访谈页**: 深色主题，对话式界面，消息气泡带头像，阶段进度条，打字机光标效果，AI 消息使用 HTML 格式渲染
- **报告页**: 深色主题，专业报告样式，构念列表带序号渐变，分析总结带装饰光晕

## 开发命令
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm ts-check` - TypeScript 类型检查
- `pnpm lint` - ESLint 检查

## 关键设计决策
- LLM 调用使用 OpenAI SDK 直连 DeepSeek API（用户自有密钥）
- 对话使用 SSE 流式传输，前端通过 ReadableStream 消费
- 阶段切换通过 `[STAGE_CHANGE:xxx]` 标记实现
- 角色库数据直接嵌入 system prompt（非 RAG）
