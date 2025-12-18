# Googa AI Hub - 完整产品需求文档 (PRD)

## 1. 产品概述 (Executive Summary)

### 1.1 产品愿景

Googa AI Hub 是一个基于 Google Gemini AI 的多功能内容生成平台，为品牌（Googoogaga）提供一站式 AI 驱动的营销内容创作工具。平台整合了产品分析、多平台内容生成、广告优化、课程编辑和 Prompt 架构等核心功能。

### 1.2 核心价值主张

- **AI 产品分析**：通过图像识别和 AI 分析，自动提取产品特征、痛点和使用场景
- **多平台内容生成**：支持 TikTok、Shopee、Facebook、Instagram 等平台的内容自动生成
- **AI 广告顾问**：智能分析广告效果，提供优化建议
- **AI 课程编辑专家**：根据年龄、科目、主题自动生成教育课程内容
- **AI 指令架构师**：将自然语言需求转换为专业级 Prompt（商业顾问、软件开发、视觉绘图三种模式）
- **管理员控制台**：完整的用户管理和数据库管理功能

### 1.3 目标用户

- **品牌营销人员**：需要快速生成多平台营销内容
- **教育工作者**：需要快速创建课程内容
- **内容创作者**：需要专业的 AI Prompt 生成工具
- **系统管理员**：需要管理用户和数据库

## 2. 功能需求规格 (Functional Requirements)

### 2.1 Page 1: AI 图片生成 (产品分析与内容生成)

#### 核心功能

1. **产品信息输入**
   - 产品名称（必填）
   - 产品描述（可选）
   - 产品图片上传（支持多图，最多5张，每张最大10MB）
   - 支持拖拽和点击上传

2. **平台选择**
   - 图标式多选：TikTok、Shopee、Facebook、Instagram
   - 默认全选

3. **语言选择**
   - 繁体中文、越南文、双语

4. **AI 分析流程**
   - Step 1: 产品信息输入
   - Step 2: AI 分析（调用 `/api/analyze-product`）
   - Step 3: 内容生成（调用 `/api/generate-platform-content`）

5. **场景生成**
   - 生成营销场景（调用 `/api/generate-scenarios`）

#### API 端点

- `POST /api/upload-image` - 图片上传
- `POST /api/analyze-product` - 产品分析（需要认证）
- `POST /api/generate-platform-content` - 多平台内容生成（需要认证）
- `POST /api/generate-scenarios` - 场景生成（需要认证）

### 2.2 Page 2: AI 广告顾问

#### 核心功能

1. **广告分析**
   - 上传广告图片
   - 选择目标平台
   - AI 分析广告效果

2. **优化建议**
   - 自动生成优化建议
   - 多语言支持

#### API 端点

- `POST /api/analyze-ads` - 广告分析（需要认证）

### 2.3 Page 3: AI 课程编辑专家

#### 核心功能

1. **课程参数设置**
   - 听者年龄（3-5岁、6-8岁、9-11岁、12-14岁、自定义）
   - 科别（社会、自然、数学、语文、艺术、自定义）
   - 主题（根据科别动态生成模板 + 自定义）
   - 课程时间（30/60/90分钟、自定义）
   - 课纲编排风格（故事引导式、游戏互动式、实验探索式、讨论思辨式、项目导向式）
   - 输出格式（课纲、教案、故事、Worksheet、Slides，多选）
   - 是否包含 AI 图片

2. **内容生成**
   - 根据参数生成完整课程内容
   - 支持 Word/PDF 导出

#### API 端点

- `POST /api/generate-course` - 课程生成（需要认证）
- `POST /api/export-course` - 课程导出（需要认证）

### 2.4 Page 4: AI 指令架构师 (BizPrompt Architect Pro)

#### 核心功能

1. **三态切换系统**
   - 商业顾问模式
   - 软件开发模式
   - 视觉绘图模式

