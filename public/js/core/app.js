/**
 * 应用主入口
 * 初始化所有模块，管理应用生命周期
 */
class App {
  constructor() {
    this.initialized = false;
    this.modules = [];
  }

  /**
   * 初始化应用
   */
  async init() {
    if (this.initialized) {
      console.warn('[App] Already initialized');
      return;
    }

    console.log('[App] Initializing...');

    try {
      // 等待DOM加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // 初始化路由
      if (window.Router) {
        window.Router.initDefaultRoutes();
        console.log('[App] Router initialized');
      }

      // 初始化状态管理
      if (window.StateManager) {
        window.StateManager.restorePersisted();
        console.log('[App] State manager initialized');
      }

      // 初始化国际化
      if (window.I18n) {
        const savedLang = localStorage.getItem('app_language') || 'zh-TW';
        window.I18n.setLanguage(savedLang);
        console.log('[App] I18n initialized');
      }

      // 初始化认证
      if (window.AuthService) {
        const isAuthenticated = window.AuthService.isAuthenticated();
        console.log('[App] Auth service initialized, authenticated:', isAuthenticated);
      }

      // 初始化导航组件
      if (window.Navigation) {
        window.Navigation.init();
        console.log('[App] Navigation initialized');
      }

      // 标记为已初始化
      this.initialized = true;
      console.log('[App] Initialization complete');

      // 触发应用就绪事件
      this.emit('app:ready');
    } catch (error) {
      console.error('[App] Initialization error:', error);
      throw error;
    }
  }

  /**
   * 启动应用
   */
  async start() {
    if (!this.initialized) {
      await this.init();
    }

    console.log('[App] Starting...');

    // 触发应用启动事件
    this.emit('app:start');
  }

  /**
   * 注册模块
   * @param {string} name - 模块名称
   * @param {Object} module - 模块对象
   */
  registerModule(name, module) {
    this.modules.push({ name, module });
    console.log(`[App] Module registered: ${name}`);
  }

  /**
   * 获取模块
   * @param {string} name - 模块名称
   * @returns {Object} 模块对象
   */
  getModule(name) {
    const found = this.modules.find(m => m.name === name);
    return found ? found.module : null;
  }

  /**
   * 销毁应用
   */
  destroy() {
    console.log('[App] Destroying...');

    // 清理所有模块
    this.modules.forEach(({ name, module }) => {
      if (module && typeof module.destroy === 'function') {
        try {
          module.destroy();
          console.log(`[App] Module destroyed: ${name}`);
        } catch (error) {
          console.error(`[App] Error destroying module ${name}:`, error);
        }
      }
    });

    this.modules = [];
    this.initialized = false;

    // 触发应用销毁事件
    this.emit('app:destroy');
  }

  /**
   * 事件发射器
   */
  emit(event, data) {
    const customEvent = new CustomEvent(`app:${event}`, { detail: data });
    window.dispatchEvent(customEvent);
  }
}

// 创建应用实例
const app = new App();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
} else {
  window.App = app;
}

// 自动初始化（如果DOM已加载）
if (document.readyState !== 'loading') {
  app.init().catch(error => {
    console.error('[App] Auto-init failed:', error);
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    app.init().catch(error => {
      console.error('[App] DOMContentLoaded init failed:', error);
    });
  });
}
