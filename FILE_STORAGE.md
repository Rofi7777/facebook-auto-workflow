# 文件存储迁移指南

## ⚠️ 重要提示

Vercel 是无服务器（Serverless）环境，**文件系统是只读的**（除了 `/tmp` 目录，但该目录在函数执行后会被清除）。

当前应用在以下目录存储文件：
- `assets/uploads/` - 用户上传的产品图片
- `assets/generated/` - AI 生成的营销图片
- `assets/scenarios/` - 营销场景图片
- `assets/exports/` - 导出的 Word/PDF 文档
- `assets/ads-uploads/` - 广告分析文件
- `assets/chat-uploads/` - 聊天上传文件
- `assets/courses/` - 课程相关图片

**这些文件在 Vercel 上无法持久化存储！**

---

## 解决方案

### 方案 1：使用 Supabase Storage（推荐）⭐

Supabase Storage 是 Supabase 提供的对象存储服务，类似于 AWS S3。

#### 优点
- ✅ 与现有 Supabase 集成无缝
- ✅ 免费额度：1GB 存储 + 2GB 带宽/月
- ✅ 自动 CDN 加速
- ✅ 简单易用的 API
- ✅ 支持图片预览和直接访问

#### 实施步骤

1. **在 Supabase 中启用 Storage**
   - 登录 Supabase Dashboard
   - 进入 **Storage** 菜单
   - 创建存储桶（Buckets）：
     - `uploads` - 用户上传文件
     - `generated` - AI 生成文件
     - `scenarios` - 场景图片
     - `exports` - 导出文档
     - `ads-uploads` - 广告分析文件
     - `chat-uploads` - 聊天文件
     - `courses` - 课程文件

2. **设置存储桶权限**
   - `uploads`: 私有（仅认证用户可上传）
   - `generated`: 公开（生成的图片可公开访问）
   - `scenarios`: 公开
   - `exports`: 私有
   - `ads-uploads`: 私有
   - `chat-uploads`: 私有
   - `courses`: 公开

3. **修改代码使用 Supabase Storage**

需要修改的文件：
- `src/server.js` - 文件上传端点
- 创建 `src/services/storageService.js` - 存储服务封装

#### 代码示例

```javascript
// src/services/storageService.js
const { createClient } = require('@supabase/supabase-js');

class StorageService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async uploadFile(bucket, filePath, fileBuffer, options = {}) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: options.contentType,
        upsert: options.upsert || false
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: urlData } = this.client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl
    };
  }

  async deleteFile(bucket, filePath) {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  }

  getPublicUrl(bucket, filePath) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
}

module.exports = StorageService;
```

---

### 方案 2：使用 Cloudinary（推荐用于图片）⭐

Cloudinary 是专业的图片和视频管理平台。

#### 优点
- ✅ 强大的图片处理功能（裁剪、压缩、格式转换）
- ✅ 免费额度：25GB 存储 + 25GB 带宽/月
- ✅ 自动优化和 CDN
- ✅ 支持图片转换和滤镜

#### 实施步骤

1. **注册 Cloudinary 账号**
   - 访问 [cloudinary.com](https://cloudinary.com)
   - 注册免费账号
   - 获取 API 凭证

2. **安装依赖**
   ```bash
   npm install cloudinary multer-storage-cloudinary
   ```

3. **配置环境变量**
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **修改 multer 配置**
   ```javascript
   const cloudinary = require('cloudinary').v2;
   const { CloudinaryStorage } = require('multer-storage-cloudinary');

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   const storage = new CloudinaryStorage({
     cloudinary: cloudinary,
     params: {
       folder: 'googoogaga',
       allowed_formats: ['jpg', 'png', 'gif', 'webp']
     }
   });

   const upload = multer({ storage: storage });
   ```

---

### 方案 3：使用 AWS S3（企业级）

适合需要大规模存储和更高 SLA 的场景。

#### 优点
- ✅ 高可用性和可扩展性
- ✅ 丰富的功能（版本控制、生命周期策略等）
- ✅ 全球 CDN 网络

#### 缺点
- ❌ 配置较复杂
- ❌ 需要 AWS 账号和信用卡

---

## 快速实施建议

### 阶段 1：快速部署（临时方案）
1. 暂时禁用文件上传功能
2. 或使用 `/tmp` 目录（仅用于测试，文件不会持久化）

### 阶段 2：完整迁移（推荐）
1. 实施 Supabase Storage 方案
2. 修改所有文件上传/下载逻辑
3. 更新前端代码以使用新的 URL

---

## 需要修改的代码位置

### 后端文件
- `src/server.js`
  - `/api/upload-image` - 产品图片上传
  - `/api/analyze-ads` - 广告文件上传
  - `/api/chat-with-advisor` - 聊天文件上传
  - `/api/download-image` - 图片下载
  - `/api/download-document` - 文档下载
  - 所有生成图片的端点

### 前端文件
- `public/js/*.js` - 更新文件 URL 引用
- `public/index.html` - 检查图片路径

---

## 迁移检查清单

- [ ] 选择存储方案（推荐 Supabase Storage）
- [ ] 创建存储桶/配置存储服务
- [ ] 修改后端文件上传逻辑
- [ ] 修改后端文件下载逻辑
- [ ] 更新前端文件 URL 引用
- [ ] 测试文件上传功能
- [ ] 测试文件下载功能
- [ ] 测试文件删除功能（如适用）
- [ ] 更新环境变量文档
- [ ] 部署到 Vercel 并测试

---

## 参考资源

- [Supabase Storage 文档](https://supabase.com/docs/guides/storage)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [AWS S3 Node.js SDK](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-examples.html)

---

**建议优先使用 Supabase Storage，因为它与现有架构最匹配！** 🚀

