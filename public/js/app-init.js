/**
 * Application Initialization Script
 * 初始化新架构并集成现有代码
 */

// 全局页面模块实例
window.pageModules = {};

// 等待DOM和所有脚本加载完成
(async function() {
  console.log('[App Init] Starting application initialization...');
  
  // 等待DOM加载
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }
  
  // 等待核心模块加载
  await waitForModules(['StateManager', 'Router', 'App', 'ApiService', 'AuthService', 'I18n']);
  
  try {
    // 1. 初始化应用核心
    if (window.App) {
      await window.App.init();
      console.log('[App Init] Core app initialized');
    }
    
    // 2. 初始化国际化
    if (window.I18n) {
      const savedLang = localStorage.getItem('app_language') || 'zh-TW';
      window.I18n.setLanguage(savedLang);
      console.log('[App Init] I18n initialized with language:', savedLang);
    }
    
    // 3. 初始化导航组件
    if (window.Navigation) {
      window.Navigation.init();
      console.log('[App Init] Navigation initialized');
    }
    
    // 4. 初始化各个页面模块
    await initializePageModules();
    
    // 5. 集成现有功能
    integrateExistingFeatures();
    
    // 6. 设置路由监听
    setupRouteListeners();
    
    // 7. 启动应用
    if (window.App) {
      await window.App.start();
    }
    
    console.log('[App Init] Application initialization complete');
    
  } catch (error) {
    console.error('[App Init] Initialization error:', error);
    // 即使初始化失败，也确保基本功能可用
    fallbackInitialization();
  }
})();

/**
 * 初始化页面模块
 */
async function initializePageModules() {
  const pages = [
    { name: 'Page1ProductAnalysis', id: 'page1' },
    { name: 'Page2AdsAdvisor', id: 'page2' },
    { name: 'Page3CourseEditor', id: 'page3' },
    { name: 'Page4PromptArchitect', id: 'page4' },
    { name: 'Page5Admin', id: 'page5' }
  ];
  
  for (const page of pages) {
    if (window[page.name]) {
      try {
        const pageModule = new window[page.name]();
        await pageModule.init();
        window.pageModules[page.id] = pageModule;
        console.log(`[App Init] ${page.name} initialized`);
      } catch (error) {
        console.error(`[App Init] Error initializing ${page.name}:`, error);
      }
    }
  }
}

/**
 * 集成现有功能
 */
function integrateExistingFeatures() {
  // 1. 集成现有的 switchPage 函数
  if (typeof window.switchPage === 'function') {
    const originalSwitchPage = window.switchPage;
    window.switchPage = function(pageId, event) {
      // 使用新的Router
      if (window.Router) {
        window.Router.navigateTo(pageId);
      } else {
        // 回退到原始函数
        originalSwitchPage(pageId, event);
      }
    };
    console.log('[App Init] switchPage integrated with Router');
  }
  
  // 2. 集成现有的 AuthManager
  if (window.AuthManager && window.AuthService) {
    // 确保 AuthManager 使用新的 AuthService
    const originalSignIn = window.AuthManager.signIn;
    window.AuthManager.signIn = async function(email, password) {
      try {
        const result = await window.AuthService.signIn(email, password);
        // 更新UI
        this.updateUI(true);
        return result;
      } catch (error) {
        throw error;
      }
    };
    console.log('[App Init] AuthManager integrated with AuthService');
  }
  
  // 3. 集成图片上传功能
  if (window.initImageUpload) {
    // 延迟初始化，确保新组件已加载
    setTimeout(() => {
      const uploadArea = document.getElementById('uploadArea');
      if (uploadArea && window.ImageUpload) {
        // 使用新的 ImageUpload 组件
        const imageUpload = new window.ImageUpload(uploadArea, {
          maxFiles: 5,
          maxSize: 10 * 1024 * 1024,
          showPreview: true
        });
        imageUpload.init();
        window.pageModules.page1.imageUpload = imageUpload;
        console.log('[App Init] Image upload integrated with new component');
      } else {
        // 回退到原有函数
        window.initImageUpload();
      }
    }, 500);
  }
  
  // 4. 集成导航功能
  if (window.initTabNavigation) {
    // 延迟初始化
    setTimeout(() => {
      if (window.Navigation && window.Navigation.initialized) {
        console.log('[App Init] Navigation already initialized by component');
      } else {
        window.initTabNavigation();
        console.log('[App Init] Navigation initialized with existing function');
      }
    }, 500);
  }
}

/**
 * 设置路由监听
 */
function setupRouteListeners() {
  if (window.Router) {
    // 监听路由变化
    window.Router.onRouteChange((newPage, oldPage) => {
      console.log(`[App Init] Route changed from ${oldPage} to ${newPage}`);
      
      // 更新导航组件
      if (window.Navigation) {
        window.Navigation.setActivePage(newPage);
      }
      
      // 更新状态管理
      if (window.StateManager) {
        window.StateManager.setState('currentPage', newPage);
      }
      
      // 触发页面显示事件
      if (window.pageModules[newPage]) {
        // 可以在这里调用页面的 beforeShow/afterShow 方法
        console.log(`[App Init] Page module ${newPage} is active`);
      }
    });
  }
}

/**
 * 等待模块加载
 */
function waitForModules(moduleNames, maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    const checkModules = () => {
      const allLoaded = moduleNames.every(name => {
        return window[name] !== undefined;
      });
      
      if (allLoaded) {
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        const missing = moduleNames.filter(name => !window[name]);
        console.warn(`[App Init] Some modules not loaded: ${missing.join(', ')}`);
        // 不拒绝，允许部分模块缺失
        resolve();
      } else {
        setTimeout(checkModules, checkInterval);
      }
    };
    
    checkModules();
  });
}

/**
 * 回退初始化（当主初始化失败时）
 */
function fallbackInitialization() {
  console.log('[App Init] Using fallback initialization');
  
  // 确保基本的导航功能可用
  if (typeof window.switchPage === 'function') {
    console.log('[App Init] Basic switchPage function available');
  }
  
  // 确保认证功能可用
  if (window.AuthManager) {
    console.log('[App Init] AuthManager available');
  }
  
  // 初始化导航（如果存在）
  if (window.initTabNavigation) {
    setTimeout(() => {
      window.initTabNavigation();
    }, 1000);
  }
  
  // 初始化图片上传（如果存在）
  if (window.initImageUpload) {
    setTimeout(() => {
      window.initImageUpload();
    }, 1000);
  }
}

/**
 * 全局错误处理
 */
window.addEventListener('error', function(event) {
  console.error('[App Init] Global error:', event.error);
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('[App Init] Unhandled promise rejection:', event.reason);
});
