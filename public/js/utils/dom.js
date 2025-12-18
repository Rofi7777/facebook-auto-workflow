/**
 * DOM Utility Functions
 */
class DOMUtils {
  /**
   * Create element with attributes
   */
  static create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    return element;
  }

  /**
   * Query selector with optional context
   */
  static $(selector, context = document) {
    return context.querySelector(selector);
  }

  /**
   * Query selector all
   */
  static $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  /**
   * Show element
   */
  static show(element, display = 'block') {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.style.display = display;
      element.style.visibility = 'visible';
    }
  }

  /**
   * Hide element
   */
  static hide(element) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.style.display = 'none';
    }
  }

  /**
   * Toggle element visibility
   */
  static toggle(element, show = null) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (!element) return;
    
    if (show === null) {
      show = element.style.display === 'none';
    }
    
    this[show ? 'show' : 'hide'](element);
  }

  /**
   * Add class
   */
  static addClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.add(className);
    }
  }

  /**
   * Remove class
   */
  static removeClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.remove(className);
    }
  }

  /**
   * Toggle class
   */
  static toggleClass(element, className, force = null) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (element) {
      element.classList.toggle(className, force);
    }
  }

  /**
   * Check if element has class
   */
  static hasClass(element, className) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    return element?.classList.contains(className) || false;
  }

  /**
   * Set attributes
   */
  static setAttributes(element, attributes) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (!element) return;
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'textContent') {
        element.textContent = value;
      } else if (key === 'innerHTML') {
        element.innerHTML = value;
      } else {
        element.setAttribute(key, value);
      }
    });
  }

  /**
   * Get computed style
   */
  static getStyle(element, property) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (!element) return null;
    
    return window.getComputedStyle(element)[property];
  }

  /**
   * Scroll to element
   */
  static scrollTo(element, options = {}) {
    if (typeof element === 'string') {
      element = this.$(element);
    }
    if (!element) return;
    
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  }

  /**
   * Debounce function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle function
   */
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Wait for element to exist
   */
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = this.$(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
        const element = this.$(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}

// Export
window.DOMUtils = DOMUtils;