2. **商业顾问模式**
   - L1 领域选择（市场行销、企业战略、业务销售、产品管理、财务分析、人力资源、自定义）
   - L2 赛道选择（根据 L1 动态生成）
   - L3 角色选择（根据 L2 动态生成）
   - L4 模型/框架选择（根据 L3 动态生成）
   - 具体任务描述
   - 生成专业 Prompt

3. **软件开发模式**
   - 自然语言需求描述
   - 参考资料上传（图片、PDF、Excel、Word、PPT、MD）
   - 网址输入
   - 目标平台选择（Web、Mobile、Desktop、API、Full Stack）
   - 复杂度选择（MVP、Standard、Enterprise）
   - 生成结构化 PRD

4. **视觉绘图模式**
   - 画面描述
   - 参考资料上传
   - 目标图像模型选择（Nano Banana、GPT DALL-E 3、Midjourney、自定义）
   - 艺术风格选择
   - 画面比例选择
   - 品质标签选择
   - 进阶选项（画数、输出格式）
   - 生成绘图指令

5. **输出功能**
   - 一键复制
   - 导出 Word

#### API 端点

- `POST /api/refine-prompt` - Prompt 生成（需要认证）

### 2.5 Page 5: 管理员控制台

#### 核心功能

1. **用户管理**
   - 待审核用户列表
   - 所有用户列表
   - 用户状态管理（审核、暂停、提升/降级角色、删除）

2. **数据库管理**
   - 数据表列表
   - 表结构查看
   - 数据查看（分页）
   - 数据操作（插入、编辑、删除、批量删除）
   - 数据导出（CSV、JSON）
   - SQL 执行（仅超级管理员）

3. **系统统计**
   - 用户统计
   - 数据表统计
   - 最近活动

#### API 端点

- `GET /api/admin/users` - 获取所有用户（需要管理员权限）
- `GET /api/admin/pending` - 获取待审核用户（需要管理员权限）
- `POST /api/admin/users/:userId/approve` - 审核用户（需要管理员权限）
- `POST /api/admin/users/:userId/suspend` - 暂停用户（需要管理员权限）
- `POST /api/admin/users/:userId/promote` - 提升用户角色（需要超级管理员权限）
- `DELETE /api/admin/users/:userId` - 删除用户（需要超级管理员权限）
- `GET /api/admin/db/tables` - 获取数据表列表（需要管理员权限）
- `GET /api/admin/db/tables/:tableName/schema` - 获取表结构（需要管理员权限）
- `GET /api/admin/db/tables/:tableName/rows` - 获取表数据（需要管理员权限）
- `POST /api/admin/db/tables/:tableName/rows` - 插入数据（需要超级管理员权限）
- `PUT /api/admin/db/tables/:tableName/rows/:rowId` - 更新数据（需要超级管理员权限）
- `DELETE /api/admin/db/tables/:tableName/rows/:rowId` - 删除数据（需要超级管理员权限）
- `POST /api/admin/db/tables/:tableName/rows/bulk-delete` - 批量删除（需要超级管理员权限）
- `POST /api/admin/db/sql` - 执行 SQL（需要超级管理员权限）
- `GET /api/admin/db/tables/:tableName/export` - 导出数据（需要管理员权限）
- `GET /api/admin/db/stats` - 获取统计信息（需要管理员权限）

### 2.6 通用功能

#### 用户认证

- 注册/登录（Supabase Auth）
- JWT Token 管理
- 自动 Token 刷新
- 登出功能

#### 多语言支持

- 繁体中文 (zh-TW)
- 英文 (en)
- 越南文 (vi)
- 使用 `data-i18n` 属性实现国际化

#### 响应式设计

- 桌面端优化
- 移动端适配

## 3. 技术架构重构方案

### 3.1 当前问题分析

1. **代码组织混乱**
   - `index.html` 文件过大（7000+ 行）
   - HTML、CSS、JavaScript 混合在一个文件中
   - 难以维护和调试

