# Googa AI Hub - 架构设计文档

## 1. 目录结构

```
public/
├── index.html                    # 精简版主页面，只包含基本结构和页面容器
├── css/
│   ├── reset.css                 # CSS 重置
│   ├── variables.css             # CSS 变量定义（颜色、间距、字体等）
│   ├── layout.css                # 布局样式（header、container、grid等）
│   ├── components.css            # 组件样式（button、card、form等）
│   ├── pages.css                 # 页面特定样式
│   └── modern-ui.css             # 现代化 UI 样式（保留现有）
├── js/
│   ├── core/
│   │   ├── app.js                # 应用主入口，初始化所有模块
│   │   ├── router.js             # 路由管理，处理页面切换
│   │   └── state.js              # 状态管理，集中式状态存储
│   ├── services/
│   │   ├── api.js                # API 调用封装，统一请求处理
│   │   ├── auth.js               # 认证服务，处理登录/登出/Token
│   │   └── i18n.js               # 国际化服务，处理多语言切换
│   ├── components/
│   │   ├── Navigation.js          # 导航组件，处理页面切换
│   │   ├── ImageUpload.js        # 图片上传组件，处理文件上传
│   │   ├── PlatformSelector.js   # 平台选择组件，处理多平台选择
│   │   └── StepIndicator.js     # 步骤指示器组件，显示进度
│   ├── pages/
│   │   ├── Page1ProductAnalysis.js  # Page 1 逻辑
│   │   ├── Page2AdsAdvisor.js       # Page 2 逻辑
│   │   ├── Page3CourseEditor.js     # Page 3 逻辑
│   │   ├── Page4PromptArchitect.js  # Page 4 逻辑
│   │   └── Page5Admin.js            # Page 5 逻辑
│   └── utils/
│       ├── dom.js                # DOM 工具函数
│       ├── validation.js        # 表单验证工具
│       └── file.js               # 文件处理工具
└── templates/
    ├── page1.html                # Page 1 HTML 模板
    ├── page2.html                # Page 2 HTML 模板
    ├── page3.html                # Page 3 HTML 模板
    ├── page4.html                # Page 4 HTML 模板
    └── page5.html                # Page 5 HTML 模板
```

## 2. 核心模块设计

### 2.1 app.js - 应用主入口

**职责**：
- 初始化所有模块
- 管理应用生命周期
- 协调各模块之间的通信

**主要方法**：
- `init()` - 初始化应用
- `start()` - 启动应用
- `destroy()` - 销毁应用

### 2.2 router.js - 路由管理

**职责**：
- 管理页面路由
- 处理页面切换
- 管理页面状态

**主要方法**：
- `registerRoute(path, pageId, handler)` - 注册路由
- `navigateTo(pageId)` - 导航到指定页面
- `getCurrentPage()` - 获取当前页面
- `onRouteChange(callback)` - 监听路由变化

### 2.3 state.js - 状态管理

**职责**：
- 集中式状态存储
- 状态变更通知
- 状态持久化

**主要方法**：
- `setState(key, value)` - 设置状态
- `getState(key)` - 获取状态
- `subscribe(key, callback)` - 订阅状态变化
- `persist(key)` - 持久化状态

## 3. 服务层设计

### 3.1 api.js - API 调用封装

**职责**：
- 统一 API 请求处理
- 自动添加认证 Token
- 统一错误处理
- 请求/响应拦截

**主要方法**：
- `get(url, params)` - GET 请求
- `post(url, data)` - POST 请求
- `put(url, data)` - PUT 请求
- `delete(url)` - DELETE 请求
- `upload(url, file, onProgress)` - 文件上传

### 3.2 auth.js - 认证服务

**职责**：
- 用户登录/注册
- Token 管理
- 自动 Token 刷新
- 认证状态管理

**主要方法**：
- `login(email, password)` - 登录
- `register(email, password)` - 注册
- `logout()` - 登出
- `getToken()` - 获取 Token
- `isAuthenticated()` - 检查是否已认证
- `refreshToken()` - 刷新 Token

### 3.3 i18n.js - 国际化服务

**职责**：
- 多语言切换
- 文本翻译
- 语言资源管理

**主要方法**：
- `setLanguage(lang)` - 设置语言
- `getLanguage()` - 获取当前语言
- `translate(key)` - 翻译文本
- `onLanguageChange(callback)` - 监听语言变化

## 4. 组件设计

### 4.1 Navigation - 导航组件

