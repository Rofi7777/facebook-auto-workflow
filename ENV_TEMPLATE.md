# 环境变量模板

请复制以下内容到 `.env` 文件：

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

## 如何获取这些值

### Supabase 配置
1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择项目 → Settings → API
3. 复制 Project URL → `SUPABASE_URL`
4. 复制 anon public key → `SUPABASE_ANON_KEY`
5. 复制 service_role key → `SUPABASE_SERVICE_KEY`

### Gemini API Key
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API Key
3. 复制到 `GEMINI_API_KEY` 和 `GEMINI_API_KEY_NEW`

### APP_URL
- 本地开发：`http://localhost:5000`
- Vercel 部署：`https://your-domain.vercel.app` 或 `https://rofiinternal.org`

