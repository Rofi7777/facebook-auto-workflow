/**
 * Integration Bridge
 * 桥接现有代码和新架构，确保向后兼容
 */

(function() {
  'use strict';
  
  console.log('[Integration Bridge] Initializing...');
  
  // 等待新架构模块加载
  const waitForArchitecture = setInterval(() => {
    if (window.Page1ProductAnalysis && window.Router && window.StateManager) {
      clearInterval(waitForArchitecture);
      setupIntegration();
    }
  }, 100);
  
  // 10秒后停止等待
  setTimeout(() => {
    clearInterval(waitForArchitecture);
    if (!window.Page1ProductAnalysis) {
      console.warn('[Integration Bridge] New architecture modules not found, using fallback');
    }
  }, 10000);
  
  function setupIntegration() {
    console.log('[Integration Bridge] Setting up integration...');
    
    // 1. 集成 analyzeProduct 函数
    if (typeof window.analyzeProduct === 'function') {
      const originalAnalyzeProduct = window.analyzeProduct;
      window.analyzeProduct = async function() {
        // 如果 Page1 模块已初始化，使用它
        if (window.pageModules && window.pageModules.page1) {
          try {
            await window.pageModules.page1.handleAnalyze();
          } catch (error) {
            console.error('[Integration Bridge] Page1 handleAnalyze failed, using original:', error);
            return originalAnalyzeProduct.call(this);
          }
        } else {
          return originalAnalyzeProduct.call(this);
        }
      };
      console.log('[Integration Bridge] analyzeProduct integrated');
    }
    
    // 2. 集成 generateContent 函数
    if (typeof window.generateContent === 'function') {
      const originalGenerateContent = window.generateContent;
      window.generateContent = async function() {
        if (window.pageModules && window.pageModules.page1) {
          try {
            await window.pageModules.page1.handleGenerateContent();
          } catch (error) {
            console.error('[Integration Bridge] Page1 handleGenerateContent failed, using original:', error);
            return originalGenerateContent.call(this);
          }
        } else {
          return originalGenerateContent.call(this);
        }
      };
      console.log('[Integration Bridge] generateContent integrated');
    }
    
    // 3. 集成 generateScenarios 函数
    if (typeof window.generateScenarios === 'function') {
      const originalGenerateScenarios = window.generateScenarios;
      window.generateScenarios = async function() {
        if (window.pageModules && window.pageModules.page1) {
          try {
            await window.pageModules.page1.handleGenerateScenarios();
          } catch (error) {
            console.error('[Integration Bridge] Page1 handleGenerateScenarios failed, using original:', error);
            return originalGenerateScenarios.call(this);
          }
        } else {
          return originalGenerateScenarios.call(this);
        }
      };
      console.log('[Integration Bridge] generateScenarios integrated');
    }
    
    // 4. 集成 generateCourse 函数
    if (typeof window.generateCourse === 'function') {
      const originalGenerateCourse = window.generateCourse;
      window.generateCourse = async function() {
        if (window.pageModules && window.pageModules.page3) {
          try {
            await window.pageModules.page3.handleGenerate();
          } catch (error) {
            console.error('[Integration Bridge] Page3 handleGenerate failed, using original:', error);
            return originalGenerateCourse.call(this);
          }
        } else {
          return originalGenerateCourse.call(this);
        }
      };
      console.log('[Integration Bridge] generateCourse integrated');
    }
    
    // 5. 确保 switchPage 函数与新 Router 集成
    if (typeof window.switchPage === 'function' && !window.switchPage._integrated) {
      const originalSwitchPage = window.switchPage;
      window.switchPage = function(pageId, event) {
        // 优先使用 Router
        if (window.Router) {
          window.Router.navigateTo(pageId);
        } else {
          originalSwitchPage.call(this, pageId, event);
        }
      };
      window.switchPage._integrated = true;
      console.log('[Integration Bridge] switchPage integrated with Router');
    }
    
    console.log('[Integration Bridge] Integration setup complete');
  }
})();

