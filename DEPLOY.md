# Vercel 部署指南

## 🚀 推荐方法：使用 Vercel Dashboard（最简单）

不需要安装 CLI，直接在网页上操作：

### 步骤：

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 或 "Log In"
   - 使用 GitHub 账号登录（推荐，会自动连接您的仓库）

2. **导入项目**
   - 登录后，点击 **"Add New Project"**
   - 在 "Import Git Repository" 中，选择：
     - `Rofi7777/facebook-auto-workflow`
   - 点击 **"Import"**

3. **配置项目**
   - **Framework Preset**: Vercel 会自动检测为 "Other"
   - **Root Directory**: `./` (默认)
   - **Build Command**: 留空（或 `echo "Build complete"`）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

4. **配置环境变量**
   点击 **"Environment Variables"**，添加以下变量：

   ```
   SUPABASE_URL=https://klaedrhhbatnncdsgxin.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsYWVkcmhoYmF0bm5jZHNneGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNzMxNDgsImV4cCI6MjA4MDg0OTE0OH0.jny5x3uEo2p740pWRDR__CT2rd8Rnwh--7ZuX35xjus
   SUPABASE_SERVICE_KEY=你的service_role_key（从Supabase获取）
   GEMINI_API_KEY=AIzaSyBUNeapNgsdwFd84elKLxCr9L6FBVa3n_A
   GEMINI_API_KEY_NEW=AIzaSyBUNeapNgsdwFd84elKLxCr9L6FBVa3n_A
   APP_URL=https://your-project.vercel.app（部署后会自动生成）
   BRAND_NAME=Googoogaga
   BRAND_SLOGAN=Cùng bé khám phá thế giới diệu kỳ mỗi ngày
   BRAND_LOGO_PATH=/brand/googoogaga-logo.png
   ASSETS_BASE_URL=/brand
   NODE_ENV=production
   ```

   ⚠️ **重要**：`SUPABASE_SERVICE_KEY` 需要从 Supabase Dashboard 获取：
   - Supabase Dashboard → Settings → API → service_role key

5. **部署**
   - 点击 **"Deploy"**
   - 等待构建完成（通常 1-2 分钟）

6. **获取部署 URL**
   - 部署完成后，会显示类似：`https://facebook-auto-workflow-xxx.vercel.app`
   - 更新 `APP_URL` 环境变量为这个 URL

---

## 方法 2：使用 npx（不需要全局安装）

如果不想使用 Dashboard，可以使用 npx 直接运行：

```bash
# 登录 Vercel（会打开浏览器）
npx vercel login

# 部署项目
npx vercel

# 设置环境变量（交互式）
npx vercel env add SUPABASE_URL
npx vercel env add SUPABASE_ANON_KEY
# ... 添加其他变量

# 生产环境部署
npx vercel --prod
```

---

## 方法 3：修复权限问题后全局安装

如果您想全局安装 Vercel CLI：

### 选项 A：使用 sudo（不推荐，但可以工作）
```bash
sudo npm i -g vercel
```

### 选项 B：修复 npm 权限（推荐）
```bash
# 创建全局包目录
mkdir ~/.npm-global

# 配置 npm 使用新目录
npm config set prefix '~/.npm-global'

# 添加到 PATH（添加到 ~/.zshrc）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# 现在可以不用 sudo 安装
npm i -g vercel
```

---

## 📝 部署后检查清单

- [ ] 部署成功，获得 Vercel URL
- [ ] 所有环境变量已设置
- [ ] 访问应用首页正常
- [ ] 测试用户注册/登录
- [ ] 测试 API 端点：`/api/health`
- [ ] 配置自定义域名（如需要）

---

## 🔗 相关链接

- **GitHub 仓库**: https://github.com/Rofi7777/facebook-auto-workflow
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com

---

## ⚠️ 重要提醒

1. **文件存储**：Vercel 不支持持久化文件存储，需要配置 Supabase Storage（参考 `FILE_STORAGE.md`）

2. **环境变量**：确保所有必需的环境变量都已设置，特别是 `SUPABASE_SERVICE_KEY`

3. **自定义域名**：部署后可以在 Vercel 项目设置中添加 `rofiinternal.org`

---

**推荐使用方法 1（Vercel Dashboard），最简单且不需要处理权限问题！** 🎉

