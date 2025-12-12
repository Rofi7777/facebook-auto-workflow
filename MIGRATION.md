# 迁移指南：从 Replit 到 Vercel

本指南将帮助您将 Googoogaga AI Hub 应用从 Replit 迁移到 Vercel 部署。

## 📋 迁移步骤

### 1. 本地环境设置

#### 1.1 安装依赖
```bash
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
npm install
```

#### 1.2 配置环境变量
创建 `.env` 文件（基于 `.env.example`）：

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY_NEW=your_gemini_api_key_new

# Application Configuration
PORT=5000
APP_URL=http://localhost:5000

# Brand Configuration
BRAND_NAME=Googoogaga
BRAND_SLOGAN=Cùng bé khám phá thế giới diệu kỳ mỗi ngày
BRAND_LOGO_PATH=/brand/googoogaga-logo.png
ASSETS_BASE_URL=/brand

# Node Environment
NODE_ENV=development
```

#### 1.3 获取 Supabase 凭证

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目（或创建新项目）
3. 进入 **Settings** > **API**
4. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY`（用于管理员功能）

#### 1.4 本地测试
```bash
npm start
```

访问 `http://localhost:5000` 确认应用正常运行。

---

### 2. 准备 Vercel 部署

#### 2.1 安装 Vercel CLI（可选）
```bash
npm i -g vercel
```

#### 2.2 项目结构检查
确保以下文件存在：
- ✅ `vercel.json` - Vercel 配置文件
- ✅ `package.json` - 包含构建脚本
- ✅ `.gitignore` - 排除敏感文件
- ✅ `src/server.js` - 主服务器文件

---

### 3. 部署到 Vercel

#### 方法 A：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 **Add New Project**
   - 选择您的 Git 仓库（或先推送到 GitHub）
   - Vercel 会自动检测项目配置

3. **配置环境变量**
   - 在项目设置中，进入 **Environment Variables**
   - 添加所有 `.env` 中的变量：
     ```
     SUPABASE_URL
     SUPABASE_ANON_KEY
     SUPABASE_SERVICE_KEY
     GEMINI_API_KEY
     GEMINI_API_KEY_NEW
     APP_URL (设置为您的 Vercel 域名)
     BRAND_NAME
     BRAND_SLOGAN
     BRAND_LOGO_PATH
     ASSETS_BASE_URL
     NODE_ENV=production
     ```

4. **部署**
   - 点击 **Deploy**
   - 等待构建完成

#### 方法 B：通过 Vercel CLI

```bash
# 登录 Vercel
vercel login

# 在项目目录中部署
cd /Users/rofi/Desktop/App/GooGa-Ai-Hub
vercel

# 生产环境部署
vercel --prod
```

---

### 4. 配置自定义域名

#### 4.1 在 Vercel 中添加域名
1. 进入项目 **Settings** > **Domains**
2. 添加您的域名：`rofiinternal.org`
3. 按照提示配置 DNS 记录

#### 4.2 DNS 配置
在您的域名注册商（购买 `rofiinternal.org` 的地方）配置：

**如果使用 Vercel 的 DNS：**
- 将域名服务器指向 Vercel 提供的 NS 记录

**如果使用现有 DNS：**
- 添加 CNAME 记录：
  ```
  类型: CNAME
  名称: @ (或 www)
  值: cname.vercel-dns.com
  ```

#### 4.3 更新环境变量
在 Vercel 项目设置中，更新 `APP_URL`：
```
APP_URL=https://rofiinternal.org
```

---

### 5. 文件存储注意事项

⚠️ **重要**：Vercel 是无服务器环境，文件系统是**只读**的（除了 `/tmp`）。

#### 5.1 当前文件存储位置
应用会在以下目录存储文件：
- `assets/uploads/` - 用户上传的图片
- `assets/generated/` - AI 生成的图片
- `assets/scenarios/` - 营销场景图片
- `assets/exports/` - 导出的文档
- `assets/ads-uploads/` - 广告分析文件
- `assets/chat-uploads/` - 聊天上传文件
- `assets/courses/` - 课程图片

