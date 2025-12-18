/**
 * 认证服务
 * 处理用户登录、注册、登出、Token管理和自动刷新
 */
class AuthService {
  constructor() {
    this.TOKEN_KEY = 'googoogaga_access_token';
    this.REFRESH_KEY = 'googoogaga_refresh_token';
    this.USER_KEY = 'googoogaga_user';
    this.apiService = window.ApiService || null;
  }

  /**
   * 获取Token
   * @returns {string|null} Token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 获取刷新Token
   * @returns {string|null} 刷新Token
   */
  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * 设置会话
   * @param {Object} session - 会话对象
   * @param {Object} user - 用户对象
   */
  setSession(session, user) {
    if (session && session.access_token) {
      localStorage.setItem(this.TOKEN_KEY, session.access_token);
      localStorage.setItem(this.REFRESH_KEY, session.refresh_token || '');
    }
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * 清除会话
   */
  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * 获取认证头
   * @returns {Object} 认证头对象
   */
  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 检查认证状态
   * @returns {Promise<boolean>} 认证是否启用
   */
  async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        return true; // 默认启用认证
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return true;
      }
      const data = await response.json();
      return data.enabled !== false;
    } catch (error) {
      console.error('Auth status check failed:', error);
      return true; // 错误时假设启用认证
    }
  }

  /**
   * 注册
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 注册结果
   */
  async signUp(email, password) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign up failed');
    }

    if (data.session) {
      this.setSession(data.session, data.user);
    }

    return data;
  }

  /**
   * 登录
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise<Object>} 登录结果
   */
  async signIn(email, password) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Sign in failed');
    }

    this.setSession(data.session, data.user);
    return data;
  }

  /**
   * 登出
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      const token = this.getToken();
      if (token) {
        await fetch('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }

    this.clearSession();
  }

  /**
   * 刷新会话
   * @returns {Promise<boolean>} 是否刷新成功
   */
  async refreshSession() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      this.setSession(data.session, data.user);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * 重置密码
   * @param {string} email - 邮箱
   * @returns {Promise<Object>} 重置结果
   */
  async resetPassword(email) {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed');
    }

    return data;
  }

  /**
   * 带认证的Fetch请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @returns {Promise<Response>} 响应对象
   */
  async authFetch(url, options = {}) {
    const headers = {
      ...options.headers,
      ...this.getAuthHeaders()
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const refreshed = await this.refreshSession();
      if (refreshed) {
        const newHeaders = {
          ...options.headers,
          ...this.getAuthHeaders()
        };
        response = await fetch(url, { ...options, headers: newHeaders });
      } else {
        this.clearSession();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  }
}

// 创建单例实例
const authService = new AuthService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = authService;
} else {
  window.AuthService = authService;
}
