/**
 * 步骤指示器组件
 * 显示步骤进度、更新当前步骤和管理步骤状态
 */
class StepIndicator {
  constructor(container, steps = null) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    this.steps = steps || [];
    this.currentStep = 0;
    this.stepStatus = {}; // { stepIndex: 'pending' | 'active' | 'completed' | 'error' }
    this.initialized = false;
  }

  /**
   * 初始化组件
   */
  init() {
    if (this.initialized || !this.container) {
      return;
    }

    // 如果容器已有内容，使用现有结构
    const existingSteps = this.container.querySelectorAll('.step-item');
    if (existingSteps.length > 0) {
      this.steps = Array.from(existingSteps).map((step, index) => ({
        label: step.textContent.trim() || `步骤 ${index + 1}`,
        index
      }));
    }

    // 渲染步骤指示器
    this.render();

    // 设置初始状态
    if (this.steps.length > 0) {
      this.setCurrentStep(0);
    }

    this.initialized = true;
  }

  /**
   * 渲染组件
   */
  render() {
    if (!this.container) {
      return;
    }

    // 如果已有步骤项，不重新渲染
    if (this.container.querySelector('.step-item')) {
      return;
    }

    this.container.innerHTML = '';
    this.container.className = 'step-indicator';

    this.steps.forEach((step, index) => {
      const stepItem = document.createElement('div');
      stepItem.className = 'step-item';
      stepItem.setAttribute('data-step', index);
      
      const stepNumber = document.createElement('div');
      stepNumber.className = 'step-number';
      stepNumber.textContent = index + 1;
      
      const stepLabel = document.createElement('div');
      stepLabel.className = 'step-label';
      stepLabel.textContent = step.label || `步骤 ${index + 1}`;
      
      stepItem.appendChild(stepNumber);
      stepItem.appendChild(stepLabel);
      this.container.appendChild(stepItem);

      // 添加连接线（除了最后一个）
      if (index < this.steps.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'step-connector';
        this.container.appendChild(connector);
      }
    });

    this.updateVisualState();
  }

  /**
   * 设置当前步骤
   * @param {number} step - 步骤索引（从0开始）
   */
  setCurrentStep(step) {
    if (step < 0 || step >= this.steps.length) {
      console.warn(`[StepIndicator] Invalid step index: ${step}`);
      return;
    }

    this.currentStep = step;
    this.updateVisualState();
  }

  /**
   * 设置步骤状态
   * @param {number} step - 步骤索引
   * @param {string} status - 状态 ('pending' | 'active' | 'completed' | 'error')
   */
  setStepStatus(step, status) {
    if (step < 0 || step >= this.steps.length) {
      console.warn(`[StepIndicator] Invalid step index: ${step}`);
      return;
    }

    const validStatuses = ['pending', 'active', 'completed', 'error'];
    if (!validStatuses.includes(status)) {
      console.warn(`[StepIndicator] Invalid status: ${status}`);
      return;
    }

    this.stepStatus[step] = status;
    this.updateVisualState();
  }

  /**
   * 更新视觉状态
   */
  updateVisualState() {
    const stepItems = this.container.querySelectorAll('.step-item');
    
    stepItems.forEach((item, index) => {
      // 移除所有状态类
      item.classList.remove('pending', 'active', 'completed', 'error');

      // 设置状态
      const status = this.stepStatus[index] || 
                     (index < this.currentStep ? 'completed' : 
                      index === this.currentStep ? 'active' : 'pending');
      
      item.classList.add(status);
      this.stepStatus[index] = status;
    });
  }

  /**
   * 下一步
   */
  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.setStepStatus(this.currentStep, 'completed');
      this.setCurrentStep(this.currentStep + 1);
    }
  }

  /**
   * 上一步
   */
  previous() {
    if (this.currentStep > 0) {
      this.setCurrentStep(this.currentStep - 1);
    }
  }

  /**
   * 重置
   */
  reset() {
    this.currentStep = 0;
    this.stepStatus = {};
    this.updateVisualState();
  }

  /**
   * 完成所有步骤
   */
  completeAll() {
    this.steps.forEach((_, index) => {
      this.setStepStatus(index, 'completed');
    });
    this.currentStep = this.steps.length - 1;
    this.updateVisualState();
  }

  /**
   * 获取当前步骤
   * @returns {number} 当前步骤索引
   */
  getCurrentStep() {
    return this.currentStep;
  }

  /**
   * 获取步骤状态
   * @param {number} step - 步骤索引
   * @returns {string} 步骤状态
   */
  getStepStatus(step) {
    return this.stepStatus[step] || 
           (step < this.currentStep ? 'completed' : 
            step === this.currentStep ? 'active' : 'pending');
  }

  /**
   * 销毁组件
   */
  destroy() {
    this.steps = [];
    this.currentStep = 0;
    this.stepStatus = {};
    this.initialized = false;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StepIndicator;
} else {
  window.StepIndicator = StepIndicator;
}
