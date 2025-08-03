#!/bin/bash

echo "🚀 设置URL编辑器开发环境..."

# 检查Node.js是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js"
    echo "推荐使用nvm安装Node.js:"
    echo "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "nvm install 18"
    echo "nvm use 18"
    exit 1
fi

echo "✅ Node.js已安装: $(node --version)"

# 检查pnpm是否已安装
if ! command -v pnpm &> /dev/null; then
    echo "📦 安装pnpm..."
    npm install -g pnpm
fi

echo "✅ pnpm已安装: $(pnpm --version)"

# 安装项目依赖
echo "📦 安装项目依赖..."
pnpm install

echo "✅ 依赖安装完成！"

echo ""
echo "🎉 环境设置完成！"
echo ""
echo "启动开发服务器:"
echo "pnpm dev"
echo ""
echo "构建项目:"
echo "pnpm build"
echo ""
echo "查看项目结构:"
echo "tree packages/" 