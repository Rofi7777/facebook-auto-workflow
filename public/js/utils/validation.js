/**
 * Validation Utility Functions
 */
class ValidationUtils {
  /**
   * Validate email
   */
  static isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate required field
   */
  static isRequired(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  }

  /**
   * Validate min length
   */
  static minLength(value, min) {
    if (typeof value === 'string') {
      return value.length >= min;
    }
    if (Array.isArray(value)) {
      return value.length >= min;
    }
    return false;
  }

  /**
   * Validate max length
   */
  static maxLength(value, max) {
    if (typeof value === 'string') {
      return value.length <= max;
    }
    if (Array.isArray(value)) {
      return value.length <= max;
    }
    return false;
  }

  /**
   * Validate file type
   */
  static isValidFileType(file, allowedTypes) {
    if (!file || !file.type) return false;
    return allowedTypes.some(type => {
      if (type.startsWith('.')) {
        // Extension check
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      // MIME type check
      return file.type.match(type);
    });
  }

  /**
   * Validate file size
   */
  static isValidFileSize(file, maxSizeMB) {
    if (!file) return false;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate URL
   */
  static isURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate number
   */
  static isNumber(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  /**
   * Validate integer
   */
  static isInteger(value) {
    return Number.isInteger(Number(value));
  }

  /**
   * Validate range
   */
  static inRange(value, min, max) {
    const num = Number(value);
    return num >= min && num <= max;
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
  }

  /**
   * Validate form
   */
  static validateForm(formData, rules) {
    const errors = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = formData[field];
      
      fieldRules.forEach(rule => {
        if (rule.required && !this.isRequired(value)) {
          errors[field] = rule.message || `${field} is required`;
          return;
        }
        
        if (!this.isRequired(value) && !rule.required) {
          return; // Skip validation for empty optional fields
        }
        
        if (rule.type === 'email' && !this.isEmail(value)) {
          errors[field] = rule.message || 'Invalid email format';
        } else if (rule.type === 'url' && !this.isURL(value)) {
          errors[field] = rule.message || 'Invalid URL format';
        } else if (rule.type === 'number' && !this.isNumber(value)) {
          errors[field] = rule.message || 'Must be a number';
        } else if (rule.minLength && !this.minLength(value, rule.minLength)) {
          errors[field] = rule.message || `Minimum length is ${rule.minLength}`;
        } else if (rule.maxLength && !this.maxLength(value, rule.maxLength)) {
          errors[field] = rule.message || `Maximum length is ${rule.maxLength}`;
        } else if (rule.min && !this.inRange(value, rule.min, Infinity)) {
          errors[field] = rule.message || `Minimum value is ${rule.min}`;
        } else if (rule.max && !this.inRange(value, -Infinity, rule.max)) {
          errors[field] = rule.message || `Maximum value is ${rule.max}`;
        } else if (rule.pattern && !rule.pattern.test(value)) {
          errors[field] = rule.message || 'Invalid format';
        } else if (rule.custom && !rule.custom(value)) {
          errors[field] = rule.message || 'Validation failed';
        }
      });
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Export
window.ValidationUtils = ValidationUtils;


