/**
 * Application Initialization Script
 * Registers pages and initializes the application
 */

// Wait for DOM and all scripts to load
(async function() {
  // Wait for all required modules to be available
  await waitForModules(['appState', 'router', 'app', 'apiService', 'authService', 'i18nService']);
  
  console.log('[App Init] Starting application initialization...');
  
  try {
    // Register services
    if (window.app && window.authService) {
      window.app.register(window.authService);
    }
    
    if (window.app && window.i18nService) {
      window.app.register(window.i18nService);
    }
    
    // Register pages
    if (window.router) {
      // Page 1: Product Analysis
      if (window.Page1ProductAnalysis) {
        const page1 = new Page1ProductAnalysis();
        window.router.register('page1', page1);
        window.page1Module = page1; // Store for debugging
        console.log('[App Init] Page1 registered');
      }
      
      // Page 2: Ads Advisor
      if (window.Page2AdsAdvisor) {
        const page2 = new Page2AdsAdvisor();
        window.router.register('page2', page2);
        window.page2Module = page2;
        console.log('[App Init] Page2 registered');
      }
      
      // Page 3: Course Editor
      if (window.Page3CourseEditor) {
        const page3 = new Page3CourseEditor();
        window.router.register('page3', page3);
        window.page3Module = page3;
        console.log('[App Init] Page3 registered');
      }
      
      // Page 4: Prompt Architect
      if (window.Page4PromptArchitect) {
        const page4 = new Page4PromptArchitect();
        window.router.register('page4', page4);
        window.page4Module = page4;
        console.log('[App Init] Page4 registered');
      }
      
      // Page 5: Admin Console
      if (window.Page5Admin) {
        const page5 = new Page5Admin();
        window.router.register('page5', page5);
        window.page5Module = page5;
        console.log('[App Init] Page5 registered');
      }
    }
    
    // Initialize app
    if (window.app) {
      await window.app.init();
      console.log('[App Init] Application initialized');
    }
    
    // Setup navigation integration
    setupNavigationIntegration();
    
    // Setup auth integration
    setupAuthIntegration();
    
    console.log('[App Init] Initialization complete');
    
  } catch (error) {
    console.error('[App Init] Initialization error:', error);
  }
})();

/**
 * Wait for modules to be available
 */
function waitForModules(moduleNames, maxWait = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 100;
    
    const checkModules = () => {
      const allLoaded = moduleNames.every(name => {
        // Check if module exists in window
        const parts = name.split('.');
        let obj = window;
        for (const part of parts) {
          if (!obj || typeof obj[part] === 'undefined') {
            return false;
          }
          obj = obj[part];
        }
        return true;
      });
      
      if (allLoaded) {
        resolve();
      } else if (Date.now() - startTime > maxWait) {
        const missing = moduleNames.filter(name => {
          const parts = name.split('.');
          let obj = window;
          for (const part of parts) {
            if (!obj || typeof obj[part] === 'undefined') {
              return true;
            }
            obj = obj[part];
          }
          return false;
        });
        reject(new Error(`Modules not loaded: ${missing.join(', ')}`));
      } else {
        setTimeout(checkModules, checkInterval);
      }
    };
    
    checkModules();
  });
}

/**
 * Setup navigation integration
 */
function setupNavigationIntegration() {
  // Integrate with existing navigation if available
  if (typeof switchPage === 'function') {
    // Override switchPage to use router
    const originalSwitchPage = window.switchPage;
    window.switchPage = function(pageId, event) {
      if (window.router) {
        // Use router for navigation
        window.router.navigate(pageId).catch(error => {
          console.error('[Navigation] Router navigation failed, falling back to original:', error);
          // Fallback to original if router fails
          if (originalSwitchPage) {
            originalSwitchPage(pageId, event);
          }
        });
      } else {
        // Fallback to original if router not available
        if (originalSwitchPage) {
          originalSwitchPage(pageId, event);
        }
      }
    };
    console.log('[App Init] Navigation integration setup complete');
  }
  
  // Setup navigation component if container exists
  const navContainer = document.querySelector('.tab-navigation') || document.getElementById('tabNavigation');
  if (navContainer && window.Navigation) {
    const user = window.authService?.getUser() || window.appState?.get('user');
    const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
    
    const navigation = new Navigation(navContainer, {
      activePage: window.appState?.get('currentPage') || 'page1',
      showAdminTab: isAdmin,
      onPageChange: (pageId, previousPage) => {
        if (window.router) {
          window.router.navigate(pageId);
        }
      }
    });
    
    window.navigation = navigation;
  }
}

/**
 * Setup auth integration
 */
function setupAuthIntegration() {
  // Listen for auth state changes
  if (window.authService) {
    // Update navigation when auth state changes
    const originalUpdateUI = window.authService.updateUI;
    window.authService.updateUI = function(shouldSwitchPage) {
      originalUpdateUI.call(this, shouldSwitchPage);
      
      // Update navigation admin tab visibility
      if (window.navigation) {
        const user = this.getUser();
        const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin');
        if (isAdmin) {
          window.navigation.showAdminTab();
        } else {
          window.navigation.hideAdminTab();
        }
      }
    };
  }
  
  // Listen for router navigation events
  if (window.router) {
    window.addEventListener('router:navigate', (event) => {
      const { pageId } = event.detail;
      
      // Update navigation active state
      if (window.navigation) {
        window.navigation.setActivePage(pageId);
      }
      
      // Update app state
      if (window.appState) {
        window.appState.set('currentPage', pageId);
      }
    });
  }
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[App Init] DOM ready');
  });
} else {
  console.log('[App Init] DOM already ready');
}

