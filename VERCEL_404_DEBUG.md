# Vercel 404 错误诊断指南

## 问题症状
- API 端点返回 404 Not Found
- 例如：`/api/analyze-product`, `/api/generate-platform-content`

## 诊断步骤

### 1. 检查 Vercel 部署状态
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 检查最新部署是否成功（绿色勾号）
4. 如果部署失败，查看错误日志

### 2. 检查 Vercel 函数日志
1. 在 Vercel Dashboard 中，进入项目的 **Functions** 标签
2. 点击 `/api/index.js`
3. 查看 **Logs** 标签
4. 查找我们添加的调试日志：
   - `🔍 [timestamp] METHOD /path` - 请求日志
   - `📥 /api/analyze-product route hit` - 路由命中日志
   - `❌ 404 - Route not found` - 404错误日志

### 3. 检查环境变量
确保在 Vercel 中设置了以下环境变量：
- `GEMINI_API_KEY_NEW` 或 `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`（可选，用于管理员功能）

**设置方法：**
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 添加所有必要的环境变量
3. 重新部署项目

### 4. 检查 Vercel 配置
确认 `vercel.json` 文件存在且格式正确：
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### 5. 手动触发重新部署
如果部署没有自动触发：
1. Vercel Dashboard → 项目 → Deployments
2. 点击最新部署右侧的 "..." 菜单
3. 选择 "Redeploy"
4. 等待部署完成

### 6. 检查路由注册
在 Vercel 函数日志中，你应该看到：
- 所有传入请求的日志
- 路由命中的日志
- 如果看到 404 日志，说明请求到达了服务器但路由未匹配

### 7. 测试 API 端点
使用 curl 或 Postman 测试：
```bash
# 测试健康检查
curl https://www.rofiinternal.org/api/health

# 测试产品分析（需要认证token）
curl -X POST https://www.rofiinternal.org/api/analyze-product \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imagePath": "test"}'
```

## 常见问题

### 问题1: 部署成功但路由仍然404
**可能原因：**
- 环境变量未设置，导致服务初始化失败
- Vercel 缓存问题

**解决方案：**
1. 清除 Vercel 缓存：Settings → Clear Build Cache
2. 重新部署
3. 检查环境变量

### 问题2: 看到调试日志但路由未命中
**可能原因：**
- 路由定义顺序问题
- 中间件拦截了请求

**解决方案：**
1. 检查 Vercel 日志中的请求路径
2. 确认路由定义在中间件之后
3. 检查 `authMiddleware` 是否返回了错误

### 问题3: 504 Gateway Timeout
**可能原因：**
- 函数执行时间超过60秒
- AI服务响应慢

**解决方案：**
1. 检查 `maxDuration` 设置（当前为60秒）
2. 优化AI服务调用
3. 添加超时处理

## 下一步
如果问题仍然存在，请提供：
1. Vercel 部署日志的截图
2. Vercel 函数日志的截图
3. 浏览器控制台的完整错误信息
4. 具体是哪个API端点返回404

