/**
 * Page 5: Admin Console Module
 * Handles user management and database management
 */
class Page5Admin {
  constructor() {
    this.pageId = 'page5';
  }

  async init() {
    console.log('[Page5] Initializing...');
    await this.waitForDOM();
    
    // 如果已有AdminConsole，使用它
    if (typeof AdminConsole !== 'undefined') {
      AdminConsole.init();
    } else {
      this.initBasicHandlers();
    }
    
    console.log('[Page5] Initialized');
  }

  async waitForDOM() {
    const maxWait = 5000;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      if (document.getElementById(this.pageId)) return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(`Page element #${this.pageId} not found`);
  }

  initBasicHandlers() {
    // 基本的事件处理
    // AdminConsole应该已经处理了大部分逻辑
    console.log('[Page5] Using existing AdminConsole');
  }

  destroy() {
    // Cleanup if needed
    if (typeof AdminConsole !== 'undefined' && AdminConsole.destroy) {
      AdminConsole.destroy();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Page5Admin;
} else {
  window.Page5Admin = Page5Admin;
}
