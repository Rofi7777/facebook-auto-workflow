# 完整测试指南

## 📋 测试前准备

### 1. 确认文件完整性

所有文件应该已经创建完成：

```bash
# 检查文件结构
ls -la public/js/core/
ls -la public/js/services/
ls -la public/js/components/
ls -la public/js/pages/
ls -la public/css/
```

### 2. 确认服务器运行

```bash
# 方法 1: 使用 Node.js (如果有 package.json)
npm start

# 方法 2: 使用 Python
python -m http.server 8000

# 方法 3: 使用 PHP
php -S localhost:8000
```

## 🧪 测试步骤

### 阶段 1: 基础测试（无需后端）

#### 1.1 访问测试页面

打开浏览器访问：
- **基础架构测试**: `http://localhost:8000/test-architecture.html`
- **集成测试**: `http://localhost:8000/test-integration.html`

#### 1.2 检查控制台

打开浏览器开发者工具（F12），查看 Console：

**应该看到**：
```
[App Init] Starting application initialization...
[App Init] Page1 registered
[App Init] Page2 registered
[App Init] Page3 registered
[App Init] Page4 registered
[App Init] Page5 registered
[App] Initializing...
[App] Module initialized: AuthService
[App] Module initialized: I18nService
[App] Initialization complete
[App Init] Initialization complete
```

**如果有错误**：
- 检查文件路径是否正确
- 检查浏览器控制台的错误信息
- 确认所有模块都已加载

### 阶段 2: 主应用测试

#### 2.1 访问主应用

打开浏览器访问：
- **主应用**: `http://localhost:8000/index.html`

#### 2.2 测试页面切换

1. **点击导航按钮**
   - 点击 "AI 圖片生成" (Page 1)
   - 点击 "AI 廣告顧問" (Page 2)
   - 点击 "課程編輯" (Page 3)
   - 点击 "指令架構師" (Page 4)
   - 如果是管理员，点击 "管理控制台" (Page 5)

2. **检查页面切换**
   - 页面应该平滑切换
   - 当前页面的按钮应该高亮
   - 控制台应该显示路由日志

#### 2.3 测试组件功能

**Page 1 - 产品分析**：
1. 输入产品名称
2. 上传产品图片（拖拽或点击）
3. 选择平台（TikTok, Shopee, Facebook, Instagram）
4. 选择语言
5. 点击 "AI 產品分析" 按钮

**Page 2 - 广告顾问**：
1. 上传广告图片
2. 选择平台
3. 点击分析按钮

**Page 3 - 课程编辑**：
1. 选择年龄
2. 选择科目
3. 选择主题
4. 选择时长
5. 选择风格
6. 选择输出格式
7. 点击生成按钮

**Page 4 - Prompt 架构师**：
1. 切换模式（商业/开发/视觉）
2. 填写表单
3. 点击生成按钮

**Page 5 - 管理员控制台**：
1. 查看用户列表
2. 查看数据库表
3. 查看统计信息

### 阶段 3: API 集成测试（需要后端）

#### 3.1 测试认证

1. **登录测试**
   - 输入邮箱和密码
   - 点击登录
   - 检查是否成功登录
   - 检查导航栏是否显示用户信息

2. **注册测试**
   - 输入邮箱和密码
   - 点击注册
   - 检查是否成功注册

3. **登出测试**
   - 点击登出按钮
   - 检查是否返回登录页面

#### 3.2 测试 API 调用

**Page 1**：
- 测试 `/api/analyze-product`
- 测试 `/api/generate-platform-content`
- 测试 `/api/generate-scenarios`

**Page 2**：
- 测试 `/api/analyze-ads`

**Page 3**：
- 测试 `/api/generate-course`
- 测试 `/api/export-course`

**Page 4**：
- 测试 `/api/refine-prompt`

**Page 5**：
- 测试 `/api/admin/users`
- 测试 `/api/admin/db/tables`

## 🔍 问题排查

### 问题 1: 模块未加载

**症状**: 控制台显示 "Module not found"

**解决方案**:
1. 检查文件路径是否正确
2. 检查文件是否存在
3. 检查浏览器控制台的网络请求

### 问题 2: 页面切换不工作

**症状**: 点击导航按钮页面不切换

**解决方案**:
1. 检查路由系统是否初始化
2. 检查页面元素是否存在
3. 检查是否有 JavaScript 错误

### 问题 3: 组件不显示

**症状**: 组件（如图片上传）不显示

**解决方案**:
1. 检查组件容器元素是否存在
2. 检查组件初始化代码
3. 检查 CSS 样式是否正确

### 问题 4: API 调用失败

**症状**: API 请求返回错误

**解决方案**:
1. 检查后端服务器是否运行
2. 检查 API 端点是否正确
3. 检查认证 token 是否有效
4. 检查网络请求的详细信息

## 📊 测试检查清单

### 基础功能
- [ ] 所有模块加载成功
- [ ] 路由系统正常工作
- [ ] 页面切换正常
- [ ] 导航栏正常显示
- [ ] 状态管理正常工作

### 组件功能
- [ ] StepIndicator 正常显示
- [ ] ImageUpload 可以上传图片
- [ ] PlatformSelector 可以选择平台
- [ ] Navigation 可以切换页面

### 页面功能
- [ ] Page 1: 产品分析功能
- [ ] Page 2: 广告分析功能
- [ ] Page 3: 课程生成功能
- [ ] Page 4: Prompt 生成功能
- [ ] Page 5: 管理员功能

### API 集成
- [ ] 认证 API 正常
- [ ] 产品分析 API 正常
- [ ] 内容生成 API 正常
- [ ] 管理员 API 正常

### 用户体验
- [ ] 页面加载速度正常
- [ ] 交互响应流畅
- [ ] 错误提示清晰
- [ ] 加载状态显示正常

## 🚀 性能测试

### 1. 页面加载时间

打开浏览器开发者工具 → Network：
- 检查资源加载时间
- 检查总加载时间
- 目标: < 3 秒

### 2. JavaScript 执行时间

打开浏览器开发者工具 → Performance：
- 记录页面加载
- 检查 JavaScript 执行时间
- 检查内存使用

### 3. 响应时间

- 测试页面切换响应时间
- 测试组件交互响应时间
- 目标: < 100ms

## 📝 测试报告模板

```markdown
# 测试报告

**测试日期**: YYYY-MM-DD
**测试人员**: 姓名
**测试环境**: 浏览器版本、操作系统

## 测试结果

### 基础功能
- [ ] 通过 / [ ] 失败

### 组件功能
- [ ] 通过 / [ ] 失败

### 页面功能
- [ ] 通过 / [ ] 失败

### API 集成
- [ ] 通过 / [ ] 失败

## 发现的问题

1. 问题描述
   - 复现步骤
   - 预期结果
   - 实际结果

## 建议

1. 优化建议
2. 改进建议
```

## 🎯 下一步

测试完成后：

1. **记录问题** - 记录所有发现的问题
2. **修复问题** - 根据问题优先级修复
3. **优化性能** - 根据测试结果优化
4. **更新文档** - 更新相关文档

---

**准备好测试了吗？** 按照上述步骤逐一测试，记录结果，然后我们可以一起解决问题！


