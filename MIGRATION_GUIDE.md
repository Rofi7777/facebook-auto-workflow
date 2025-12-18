# 代码迁移指南

## 概述

本文档说明如何将现有代码迁移到新架构。新架构采用模块化设计，提供了更好的代码组织和可维护性。

## 迁移状态

✅ **已完成**：
- 所有核心模块已创建
- 所有组件已创建
- 所有页面模块已创建
- CSS 系统已重构
- 路径已修复（从 `/public/` 改为 `/`）
- 应用初始化脚本已更新

## 关键变更

### 1. 路径变更

**CSS 文件**：
- 旧：`/public/css/modern-ui.css`
- 新：`/css/modern-ui.css`

**JavaScript 文件**：
- 旧：`/public/js/auth.js`
- 新：`/js/auth.js`

### 2. 新架构模块

#### 核心模块
- `StateManager` - 状态管理（替代全局变量）
- `Router` - 路由管理（替代 switchPage）
- `App` - 应用入口

#### 服务层
- `ApiService` - API 调用封装
- `AuthService` - 认证服务（与 AuthManager 兼容）
- `I18n` - 国际化服务（使用现有的 translations.js）

#### 组件
- `Navigation` - 导航组件（与现有导航兼容）
- `ImageUpload` - 图片上传组件（与现有上传兼容）
- `PlatformSelector` - 平台选择组件
- `StepIndicator` - 步骤指示器组件

#### 页面模块
- `Page1ProductAnalysis` - Page 1 模块
- `Page2AdsAdvisor` - Page 2 模块
- `Page3CourseEditor` - Page 3 模块
- `Page4PromptArchitect` - Page 4 模块
- `Page5Admin` - Page 5 模块

## 兼容性

### 向后兼容

新架构设计为**完全向后兼容**：

1. **现有的 `switchPage` 函数**仍然可用
   - 新架构会自动检测并使用 Router
   - 如果 Router 不可用，会回退到原始函数

2. **现有的 `AuthManager`**仍然可用
   - 新架构会集成 AuthService
   - 两者可以共存

3. **现有的导航和上传功能**仍然可用
   - 新组件会自动检测现有实现
   - 如果新组件不可用，会使用现有实现

### 渐进式迁移

可以逐步迁移功能，不需要一次性替换所有代码：

1. **第一阶段**：使用新的 CSS 系统
2. **第二阶段**：使用新的 API 服务
3. **第三阶段**：使用新的组件
4. **第四阶段**：使用新的页面模块

## 使用新架构

### 1. 状态管理

**旧方式**：
```javascript
window.productName = 'Product';
```

**新方式**：
```javascript
window.StateManager.setState('page1.productName', 'Product');
const productName = window.StateManager.getState('page1.productName');
```

### 2. API 调用

**旧方式**：
```javascript
const response = await fetch('/api/analyze-product', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

**新方式**：
```javascript
const result = await window.ApiService.post('/analyze-product', data);
// 自动处理认证、错误处理等
```

### 3. 页面导航

**旧方式**：
```javascript
switchPage('page2');
```

**新方式**：
```javascript
window.Router.navigateTo('page2');
// 或者继续使用 switchPage（已自动集成）
```

### 4. 图片上传

**旧方式**：
```javascript
const fileInput = document.getElementById('imageUpload');
// 手动处理文件选择、预览等
```

**新方式**：
```javascript
const imageUpload = new ImageUpload(uploadArea, {
  maxFiles: 5,
  maxSize: 10 * 1024 * 1024,
  showPreview: true
});
imageUpload.init();
const files = imageUpload.getFiles();
```

### 5. 国际化

**旧方式**：
```javascript
const text = translations[currentLanguage]['product_name'];
```

**新方式**：
```javascript
const text = window.I18n.translate('product_name');
// 或简写
const text = window.t('product_name');
```

## 迁移检查清单

- [x] CSS 路径已更新
- [x] JavaScript 路径已更新
- [x] 应用初始化脚本已更新
- [x] Router 与现有 switchPage 兼容
- [x] Navigation 组件与现有导航兼容
- [x] ImageUpload 组件与现有上传兼容
- [x] AuthService 与 AuthManager 兼容
- [ ] 测试页面切换功能
- [ ] 测试图片上传功能
- [ ] 测试表单提交功能
- [ ] 测试 API 调用功能
- [ ] 测试认证流程
- [ ] 测试多语言切换

## 故障排除

### 问题 1: 模块未加载

**症状**：控制台显示 "Module not found"

**解决方案**：
1. 检查文件路径是否正确（应该是 `/js/` 而不是 `/public/js/`）
2. 检查文件是否存在
3. 检查浏览器控制台是否有 404 错误

### 问题 2: 功能不工作

**症状**：某些功能（如导航、上传）不工作

**解决方案**：
1. 检查是否使用了新组件
2. 检查是否有 JavaScript 错误
3. 尝试使用回退功能（现有代码）

### 问题 3: 样式问题

**症状**：页面样式不正确

**解决方案**：
1. 检查 CSS 文件是否正确加载
2. 检查 CSS 变量是否定义
3. 检查是否有样式冲突

## 下一步

1. **测试**：全面测试所有功能
2. **优化**：根据测试结果优化代码
3. **文档**：更新用户文档
4. **培训**：培训团队成员使用新架构

## 支持

如有问题，请：
1. 查看浏览器控制台的错误信息
2. 检查 `REFACTORING_COMPLETE.md` 了解架构详情
3. 查看 `ARCHITECTURE.md` 了解设计细节

---

**最后更新**：2024年12月

