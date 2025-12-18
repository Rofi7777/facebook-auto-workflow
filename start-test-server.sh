#!/bin/bash

# 快速启动测试服务器脚本

echo "=========================================="
echo "Googa AI Hub - 测试服务器启动脚本"
echo "=========================================="
echo ""

# 检查当前目录
if [ ! -f "public/index.html" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    echo "   当前目录: $(pwd)"
    exit 1
fi

echo "📍 项目目录: $(pwd)"
echo ""

# 检查端口是否被占用
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  警告: 端口 8000 已被占用"
    echo "   正在尝试使用端口 8001..."
    PORT=8001
else
    PORT=8000
fi

echo "🚀 启动服务器在端口 $PORT..."
echo ""

# 尝试使用 Python
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器"
    echo ""
    echo "📝 测试页面地址:"
    echo "   - 基础架构测试: http://localhost:$PORT/test-architecture.html"
    echo "   - 集成测试:     http://localhost:$PORT/test-integration.html"
    echo "   - 主应用:        http://localhost:$PORT/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=========================================="
    echo ""
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 2 启动服务器"
    echo ""
    echo "📝 测试页面地址:"
    echo "   - 基础架构测试: http://localhost:$PORT/test-architecture.html"
    echo "   - 集成测试:     http://localhost:$PORT/test-integration.html"
    echo "   - 主应用:        http://localhost:$PORT/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=========================================="
    echo ""
    python -m SimpleHTTPServer $PORT
elif command -v php &> /dev/null; then
    echo "✅ 使用 PHP 启动服务器"
    echo ""
    echo "📝 测试页面地址:"
    echo "   - 基础架构测试: http://localhost:$PORT/test-architecture.html"
    echo "   - 集成测试:     http://localhost:$PORT/test-integration.html"
    echo "   - 主应用:        http://localhost:$PORT/index.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=========================================="
    echo ""
    php -S localhost:$PORT
else
    echo "❌ 错误: 未找到 Python 或 PHP"
    echo ""
    echo "请安装以下之一:"
    echo "  - Python 3: brew install python3"
    echo "  - PHP: brew install php"
    echo ""
    echo "或者手动启动服务器:"
    echo "  python3 -m http.server 8000"
    exit 1
fi


