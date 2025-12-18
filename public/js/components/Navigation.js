/**
 * 导航组件
 * 处理页面导航、按钮状态管理和导航事件
 */
class Navigation {
  constructor() {
    this.container = null;
    this.buttons = [];
    this.currentPage = null;
    this.onPageChangeCallbacks = [];
    this.initialized = false;
  }

  /**
   * 初始化导航组件
   * @param {string|HTMLElement} container - 容器选择器或元素
   */
  init(container = null) {
    if (this.initialized) {
      console.warn('[Navigation] Already initialized');
      return;
    }

    // 查找容器
    if (container) {
      this.container = typeof container === 'string' 
        ? document.querySelector(container) 
        : container;
    } else {
      this.container = document.getElementById('tabNavigation') || 
                       document.querySelector('.tab-navigation');
    }

    if (!this.container) {
      console.warn('[Navigation] Container not found');
      return;
    }

    // 查找所有导航按钮
    this.buttons = Array.from(this.container.querySelectorAll('.tab-btn[data-page]'));

    // 绑定事件
    this.bindEvents();

    // 设置当前页面
    const activeButton = this.container.querySelector('.tab-btn.active');
    if (activeButton) {
      this.currentPage = activeButton.getAttribute('data-page');
    }

    this.initialized = true;
    console.log('[Navigation] Initialized with', this.buttons.length, 'buttons');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 使用事件委托
    this.container.addEventListener('click', (e) => {
      const button = e.target.closest('.tab-btn[data-page]');
      if (button) {
        e.preventDefault();
        e.stopPropagation();
        
        const pageId = button.getAttribute('data-page');
        if (pageId) {
          this.navigateTo(pageId);
        }
      }
    });

    // 监听路由变化
    if (window.Router) {
      window.Router.onRouteChange((newPage, oldPage) => {
        this.setActivePage(newPage);
      });
    }
  }

  /**
   * 导航到指定页面
   * @param {string} pageId - 页面ID
   */
  navigateTo(pageId) {
    if (this.currentPage === pageId) {
      return;
    }

    // 使用Router导航（如果可用）
    if (window.Router) {
      window.Router.navigateTo(pageId);
    } else {
      // 回退到直接切换
      this.switchPage(pageId);
    }

    this.setActivePage(pageId);
    this.currentPage = pageId;

    // 触发页面变化事件
    this.triggerPageChange(pageId);
  }

  /**
   * 设置活动页面
   * @param {string} pageId - 页面ID
   */
  setActivePage(pageId) {
    // 移除所有按钮的active状态
    this.buttons.forEach(btn => {
      btn.classList.remove('active');
    });

    // 设置目标按钮为active
    const targetButton = this.container.querySelector(`.tab-btn[data-page="${pageId}"]`);
    if (targetButton) {
      targetButton.classList.add('active');
    }
  }

  /**
   * 切换页面（直接方式，不使用Router）
   * @param {string} pageId - 页面ID
   */
  switchPage(pageId) {
    // 隐藏所有页面
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.style.display = 'block';
      targetPage.style.visibility = 'visible';
      targetPage.style.opacity = '1';

      // 特殊处理 page4 和 page5
      if (pageId === 'page4' || pageId === 'page5') {
        const containers = targetPage.querySelectorAll(
          '.workflow-container, .modern-card, .input-panel, .output-panel, .admin-panel'
        );
        containers.forEach(container => {
          if (container.classList.contains('workflow-container')) {
            container.style.display = 'grid';
          } else {
            container.style.display = 'block';
          }
          container.style.visibility = 'visible';
          container.style.opacity = '1';
        });
      }

      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * 监听页面变化
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  onPageChange(callback) {
    this.onPageChangeCallbacks.push(callback);
    return () => {
      const index = this.onPageChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onPageChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发页面变化事件
   * @param {string} pageId - 页面ID
   */
  triggerPageChange(pageId) {
    this.onPageChangeCallbacks.forEach(callback => {
      try {
        callback(pageId, this.currentPage);
      } catch (error) {
        console.error('[Navigation] Error in page change callback:', error);
      }
    });
  }

  /**
   * 渲染导航（如果需要动态生成）
   * @param {Array} pages - 页面配置数组
   */
  render(pages) {
    if (!this.container) {
      console.error('[Navigation] Container not found');
      return;
    }

    this.container.innerHTML = '';
    pages.forEach(page => {
      const button = document.createElement('button');
      button.className = 'tab-btn';
      button.setAttribute('data-page', page.id);
      button.textContent = page.label;
      if (page.active) {
        button.classList.add('active');
      }
      this.container.appendChild(button);
    });

    this.buttons = Array.from(this.container.querySelectorAll('.tab-btn[data-page]'));
    this.bindEvents();
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.onPageChangeCallbacks = [];
    this.buttons = [];
    this.container = null;
    this.initialized = false;
  }
}

// 创建单例实例
const navigation = new Navigation();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = navigation;
} else {
  window.Navigation = navigation;
}

// 自动初始化
if (document.readyState !== 'loading') {
  navigation.init();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    navigation.init();
  });
}
