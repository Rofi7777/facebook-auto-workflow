/**
 * Page 3: AI Course Editor Module
 * Handles course content generation based on parameters
 */
class Page3CourseEditor {
  constructor() {
    this.pageId = 'page3';
    this.isGenerating = false;
  }

  async init() {
    console.log('[Page3] Initializing...');
    await this.waitForDOM();
    this.initFormHandlers();
    console.log('[Page3] Initialized');
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

  initFormHandlers() {
    const form = document.querySelector(`#${this.pageId} #courseForm`);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleGenerate();
      });
    }

    const generateBtn = document.querySelector(`#${this.pageId} #generateCourseBtn`);
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerate());
    }
  }

  async handleGenerate() {
    if (this.isGenerating) return;
    
    try {
      this.isGenerating = true;
      this.setButtonLoading('generateCourseBtn', true, '生成中...');
      
      const formData = this.getFormData();
      
      let result;
      if (window.ApiService) {
        result = await window.ApiService.post('/generate-course', formData);
      } else {
        const response = await window.AuthService?.authFetch('/api/generate-course', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }) || fetch('/api/generate-course', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('課程生成失敗');
        result = await response.json();
      }
      
      this.displayResults(result);
      
    } catch (error) {
      console.error('[Page3] Generation error:', error);
      this.showError(error.message || '課程生成失敗，請重試');
    } finally {
      this.isGenerating = false;
      this.setButtonLoading('generateCourseBtn', false);
    }
  }

  getFormData() {
    return {
      age: document.querySelector(`#${this.pageId} #targetAge`)?.value || '',
      category: document.querySelector(`#${this.pageId} #category`)?.value || '',
      topic: document.querySelector(`#${this.pageId} #topic`)?.value || '',
      duration: document.querySelector(`#${this.pageId} #duration`)?.value || '',
      style: document.querySelector(`#${this.pageId} #style`)?.value || '',
      outputTypes: Array.from(document.querySelectorAll(`#${this.pageId} input[type="checkbox"]:checked`)).map(cb => cb.value),
      language: document.querySelector(`#${this.pageId} #courseLanguage`)?.value || 'zh-TW',
      includeImages: document.querySelector(`#${this.pageId} #includeImages`)?.checked || false
    };
  }

  displayResults(result) {
    const container = document.querySelector(`#${this.pageId} .course-preview`) ||
                      document.querySelector(`#${this.pageId} #coursePreview`);
    if (container) {
      container.innerHTML = `<div class="result-content">${this.formatResult(result)}</div>`;
      container.style.display = 'block';
    }
  }

  formatResult(result) {
    if (typeof result === 'string') return result;
    if (typeof result === 'object') return JSON.stringify(result, null, 2);
    return String(result);
  }

  setButtonLoading(buttonId, loading, loadingText = '處理中...') {
    const button = document.querySelector(`#${this.pageId} #${buttonId}`);
    if (!button) return;
    
    if (loading) {
      button.disabled = true;
      if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
      }
      button.innerHTML = `<span class="loading-spinner"></span> ${loadingText}`;
    } else {
      button.disabled = false;
      button.textContent = button.dataset.originalText || button.textContent;
      delete button.dataset.originalText;
    }
  }

  showError(message) {
    if (window.showNotification) {
      window.showNotification(message, 'error');
      return;
    }
    alert(message);
  }

  destroy() {
    // Cleanup if needed
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Page3CourseEditor;
} else {
  window.Page3CourseEditor = Page3CourseEditor;
}
