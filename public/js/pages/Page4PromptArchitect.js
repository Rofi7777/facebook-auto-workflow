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
    
    // 确保页面可见
    const page = document.getElementById(this.pageId);
    if (page) {
      // 确保页面本身可见
      page.style.display = 'block';
      page.style.visibility = 'visible';
      page.style.opacity = '1';
      
      // 确保工作流容器可见
      const workflowContainer = page.querySelector('.workflow-container');
      if (workflowContainer) {
        workflowContainer.style.display = 'grid';
        workflowContainer.style.visibility = 'visible';
        workflowContainer.style.opacity = '1';
      }
      
      // 确保所有面板可见
      const panels = page.querySelectorAll('.input-panel, .output-panel');
      panels.forEach(panel => {
        panel.style.display = 'block';
        panel.style.visibility = 'visible';
        panel.style.opacity = '1';
      });
      
      // 确保模式容器可见
      const modeContainers = page.querySelectorAll('.prompt-mode');
      modeContainers.forEach(container => {
        container.style.visibility = 'visible';
        container.style.opacity = '1';
      });
      
      // 确保输出区域可见
      const outputPanel = page.querySelector('.output-panel');
      if (outputPanel) {
        outputPanel.style.display = 'block';
        outputPanel.style.visibility = 'visible';
        outputPanel.style.opacity = '1';
      }
      
      const promptResult = page.querySelector('#promptResult');
      if (promptResult) {
        promptResult.style.display = 'block';
        promptResult.style.visibility = 'visible';
        promptResult.style.opacity = '1';
      }
    }
    
    this.initModeSwitcher();
    this.initFormHandlers();
    
    // 设置默认模式为business
    this.switchMode('business');
    
    console.log('[Page4] Initialized and content should be visible');
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
    // 查找模式切换按钮（支持两种方式：.mode-btn 和 .mode-tab）
    const modeButtons = document.querySelectorAll(`#${this.pageId} .mode-btn, #${this.pageId} .mode-tab`);
    modeButtons.forEach(btn => {
      // 移除旧的onclick，添加新的事件监听
      const mode = btn.getAttribute('data-mode') || 
                   (btn.onclick && btn.onclick.toString().match(/switchPromptMode\(['"]([^'"]+)['"]\)/)?.[1]);
      
      if (mode) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.switchMode(mode);
        });
      }
    });
    
    // 如果存在全局的 switchPromptMode 函数，也集成它
    if (typeof window.switchPromptMode === 'function') {
      const originalSwitchPromptMode = window.switchPromptMode;
      window.switchPromptMode = (mode) => {
        this.switchMode(mode);
        // 也调用原始函数以确保兼容性
        if (originalSwitchPromptMode) {
          originalSwitchPromptMode(mode);
        }
      };
    } else {
      // 创建全局函数供HTML中的onclick使用
      window.switchPromptMode = (mode) => {
        this.switchMode(mode);
      };
    }
  }

  switchMode(mode) {
    this.currentMode = mode;
    console.log(`[Page4] Switching to mode: ${mode}`);
    
    // 更新按钮状态（支持两种类名）
    document.querySelectorAll(`#${this.pageId} .mode-btn, #${this.pageId} .mode-tab`).forEach(btn => {
      btn.classList.remove('active');
      const btnMode = btn.getAttribute('data-mode') || 
                     (btn.onclick && btn.onclick.toString().match(/switchPromptMode\(['"]([^'"]+)['"]\)/)?.[1]);
      
      if (btnMode === mode) {
        btn.classList.add('active');
        // 更新样式
        if (btn.classList.contains('mode-tab')) {
          btn.style.background = 'linear-gradient(135deg, #87CEEB 0%, #FFB6C1 100%)';
          btn.style.color = 'white';
        }
      } else {
        if (btn.classList.contains('mode-tab')) {
          btn.style.background = 'white';
          btn.style.color = '#87CEEB';
        }
      }
    });
    
    // 显示/隐藏对应的表单容器（使用正确的ID）
    ['business', 'coding', 'image'].forEach(m => {
      const container = document.querySelector(`#${this.pageId} #${m}Mode`) ||
                        document.querySelector(`#${this.pageId} #${m}Form`);
      if (container) {
        if (m === mode) {
          container.style.display = 'block';
          container.classList.add('active');
        } else {
          container.style.display = 'none';
          container.classList.remove('active');
        }
      }
    });
    
    console.log(`[Page4] Mode switched to: ${mode}`);
  }

  initFormHandlers() {
    // 绑定各个模式的生成按钮
    const bizGenerateBtn = document.querySelector(`#${this.pageId} #bizGenerateBtn`);
    if (bizGenerateBtn) {
      bizGenerateBtn.addEventListener('click', () => {
        this.currentMode = 'business';
        this.handleGenerate();
      });
    }
    
    const codingGenerateBtn = document.querySelector(`#${this.pageId} #codingGenerateBtn`);
    if (codingGenerateBtn) {
      codingGenerateBtn.addEventListener('click', () => {
        this.currentMode = 'coding';
        this.handleGenerate();
      });
    }
    
    const imageGenerateBtn = document.querySelector(`#${this.pageId} #imageGenerateBtn`);
    if (imageGenerateBtn) {
      imageGenerateBtn.addEventListener('click', () => {
        this.currentMode = 'image';
        this.handleGenerate();
      });
    }
    
    // 如果存在全局生成函数，也集成它们
    if (typeof window.generateBusinessPrompt === 'function') {
      const originalGenerateBusinessPrompt = window.generateBusinessPrompt;
      window.generateBusinessPrompt = () => {
        this.currentMode = 'business';
        this.handleGenerate();
      };
    }
    
    if (typeof window.generateCodingPrompt === 'function') {
      const originalGenerateCodingPrompt = window.generateCodingPrompt;
      window.generateCodingPrompt = () => {
        this.currentMode = 'coding';
        this.handleGenerate();
      };
    }
    
    if (typeof window.generateImagePrompt === 'function') {
      const originalGenerateImagePrompt = window.generateImagePrompt;
      window.generateImagePrompt = () => {
        this.currentMode = 'image';
        this.handleGenerate();
      };
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
    // 查找输出容器（支持多种选择器，包括 promptResult）
    const container = document.querySelector(`#${this.pageId} #promptResult`) ||
                      document.querySelector(`#${this.pageId} .prompt-result`) ||
                      document.querySelector(`#${this.pageId} #generatedPrompt`) ||
                      document.querySelector(`#${this.pageId} .output-panel .modern-card > div:first-child`) ||
                      document.querySelector(`#${this.pageId} .output-content`);
    
    if (!container) {
      console.warn('[Page4] Result container not found, trying to find output panel');
      // 如果找不到容器，尝试使用右侧面板
      const outputPanel = document.querySelector(`#${this.pageId} .output-panel`);
      if (outputPanel) {
        const promptResult = outputPanel.querySelector('#promptResult');
        if (promptResult) {
          this.displayResults(result);
          return;
        }
        // 如果还是没有，创建一个
        const resultDiv = document.createElement('div');
        resultDiv.id = 'promptResult';
        resultDiv.style.cssText = 'max-height: 500px; overflow-y: auto; padding: 20px; background: #1e1e1e; border-radius: 12px; color: #d4d4d4; font-family: "Consolas", "Monaco", monospace; font-size: 14px; line-height: 1.6; white-space: pre-wrap; min-height: 200px;';
        outputPanel.querySelector('.modern-card').insertBefore(resultDiv, outputPanel.querySelector('#promptActions'));
        this.displayResults(result);
        return;
      }
      console.error('[Page4] Cannot find result container');
      return;
    }
    
    const promptText = result.prompt || result.text || result.content || 
                      (typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    
    // 检查容器是否是 promptResult（有特定样式）
    const isPromptResult = container.id === 'promptResult';
    
    if (isPromptResult) {
      // 使用 promptResult 的样式
      container.innerHTML = `
        <div style="color: #d4d4d4; font-family: 'Consolas', 'Monaco', monospace; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${this.escapeHtml(promptText)}</div>
      `;
    } else {
      // 使用通用样式
      container.innerHTML = `
        <div class="result-content" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <pre style="white-space: pre-wrap; word-wrap: break-word; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.6; margin: 0;">${this.escapeHtml(promptText)}</pre>
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="modern-btn modern-btn-primary" id="copyPromptBtn" style="flex: 1;">
            📋 複製 Prompt
          </button>
          <button type="button" class="modern-btn" id="exportPromptBtn" style="flex: 1;">
            📄 匯出 Word
          </button>
        </div>
      `;
    }
    
    container.style.display = 'block';
    container.style.visibility = 'visible';
    container.style.opacity = '1';
    
    // 显示操作按钮（如果存在）
    const promptActions = document.querySelector(`#${this.pageId} #promptActions`);
    if (promptActions) {
      promptActions.style.display = 'flex';
    }
    
    // 绑定复制按钮（如果存在）
    const copyBtn = container.querySelector('#copyPromptBtn') || 
                    document.querySelector(`#${this.pageId} #promptActions button[onclick*="copyPromptToClipboard"]`);
    if (copyBtn) {
      // 移除旧的onclick，添加新的事件监听
      copyBtn.onclick = null;
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(promptText);
          this.showSuccess('已複製到剪貼板');
          if (copyBtn.textContent) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ 已複製';
            setTimeout(() => {
              copyBtn.textContent = originalText;
            }, 2000);
          }
        } catch (error) {
          console.error('Copy failed:', error);
          // 回退方法
          const textArea = document.createElement('textarea');
          textArea.value = promptText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.showSuccess('已複製到剪貼板');
        }
      });
    }
    
    // 如果存在全局的 copyPromptToClipboard 函数，也更新它
    if (typeof window.copyPromptToClipboard === 'function') {
      window.copyPromptToClipboard = async () => {
        const promptText = document.querySelector(`#${this.pageId} #promptResult`)?.textContent || '';
        if (promptText) {
          try {
            await navigator.clipboard.writeText(promptText);
            this.showSuccess('已複製到剪貼板');
          } catch (error) {
            console.error('Copy failed:', error);
          }
        }
      };
    }
    
    // 绑定导出按钮（如果存在）
    const exportBtn = container.querySelector('#exportPromptBtn') ||
                      document.querySelector(`#${this.pageId} #promptActions button[onclick*="exportPromptToWord"]`);
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        // TODO: 实现Word导出功能
        this.showError('匯出功能開發中');
      });
    }
    
    // 滚动到结果区域
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  showSuccess(message) {
    if (window.showNotification) {
      window.showNotification(message, 'success');
      return;
    }
    alert(message);
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
