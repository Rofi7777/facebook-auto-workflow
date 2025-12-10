const AdminManager = {
  isAdmin: false,
  isSuperAdmin: false,
  hasServiceKey: false,

  async checkAdminStatus() {
    try {
      const response = await AuthManager.authFetch('/api/auth/user');
      const data = await response.json();
      
      if (data.success && data.user) {
        this.isAdmin = data.user.isAdmin || false;
        this.isSuperAdmin = data.user.isSuperAdmin || false;
        this.updateAdminUI();
        return this.isAdmin;
      }
      return false;
    } catch (error) {
      console.error('Admin status check failed:', error);
      return false;
    }
  },

  async checkServiceKeyStatus() {
    try {
      const response = await AuthManager.authFetch('/api/admin/status');
      const data = await response.json();
      
      if (data.success) {
        this.hasServiceKey = data.hasServiceKey;
        const banner = document.getElementById('adminStatusBanner');
        if (banner) {
          banner.style.display = this.hasServiceKey ? 'none' : 'block';
        }
      }
    } catch (error) {
      console.error('Service key status check failed:', error);
    }
  },

  updateAdminUI() {
    const adminTabBtn = document.getElementById('adminTabBtn');
    const adminPage = document.getElementById('page5');
    
    if (this.isAdmin) {
      if (adminTabBtn) adminTabBtn.style.display = 'inline-flex';
      if (adminPage) adminPage.classList.remove('admin-only-hidden');
    } else {
      if (adminTabBtn) adminTabBtn.style.display = 'none';
      if (adminPage) adminPage.classList.add('admin-only-hidden');
    }
  },

  async loadAdminData() {
    if (!this.isAdmin) return;
    
    const loadingEl = document.getElementById('adminLoading');
    if (loadingEl) loadingEl.style.display = 'flex';
    
    try {
      await this.checkServiceKeyStatus();
      await Promise.all([
        this.loadPendingUsers(),
        this.loadAllUsers()
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      showNotification(t('admin_error_operation') + ': ' + error.message, 'error');
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
    }
  },

  async loadPendingUsers() {
    try {
      const response = await AuthManager.authFetch('/api/admin/pending');
      const data = await response.json();
      
      const pendingBody = document.getElementById('pendingUsersBody');
      const pendingCount = document.getElementById('pendingCount');
      
      if (!data.success || !data.users || data.users.length === 0) {
        if (pendingBody) {
          pendingBody.innerHTML = `<tr><td colspan="3" style="padding: 30px; text-align: center; color: #888;">${t('admin_no_pending')}</td></tr>`;
        }
        if (pendingCount) pendingCount.textContent = '0';
        return;
      }
      
      if (pendingCount) pendingCount.textContent = data.users.length;
      
      if (pendingBody) {
        pendingBody.innerHTML = data.users.map(user => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 15px;">${this.escapeHtml(user.email)}</td>
            <td style="padding: 12px 15px;">${this.formatDate(user.created_at)}</td>
            <td style="padding: 12px 15px; text-align: center;">
              <button onclick="AdminManager.approveUser('${user.id}')" style="padding: 6px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 5px;">
                ✓ ${t('admin_approve')}
              </button>
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Failed to load pending users:', error);
    }
  },

  async loadAllUsers() {
    try {
      const response = await AuthManager.authFetch('/api/admin/users');
      const data = await response.json();
      
      const usersBody = document.getElementById('allUsersBody');
      const totalCount = document.getElementById('totalCount');
      
      if (!data.success || !data.users || data.users.length === 0) {
        if (usersBody) {
          usersBody.innerHTML = `<tr><td colspan="6" style="padding: 30px; text-align: center; color: #888;">${t('admin_no_users')}</td></tr>`;
        }
        if (totalCount) totalCount.textContent = '0';
        return;
      }
      
      if (totalCount) totalCount.textContent = data.users.length;
      
      if (usersBody) {
        usersBody.innerHTML = data.users.map(user => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 15px;">${this.escapeHtml(user.email)}</td>
            <td style="padding: 12px 15px; text-align: center;">${this.getRoleBadge(user.role)}</td>
            <td style="padding: 12px 15px; text-align: center;">${this.getStatusBadge(user.status)}</td>
            <td style="padding: 12px 15px;">${this.formatDate(user.created_at)}</td>
            <td style="padding: 12px 15px;">${user.last_sign_in_at ? this.formatDate(user.last_sign_in_at) : '-'}</td>
            <td style="padding: 12px 15px; text-align: center;">
              ${this.getActionButtons(user)}
            </td>
          </tr>
        `).join('');
      }
    } catch (error) {
      console.error('Failed to load all users:', error);
    }
  },

  getRoleBadge(role) {
    const roles = {
      'super_admin': { label: t('admin_role_super_admin'), color: '#9b59b6' },
      'admin': { label: t('admin_role_admin'), color: '#e74c3c' },
      'user': { label: t('admin_role_user'), color: '#3498db' },
      'pending': { label: t('admin_role_pending'), color: '#f39c12' }
    };
    const r = roles[role] || roles['user'];
    return `<span style="background: ${r.color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${r.label}</span>`;
  },

  getStatusBadge(status) {
    const statuses = {
      'active': { label: t('admin_status_active'), color: '#28a745' },
      'suspended': { label: t('admin_status_suspended'), color: '#dc3545' },
      'pending': { label: t('admin_status_pending'), color: '#ffc107' }
    };
    const s = statuses[status] || statuses['pending'];
    return `<span style="background: ${s.color}; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px;">${s.label}</span>`;
  },

  getActionButtons(user) {
    if (user.role === 'super_admin') {
      return '<span style="color: #888; font-size: 12px;">-</span>';
    }

    let buttons = [];
    
    if (user.status === 'pending' || user.status !== 'active') {
      buttons.push(`<button onclick="AdminManager.approveUser('${user.id}')" style="padding: 4px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;" title="${t('admin_approve')}">✓</button>`);
    }
    
    if (user.status === 'active') {
      buttons.push(`<button onclick="AdminManager.suspendUser('${user.id}')" style="padding: 4px 10px; background: #ffc107; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;" title="${t('admin_suspend')}">⏸</button>`);
    }
    
    if (this.isSuperAdmin && user.role !== 'admin') {
      buttons.push(`<button onclick="AdminManager.promoteUser('${user.id}')" style="padding: 4px 10px; background: #9b59b6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;" title="${t('admin_promote')}">⬆</button>`);
    }
    
    if (this.isSuperAdmin && user.role === 'admin') {
      buttons.push(`<button onclick="AdminManager.demoteUser('${user.id}')" style="padding: 4px 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;" title="${t('admin_demote')}">⬇</button>`);
    }
    
    if (this.isSuperAdmin) {
      buttons.push(`<button onclick="AdminManager.deleteUser('${user.id}')" style="padding: 4px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 2px;" title="${t('admin_delete')}">🗑</button>`);
    }
    
    return buttons.length > 0 ? buttons.join('') : '<span style="color: #888; font-size: 12px;">-</span>';
  },

  async approveUser(userId) {
    if (!confirm(t('admin_confirm_approve'))) return;
    await this.performAction(`/api/admin/users/${userId}/approve`, 'POST', t('admin_success_approve'));
  },

  async suspendUser(userId) {
    if (!confirm(t('admin_confirm_suspend'))) return;
    await this.performAction(`/api/admin/users/${userId}/suspend`, 'POST', t('admin_success_suspend'));
  },

  async promoteUser(userId) {
    if (!confirm(t('admin_confirm_promote'))) return;
    await this.performAction(`/api/admin/users/${userId}/promote`, 'POST', t('admin_success_promote'));
  },

  async demoteUser(userId) {
    if (!confirm(t('admin_confirm_demote'))) return;
    await this.performAction(`/api/admin/users/${userId}/demote`, 'POST', t('admin_success_demote'));
  },

  async deleteUser(userId) {
    if (!confirm(t('admin_confirm_delete'))) return;
    await this.performAction(`/api/admin/users/${userId}`, 'DELETE', t('admin_success_delete'));
  },

  async performAction(url, method, successMessage) {
    const loadingEl = document.getElementById('adminLoading');
    if (loadingEl) loadingEl.style.display = 'flex';
    
    try {
      const response = await AuthManager.authFetch(url, { method });
      const data = await response.json();
      
      if (data.success) {
        showNotification(successMessage, 'success');
        await this.loadAdminData();
      } else {
        showNotification(t('admin_error_operation') + ': ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Admin action failed:', error);
      showNotification(t('admin_error_operation') + ': ' + error.message, 'error');
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
    }
  },

  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

async function loadAdminData() {
  await AdminManager.loadAdminData();
}

document.addEventListener('DOMContentLoaded', async function() {
  setTimeout(async () => {
    if (AuthManager.isLoggedIn()) {
      await AdminManager.checkAdminStatus();
    }
  }, 500);
});

const originalSetSession = AuthManager.setSession.bind(AuthManager);
AuthManager.setSession = function(session, user) {
  originalSetSession(session, user);
  setTimeout(() => AdminManager.checkAdminStatus(), 100);
};
