# Vercel 500 错误调试指南

## ✅ 好消息

域名 `rofiinternal.org` 已经成功连接到 Vercel（显示 "Valid Configuration"）！

但是应用出现了 500 错误，需要查看日志来诊断问题。

---

## 🔍 步骤 1：查看 Vercel 日志

### 方法 A：通过 Vercel Dashboard

1. **进入项目**
   - 访问 [Vercel Dashboard](https://vercel.com/dashboard)
   - 选择项目 `googoogaga-platform`

2. **查看部署日志**
   - 点击 **"Deployments"** 标签
   - 找到最新的部署（应该显示状态）
   - 点击部署条目

3. **查看函数日志**
   - 在部署详情页面
   - 找到 **"Function Logs"** 或 **"Runtime Logs"** 部分
   - 查看错误信息

### 方法 B：通过 Logs 标签

1. **进入 Logs**
   - 在项目页面，点击 **"Logs"** 标签
   - 查看实时日志输出

2. **筛选错误**
   - 查看红色的错误信息
   - 通常会有堆栈跟踪（stack trace）

---

## 🔧 常见问题和解决方案

### 问题 1：模块找不到（Module not found）

**错误示例**：
```
Error: Cannot find module '../src/services/...'
```

**解决方案**：
- 检查 `api/index.js` 中的 require 路径
- 确保路径使用 `../src/` 而不是 `./`

### 问题 2：环境变量缺失

**错误示例**：
```
Error: SUPABASE_URL is not defined
```

**解决方案**：
1. 进入 Vercel → Settings → Environment Variables
2. 确保所有必需的环境变量都已设置：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `GEMINI_API_KEY` 或 `GEMINI_API_KEY_NEW`
   - 其他配置变量

3. **重新部署**
   - 添加环境变量后，需要重新部署
   - Deployments → 点击最新部署 → Redeploy

### 问题 3：文件路径错误

**错误示例**：
```
Error: ENOENT: no such file or directory
```

**解决方案**：
- 检查静态文件路径
- 确保使用 `path.join(__dirname, '..', 'public')` 而不是相对路径

### 问题 4：依赖问题

**错误示例**：
```
Error: Cannot find module 'express'
```

**解决方案**：
1. 检查 `package.json` 是否包含所有依赖
2. 确保 `node_modules` 在 Git 中被忽略（应该在 `.gitignore` 中）
3. Vercel 会自动运行 `npm install`

---

## 🛠️ 快速修复检查清单

### 1. 检查环境变量

在 Vercel Dashboard 中确认以下变量已设置：

```bash
SUPABASE_URL=https://klaedrhhbatnncdsgxin.supabase.co
SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_KEY=你的service_key（重要！）
GEMINI_API_KEY=你的gemini_key
GEMINI_API_KEY_NEW=你的gemini_key
APP_URL=https://rofiinternal.org
NODE_ENV=production
BRAND_NAME=Googoogaga
BRAND_SLOGAN=Cùng bé khám phá thế giới diệu kỳ mỗi ngày
BRAND_LOGO_PATH=/brand/googoogaga-logo.png
ASSETS_BASE_URL=/brand
```

### 2. 检查代码路径

确认 `api/index.js` 中的路径正确：

```javascript
// ✅ 正确
const SupabaseAuthService = require('../src/services/supabaseAuth');

// ❌ 错误
const SupabaseAuthService = require('./services/supabaseAuth');
```

### 3. 重新部署

添加或修改环境变量后：
1. 进入 Deployments
2. 点击最新的部署
3. 点击 **"Redeploy"** 按钮
4. 等待部署完成

---

## 📋 调试步骤

### 步骤 1：查看具体错误

1. 进入 Vercel → 项目 → Logs
2. 复制完整的错误信息
3. 查看堆栈跟踪（stack trace）

### 步骤 2：根据错误信息修复

- **如果是路径错误**：检查 `api/index.js` 中的 require 路径
- **如果是环境变量**：在 Vercel 设置中添加
- **如果是依赖问题**：检查 `package.json`

### 步骤 3：本地测试

在修复后，本地测试确保代码正常：

```bash
# 启动本地服务器
npm start

# 测试 API
curl http://localhost:5000/api/health
```

### 步骤 4：提交并推送

```bash
git add .
git commit -m "fix: 修复 Vercel 部署错误"
git push origin main
```

Vercel 会自动重新部署。

---

## 🔍 查看日志的命令（如果使用 Vercel CLI）

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 查看实时日志
vercel logs googoogaga-platform --follow
```

---

## 💡 常见错误模式

### 模式 1：初始化错误

如果错误发生在应用启动时，可能是：
- 环境变量缺失
- 服务初始化失败（Supabase、Gemini 等）

### 模式 2：请求处理错误

如果错误发生在处理请求时，可能是：
- 路由问题
- 中间件错误
- 业务逻辑错误

### 模式 3：文件系统错误

如果错误与文件相关，可能是：
- 路径问题
- 权限问题
- 文件不存在

---

## 🆘 需要帮助？

如果查看日志后仍无法解决：

1. **复制完整的错误日志**
   - 包括堆栈跟踪
   - 包括错误代码和 ID

2. **检查以下内容**：
   - 环境变量是否全部设置
   - 代码路径是否正确
   - 依赖是否完整

3. **提供错误信息**，我可以帮您进一步诊断

---

**下一步：请查看 Vercel Logs，找到具体的错误信息，然后我们可以针对性地修复！** 🔍

