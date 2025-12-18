/**
 * 状态管理模块
 * 提供集中式状态存储、状态变更通知和状态持久化
 */
class StateManager {
  constructor() {
    this.state = {};
    this.subscribers = {};
    this.persistedKeys = new Set();
  }

  /**
   * 设置状态
   * @param {string} key - 状态键
   * @param {*} value - 状态值
   * @param {boolean} persist - 是否持久化
   */
  setState(key, value, persist = false) {
    const oldValue = this.state[key];
    this.state[key] = value;

    // 持久化
    if (persist) {
      this.persistedKeys.add(key);
      try {
        localStorage.setItem(`state_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to persist state ${key}:`, error);
      }
    }

    // 通知订阅者
    this.notifySubscribers(key, value, oldValue);
  }

  /**
   * 获取状态
   * @param {string} key - 状态键
   * @param {*} defaultValue - 默认值
   * @returns {*} 状态值
   */
  getState(key, defaultValue = null) {
    // 先从内存获取
    if (key in this.state) {
      return this.state[key];
    }

    // 如果不在内存中，尝试从持久化存储恢复
    if (this.persistedKeys.has(key)) {
      try {
        const stored = localStorage.getItem(`state_${key}`);
        if (stored !== null) {
          const value = JSON.parse(stored);
          this.state[key] = value;
          return value;
        }
      } catch (error) {
        console.error(`Failed to restore state ${key}:`, error);
      }
    }

    return defaultValue;
  }

  /**
   * 订阅状态变化
   * @param {string} key - 状态键
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    this.subscribers[key].push(callback);

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers[key].indexOf(callback);
      if (index > -1) {
        this.subscribers[key].splice(index, 1);
      }
    };
  }

  /**
   * 通知订阅者
   * @param {string} key - 状态键
   * @param {*} newValue - 新值
   * @param {*} oldValue - 旧值
   */
  notifySubscribers(key, newValue, oldValue) {
    if (this.subscribers[key]) {
      this.subscribers[key].forEach(callback => {
        try {
          callback(newValue, oldValue, key);
        } catch (error) {
          console.error(`Error in subscriber for ${key}:`, error);
        }
      });
    }
  }

  /**
   * 持久化指定状态
   * @param {string} key - 状态键
   */
  persist(key) {
    this.persistedKeys.add(key);
    const value = this.state[key];
    if (value !== undefined) {
      try {
        localStorage.setItem(`state_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to persist state ${key}:`, error);
      }
    }
  }

  /**
   * 清除状态
   * @param {string} key - 状态键
   */
  clearState(key) {
    delete this.state[key];
    if (this.persistedKeys.has(key)) {
      localStorage.removeItem(`state_${key}`);
      this.persistedKeys.delete(key);
    }
    this.notifySubscribers(key, undefined, this.state[key]);
  }

  /**
   * 清除所有状态
   */
  clearAll() {
    this.state = {};
    this.persistedKeys.forEach(key => {
      localStorage.removeItem(`state_${key}`);
    });
    this.persistedKeys.clear();
    this.subscribers = {};
  }

  /**
   * 恢复所有持久化状态
   */
  restorePersisted() {
    this.persistedKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(`state_${key}`);
        if (stored !== null) {
          this.state[key] = JSON.parse(stored);
        }
      } catch (error) {
        console.error(`Failed to restore state ${key}:`, error);
      }
    });
  }
}

// 创建单例实例
const stateManager = new StateManager();

// 恢复持久化状态
stateManager.restorePersisted();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stateManager;
} else {
  window.StateManager = stateManager;
}
