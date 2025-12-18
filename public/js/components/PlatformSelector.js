/**
 * 平台选择组件
 * 处理多平台选择、选择状态管理和选择变化事件
 */
class PlatformSelector {
  constructor(container, platforms = null) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.platforms = platforms || [
      { id: 'tiktok', label: 'TikTok', icon: '🎵' },
      { id: 'shopee', label: 'Shopee', icon: '🛒' },
      { id: 'facebook', label: 'Facebook', icon: '📘' },
      { id: 'instagram', label: 'Instagram', icon: '📷' }
    ];
    this.selected = new Set();
    this.onChangeCallbacks = [];
    this.initialized = false;
  }

  /**
   * 初始化组件
   */
  init() {
    if (this.initialized || !this.container) {
      return;
    }

    // 渲染平台选择器
    this.render();

    // 默认全选
    this.selectAll();

    this.initialized = true;
  }

  /**
   * 渲染组件
   */
  render() {
    if (!this.container) {
      return;
    }

    // 如果容器已有内容，使用现有结构
    const existingItems = this.container.querySelectorAll('.platform-item');
    if (existingItems.length > 0) {
      this.bindExistingItems();
      return;
    }

    // 否则创建新结构
    this.container.innerHTML = '';
    this.platforms.forEach(platform => {
      const item = document.createElement('div');
      item.className = 'platform-item';
      item.setAttribute('data-platform', platform.id);
      item.innerHTML = `
        <div class="platform-icon">${platform.icon || '📱'}</div>
        <div class="platform-label">${platform.label}</div>
        <div class="platform-checkbox">
          <input type="checkbox" id="platform-${platform.id}" value="${platform.id}">
        </div>
      `;
      this.container.appendChild(item);
    });

    this.bindEvents();
  }

  /**
   * 绑定现有元素的事件
   */
  bindExistingItems() {
    const items = this.container.querySelectorAll('.platform-item');
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const platformId = item.getAttribute('data-platform') || checkbox?.value;

      if (checkbox) {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            this.selected.add(platformId);
          } else {
            this.selected.delete(platformId);
          }
          this.updateVisualState(item, checkbox.checked);
          this.triggerChange();
        });
      }

      // 点击整个项目也可以切换
      item.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const items = this.container.querySelectorAll('.platform-item');
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const platformId = item.getAttribute('data-platform');

      if (checkbox) {
        checkbox.addEventListener('change', () => {
          if (checkbox.checked) {
            this.selected.add(platformId);
          } else {
            this.selected.delete(platformId);
          }
          this.updateVisualState(item, checkbox.checked);
          this.triggerChange();
        });
      }

      // 点击整个项目也可以切换
      item.addEventListener('click', (e) => {
        if (e.target.tagName !== 'INPUT') {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /**
   * 更新视觉状态
   * @param {HTMLElement} item - 平台项元素
   * @param {boolean} selected - 是否选中
   */
  updateVisualState(item, selected) {
    if (selected) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  }

  /**
   * 获取选中的平台
   * @returns {string[]} 选中的平台ID数组
   */
  getSelected() {
    return Array.from(this.selected);
  }

  /**
   * 设置选中的平台
   * @param {string[]} platformIds - 平台ID数组
   */
  setSelected(platformIds) {
    this.selected.clear();
    platformIds.forEach(id => this.selected.add(id));

    // 更新UI
    const items = this.container.querySelectorAll('.platform-item');
    items.forEach(item => {
      const platformId = item.getAttribute('data-platform');
      const checkbox = item.querySelector('input[type="checkbox"]');
      
      if (checkbox) {
        checkbox.checked = this.selected.has(platformId);
        this.updateVisualState(item, checkbox.checked);
      }
    });

    this.triggerChange();
  }

  /**
   * 全选
   */
  selectAll() {
    const allIds = this.platforms.map(p => p.id);
    this.setSelected(allIds);
  }

  /**
   * 全不选
   */
  deselectAll() {
    this.setSelected([]);
  }

  /**
   * 切换选择
   * @param {string} platformId - 平台ID
   */
  toggle(platformId) {
    if (this.selected.has(platformId)) {
      this.selected.delete(platformId);
    } else {
      this.selected.add(platformId);
    }

    // 更新UI
    const item = this.container.querySelector(`[data-platform="${platformId}"]`);
    if (item) {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = this.selected.has(platformId);
        this.updateVisualState(item, checkbox.checked);
      }
    }

    this.triggerChange();
  }

  /**
   * 监听变化事件
   * @param {Function} callback - 回调函数
   */
  onChange(callback) {
    this.onChangeCallbacks.push(callback);
  }

  /**
   * 触发变化事件
   */
  triggerChange() {
    const selected = this.getSelected();
    this.onChangeCallbacks.forEach(callback => {
      try {
        callback(selected);
      } catch (error) {
        console.error('[PlatformSelector] Error in change callback:', error);
      }
    });
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.selected.clear();
    this.onChangeCallbacks = [];
    this.initialized = false;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlatformSelector;
} else {
  window.PlatformSelector = PlatformSelector;
}
