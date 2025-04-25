# Vercel部署说明

本项目已预先配置为在Vercel上轻松部署。下面是简单的部署步骤：

## 一键部署

[![部署到Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F294743105%2Fai-debate)

1. 点击上方按钮
2. 如果需要，使用GitHub账户登录Vercel
3. 允许Vercel访问您的GitHub仓库
4. Vercel将自动Fork该项目并部署

## 手动部署

如果您想手动部署：

1. 从GitHub仓库克隆或Fork该项目
2. 登录您的Vercel账户
3. 点击"New Project"
4. 导入您克隆的仓库
5. 无需修改任何配置，直接点击"Deploy"

## 自定义域名

部署完成后，您可以在项目设置中添加自定义域名：

1. 在Vercel仪表板中选择您的项目
2. 点击"Settings" > "Domains"
3. 添加您的自定义域名并按照说明设置DNS记录

## 环境变量

本应用不需要任何环境变量即可运行，因为API密钥是通过用户界面输入的并存储在浏览器的本地存储中。

## 注意事项

- 本应用在前端直接调用OpenAI API，请确保您的API密钥使用受到限制
- 为了生产环境安全，建议实现适当的用户认证和API密钥管理 