2. **JavaScript 模块化不足**
   - 多个 JS 文件但缺乏清晰的模块边界
   - 全局变量污染
   - 事件绑定混乱
   - 初始化顺序问题

3. **CSS 样式冲突**
   - 内联样式和外部 CSS 混用
   - 样式优先级问题
   - `!important` 过度使用

4. **页面切换问题**
   - `switchPage` 函数逻辑不完善
   - 页面显示/隐藏逻辑混乱
   - 事件委托处理不当

5. **文件上传问题**
   - 拖拽和点击事件冲突
   - 文件预览逻辑不完善

### 3.2 重构架构设计

#### 3.2.1 前端架构

```
public/
├── index.html (精简版，只包含基本结构和页面容器)
├── css/
│   ├── reset.css (CSS 重置)
│   ├── variables.css (CSS 变量定义)
│   ├── layout.css (布局样式)
│   ├── components.css (组件样式)
│   ├── pages.css (页面特定样式)
│   └── modern-ui.css (现代化 UI 样式)
├── js/
│   ├── core/
│   │   ├── app.js (应用主入口)
│   │   ├── router.js (路由管理)
│   │   └── state.js (状态管理)
│   ├── services/
│   │   ├── api.js (API 调用封装)
│   │   ├── auth.js (认证服务)
│   │   └── i18n.js (国际化服务)
│   ├── components/
│   │   ├── Navigation.js (导航组件)
│   │   ├── ImageUpload.js (图片上传组件)
│   │   ├── PlatformSelector.js (平台选择组件)
│   │   └── StepIndicator.js (步骤指示器组件)
│   ├── pages/
│   │   ├── Page1ProductAnalysis.js (Page 1 逻辑)
│   │   ├── Page2AdsAdvisor.js (Page 2 逻辑)
│   │   ├── Page3CourseEditor.js (Page 3 逻辑)
│   │   ├── Page4PromptArchitect.js (Page 4 逻辑)
│   │   └── Page5Admin.js (Page 5 逻辑)
│   └── utils/
│       ├── dom.js (DOM 工具函数)
│       ├── validation.js (表单验证)
│       └── file.js (文件处理工具)
└── templates/
    ├── page1.html (Page 1 模板)
    ├── page2.html (Page 2 模板)
    ├── page3.html (Page 3 模板)
    ├── page4.html (Page 4 模板)
    └── page5.html (Page 5 模板)
```

#### 3.2.2 核心设计原则

1. **关注点分离**
   - HTML：结构
   - CSS：样式
   - JavaScript：行为

2. **模块化设计**
   - 每个页面独立模块
   - 可复用的组件
   - 清晰的服务层

3. **事件驱动架构**
   - 使用事件总线进行组件通信
   - 避免全局变量
   - 统一的事件处理机制

4. **状态管理**
   - 集中式状态管理
   - 响应式更新
   - 状态持久化

#### 3.2.3 重构实施步骤

**阶段 1: 基础架构搭建**
1. 创建新的目录结构
2. 拆分 `index.html` 为多个模板文件
3. 创建核心模块（app.js, router.js, state.js）
4. 实现路由系统

**阶段 2: 组件化重构**
1. 提取可复用组件（Navigation, ImageUpload, PlatformSelector）
2. 重构每个页面的 JavaScript 逻辑
3. 统一事件处理机制
4. 实现组件生命周期管理

**阶段 3: 样式系统重构**
1. 创建 CSS 变量系统
2. 拆分 CSS 为模块化文件
3. 移除内联样式
4. 建立样式优先级规范

**阶段 4: 功能优化**
1. 优化页面切换逻辑
2. 修复文件上传功能
3. 完善错误处理
4. 添加加载状态管理

**阶段 5: 测试与优化**
1. 功能测试
2. 性能优化
3. 浏览器兼容性测试
4. 响应式设计验证

### 3.3 后端架构（保持不变）

后端 API 接口保持不变，确保：
- 所有现有 API 端点继续工作
- 请求/响应格式不变
- 认证机制不变
- 错误处理逻辑不变

