const AuthManager = {
  TOKEN_KEY: 'googoogaga_access_token',
  REFRESH_KEY: 'googoogaga_refresh_token',
  USER_KEY: 'googoogaga_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  },

  getUser() {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setSession(session, user) {
    if (session && session.access_token) {
      localStorage.setItem(this.TOKEN_KEY, session.access_token);
      localStorage.setItem(this.REFRESH_KEY, session.refresh_token || '');
    }
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    // 設置 session 時不自動切換頁面，由登入函數控制
    this.updateUI(false);
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    // 清除 session 時切換到登入頁面
    this.updateUI(true);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  async checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/status');
      if (!response.ok) {
        // API 返回错误，假设认证已启用（安全起见）
        console.warn('Auth status API returned error:', response.status);
        return true; // 返回 true 表示需要登录
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 返回的不是 JSON，可能是 HTML 错误页面
        console.warn('Auth status API returned non-JSON response');
        return true; // 返回 true 表示需要登录
      }
      const data = await response.json();
      return data.enabled !== false; // 默认启用认证
    } catch (error) {
      console.error('Auth status check failed:', error);
      // 错误时假设认证已启用，需要登录
      return true;
    }
  },

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
  },

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
  },

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
  },

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
  },

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
  },

  getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  },

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
        this.showLoginModal();
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  },

  updateUI(shouldSwitchPage = true) {
    const user = this.getUser();
    const userInfoEl = document.getElementById('userInfo');
    const authButtonsEl = document.getElementById('authButtons');
    const loginBtnEl = document.getElementById('loginBtn');
    const logoutBtnEl = document.getElementById('logoutBtn');
    const userEmailEl = document.getElementById('userEmail');
    const authShell = document.getElementById('authShell');
    const appShell = document.getElementById('appShell');

    if (this.isLoggedIn() && user) {
      // 更新用戶資訊 UI
      if (userInfoEl) userInfoEl.style.display = 'flex';
      if (authButtonsEl) authButtonsEl.style.display = 'none';
      if (loginBtnEl) loginBtnEl.style.display = 'none';
      if (logoutBtnEl) logoutBtnEl.style.display = 'inline-flex';
      if (userEmailEl) userEmailEl.textContent = user.email || 'User';
      
      // 只有在 shouldSwitchPage 為 true 時才切換頁面
      if (shouldSwitchPage) {
        // 登入後：隱藏登入頁面，顯示主應用
        if (authShell) {
          authShell.classList.add('hidden');
          authShell.style.display = 'none';
        }
        if (appShell) {
          appShell.classList.add('visible');
          appShell.style.display = 'block';
          appShell.style.visibility = 'visible';
        }
        document.body.classList.add('logged-in');
        document.body.classList.remove('not-logged-in');
      }
    } else {
      // 更新未登入 UI
      if (userInfoEl) userInfoEl.style.display = 'none';
      if (authButtonsEl) authButtonsEl.style.display = 'flex';
      if (loginBtnEl) loginBtnEl.style.display = 'inline-flex';
      if (logoutBtnEl) logoutBtnEl.style.display = 'none';
      if (userEmailEl) userEmailEl.textContent = '';
      
      // 只有在 shouldSwitchPage 為 true 時才切換頁面
      if (shouldSwitchPage) {
        // 未登入：顯示登入頁面，隱藏主應用
        if (authShell) {
          authShell.classList.remove('hidden');
          authShell.style.display = 'flex';
        }
        if (appShell) {
          appShell.classList.remove('visible');
          appShell.style.display = 'none';
          appShell.style.visibility = 'hidden';
        }
        document.body.classList.add('not-logged-in');
        document.body.classList.remove('logged-in');
      }
    }
  },

  showLoginModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'flex';
      this.switchAuthTab('login');
    }
  },

  hideLoginModal() {
    if (!this.isLoggedIn()) {
      return;
    }
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.clearAuthForms();
  },

  switchAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginFormContainer');
    const registerForm = document.getElementById('registerFormContainer');

    if (tab === 'login') {
      if (loginTab) loginTab.classList.add('active');
      if (registerTab) registerTab.classList.remove('active');
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
    } else {
      if (loginTab) loginTab.classList.remove('active');
      if (registerTab) registerTab.classList.add('active');
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
    }
  },

  clearAuthForms() {
    const forms = document.querySelectorAll('#authModal input');
    forms.forEach(input => input.value = '');
    const errorDivs = document.querySelectorAll('#authModal .auth-error');
    errorDivs.forEach(div => div.style.display = 'none');
  },

  showAuthError(formType, message) {
    const errorEl = document.getElementById(formType + 'Error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  },

  hideAuthError(formType) {
    const errorEl = document.getElementById(formType + 'Error');
    if (errorEl) {
      errorEl.style.display = 'none';
    }
  }
};

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  if (!email || !password) {
    AuthManager.showAuthError('login', translations[currentLanguage]?.auth_error_required || 'Please fill in all fields');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span>';
  
  try {
    await AuthManager.signIn(email, password);
    AuthManager.hideLoginModal();
    showNotification(translations[currentLanguage]?.auth_login_success || 'Successfully logged in!', 'success');
  } catch (error) {
    AuthManager.showAuthError('login', error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = translations[currentLanguage]?.auth_login_btn || 'Login';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  if (!email || !password || !confirmPassword) {
    AuthManager.showAuthError('register', translations[currentLanguage]?.auth_error_required || 'Please fill in all fields');
    return;
  }
  
  if (password !== confirmPassword) {
    AuthManager.showAuthError('register', translations[currentLanguage]?.auth_error_password_mismatch || 'Passwords do not match');
    return;
  }
  
  if (password.length < 6) {
    AuthManager.showAuthError('register', translations[currentLanguage]?.auth_error_password_length || 'Password must be at least 6 characters');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner"></span>';
  
  try {
    const result = await AuthManager.signUp(email, password);
    if (result.session) {
      AuthManager.hideLoginModal();
      showNotification(translations[currentLanguage]?.auth_register_success || 'Successfully registered!', 'success');
    } else {
      showNotification(translations[currentLanguage]?.auth_verify_email || 'Please check your email to verify your account.', 'info');
      AuthManager.switchAuthTab('login');
    }
  } catch (error) {
    AuthManager.showAuthError('register', error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = translations[currentLanguage]?.auth_register_btn || 'Register';
  }
}

async function handleLogout() {
  await AuthManager.signOut();
  
  const authShell = document.getElementById('authShell');
  const appShell = document.getElementById('appShell');
  
  if (authShell) authShell.classList.remove('hidden');
  if (appShell) appShell.classList.remove('visible');
  
  showNotification(translations[currentLanguage]?.auth_logout_success || 'Successfully logged out!', 'success');
}

function showNotification(message, type = 'info') {
  let notificationEl = document.getElementById('globalNotification');
  if (!notificationEl) {
    notificationEl = document.createElement('div');
    notificationEl.id = 'globalNotification';
    notificationEl.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: 500;
      z-index: 10000;
      opacity: 0;
      transform: translateX(100px);
      transition: all 0.3s ease;
    `;
    document.body.appendChild(notificationEl);
  }

  const colors = {
    success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
    error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
    info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' },
    warning: { bg: '#fff3cd', text: '#856404', border: '#ffeeba' }
  };

  const color = colors[type] || colors.info;
  notificationEl.style.background = color.bg;
  notificationEl.style.color = color.text;
  notificationEl.style.border = `1px solid ${color.border}`;
  notificationEl.textContent = message;

  requestAnimationFrame(() => {
    notificationEl.style.opacity = '1';
    notificationEl.style.transform = 'translateX(0)';
  });

  setTimeout(() => {
    notificationEl.style.opacity = '0';
    notificationEl.style.transform = 'translateX(100px)';
  }, 4000);
}

function toggleAuthForm(form) {
  const loginForm = document.getElementById('authLoginForm');
  const registerForm = document.getElementById('authRegisterForm');
  
  if (form === 'register') {
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
  } else {
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
  }
  
  document.querySelectorAll('#authShell .auth-error').forEach(el => {
    el.style.display = 'none';
    el.textContent = '';
  });
}

function showAuthError(formType, message) {
  const errorEl = document.getElementById(formType === 'login' ? 'authLoginError' : 'authRegisterError');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
}

async function handleAuthLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const submitBtn = document.getElementById('authLoginBtn');
  
  submitBtn.disabled = true;
  submitBtn.textContent = translations[currentLanguage]?.auth_loading || 'Loading...';
  
  try {
    await AuthManager.signIn(email, password);
    
    const authShell = document.getElementById('authShell');
    const appShell = document.getElementById('appShell');
    
    // 先更新 body 類別
    document.body.classList.add('logged-in');
    document.body.classList.remove('not-logged-in');
    
    // 隱藏登入頁面
    if (authShell) {
      authShell.classList.add('hidden');
      authShell.style.display = 'none';
      authShell.style.visibility = 'hidden';
    }
    
    // 顯示主應用 - 使用多種方式確保顯示
    if (appShell) {
      appShell.classList.add('visible');
      appShell.style.display = 'block';
      appShell.style.visibility = 'visible';
      appShell.style.position = 'relative';
      appShell.style.zIndex = '1';
    }
    
    // 確保第一個功能頁面顯示（page1）
    setTimeout(() => {
      const page1 = document.getElementById('page1');
      if (page1) {
        // 隱藏所有頁面
        document.querySelectorAll('.page-content').forEach(page => {
          page.classList.remove('active');
        });
        // 顯示第一個頁面
        page1.classList.add('active');
        // 設置第一個按鈕為 active
        const firstTabBtn = document.querySelector('.tab-btn[onclick*="page1"]');
        if (firstTabBtn) {
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
          });
          firstTabBtn.classList.add('active');
        }
      }
    }, 100);
    
    // 滾動到頂部
    window.scrollTo(0, 0);
    
    // 強制重新渲染
    if (appShell) {
      appShell.offsetHeight; // 觸發重排
    }
    
    // 更新 UI（不切換頁面，因為已經手動切換了）
    AuthManager.updateUI(false);
    showNotification(translations[currentLanguage]?.auth_login_success || 'Successfully logged in!', 'success');
    
    if (typeof AdminManager !== 'undefined') {
      AdminManager.checkAdminStatus();
    }
  } catch (error) {
    showAuthError('login', error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = translations[currentLanguage]?.auth_login_btn || 'Login';
  }
}

async function handleAuthRegister(event) {
  event.preventDefault();
  
  const email = document.getElementById('authRegEmail').value;
  const password = document.getElementById('authRegPassword').value;
  const confirmPassword = document.getElementById('authRegConfirmPassword').value;
  const submitBtn = document.getElementById('authRegisterBtn');
  
  if (password !== confirmPassword) {
    showAuthError('register', translations[currentLanguage]?.auth_password_mismatch || 'Passwords do not match');
    return;
  }
  
  submitBtn.disabled = true;
  submitBtn.textContent = translations[currentLanguage]?.auth_loading || 'Loading...';
  
  try {
    const result = await AuthManager.signUp(email, password);
    
    if (result.session) {
      const authShell = document.getElementById('authShell');
      const appShell = document.getElementById('appShell');
      
      if (authShell) authShell.classList.add('hidden');
      if (appShell) appShell.classList.add('visible');
      document.body.classList.add('logged-in');
      document.body.classList.remove('not-logged-in');
      
      AuthManager.updateUI();
      showNotification(translations[currentLanguage]?.auth_register_success || 'Successfully registered!', 'success');
    } else {
      showNotification(translations[currentLanguage]?.auth_verify_email || 'Please check your email to verify your account.', 'info');
      toggleAuthForm('login');
    }
  } catch (error) {
    showAuthError('register', error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = translations[currentLanguage]?.auth_register_btn || 'Register';
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  // 強制清除自動登入狀態 - 無論如何都先顯示登入頁面
  const authShell = document.getElementById('authShell');
  const appShell = document.getElementById('appShell');
  
  // 強制設置初始狀態：顯示登入頁面，隱藏主應用
  // 即使 localStorage 中有 token，也不自動登入
  if (authShell) {
    authShell.classList.remove('hidden');
    authShell.style.display = 'flex';
    authShell.style.visibility = 'visible';
  }
  if (appShell) {
    appShell.classList.remove('visible');
    appShell.style.display = 'none';
    appShell.style.visibility = 'hidden';
  }
  document.body.classList.add('not-logged-in');
  document.body.classList.remove('logged-in');
  
  // 檢查認證狀態（但不自動登入）
  const authEnabled = await AuthManager.checkAuthStatus();
  
  if (authEnabled) {
    // 認證已啟用：始終顯示登入頁面，不自動登入
    // 用戶必須手動登入
    if (authShell) {
      authShell.classList.remove('hidden');
      authShell.style.display = 'flex';
      authShell.style.visibility = 'visible';
    }
    if (appShell) {
      appShell.classList.remove('visible');
      appShell.style.display = 'none';
      appShell.style.visibility = 'hidden';
    }
    document.body.classList.add('not-logged-in');
    document.body.classList.remove('logged-in');
    // 只更新 UI 元素（用戶資訊等），不切換頁面
    AuthManager.updateUI(false);
  } else {
    // 認證未啟用：直接顯示主應用
    if (authShell) {
      authShell.classList.add('hidden');
      authShell.style.display = 'none';
    }
    if (appShell) {
      appShell.classList.add('visible');
      appShell.style.display = 'block';
      appShell.style.visibility = 'visible';
    }
    document.body.classList.add('logged-in');
    document.body.classList.remove('not-logged-in');
    const authElements = document.querySelectorAll('.auth-required');
    authElements.forEach(el => el.style.display = 'none');
  }
  
  const authLangSelect = document.getElementById('authLangSelect');
  if (authLangSelect) {
    authLangSelect.value = currentLanguage;
  }
});
