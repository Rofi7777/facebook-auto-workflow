# 🔧 后端服务器设置指南

## 问题说明

当前错误：
- **501 Unsupported method ('POST')** - 后端 API 未运行
- **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"** - API 返回 HTML 而不是 JSON

**原因**: 你使用的是 Python 的简单 HTTP 服务器（`python3 -m http.server`），它只提供静态文件，不支持 POST 请求和 API 路由。

## 解决方案

### 方案 1: 使用 Express 服务器（推荐）

Express 服务器可以同时提供：
1. API 路由（`/api/*`）
2. 静态文件（`/public/*`）

#### 启动步骤：

```bash
# 1. 进入项目目录
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub

# 2. 安装依赖（如果还没有）
npm install

# 3. 启动服务器
npm start
# 或
node api/index.js
```

服务器将在 `http://localhost:5000` 启动。

#### 访问地址：

- **主应用**: `http://localhost:5000/` 或 `http://localhost:5000/public/index.html`
- **API 健康检查**: `http://localhost:5000/api/health`

### 方案 2: 使用启动脚本（最简单）

我已经创建了一个启动脚本，它会同时启动 API 服务器和静态文件服务器：

```bash
# 1. 进入项目目录
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub

# 2. 运行启动脚本
./start-server.sh
```

这个脚本会：
- 启动 Express API 服务器（端口 5000）
- 启动静态文件服务器（端口 8000）
- 自动检查依赖和端口

### 方案 3: 手动启动（开发调试）

如果需要分别启动：

**终端 1 - API 服务器**:
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
node api/index.js
```

**终端 2 - 静态文件服务器**（可选）:
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub/public
python3 -m http.server 8000
```

## 环境变量配置

确保 `.env` 文件存在并包含必要的配置：

```bash
# Supabase 认证（必需）
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API（可选，用于 AI 功能）
GEMINI_API_KEY_NEW=your_gemini_api_key

# 服务器端口（可选，默认 5000）
PORT=5000
```

## 验证服务器运行

### 1. 检查 API 服务器

访问：`http://localhost:5000/api/health`

应该返回：
```json
{
  "status": "OK",
  "message": "Googoogaga Facebook Auto Workflow API is running",
  "timestamp": "2024-12-17T..."
}
```

### 2. 检查静态文件

访问：`http://localhost:5000/` 或 `http://localhost:5000/public/index.html`

应该显示登录页面。

### 3. 检查控制台

打开浏览器开发者工具，应该不再有：
- ❌ `501 Unsupported method ('POST')`
- ❌ `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

## 常见问题

### Q: 端口已被占用

**A**: 修改端口：
```bash
PORT=5001 node api/index.js
```

### Q: 模块未找到错误

**A**: 安装依赖：
```bash
npm install
```

### Q: Supabase 认证错误

**A**: 检查 `.env` 文件中的 Supabase 配置。

### Q: 仍然显示 501 错误

**A**: 
1. 确认 Express 服务器正在运行
2. 确认访问的是 `http://localhost:5000`（不是 8000）
3. 检查控制台，确认 API 请求发送到正确的端口

## 快速测试

运行以下命令测试服务器：

```bash
# 测试 API 健康检查
curl http://localhost:5000/api/health

# 应该返回 JSON 响应
```

---

**现在请停止 Python 服务器，然后运行 `npm start` 或 `./start-server.sh`** 🚀


