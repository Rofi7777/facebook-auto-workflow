#!/bin/bash
echo "🔧 修复 404 错误 - 快速修复脚本"
echo ""
echo "1. 停止旧服务器..."
pkill -f "http.server" 2>/dev/null
sleep 1
echo "✓ 完成"
echo ""
echo "2. 启动新服务器..."
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 2
echo "✓ 服务器已启动 (PID: $SERVER_PID)"
echo ""
echo "3. 测试服务器..."
curl -s http://localhost:8000/public/test-architecture.html > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 服务器运行正常"
else
    echo "⚠️  服务器可能还在启动中..."
fi
echo ""
echo "=========================================="
echo "✅ 修复完成！"
echo ""
echo "📝 请在浏览器访问："
echo "   http://localhost:8000/public/test-architecture.html"
echo ""
echo "⚠️  注意：URL 中需要包含 /public/ 路径"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "=========================================="
wait $SERVER_PID
