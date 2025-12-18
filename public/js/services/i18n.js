/**
 * 国际化服务
 * 处理多语言切换、文本翻译和语言资源管理
 */
class I18nService {
  constructor() {
    this.currentLanguage = 'zh-TW';
    this.translations = {};
    this.languageChangeCallbacks = [];
    this.loadTranslations();
  }

  /**
   * 加载翻译资源
   */
  loadTranslations() {
    // 如果全局有translations对象，使用它
    if (typeof translations !== 'undefined') {
      this.translations = translations;
    } else {
      // 否则尝试从文件加载
      console.warn('[I18n] Translations not found, using fallback');
      this.translations = {
        'zh-TW': {},
        'en': {},
        'vi': {}
      };
    }

    // 从localStorage恢复语言设置
    const savedLang = localStorage.getItem('app_language');
    if (savedLang && this.translations[savedLang]) {
      this.currentLanguage = savedLang;
    }
  }

  /**
   * 设置语言
   * @param {string} lang - 语言代码 (zh-TW, en, vi)
   */
  setLanguage(lang) {
    if (!this.translations[lang]) {
      console.warn(`[I18n] Language ${lang} not found, using ${this.currentLanguage}`);
      return;
    }

    const oldLang = this.currentLanguage;
    this.currentLanguage = lang;
    localStorage.setItem('app_language', lang);

    // 更新所有带有 data-i18n 属性的元素
    this.updateElements();

    // 触发语言变化事件
    this.triggerLanguageChange(lang, oldLang);
  }

  /**
   * 获取当前语言
   * @returns {string} 当前语言代码
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * 翻译文本
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象（用于替换占位符）
   * @returns {string} 翻译后的文本
   */
  translate(key, params = {}) {
    const lang = this.currentLanguage;
    const translation = this.translations[lang]?.[key] || 
                        this.translations['zh-TW']?.[key] || 
                        key;

    // 替换参数
    if (Object.keys(params).length > 0) {
      return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return translation;
  }

  /**
   * 翻译的简写方法
   * @param {string} key - 翻译键
   * @param {Object} params - 参数对象
   * @returns {string} 翻译后的文本
   */
  t(key, params = {}) {
    return this.translate(key, params);
  }

  /**
   * 更新所有带有 data-i18n 属性的元素
   */
  updateElements() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translate(key);
      
      // 根据元素类型更新内容
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const placeholder = element.getAttribute('data-i18n-placeholder');
        if (placeholder) {
          element.placeholder = this.translate(placeholder);
        } else {
          element.value = translation;
        }
      } else {
        element.textContent = translation;
      }
    });

    // 更新页面标题
    const titleKey = document.querySelector('title')?.getAttribute('data-i18n');
    if (titleKey) {
      document.title = this.translate(titleKey);
    }
  }

  /**
   * 监听语言变化
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  onLanguageChange(callback) {
    this.languageChangeCallbacks.push(callback);
    return () => {
      const index = this.languageChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.languageChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * 触发语言变化事件
   * @param {string} newLang - 新语言
   * @param {string} oldLang - 旧语言
   */
  triggerLanguageChange(newLang, oldLang) {
    this.languageChangeCallbacks.forEach(callback => {
      try {
        callback(newLang, oldLang);
      } catch (error) {
        console.error('[I18n] Error in language change callback:', error);
      }
    });

    // 触发自定义事件
    const event = new CustomEvent('language:change', {
      detail: { newLang, oldLang }
    });
    window.dispatchEvent(event);
  }

  /**
   * 获取支持的语言列表
   * @returns {string[]} 语言代码数组
   */
  getSupportedLanguages() {
    return Object.keys(this.translations);
  }

  /**
   * 检查语言是否支持
   * @param {string} lang - 语言代码
   * @returns {boolean} 是否支持
   */
  isLanguageSupported(lang) {
    return !!this.translations[lang];
  }

  /**
   * 获取语言显示名称
   * @param {string} lang - 语言代码
   * @returns {string} 显示名称
   */
  getLanguageName(lang) {
    const names = {
      'zh-TW': '繁體中文',
      'en': 'English',
      'vi': 'Tiếng Việt'
    };
    return names[lang] || lang;
  }
}

// 创建单例实例
const i18nService = new I18nService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18nService;
} else {
  window.I18n = i18nService;
}

// 全局简写
if (typeof window !== 'undefined') {
  window.t = (key, params) => i18nService.translate(key, params);
}
