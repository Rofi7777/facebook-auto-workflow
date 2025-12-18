#!/bin/bash

# Googa AI Hub - 完整服务器启动脚本
# 同时启动 Express API 服务器和静态文件服务器

echo "=========================================="
echo "Googa AI Hub - 服务器启动脚本"
echo "=========================================="
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "   请安装 Node.js: https://nodejs.org/"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
    echo ""
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "   某些功能可能无法正常工作"
    echo ""
fi

# 设置端口
API_PORT=${PORT:-5000}
STATIC_PORT=8000

# 检查端口是否被占用
if lsof -Pi :$API_PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  警告: 端口 $API_PORT 已被占用"
    echo "   请关闭占用该端口的程序或修改 PORT 环境变量"
    exit 1
fi

if lsof -Pi :$STATIC_PORT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  警告: 端口 $STATIC_PORT 已被占用"
    STATIC_PORT=8001
    echo "   使用端口 $STATIC_PORT 作为静态文件服务器"
fi

echo "🚀 启动服务器..."
echo ""
echo "📍 API 服务器: http://localhost:$API_PORT"
echo "📍 静态文件服务器: http://localhost:$STATIC_PORT"
echo ""
echo "📝 访问地址:"
echo "   - 主应用: http://localhost:$STATIC_PORT/public/index.html"
echo "   - 或: http://localhost:$API_PORT (Express 会提供静态文件)"
echo ""
echo "按 Ctrl+C 停止所有服务器"
echo "=========================================="
echo ""

# 设置环境变量
export PORT=$API_PORT
export NODE_ENV=development

# 启动 Express API 服务器（在后台）
echo "🔧 启动 Express API 服务器..."
node api/index.js > /tmp/googa-api.log 2>&1 &
API_PID=$!

# 等待 API 服务器启动
sleep 2

# 检查 API 服务器是否启动成功
if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ API 服务器启动失败"
    echo "   查看日志: cat /tmp/googa-api.log"
    exit 1
fi

echo "✅ API 服务器已启动 (PID: $API_PID)"
echo ""

# 启动静态文件服务器（在后台）
echo "📁 启动静态文件服务器..."
cd public
if command -v python3 &> /dev/null; then
    python3 -m http.server $STATIC_PORT > /tmp/googa-static.log 2>&1 &
    STATIC_PID=$!
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $STATIC_PORT > /tmp/googa-static.log 2>&1 &
    STATIC_PID=$!
else
    echo "⚠️  警告: 未找到 Python，跳过静态文件服务器"
    echo "   直接使用 Express 服务器提供静态文件"
    STATIC_PID=""
fi
cd ..

if [ ! -z "$STATIC_PID" ]; then
    echo "✅ 静态文件服务器已启动 (PID: $STATIC_PID)"
    echo ""
fi

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务器..."
    kill $API_PID 2>/dev/null
    if [ ! -z "$STATIC_PID" ]; then
        kill $STATIC_PID 2>/dev/null
    fi
    echo "✅ 服务器已停止"
    exit 0
}

# 捕获 Ctrl+C
trap cleanup INT TERM

# 等待
echo "✅ 所有服务器已启动！"
echo ""
echo "📊 查看日志:"
echo "   - API: tail -f /tmp/googa-api.log"
echo "   - Static: tail -f /tmp/googa-static.log"
echo ""
echo "等待中... (按 Ctrl+C 停止)"
echo ""

# 保持脚本运行
wait


