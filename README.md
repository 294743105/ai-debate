# AI辩论应用

这是一个基于Next.js和OpenAI API的人工智能辩论应用。它允许您设置两个AI模型进行辩论，一方支持，一方反对您设定的辩题。

## 功能特点

- 支持自定义模型名称（用于界面显示）
- 支持自定义模型ID（用于API调用）
- 支持自定义API端点（便于使用不同的服务提供商）
- 支持自定义API密钥
- 自动轮流发言机制，正方先发言，然后反方回应
- 友好的UI界面，清晰区分正反双方

## 开始使用

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

1. 在页面上方配置正方和反方的模型参数
   - 模型名称（显示用）
   - 模型ID（API调用用，例如：gpt-3.5-turbo, gpt-4等）
   - API端点（例如：https://api.openai.com/v1）
   - API密钥

2. 在输入框中输入辩论主题

3. 点击"开始辩论"按钮，系统会自动让正方模型先发言

4. 点击"下一回合"按钮继续辩论，让反方回应

5. 您可以随时点击"暂停辩论"或"清空辩论"来控制辩论进程

## 技术栈

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OpenAI API](https://openai.com/)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
