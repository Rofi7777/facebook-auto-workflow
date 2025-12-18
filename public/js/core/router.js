/**
 * 路由管理模块
 * 处理页面切换、路由注册和路由变化监听
 */
class Router {
  constructor() {
    this.routes = new Map();
    this.currentPage = null;
    this.routeChangeCallbacks = [];
    this.init();
  }

  /**
   * 初始化路由
   */
  init() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', (e) => {
      const pageId = e.state?.pageId || 'page1';
      this.navigateTo(pageId, false);
    });
  }

  /**
   * 注册路由
   * @param {string} path - 路由路径
   * @param {string} pageId - 页面ID
   * @param {Function} handler - 路由处理器（可选）
   */
  registerRoute(path, pageId, handler = null) {
    this.routes.set(path, {
      pageId,
      handler
    });
  }

  /**
   * 导航到指定页面
   * @param {string} pageId - 页面ID
   * @param {boolean} updateHistory - 是否更新浏览器历史
   */
  navigateTo(pageId, updateHistory = true) {
    // 兼容旧的 switchPage 调用
    if (typeof window.switchPage === 'function' && !window.switchPage._migrated) {
      // 如果旧的 switchPage 存在且未被迁移，先调用它以确保兼容性
      try {
        window.switchPage(pageId);
      } catch (e) {
        console.warn('[Router] Old switchPage failed, using new router:', e);
      }
    }
    console.log('[Router] Navigating to:', pageId);

    // 隐藏所有页面
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
      page.style.visibility = 'hidden';
      page.style.opacity = '0';
    });

    // 移除所有按钮的 active 状态
    const allButtons = document.querySelectorAll('.tab-btn');
    allButtons.forEach(btn => {
      btn.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (!targetPage) {
      console.error('[Router] Page not found:', pageId);
      return false;
    }

    // 设置页面可见
    targetPage.classList.add('active');
    targetPage.style.display = 'block';
    targetPage.style.visibility = 'visible';
    targetPage.style.opacity = '1';

    // 特殊处理 page4 和 page5 - 确保所有内容可见
    if (pageId === 'page4' || pageId === 'page5') {
      // 确保工作流容器可见
      const workflowContainers = targetPage.querySelectorAll('.workflow-container');
      workflowContainers.forEach(container => {
        container.style.display = 'grid';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      });
      
      // 确保所有面板可见
      const panels = targetPage.querySelectorAll('.modern-card, .input-panel, .output-panel, .admin-panel, .prompt-mode');
      panels.forEach(panel => {
        panel.style.display = panel.classList.contains('workflow-container') ? 'grid' : 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
      });
      
      // Page 4 特殊处理：确保模式表单可见
      if (pageId === 'page4') {
        const businessMode = targetPage.querySelector('#businessMode');
        const codingMode = targetPage.querySelector('#codingMode');
        const imageMode = targetPage.querySelector('#imageMode');
        
        // 默认显示business模式
        if (businessMode) {
          businessMode.style.display = 'block';
          businessMode.style.visibility = 'visible';
          businessMode.style.opacity = '1';
        }
        if (codingMode) {
          codingMode.style.display = 'none';
        }
        if (imageMode) {
          imageMode.style.display = 'none';
        }
        
        // 确保输出面板可见
        const outputPanel = targetPage.querySelector('.output-panel');
        if (outputPanel) {
          outputPanel.style.display = 'block';
          outputPanel.style.visibility = 'visible';
          outputPanel.style.opacity = '1';
        }
        
        const promptResult = targetPage.querySelector('#promptResult');
        if (promptResult) {
          promptResult.style.display = 'block';
          promptResult.style.visibility = 'visible';
          promptResult.style.opacity = '1';
        }
      }
    }

    // 设置对应按钮为 active
    const targetBtn = document.querySelector(`.tab-btn[data-page="${pageId}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
    }

    // 更新当前页面
    const oldPage = this.currentPage;
    this.currentPage = pageId;

    // 更新浏览器历史
    if (updateHistory) {
      window.history.pushState({ pageId }, '', `#${pageId}`);
    }

    // 触发路由变化事件
    this.triggerRouteChange(pageId, oldPage);

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 触发页面显示事件
    this.emit('page:show', { pageId, oldPage });

    return true;
  }

  /**
   * 获取当前页面
   * @returns {string} 当前页面ID
   */
  getCurrentPage() {
    return this.currentPage || 'page1';
  }

  /**
   * 监听路由变化
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  onRouteChange(callback) {
    this.routeChangeCallbacks.push(callback);
    return () => {
      const index = this.routeChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.routeChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发路由变化事件
   * @param {string} newPage - 新页面ID
   * @param {string} oldPage - 旧页面ID
   */
  triggerRouteChange(newPage, oldPage) {
    this.routeChangeCallbacks.forEach(callback => {
      try {
        callback(newPage, oldPage);
      } catch (error) {
        console.error('[Router] Error in route change callback:', error);
      }
    });
  }

  /**
   * 事件发射器（用于组件间通信）
   */
  emit(event, data) {
    const eventName = `router:${event}`;
    const customEvent = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(customEvent);
  }

  /**
   * 初始化默认路由
   */
  initDefaultRoutes() {
    // 注册默认页面路由
    this.registerRoute('#page1', 'page1');
    this.registerRoute('#page2', 'page2');
    this.registerRoute('#page3', 'page3');
    this.registerRoute('#page4', 'page4');
    this.registerRoute('#page5', 'page5');

    // 检查URL hash并导航
    const hash = window.location.hash.slice(1);
    if (hash && this.routes.has(`#${hash}`)) {
      this.navigateTo(hash, false);
    } else {
      this.navigateTo('page1', false);
    }
  }
}

// 创建单例实例
const router = new Router();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = router;
} else {
  window.Router = router;
}
