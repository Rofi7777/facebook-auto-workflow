/**
 * Page 1: Product Analysis Module
 * Handles product information input, AI analysis, and content generation
 */
class Page1ProductAnalysis {
  constructor() {
    this.pageId = 'page1';
    this.stepIndicator = null;
    this.imageUpload = null;
    this.platformSelector = null;
    this.currentStep = 0;
    this.isAnalyzing = false;
    this.isGenerating = false;
    this.analysisResult = null;
  }

  /**
   * Initialize the page
   */
  async init() {
    console.log('[Page1] Initializing...');
    
    // Wait for DOM
    await this.waitForDOM();
    
    // Initialize components
    this.initStepIndicator();
    this.initImageUpload();
    this.initPlatformSelector();
    this.initFormHandlers();
    
    // Load state if available
    this.loadState();
    
    console.log('[Page1] Initialized');
  }

  /**
   * Wait for DOM elements
   */
  async waitForDOM() {
    const maxWait = 5000;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      const page = document.getElementById(this.pageId);
      if (page) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Page element #${this.pageId} not found`);
  }

  /**
   * Initialize step indicator
   */
  initStepIndicator() {
    const container = document.querySelector(`#${this.pageId} .step-indicator`);
    if (!container) {
      console.warn('[Page1] Step indicator container not found');
      return;
    }
    
    this.stepIndicator = new StepIndicator(container, [
      { label: '產品資訊' },
      { label: 'AI 分析' },
      { label: '內容生成' }
    ]);
    this.stepIndicator.init();
    this.stepIndicator.setCurrentStep(0);
  }

