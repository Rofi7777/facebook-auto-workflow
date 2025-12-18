/**
 * Page 4: AI Prompt Architect Module
 * Handles prompt generation in three modes: business, coding, image
 */
class Page4PromptArchitect {
  constructor() {
    this.pageId = 'page4';
    this.currentMode = 'business'; // business, coding, image
    this.isGenerating = false;
  }

  async init() {
    console.log('[Page4] Initializing...');
    await this.waitForDOM();
    this.initModeSwitcher();
    this.initFormHandlers();
    console.log('[Page4] Initialized');
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

  initModeSwitcher() {
    const modeButtons = document.querySelectorAll(`#${this.pageId} .mode-btn`);
    modeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        this.switchMode(mode);
      });
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    
    // 更新按钮状态
    document.querySelectorAll(`#${this.pageId} .mode-btn`).forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-mode') === mode) {
        btn.classList.add('active');
      }
    });
    
    // 显示/隐藏对应的表单
    ['business', 'coding', 'image'].forEach(m => {
      const form = document.querySelector(`#${this.pageId} #${m}Form`);
      if (form) {
        form.style.display = m === mode ? 'block' : 'none';
      }
    });
  }

  initFormHandlers() {
    const generateBtn = document.querySelector(`#${this.pageId} #generatePromptBtn`);
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerate());
    }
  }

  async handleGenerate() {
    if (this.isGenerating) return;
    
    try {
      this.isGenerating = true;
      this.setButtonLoading('generatePromptBtn', true, '生成中...');
      
      const formData = this.getFormData();
      formData.mode = this.currentMode;
      
      let result;
      if (window.ApiService) {
        result = await window.ApiService.post('/refine-prompt', formData);
      } else {
        const response = await window.AuthService?.authFetch('/api/refine-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }) || fetch('/api/refine-prompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Prompt生成失敗');
        result = await response.json();
      }
      
      this.displayResults(result);
      
    } catch (error) {
      console.error('[Page4] Generation error:', error);
      this.showError(error.message || 'Prompt生成失敗，請重試');
    } finally {
      this.isGenerating = false;
      this.setButtonLoading('generatePromptBtn', false);
    }
  }

  getFormData() {
    const data = { mode: this.currentMode };
    
    if (this.currentMode === 'business') {
      data.domain = document.querySelector(`#${this.pageId} #bizDomain`)?.value || '';
      data.industry = document.querySelector(`#${this.pageId} #bizIndustry`)?.value || '';
      data.role = document.querySelector(`#${this.pageId} #bizRole`)?.value || '';
      data.framework = document.querySelector(`#${this.pageId} #bizFramework`)?.value || '';
      data.context = document.querySelector(`#${this.pageId} #bizContext`)?.value || '';
    } else if (this.currentMode === 'coding') {
      data.requirement = document.querySelector(`#${this.pageId} #codingInput`)?.value || '';
      data.platform = document.querySelector(`#${this.pageId} #codingPlatform`)?.value || '';
      data.complexity = document.querySelector(`#${this.pageId} #codingComplexity`)?.value || '';
    } else if (this.currentMode === 'image') {
      data.description = document.querySelector(`#${this.pageId} #imageInput`)?.value || '';
      data.model = document.querySelector(`#${this.pageId} #imageModel`)?.value || '';
      data.style = document.querySelector(`#${this.pageId} #imageStyle`)?.value || '';
      data.ratio = document.querySelector(`#${this.pageId} #imageRatio`)?.value || '';
      data.quality = document.querySelector(`#${this.pageId} #imageQuality`)?.value || '';
    }
    
    return data;
  }

  displayResults(result) {
    const container = document.querySelector(`#${this.pageId} .prompt-result`) ||
                      document.querySelector(`#${this.pageId} #generatedPrompt`);
    if (container) {
      container.innerHTML = `<pre class="result-content">${this.formatResult(result.prompt || result)}</pre>`;
      container.style.display = 'block';
      
      // 添加复制按钮
      const copyBtn = document.createElement('button');
      copyBtn.textContent = '复制';
      copyBtn.className = 'modern-btn';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(result.prompt || result);
        this.showError('已复制到剪贴板');
      };
      container.appendChild(copyBtn);
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
  module.exports = Page4PromptArchitect;
} else {
  window.Page4PromptArchitect = Page4PromptArchitect;
}
