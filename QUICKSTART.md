# 快速开始指南

## 🚀 5 分钟快速部署

### 1. 本地测试（2 分钟）

```bash
# 1. 安装依赖
npm install

# 2. 创建 .env 文件
cp ENV_TEMPLATE.md .env
# 然后编辑 .env 填入您的配置

# 3. 启动服务器
npm start

# 4. 访问应用
open http://localhost:5000
```

### 2. 配置 Supabase（3 分钟）

1. **创建 Supabase 项目**
   - 访问 [supabase.com](https://supabase.com)
   - 点击 "New Project"
   - 填写项目信息并创建

2. **获取 API 密钥**
   - 进入项目 → Settings → API
   - 复制以下值到 `.env`：
     - Project URL → `SUPABASE_URL`
     - anon public key → `SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_KEY`

3. **创建数据库表**
   - 进入 SQL Editor
   - 运行 `database/user_learning_schema.sql`

### 3. 部署到 Vercel（5 分钟）

#### 方法 A：通过 GitHub（推荐）

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit"

# 2. 推送到 GitHub
# 在 GitHub 创建新仓库，然后：
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main

# 3. 在 Vercel 导入项目
# - 访问 vercel.com
# - 点击 "Add New Project"
# - 选择您的 GitHub 仓库
# - 配置环境变量（从 .env 复制）
# - 点击 Deploy
```

#### 方法 B：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
vercel

# 4. 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
# ... 添加所有环境变量

# 5. 生产环境部署
vercel --prod
```

---

## 📝 必需的环境变量

确保以下环境变量已设置：

### Supabase（必需）
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`（用于管理员功能）

### Gemini AI（必需）
- `GEMINI_API_KEY` 或 `GEMINI_API_KEY_NEW`

### 应用配置（可选，有默认值）
- `PORT=5000`
- `APP_URL`（本地：`http://localhost:5000`，生产：您的域名）
- `BRAND_NAME=Googoogaga`
- `BRAND_SLOGAN=Cùng bé khám phá thế giới diệu kỳ mỗi ngày`

---

## ✅ 验证部署

部署完成后，检查以下功能：

- [ ] 访问首页：`https://your-domain.vercel.app`
- [ ] 用户注册/登录
- [ ] 产品图片上传（注意：需要配置文件存储）
- [ ] AI 内容生成
- [ ] API 健康检查：`https://your-domain.vercel.app/api/health`

---

## ⚠️ 重要提醒

### 文件存储
Vercel 不支持持久化文件存储。请参考 `FILE_STORAGE.md` 配置 Supabase Storage 或其他存储方案。

### 环境变量
确保在 Vercel 项目设置中配置了所有环境变量。

### 域名配置
如需使用 `rofiinternal.org`，请在 Vercel 项目设置中添加自定义域名。

---

## 🆘 遇到问题？

1. **检查 Vercel 部署日志**
   - 进入 Vercel Dashboard → Deployments → 查看日志

2. **检查环境变量**
   - 确保所有必需变量已设置
   - 变量名称完全匹配（区分大小写）

3. **检查 Supabase 连接**
   - 确认 Supabase 项目已启用
   - 检查 API 密钥是否正确

4. **查看详细文档**
   - `MIGRATION.md` - 完整迁移指南
   - `FILE_STORAGE.md` - 文件存储方案

---

**祝部署顺利！** 🎉