  /**
   * Initialize image upload
   */
  initImageUpload() {
    const uploadArea = document.querySelector(`#${this.pageId} #uploadArea`);
    if (!uploadArea) {
      console.warn('[Page1] Upload area not found');
      return;
    }
    
    this.imageUpload = new ImageUpload(uploadArea, {
      maxFiles: 5,
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
      showPreview: true,
      uploadText: '點擊或拖拽上傳圖片'
    });
    this.imageUpload.init();

    // 监听文件变化
    this.imageUpload.onChange((files) => {
      if (window.StateManager) {
        window.StateManager.setState('page1.images', files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })));
      }
    });
  }

  /**
   * Initialize platform selector
   */
  initPlatformSelector() {
    const container = document.querySelector(`#${this.pageId} .platform-selection`);
    if (!container) {
      console.warn('[Page1] Platform selector container not found');
      return;
    }
    
    this.platformSelector = new PlatformSelector(container, [
      { id: 'tiktok', label: 'TikTok', icon: '🎵' },
      { id: 'shopee', label: 'Shopee', icon: '🛒' },
      { id: 'facebook', label: 'Facebook', icon: '📘' },
      { id: 'instagram', label: 'Instagram', icon: '📷' }
    ]);
    this.platformSelector.init();

    // 监听平台变化
    this.platformSelector.onChange((selected) => {
      if (window.StateManager) {
        window.StateManager.setState('page1.selectedPlatforms', selected);
      }
    });
  }

  /**
   * Initialize form handlers
   */
  initFormHandlers() {
    const form = document.querySelector(`#${this.pageId} #productForm`);
    if (!form) {
      console.warn('[Page1] Product form not found');
      return;
    }

    // 表单提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAnalyze();
    });

    // 产品名称输入
    const productNameInput = document.querySelector(`#${this.pageId} #productName`);
    if (productNameInput) {
      productNameInput.addEventListener('input', (e) => {
        if (window.StateManager) {
          window.StateManager.setState('page1.productName', e.target.value);
        }
      });
    }
    
    // 产品描述输入
    const productDescInput = document.querySelector(`#${this.pageId} #productDescription`);
    if (productDescInput) {
      productDescInput.addEventListener('input', (e) => {
        if (window.StateManager) {
          window.StateManager.setState('page1.productDescription', e.target.value);
        }
      });
    }
    
    // 语言选择
    const languageSelect = document.querySelector(`#${this.pageId} #languageSelect`);
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        if (window.StateManager) {
          window.StateManager.setState('page1.selectedLanguage', e.target.value);
        }
      });
    }
    
    // 分析按钮
    const analyzeBtn = document.querySelector(`#${this.pageId} #analyzeProductBtn`);
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        this.handleAnalyze();
      });
    }
    
    // 生成内容按钮
    const generateBtn = document.querySelector(`#${this.pageId} #generateContentBtn`);
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.handleGenerateContent();
      });
    }

    // 生成场景按钮
    const scenariosBtn = document.querySelector(`#${this.pageId} #generateScenariosBtn`);
    if (scenariosBtn) {
      scenariosBtn.addEventListener('click', () => {
        this.handleGenerateScenarios();
      });
    }
  }

  /**
   * Handle analyze button click
   */
  async handleAnalyze() {
    if (this.isAnalyzing) return;
    
    try {
      // 验证输入
      const productName = document.querySelector(`#${this.pageId} #productName`)?.value?.trim();
      if (!productName) {
        this.showError('請輸入產品名稱');
        return;
      }
      
      const images = this.imageUpload?.getFiles() || [];
      if (images.length === 0) {
        this.showError('請上傳至少一張產品圖片');
        return;
      }
      
      this.isAnalyzing = true;
      this.setButtonLoading('analyzeProductBtn', true, '分析中...');
      
      // 更新步骤
      if (this.stepIndicator) {
        this.stepIndicator.setCurrentStep(1);
        this.stepIndicator.setStepStatus(0, 'completed');
        this.stepIndicator.setStepStatus(1, 'active');
      }
      
      // 上传图片
      let uploadedImagePaths = [];
      if (window.ApiService) {
        try {
          const uploadResult = await this.imageUpload.upload('/upload-image');
          uploadedImagePaths = uploadResult.paths || uploadResult.images || [];
        } catch (error) {
          console.error('[Page1] Image upload error:', error);
          // 尝试使用FormData方式
          const formData = new FormData();
          images.forEach(file => formData.append('images', file));
          formData.append('productName', productName);
          
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error('圖片上傳失敗');
          }
          
          const result = await response.json();
          uploadedImagePaths = result.paths || result.images || [];
        }
      }
      
      // 准备分析数据
      const productDescription = document.querySelector(`#${this.pageId} #productDescription`)?.value || '';
      const language = document.querySelector(`#${this.pageId} #languageSelect`)?.value || 'zh-TW';
      
      const analysisData = {
        productName: productName,
        productDescription: productDescription,
        images: uploadedImagePaths,
        language: language
      };
      
      // 调用分析API
      let analysisResult;
      if (window.ApiService) {
        analysisResult = await window.ApiService.post('/analyze-product', analysisData);
      } else {
        // 回退到直接fetch
        const response = await window.AuthService?.authFetch('/api/analyze-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisData)
        }) || fetch('/api/analyze-product', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(analysisData)
        });
        
        if (!response.ok) {
          throw new Error('分析失敗');
        }
        analysisResult = await response.json();
      }
      
      // 保存结果
      this.analysisResult = analysisResult;
      if (window.StateManager) {
        window.StateManager.setState('page1.analysisResult', analysisResult, true);
      }
      
      // 显示结果
      this.displayAnalysisResults(analysisResult);
      
      // 显示生成按钮
      const generateBtn = document.querySelector(`#${this.pageId} #generateContentBtn`);
      if (generateBtn) {
        generateBtn.style.display = 'flex';
      }
      
      // 更新步骤
      if (this.stepIndicator) {
        this.stepIndicator.setStepStatus(1, 'completed');
        this.stepIndicator.setCurrentStep(2);
        this.stepIndicator.setStepStatus(2, 'active');
      }
      
    } catch (error) {
      console.error('[Page1] Analysis error:', error);
      this.showError(error.message || '分析失敗，請重試');
      
      // 回退步骤
      if (this.stepIndicator) {
        this.stepIndicator.setCurrentStep(0);
        this.stepIndicator.setStepStatus(1, 'error');
      }
    } finally {
      this.isAnalyzing = false;
      this.setButtonLoading('analyzeProductBtn', false);
    }
  }

  /**
   * Handle generate content button click
   */
  async handleGenerateContent() {
    if (this.isGenerating) return;
    
    try {
      if (!this.analysisResult) {
        this.analysisResult = window.StateManager?.getState('page1.analysisResult');
        if (!this.analysisResult) {
          this.showError('請先進行產品分析');
          return;
        }
      }
      
      const selectedPlatforms = this.platformSelector?.getSelected() || 
        window.StateManager?.getState('page1.selectedPlatforms') || [];
      
      if (selectedPlatforms.length === 0) {
        this.showError('請選擇至少一個平台');
        return;
      }
      
      this.isGenerating = true;
      this.setButtonLoading('generateContentBtn', true, '生成中...');
      
      const productName = document.querySelector(`#${this.pageId} #productName`)?.value?.trim() || '';
      const productDescription = document.querySelector(`#${this.pageId} #productDescription`)?.value || '';
      const language = document.querySelector(`#${this.pageId} #languageSelect`)?.value || 'zh-TW';
      
      // 准备生成数据
      const generationData = {
        productInfo: this.analysisResult.productAnalysis || {
          productName: productName,
          productDescription: productDescription
        },
        platforms: selectedPlatforms,
        language: language
      };
      
      // 调用生成API
      let contentResult;
      if (window.ApiService) {
        contentResult = await window.ApiService.post('/generate-platform-content', generationData);
      } else {
        const response = await window.AuthService?.authFetch('/api/generate-platform-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(generationData)
        }) || fetch('/api/generate-platform-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(generationData)
        });
        
        if (!response.ok) {
          throw new Error('內容生成失敗');
        }
        contentResult = await response.json();
      }
      
      // 保存结果
      if (window.StateManager) {
        window.StateManager.setState('page1.contentResult', contentResult, true);
      }
      
      // 显示结果
      this.displayContentResults(contentResult);
      
      // 显示场景生成按钮
      const scenariosBtn = document.querySelector(`#${this.pageId} #generateScenariosBtn`);
      if (scenariosBtn) {
        scenariosBtn.style.display = 'flex';
      }
      
      // 完成步骤
      if (this.stepIndicator) {
        this.stepIndicator.setStepStatus(2, 'completed');
      }
      
    } catch (error) {
      console.error('[Page1] Generation error:', error);
      this.showError(error.message || '內容生成失敗，請重試');
    } finally {
      this.isGenerating = false;
      this.setButtonLoading('generateContentBtn', false);
    }
  }

  /**
   * Handle generate scenarios button click
   */
  async handleGenerateScenarios() {
    try {
      if (!this.analysisResult) {
        this.showError('請先進行產品分析');
        return;
      }

      const productName = document.querySelector(`#${this.pageId} #productName`)?.value?.trim() || '';
      const language = document.querySelector(`#${this.pageId} #languageSelect`)?.value || 'zh-TW';
      
      const scenariosData = {
        productInfo: this.analysisResult.productAnalysis || { productName },
        language: language
      };
      
      let scenariosResult;
      if (window.ApiService) {
        scenariosResult = await window.ApiService.post('/generate-scenarios', scenariosData);
      } else {
        const response = await window.AuthService?.authFetch('/api/generate-scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scenariosData)
        }) || fetch('/api/generate-scenarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.AuthService?.getAuthHeaders() || {})
          },
          body: JSON.stringify(scenariosData)
        });
        
        if (!response.ok) {
          throw new Error('場景生成失敗');
        }
        scenariosResult = await response.json();
      }
      
      this.displayScenariosResults(scenariosResult);
      
    } catch (error) {
      console.error('[Page1] Scenarios generation error:', error);
      this.showError(error.message || '場景生成失敗，請重試');
    }
  }

  /**
   * Display analysis results
   */
  displayAnalysisResults(result) {
    const resultContainer = document.querySelector(`#${this.pageId} .analysis-result`) ||
                            document.querySelector(`#${this.pageId} #aiAnalysisResult`);
    if (!resultContainer) {
      console.warn('[Page1] Analysis result container not found');
      return;
    }
    
    const productAnalysis = result.productAnalysis || result;
    const painPoints = result.painPointsAnalysis || {};
    
    resultContainer.innerHTML = `
      <div class="result-section">
        <h3 class="result-title">產品分析</h3>
        <div class="result-content">${this.formatResult(productAnalysis.summary || productAnalysis || '無分析結果')}</div>
      </div>
      ${painPoints.summary ? `
      <div class="result-section">
        <h3 class="result-title">痛點分析</h3>
        <div class="result-content">${this.formatResult(painPoints.summary)}</div>
      </div>
      ` : ''}
    `;
    
    resultContainer.style.display = 'block';
  }

  /**
   * Display content results
   */
  displayContentResults(result) {
    const resultContainer = document.querySelector(`#${this.pageId} .content-result`) ||
                            document.querySelector(`#${this.pageId} #multiPlatformResult`);
    if (!resultContainer) {
      console.warn('[Page1] Content result container not found');
      return;
    }
    
    resultContainer.innerHTML = '';
    
    if (result.platforms && Object.keys(result.platforms).length > 0) {
      Object.entries(result.platforms).forEach(([platform, content]) => {
        const platformCard = document.createElement('div');
        platformCard.className = 'platform-content-card';
        platformCard.style.cssText = 'margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;';
        
        const platformTitle = document.createElement('h4');
        platformTitle.style.cssText = 'margin-bottom: 10px; color: #4a2c7a;';
        platformTitle.textContent = platform.toUpperCase();
        
        const platformContent = document.createElement('div');
        platformContent.className = 'platform-content';
        platformContent.style.cssText = 'white-space: pre-wrap; line-height: 1.6;';
        platformContent.textContent = content.text || content;
        
        platformCard.appendChild(platformTitle);
        platformCard.appendChild(platformContent);
        resultContainer.appendChild(platformCard);
      });
    } else {
      resultContainer.innerHTML = '<div class="result-content">' + this.formatResult(result) + '</div>';
    }
    
    resultContainer.style.display = 'block';
  }

  /**
   * Display scenarios results
   */
  displayScenariosResults(result) {
    const resultContainer = document.querySelector(`#${this.pageId} .scenarios-result`) ||
                            document.querySelector(`#${this.pageId} #aiMarketingScenario`);
    if (!resultContainer) {
      console.warn('[Page1] Scenarios result container not found');
      return;
    }
    
    resultContainer.innerHTML = '<div class="result-content">' + this.formatResult(result) + '</div>';
    resultContainer.style.display = 'block';
  }

  /**
   * Format result for display
   */
  formatResult(result) {
    if (typeof result === 'string') {
      return result;
    }
    if (typeof result === 'object') {
      return JSON.stringify(result, null, 2);
    }
    return String(result);
  }

  /**
   * Set button loading state
   */
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

  /**
   * Show error message
   */
  showError(message) {
    // 使用通知系统（如果可用）
    if (window.showNotification) {
      window.showNotification(message, 'error');
      return;
    }

    // 创建或更新错误显示
    let errorDiv = document.querySelector(`#${this.pageId} .error-message`);
    if (!errorDiv) {
      errorDiv = document.createElement('div');
      errorDiv.className = 'error-message alert alert-error';
      errorDiv.style.cssText = 'margin-top: 15px; padding: 15px; background: #f8d7da; color: #721c24; border-radius: 8px;';
      const container = document.querySelector(`#${this.pageId} .workflow-container`) ||
                        document.querySelector(`#${this.pageId}`);
      if (container) {
        container.insertBefore(errorDiv, container.firstChild);
      }
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // 5秒后自动隐藏
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }

  /**
   * Load state from state manager
   */
  loadState() {
    if (!window.StateManager) return;
    
    const productName = window.StateManager.getState('page1.productName');
    const productDescription = window.StateManager.getState('page1.productDescription');
    const selectedLanguage = window.StateManager.getState('page1.selectedLanguage');
    const analysisResult = window.StateManager.getState('page1.analysisResult');
    const contentResult = window.StateManager.getState('page1.contentResult');
    
    // 恢复产品名称
    const productNameInput = document.querySelector(`#${this.pageId} #productName`);
    if (productNameInput && productName) {
      productNameInput.value = productName;
    }
    
    // 恢复产品描述
    const productDescInput = document.querySelector(`#${this.pageId} #productDescription`);
    if (productDescInput && productDescription) {
      productDescInput.value = productDescription;
    }
    
    // 恢复语言
    const languageSelect = document.querySelector(`#${this.pageId} #languageSelect`);
    if (languageSelect && selectedLanguage) {
      languageSelect.value = selectedLanguage;
    }
    
    // 恢复分析结果
    if (analysisResult) {
      this.analysisResult = analysisResult;
      this.displayAnalysisResults(analysisResult);
      if (this.stepIndicator) {
        this.stepIndicator.setCurrentStep(1);
        this.stepIndicator.setStepStatus(1, 'completed');
      }
      
      // 显示生成按钮
      const generateBtn = document.querySelector(`#${this.pageId} #generateContentBtn`);
      if (generateBtn) {
        generateBtn.style.display = 'flex';
      }
    }
    
    // 恢复内容结果
    if (contentResult) {
      this.displayContentResults(contentResult);
      if (this.stepIndicator) {
        this.stepIndicator.setCurrentStep(2);
        this.stepIndicator.setStepStatus(2, 'completed');
      }
      
      // 显示场景按钮
      const scenariosBtn = document.querySelector(`#${this.pageId} #generateScenariosBtn`);
      if (scenariosBtn) {
        scenariosBtn.style.display = 'flex';
      }
    }
  }

  /**
   * Destroy page
   */
  destroy() {
    if (this.imageUpload) {
      this.imageUpload.destroy();
    }
    if (this.platformSelector) {
      this.platformSelector.destroy();
    }
    if (this.stepIndicator) {
      this.stepIndicator.destroy();
    }
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Page1ProductAnalysis;
} else {
  window.Page1ProductAnalysis = Page1ProductAnalysis;
}
