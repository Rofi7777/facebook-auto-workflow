# 🔐 登录问题排查指南

## 当前状态

✅ **静态文件问题已解决**：没有 404 错误
❌ **登录认证失败**：401 Unauthorized - "Invalid login credentials"

## 问题分析

从错误信息 "Invalid login credentials" 来看，可能的原因：

1. **用户尚未注册**
   - 邮箱 `rofi90@hotmail.com` 在 Supabase 中不存在
   - 需要先注册账户

2. **密码不正确**
   - 输入的密码与注册时设置的密码不匹配

3. **Supabase 配置问题**
   - `.env` 文件中的 Supabase 配置不正确
   - Supabase 服务未正确初始化

## 解决方案

### 方案 1: 注册新用户（推荐）

如果这是第一次使用，需要先注册：

1. **在登录页面点击注册链接**
   - 点击 "還沒有帳號?立即註冊>" (Don't have an account? Register now>)

2. **填写注册信息**
   - 邮箱：`rofi90@hotmail.com`
   - 密码：设置一个密码（至少 6 个字符）

3. **完成注册**
   - 注册成功后，Supabase 可能会发送验证邮件
   - 根据 Supabase 配置，可能需要验证邮箱

4. **使用注册的凭据登录**

### 方案 2: 检查 Supabase 配置

确认 `.env` 文件包含正确的 Supabase 配置：

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**检查步骤**：

1. 查看服务器启动日志，应该看到：
   ```
   🔐 Supabase Auth Service initialized successfully
   ```

2. 如果没有看到这条消息，说明 Supabase 配置有问题

3. 检查 `.env` 文件是否存在且配置正确

### 方案 3: 查看服务器日志

在运行服务器的终端，查看登录尝试的日志：

**应该看到**：
```
🔍 [2024-12-17T...] POST /api/auth/signin
📍 Request URL: /api/auth/signin
```

**如果登录失败，应该看到**：
```
Sign in error: Invalid login credentials
```

**如果 Supabase 未初始化，应该看到**：
```
⚠️ Supabase credentials not found. Authentication will be disabled.
```

## 测试步骤

### 步骤 1: 检查 Supabase 服务状态

在服务器终端，查看启动日志，确认看到：
```
🔐 Supabase Auth Service initialized successfully
```

### 步骤 2: 尝试注册

1. 在登录页面点击 "立即註冊" (Register now)
2. 填写邮箱和密码
3. 点击注册按钮
4. 查看服务器日志，确认注册是否成功

### 步骤 3: 尝试登录

1. 使用注册的邮箱和密码登录
2. 如果仍然失败，查看服务器日志中的具体错误

### 步骤 4: 检查 Supabase 控制台

如果 Supabase 配置正确，可以在 Supabase 控制台查看：
1. 用户是否已创建
2. 用户状态（pending, active, etc.）
3. 认证日志

## 常见错误

### 错误 1: "Authentication service is not available"

**原因**：Supabase 配置缺失或错误

**解决**：
1. 检查 `.env` 文件
2. 确认 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 已设置
3. 重启服务器

### 错误 2: "Invalid login credentials"

**原因**：
- 用户不存在
- 密码不正确
- 邮箱未验证（如果 Supabase 要求验证）

**解决**：
1. 先注册用户
2. 确认密码正确
3. 检查邮箱是否需要验证

### 错误 3: "Email not confirmed"

**原因**：Supabase 要求邮箱验证，但用户未验证邮箱

**解决**：
1. 检查注册邮箱中的验证链接
2. 点击验证链接
3. 或者在 Supabase 控制台手动验证用户

## 快速测试

### 测试注册功能

在浏览器控制台运行：

```javascript
fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123456'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 测试登录功能

```javascript
fetch('/api/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'rofi90@hotmail.com',
    password: 'your_password'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## 如果问题仍然存在

1. **查看服务器日志**：在运行服务器的终端查看详细错误信息
2. **检查 Supabase 控制台**：确认用户是否存在
3. **测试 API 端点**：使用 curl 或浏览器直接测试 `/api/auth/signin`
4. **提供错误信息**：告诉我服务器日志中的具体错误信息

---

**关键提示**：如果这是第一次使用，请先注册用户，然后再登录！


