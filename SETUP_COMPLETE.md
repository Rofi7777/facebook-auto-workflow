# ✅ 设置完成检查清单

## 已完成 ✅

- [x] 环境变量已从 `.env.local` 转换到 `.env`
- [x] Supabase 项目已连接
- [x] 数据库表已创建（user_interactions, user_preferences, user_feedback）
- [x] Gemini API Key 已配置
- [x] 项目依赖已安装

## 待完成 ⚠️

### 1. 获取 SUPABASE_SERVICE_KEY（必需）

**步骤：**
1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 "GooGa Ai Hub"
3. 进入 **Settings** → **API**
4. 找到 **service_role** key（⚠️ 这是敏感密钥，不要在前端使用）
5. 复制并更新 `.env` 文件：

```bash
# 编辑 .env 文件，替换这一行：
SUPABASE_SERVICE_KEY=your_service_role_key_here

# 改为：
SUPABASE_SERVICE_KEY=你的实际service_role_key
```

**为什么需要？**
- 管理员控制台功能需要
- 数据库管理功能需要
- 用户管理功能需要

---

### 2. 测试本地服务器

```bash
# 启动服务器
npm start

# 应该看到：
# 🔐 Supabase Auth Service initialized successfully
# 🗄️ Database Admin Service initialized
# Googoogaga Facebook Auto Workflow server running on http://localhost:5000
```

然后访问：http://localhost:5000

---

### 3. 验证功能

测试以下功能是否正常：

- [ ] 访问首页
- [ ] 用户注册
- [ ] 用户登录
- [ ] API 健康检查：http://localhost:5000/api/health

---

## 下一步：部署到 Vercel

完成本地测试后，参考 `QUICKSTART.md` 或 `MIGRATION.md` 部署到 Vercel。

### Vercel 环境变量

部署到 Vercel 时，需要在项目设置中添加所有 `.env` 中的变量：

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 创建新项目或选择现有项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量（从 `.env` 复制）：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY` ⚠️ 重要
   - `GEMINI_API_KEY`
   - `GEMINI_API_KEY_NEW`
   - `APP_URL` (设置为 Vercel 域名或 `https://rofiinternal.org`)
   - 其他可选变量

---

## 快速命令

```bash
# 检查配置
node check-setup.js

# 启动本地服务器
npm start

# 查看环境变量（不显示敏感信息）
cat .env | grep -v KEY
```

---

## 需要帮助？

- 查看 `MIGRATION.md` - 完整迁移指南
- 查看 `QUICKSTART.md` - 快速开始
- 查看 `FILE_STORAGE.md` - 文件存储方案

