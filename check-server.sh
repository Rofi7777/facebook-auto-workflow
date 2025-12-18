#!/bin/bash

echo "🔍 检查 Googa AI Hub 服务器状态..."
echo ""

# 检查服务器是否运行
if lsof -i :5000 > /dev/null 2>&1; then
    echo "✅ 服务器正在运行 (端口 5000)"
    PID=$(lsof -ti :5000)
    echo "   PID: $PID"
else
    echo "❌ 服务器未运行"
    echo ""
    echo "请运行以下命令启动服务器："
    echo "  cd /Users/rofi/Desktop/App/GooGa-Ai-Hub"
    echo "  npm start"
    echo "  或"
    echo "  node api/index.js"
    exit 1
fi

echo ""
echo "📁 检查文件结构..."

# 检查关键文件
files=(
    "public/css/reset.css"
    "public/css/variables.css"
    "public/css/layout.css"
    "public/css/components.css"
    "public/css/pages.css"
    "public/js/core/state.js"
    "public/js/core/router.js"
    "public/js/core/app.js"
    "public/index.html"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (未找到)"
        all_exist=false
    fi
done

echo ""
if [ "$all_exist" = true ]; then
    echo "✅ 所有关键文件都存在"
else
    echo "❌ 部分文件缺失"
fi

echo ""
echo "🌐 测试服务器响应..."

# 测试服务器响应
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ 服务器响应正常"
    echo ""
    echo "访问应用: http://localhost:5000"
    echo "诊断工具: http://localhost:5000/debug-check.html"
else
    echo "❌ 服务器无响应"
    echo "   请检查服务器日志"
fi

