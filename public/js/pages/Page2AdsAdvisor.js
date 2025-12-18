/**
 * Page 2: AI Ads Advisor Module
 * Handles ad analysis and optimization suggestions
 */
class Page2AdsAdvisor {
  constructor() {
    this.pageId = 'page2';
    this.isAnalyzing = false;
  }

  async init() {
    console.log('[Page2] Initializing...');
    await this.waitForDOM();
    this.initFormHandlers();
    console.log('[Page2] Initialized');
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
    const form = document.querySelector(`#${this.pageId} #adsAnalysisForm`);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAnalyze();
      });
    }

    const analyzeBtn = document.querySelector(`#${this.pageId} #startAnalysisBtn`);
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.handleAnalyze());
    }
  }

  async handleAnalyze() {
    if (this.isAnalyzing) return;
    
    try {
      this.isAnalyzing = true;
      this.setButtonLoading('startAnalysisBtn', true, '分析中...');
      
      const formData = this.getFormData();
      
      let result;
      if (window.ApiService) {
        result = await window.ApiService.post('/analyze-ads', formData);
      } else {
        const response = await window.AuthService?.authFetch('/api/analyze-ads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }) || fetch('/api/analyze-ads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('分析失敗');
        result = await response.json();
      }
      
      this.displayResults(result);
      
    } catch (error) {
      console.error('[Page2] Analysis error:', error);
      this.showError(error.message || '分析失敗，請重試');
    } finally {
      this.isAnalyzing = false;
      this.setButtonLoading('startAnalysisBtn', false);
    }
  }

  getFormData() {
    return {
      brandName: document.querySelector(`#${this.pageId} #brandName`)?.value || '',
      productName: document.querySelector(`#${this.pageId} #adProductName`)?.value || '',
      coreProduct: document.querySelector(`#${this.pageId} #coreProduct`)?.value || '',
      targetMarket: document.querySelector(`#${this.pageId} #targetMarket`)?.value || '',
      platforms: Array.from(document.querySelectorAll(`#${this.pageId} input[type="checkbox"]:checked`)).map(cb => cb.value)
    };
  }

  displayResults(result) {
    const container = document.querySelector(`#${this.pageId} .analysis-results`) ||
                      document.querySelector(`#${this.pageId} #aiAnalysisResultsArea`);
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
  module.exports = Page2AdsAdvisor;
} else {
  window.Page2AdsAdvisor = Page2AdsAdvisor;
}