## 4. UI/UX 设计规范

### 4.1 设计系统

#### 颜色系统

- **主色调**：渐变紫色 (#1a0d2e → #2d1b4e → #4a2c7a → #6b3fa0 → #8b5ab5)
- **强调色**：天蓝色 (#87CEEB) 到粉红色 (#FFB6C1) 渐变
- **背景色**：白色卡片背景
- **文字色**：深灰色 (#333) 主文字，浅灰色 (#666) 辅助文字

#### 组件规范

- **按钮**：圆角 12px，渐变背景，悬停效果
- **卡片**：圆角 15px，阴影效果，内边距 30px
- **表单输入**：圆角 8px，边框 2px，内边距 12px
- **图标**：使用 Emoji 图标，统一大小

#### 布局规范

- **最大宽度**：1400px
- **间距系统**：8px 基础单位（8px, 16px, 24px, 32px, 40px）
- **网格系统**：12 列网格布局

### 4.2 交互规范

#### 页面切换

- 平滑过渡动画（300ms）
- 自动滚动到顶部
- 保持滚动位置（可选）

#### 表单验证

- 实时验证反馈
- 错误提示清晰
- 成功状态反馈

#### 加载状态

- 按钮加载动画
- 页面加载骨架屏
- 进度指示器

## 5. 开发计划

### 5.1 开发阶段

**Week 1: 架构设计与准备**
- 完成 PRD 文档
- 设计技术架构
- 创建项目结构
- 设置开发环境

**Week 2: 核心模块开发**
- 实现路由系统
- 实现状态管理
- 实现认证服务
- 实现 API 封装

**Week 3: 组件开发**
- 开发导航组件
- 开发图片上传组件
- 开发平台选择组件
- 开发步骤指示器组件

**Week 4: 页面重构**
- 重构 Page 1
- 重构 Page 2
- 重构 Page 3
- 重构 Page 4
- 重构 Page 5

**Week 5: 样式系统重构**
- 创建 CSS 变量系统
- 拆分 CSS 文件
- 移除内联样式
- 优化响应式设计

**Week 6: 测试与优化**
- 功能测试
- 性能优化
- 浏览器兼容性测试
- Bug 修复

### 5.2 技术栈

- **前端框架**：原生 JavaScript (ES6+)
- **构建工具**：无需构建工具（或使用 Vite 进行开发）
- **CSS 预处理器**：原生 CSS（使用 CSS 变量）
- **代码规范**：ESLint + Prettier
- **版本控制**：Git

### 5.3 质量保证

- **代码审查**：每个 PR 必须经过审查
- **测试覆盖**：关键功能必须有测试
- **文档**：每个模块必须有文档
- **性能监控**：监控页面加载时间和 API 响应时间

## 6. 风险评估与应对

### 6.1 技术风险

**风险 1: 重构过程中功能丢失**
- **应对**：完整的测试用例，逐步迁移

**风险 2: 浏览器兼容性问题**
- **应对**：使用 Babel 转译，Polyfill 支持

**风险 3: 性能下降**
- **应对**：代码分割，懒加载，性能监控

### 6.2 时间风险

**风险 1: 开发时间超期**
- **应对**：优先级排序，分阶段交付

**风险 2: 测试时间不足**
- **应对**：自动化测试，并行开发与测试

## 7. 成功标准

1. **功能完整性**：所有现有功能正常工作
2. **代码质量**：代码可维护性提升 50%
3. **性能指标**：页面加载时间 < 2s
4. **用户体验**：所有交互流畅，无卡顿
5. **浏览器兼容**：支持 Chrome、Firefox、Safari、Edge 最新版本

## 8. 后续优化方向

1. **PWA 支持**：离线功能，安装到桌面
2. **性能优化**：代码分割，懒加载，CDN
3. **功能扩展**：更多平台支持，更多 AI 模型
4. **数据分析**：用户行为分析，使用统计
5. **移动端 App**：React Native 或 Flutter 开发


