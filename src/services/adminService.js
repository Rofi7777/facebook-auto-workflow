const { createClient } = require('@supabase/supabase-js');

class AdminService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    this.SUPER_ADMIN_EMAIL = 'rofi90@hotmail.com';
    
    this.ADMIN_EMAILS = [
      'rofi90@hotmail.com'
    ];

    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
      console.warn('⚠️ Supabase credentials not found. Admin service will be limited.');
      this.client = null;
      this.enabled = false;
      return;
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    this.hasServiceKey = !!supabaseServiceKey;
    this.enabled = true;
    console.log(`🔐 Admin Service initialized ${this.hasServiceKey ? '(with service key)' : '(limited mode)'}`);
  }

  isEnabled() {
    return this.enabled;
  }

  isSuperAdmin(email) {
    return email && email.toLowerCase() === this.SUPER_ADMIN_EMAIL.toLowerCase();
  }

  isAdminByEmail(email) {
    if (!email) return false;
    return this.ADMIN_EMAILS.some(adminEmail => 
      adminEmail.toLowerCase() === email.toLowerCase()
    );
  }

  async isAdmin(email, userMetadata = null) {
    if (!email) return false;
    
    if (this.isAdminByEmail(email)) {
      return true;
    }
    
    if (userMetadata && userMetadata.role === 'admin') {
      return true;
    }
    
    return false;
  }

  async checkAdminByUserId(userId) {
    if (!this.enabled || !this.hasServiceKey) {
      return false;
    }

    try {
      const { data, error } = await this.client.auth.admin.getUserById(userId);
      if (error || !data.user) return false;
      
      const email = data.user.email;
      const metadata = data.user.user_metadata;
      
      return this.isSuperAdmin(email) || 
             this.isAdminByEmail(email) || 
             (metadata && metadata.role === 'admin');
    } catch (err) {
      console.error('Error checking admin by userId:', err);
      return false;
    }
  }

  async getUserRole(email, userMetadata = null) {
    if (this.isSuperAdmin(email)) {
      return 'super_admin';
    }
    if (await this.isAdmin(email, userMetadata)) {
      return 'admin';
    }
    return 'user';
  }

  async getAllUsers() {
    if (!this.enabled || !this.hasServiceKey) {
      return { users: [], error: 'Service key required for user listing' };
    }

    try {
      const { data, error } = await this.client.auth.admin.listUsers();
      
      if (error) {
        console.error('Error listing users:', error);
        return { users: [], error: error.message };
      }

      const users = data.users.map(user => {
        // 确保只有 rofi90@hotmail.com 是超级管理员
        if (this.isSuperAdmin(user.email)) {
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at,
            email_confirmed_at: user.email_confirmed_at,
            role: 'super_admin',
            status: user.user_metadata?.status || 
                    (user.email_confirmed_at ? 'active' : 'pending'),
            user_metadata: user.user_metadata
          };
        }
        
        // 对于其他用户，从 user_metadata 获取角色，如果没有则默认为 'user'
        const userRole = user.user_metadata?.role || 'user';
        // 确保角色只能是 'user' 或 'admin'，不能是 'super_admin'
        const role = (userRole === 'admin') ? 'admin' : 'user';
        
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          email_confirmed_at: user.email_confirmed_at,
          role: role,
          status: user.user_metadata?.status || 
                  (user.email_confirmed_at ? 'active' : 'pending'),
          user_metadata: user.user_metadata
        };
      });

      return { users, error: null };
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      return { users: [], error: err.message };
    }
  }

  async getPendingUsers() {
    const { users, error } = await this.getAllUsers();
    if (error) return { users: [], error };

    const pendingUsers = users.filter(user => 
      !user.email_confirmed_at || user.status === 'pending'
    );

    return { users: pendingUsers, error: null };
  }

  async updateUserStatus(userId, status) {
    if (!this.enabled || !this.hasServiceKey) {
      return { success: false, error: 'Service key required' };
    }

    try {
      const { data, error } = await this.client.auth.admin.updateUserById(userId, {
        user_metadata: { status }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async updateUserRole(userId, role) {
    if (!this.enabled || !this.hasServiceKey) {
      return { success: false, error: 'Service key required' };
    }

    try {
      // 先获取用户信息，确保不能修改超级管理员的角色
      const { data: userData, error: getUserError } = await this.client.auth.admin.getUserById(userId);
      if (getUserError || !userData.user) {
        return { success: false, error: 'User not found' };
      }

      // 禁止修改超级管理员的角色
      if (this.isSuperAdmin(userData.user.email)) {
        return { success: false, error: 'Cannot modify super admin role' };
      }

      // 确保角色只能是 'user' 或 'admin'，不能设置为 'super_admin'
      if (role === 'super_admin') {
        return { success: false, error: 'Cannot set role to super_admin. Only rofi90@hotmail.com can be super admin.' };
      }

      const { data, error } = await this.client.auth.admin.updateUserById(userId, {
        user_metadata: { 
          ...userData.user.user_metadata,
          role: role === 'admin' ? 'admin' : 'user'
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (role === 'admin' && !this.ADMIN_EMAILS.includes(data.user.email)) {
        this.ADMIN_EMAILS.push(data.user.email);
      }

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async approveUser(userId) {
    return this.updateUserStatus(userId, 'active');
  }

  async suspendUser(userId) {
    return this.updateUserStatus(userId, 'suspended');
  }

  async promoteToAdmin(userId) {
    // 先检查用户是否是超级管理员
    if (!this.enabled || !this.hasServiceKey) {
      return { success: false, error: 'Service key required' };
    }

    try {
      const { data: userData, error: getUserError } = await this.client.auth.admin.getUserById(userId);
      if (getUserError || !userData.user) {
        return { success: false, error: 'User not found' };
      }

      // 禁止修改超级管理员
      if (this.isSuperAdmin(userData.user.email)) {
        return { success: false, error: 'Cannot modify super admin' };
      }

      return this.updateUserRole(userId, 'admin');
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async demoteFromAdmin(userId) {
    // 先检查用户是否是超级管理员
    if (!this.enabled || !this.hasServiceKey) {
      return { success: false, error: 'Service key required' };
    }

    try {
      const { data: userData, error: getUserError } = await this.client.auth.admin.getUserById(userId);
      if (getUserError || !userData.user) {
        return { success: false, error: 'User not found' };
      }

      // 禁止修改超级管理员
      if (this.isSuperAdmin(userData.user.email)) {
        return { success: false, error: 'Cannot modify super admin' };
      }

      return this.updateUserRole(userId, 'user');
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteUser(userId) {
    if (!this.enabled || !this.hasServiceKey) {
      return { success: false, error: 'Service key required' };
    }

    try {
      const { error } = await this.client.auth.admin.deleteUser(userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getUserById(userId) {
    if (!this.enabled || !this.hasServiceKey) {
      return { user: null, error: 'Service key required' };
    }

    try {
      const { data, error } = await this.client.auth.admin.getUserById(userId);

      if (error) {
        return { user: null, error: error.message };
      }

        // 确保只有 rofi90@hotmail.com 是超级管理员
        let role = 'user';
        if (this.isSuperAdmin(data.user.email)) {
          role = 'super_admin';
        } else {
          const userRole = data.user.user_metadata?.role || 'user';
          role = (userRole === 'admin') ? 'admin' : 'user';
        }
        
        return { 
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
          email_confirmed_at: data.user.email_confirmed_at,
          role: role,
          status: data.user.user_metadata?.status || 
                  (data.user.email_confirmed_at ? 'active' : 'pending'),
          user_metadata: data.user.user_metadata
        }, 
        error: null 
      };
    } catch (err) {
      return { user: null, error: err.message };
    }
  }
}

module.exports = AdminService;