#### 5.2 解决方案选项

**选项 A：使用 Supabase Storage（推荐）**
- 将文件上传到 Supabase Storage
- 修改上传逻辑使用 Supabase Storage API
- 优点：持久化存储，可扩展

**选项 B：使用外部存储服务**
- AWS S3 / Google Cloud Storage / Cloudinary
- 修改上传逻辑使用这些服务
- 优点：专业文件存储，CDN 支持

**选项 C：临时方案（仅用于测试）**
- 使用 Vercel 的 `/tmp` 目录（临时存储）
- ⚠️ 注意：文件在函数执行后会被删除
- 不适用于生产环境

#### 5.3 快速修复（临时）
如果需要快速部署，可以：
1. 暂时禁用文件上传功能
2. 或使用 Supabase Storage（需要修改代码）

---

### 6. 数据库迁移

#### 6.1 确认 Supabase 数据库
1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 运行 `database/user_learning_schema.sql` 创建必要的表：
   ```sql
   -- 用户交互表
   -- 用户偏好表
   -- 用户反馈表
   ```

#### 6.2 迁移现有数据（如果有）
如果 Replit 上有数据库数据，需要：
1. 导出数据
2. 导入到 Supabase
3. 更新连接配置

---

### 7. 测试部署

#### 7.1 功能测试清单
- [ ] 用户注册/登录
- [ ] 产品图片上传
- [ ] AI 内容生成
- [ ] 多平台内容生成
- [ ] 广告分析
- [ ] 课程生成
- [ ] BizPrompt 生成
- [ ] 管理员控制台

#### 7.2 常见问题排查

**问题：环境变量未生效**
- 检查 Vercel 项目设置中的环境变量
- 确保变量名称完全匹配
- 重新部署项目

**问题：文件上传失败**
- 检查文件存储配置
- 确认使用 Supabase Storage 或外部存储

**问题：Supabase 连接失败**
- 检查 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`
- 确认 Supabase 项目已启用
- 检查网络连接和 CORS 设置

**问题：API 超时**
- Vercel 免费版函数最大执行时间为 10 秒
- Pro 版为 60 秒
- 考虑优化长时间运行的 AI 请求

---

### 8. 性能优化建议

#### 8.1 静态资源
- 将 `public/` 目录中的静态文件通过 Vercel 的 CDN 提供
- 确保图片和字体文件已优化

#### 8.2 API 优化
- 使用 Vercel Edge Functions 处理轻量级请求
- 对于长时间运行的 AI 任务，考虑使用队列系统

#### 8.3 缓存策略
- 实现适当的缓存头
- 使用 Vercel 的缓存功能

---

### 9. 监控和维护

#### 9.1 Vercel Analytics
- 启用 Vercel Analytics 监控性能
- 查看函数执行时间和错误日志

#### 9.2 Supabase 监控
- 在 Supabase Dashboard 中监控数据库使用情况
- 设置警报阈值

---

### 10. 回滚计划

如果部署出现问题：

1. **在 Vercel Dashboard 中回滚**
   - 进入 **Deployments**
   - 选择之前的成功部署
   - 点击 **Promote to Production**

2. **或使用 CLI**
   ```bash
   vercel rollback
   ```

---

## 📝 检查清单

迁移前：
- [ ] 本地环境配置完成
- [ ] Supabase 项目创建并配置
- [ ] 环境变量已收集
- [ ] 本地测试通过

部署时：
- [ ] Vercel 项目创建
- [ ] 环境变量已设置
- [ ] 域名配置完成
- [ ] 文件存储方案已确定

部署后：
- [ ] 所有功能测试通过
- [ ] 性能监控已设置
- [ ] 错误日志已检查
- [ ] 用户通知（如需要）

---

## 🆘 需要帮助？

如果遇到问题：
1. 检查 Vercel 部署日志
2. 查看 Supabase Dashboard 日志
3. 检查浏览器控制台错误
4. 参考 [Vercel 文档](https://vercel.com/docs)
5. 参考 [Supabase 文档](https://supabase.com/docs)

---

**祝迁移顺利！** 🚀

