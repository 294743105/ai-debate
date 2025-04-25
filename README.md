# AI辩论应用

这是一个基于Next.js和OpenAI API的人工智能辩论应用。它允许您设置两个或四个AI模型进行辩论，支持1v1或2v2模式，每方根据您设定的辩题进行支持或反对。

## 功能特点
- 支持所有openai通用SDK大语言模型
- 支持1v1和2v2两种辩论模式
- 支持自定义模型名称（用于界面显示）
- 支持自定义模型ID（用于API调用）
- 支持自定义API端点（便于使用不同的服务提供商）
- 支持自定义API密钥
- 自动轮流发言机制，在2v2模式下正反交替：正1→反1→正2→反2→正1...
- 友好的UI界面，清晰区分正反双方
- 支持导出辩论记录为文本文件

## 一键部署到Vercel

[![部署到Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F294743105%2Fai-debate)

只需点击上方按钮，然后连接到您的GitHub账户，即可轻松部署此应用。

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 使用方法

1. 选择辩论模式：1v1或2v2

2. 配置模型参数（在2v2模式下需要配置四个模型）
   - 模型名称（显示用）
   - 模型ID（API调用用，例如：gpt-3.5-turbo, gpt-4等）
   - API端点（例如：https://api.openai.com/v1）
   - API密钥

3. 在输入框中输入辩论主题

4. 点击"开始辩论"按钮，系统会自动让正方模型先发言

5. 点击"下一回合"按钮继续辩论，让下一方回应

6. 您可以随时点击"停止辩论"或"清空"来控制辩论进程

7. 辩论结束后，可以点击"导出记录"按钮将辩论内容保存为文本文件

## 技术栈

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://openai.com/)

## 了解更多

要了解有关Next.js的更多信息，请查看以下资源:

- [Next.js文档](https://nextjs.org/docs) - 了解Next.js的功能和API
- [学习Next.js](https://nextjs.org/learn) - 一个交互式Next.js教程

## 许可证

MIT
