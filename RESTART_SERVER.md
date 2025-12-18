# 🔄 重启服务器指南

## 当前状态

✅ **代码已修复**：静态文件路径配置已更新
❌ **需要重启**：服务器必须重启才能应用更改

## 必须执行的操作

### 步骤 1: 停止当前服务器

1. 找到运行 Express 服务器的终端窗口
2. 按 `Ctrl + C` 停止服务器
3. 确认服务器已停止（终端提示符恢复）

### 步骤 2: 重新启动服务器

在项目根目录运行：

```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
npm start
```

或：

```bash
node api/index.js
```

### 步骤 3: 确认服务器启动成功

应该看到以下消息：

```
Googoogaga Facebook Auto Workflow server running on http://localhost:5000
Ready to generate Googoogaga Facebook promotional materials for babies!
```

### 步骤 4: 在浏览器访问

**重要**：必须使用完整的 URL，包括端口号：

```
http://localhost:5000
```

**不要使用**：
- ❌ `localhost`
- ❌ `localhost/Googa AI Hub`
- ❌ `http://localhost`（没有端口号）

### 步骤 5: 清除浏览器缓存

1. **完全关闭浏览器**（所有窗口和标签页）
2. **重新打开浏览器**
3. **访问**：`http://localhost:5000`
4. **硬刷新**：
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

### 步骤 6: 验证修复

打开浏览器开发者工具（F12），检查 Console：

**应该看到**：
- ✅ 没有 404 错误
- ✅ 所有 JavaScript 文件正常加载
- ✅ 所有 CSS 文件正常加载

**不应该看到**：
- ❌ `Failed to load resource: 404`
- ❌ `Refused to execute script... MIME type ('text/html')`

## 快速测试

在浏览器访问以下 URL 验证：

1. **主应用**：`http://localhost:5000`
2. **API 健康检查**：`http://localhost:5000/api/health`
   - 应该返回 JSON
3. **静态文件测试**：`http://localhost:5000/public/js/core/state.js`
   - 应该显示 JavaScript 代码，而不是 404 错误

## 如果仍然有问题

### 检查服务器是否运行

```bash
lsof -i :5000
```

应该看到 `node` 进程。

### 检查服务器日志

在运行服务器的终端，访问文件时应该看到请求日志：

```
🔍 [2024-12-17T...] GET /public/js/core/state.js
📍 Request URL: /public/js/core/state.js
```

### 检查文件是否存在

```bash
ls -la public/js/core/state.js
```

应该能看到文件。

---

**关键提示**：代码修复后，必须重启服务器才能生效！


