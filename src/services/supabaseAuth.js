const { createClient } = require('@supabase/supabase-js');

class SupabaseAuthService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('⚠️ Supabase credentials not found. Authentication will be disabled.');
      this.client = null;
      this.enabled = false;
      return;
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey);
    this.enabled = true;
    console.log('🔐 Supabase Auth Service initialized successfully');
  }

  isEnabled() {
    return this.enabled;
  }

  async signUp(email, password) {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async signIn(email, password) {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async signOut() {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { error } = await this.client.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { success: true };
  }

  async verifyToken(accessToken) {
    if (!this.enabled) {
      return null;
    }

    try {
      const { data: { user }, error } = await this.client.auth.getUser(accessToken);
      
      if (error || !user) {
        return null;
      }

      return user;
    } catch (err) {
      console.error('Token verification error:', err.message);
      return null;
    }
  }

  async refreshSession(refreshToken) {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async getUser(accessToken) {
    if (!this.enabled) {
      return null;
    }

    const { data: { user }, error } = await this.client.auth.getUser(accessToken);

    if (error) {
      return null;
    }

    return user;
  }

  async resetPassword(email) {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL || 'http://localhost:5000'}/reset-password`
    });

    if (error) {
      throw error;
    }

    return data;
  }

  async updatePassword(accessToken, newPassword) {
    if (!this.enabled) {
      throw new Error('Authentication service is not available');
    }

    const { data, error } = await this.client.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return data;
  }
}

module.exports = SupabaseAuthService;