**职责**：
- 渲染导航栏
- 处理导航点击
- 高亮当前页面

**接口**：
- `render(container)` - 渲染导航
- `setActivePage(pageId)` - 设置当前页面
- `onPageChange(callback)` - 监听页面切换

### 4.2 ImageUpload - 图片上传组件

**职责**：
- 文件选择（点击/拖拽）
- 文件预览
- 文件上传
- 上传进度显示

**接口**：
- `render(container, options)` - 渲染上传组件
- `getFiles()` - 获取选中的文件
- `clear()` - 清空文件
- `onUpload(callback)` - 监听上传事件
- `onProgress(callback)` - 监听上传进度

### 4.3 PlatformSelector - 平台选择组件

**职责**：
- 渲染平台选择器
- 处理平台选择/取消
- 获取选中的平台

**接口**：
- `render(container, platforms)` - 渲染选择器
- `getSelected()` - 获取选中的平台
- `setSelected(platforms)` - 设置选中的平台
- `onChange(callback)` - 监听选择变化

### 4.4 StepIndicator - 步骤指示器组件

**职责**：
- 显示步骤进度
- 更新当前步骤
- 步骤状态管理

**接口**：
- `render(container, steps)` - 渲染步骤指示器
- `setCurrentStep(step)` - 设置当前步骤
- `setStepStatus(step, status)` - 设置步骤状态

## 5. 页面模块设计

### 5.1 Page1ProductAnalysis - Page 1 逻辑

**职责**：
- 管理产品信息表单
- 处理图片上传
- 调用 AI 分析 API
- 显示分析结果
- 生成多平台内容

**主要方法**：
- `init()` - 初始化页面
- `render()` - 渲染页面
- `handleAnalyze()` - 处理分析请求
- `handleGenerateContent()` - 处理内容生成
- `destroy()` - 清理页面

### 5.2-5.5 其他页面模块

类似结构，每个页面模块都有：
- `init()` - 初始化
- `render()` - 渲染
- 页面特定的业务逻辑方法
- `destroy()` - 清理

## 6. 事件系统设计

### 6.1 事件总线

使用简单的事件总线模式进行组件间通信：

```javascript
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}
```

### 6.2 事件命名规范

- `route:change` - 路由变化
- `auth:login` - 用户登录
- `auth:logout` - 用户登出
- `language:change` - 语言切换
- `page:show` - 页面显示
- `page:hide` - 页面隐藏

## 7. 数据流设计

```
用户操作
  ↓
组件事件
  ↓
事件总线
  ↓
页面模块处理
  ↓
服务层（API调用）
  ↓
状态更新
  ↓
UI 更新
```

## 8. 初始化流程

1. **加载 HTML** - 加载 `index.html`
2. **加载 CSS** - 按顺序加载所有 CSS 文件
3. **初始化核心模块** - 初始化 app.js, router.js, state.js
4. **初始化服务层** - 初始化 api.js, auth.js, i18n.js
5. **加载页面模板** - 动态加载页面 HTML 模板
6. **初始化组件** - 初始化 Navigation, ImageUpload 等组件
7. **初始化页面模块** - 初始化各个页面模块
8. **启动应用** - 显示默认页面

## 9. 错误处理

### 9.1 全局错误处理

- API 错误统一处理
- 网络错误处理
- 未捕获异常处理

### 9.2 用户友好的错误提示

- 错误消息国际化
- 错误类型分类
- 错误恢复建议

## 10. 性能优化

### 10.1 代码分割

- 按页面懒加载
- 组件按需加载

### 10.2 资源优化

- CSS 文件合并
- JavaScript 文件压缩
- 图片优化

### 10.3 缓存策略

- 静态资源缓存
- API 响应缓存（适当场景）
- 状态持久化

## 11. 浏览器兼容性

### 11.1 支持的浏览器

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

### 11.2 Polyfill

- Promise polyfill（如需要）
- Fetch polyfill（如需要）
- CSS 变量 polyfill（如需要）

## 12. 开发规范

### 12.1 代码风格

- 使用 ES6+ 语法
- 使用 const/let，避免 var
- 函数命名使用 camelCase
- 类命名使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

### 12.2 注释规范

- 每个模块必须有 JSDoc 注释
- 复杂逻辑必须有行内注释
- 公共 API 必须有文档注释

### 12.3 文件组织

- 一个文件一个类/模块
- 相关功能放在同一目录
- 工具函数放在 utils 目录


