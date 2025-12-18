# 启动服务器指南

## 🚀 快速启动

### 方法1: 使用 npm start
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
npm start
```

### 方法2: 直接运行 Node.js
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
node api/index.js
```

### 方法3: 使用 nodemon (开发模式)
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
npx nodemon api/index.js
```

## ✅ 验证服务器运行

启动后，你应该看到：
```
📁 Public path: /Users/rofi/Desktop/App/GooGa-Ai-Hub/public
📁 Assets path: /Users/rofi/Desktop/App/GooGa-Ai-Hub/assets
✅ AI services initialized successfully
🚀 Server running on port 5000
```

## 🌐 访问应用

1. **主页**: http://localhost:5000
2. **诊断工具**: http://localhost:5000/debug-check.html
3. **测试静态文件**: http://localhost:5000/test-static

## 🔍 检查静态文件

访问以下URL验证文件是否可访问：
- http://localhost:5000/css/reset.css
- http://localhost:5000/css/variables.css
- http://localhost:5000/css/layout.css
- http://localhost:5000/js/core/state.js
- http://localhost:5000/js/core/router.js

如果这些URL返回404，说明静态文件服务配置有问题。

## 🐛 常见问题

### 问题1: 端口被占用
```bash
# 查找占用5000端口的进程
lsof -i :5000

# 杀死进程
kill -9 <PID>
```

### 问题2: 文件未找到
确保：
1. 服务器正在运行
2. 文件路径正确
3. 文件权限正确

### 问题3: 模块未加载
检查浏览器控制台，查看具体的404错误。

