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

  isAdmin(email) {
    if (!email) return false;
    return this.ADMIN_EMAILS.some(adminEmail => 
      adminEmail.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserRole(email) {
    if (this.isSuperAdmin(email)) {
      return 'super_admin';
    }
    if (this.isAdmin(email)) {
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

      const users = data.users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        email_confirmed_at: user.email_confirmed_at,
        role: this.isSuperAdmin(user.email) ? 'super_admin' : 
              this.isAdmin(user.email) ? 'admin' : 
              (user.user_metadata?.role || 'user'),
        status: user.user_metadata?.status || 
                (user.email_confirmed_at ? 'active' : 'pending'),
        user_metadata: user.user_metadata
      }));

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
      const { data, error } = await this.client.auth.admin.updateUserById(userId, {
        user_metadata: { role }
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
    return this.updateUserRole(userId, 'admin');
  }

  async demoteFromAdmin(userId) {
    return this.updateUserRole(userId, 'user');
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

      return { 
        user: {
          id: data.user.id,
          email: data.user.email,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
          email_confirmed_at: data.user.email_confirmed_at,
          role: this.isSuperAdmin(data.user.email) ? 'super_admin' : 
                this.isAdmin(data.user.email) ? 'admin' : 
                (data.user.user_metadata?.role || 'user'),
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
