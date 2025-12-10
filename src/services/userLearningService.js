const { createClient } = require('@supabase/supabase-js');

class UserLearningService {
  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
      console.warn('⚠️ Supabase credentials not found. User learning will be disabled.');
      this.client = null;
      this.enabled = false;
      return;
    }

    this.client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
    this.enabled = true;
    console.log('🧠 User Learning Service initialized successfully');
  }

  isEnabled() {
    return this.enabled;
  }

  async trackInteraction(userId, data) {
    if (!this.enabled || !userId) return null;

    try {
      const { data: result, error } = await this.client
        .from('user_interactions')
        .insert({
          user_id: userId,
          feature_tab: data.featureTab || null,
          action_type: data.actionType || 'unknown',
          platform: data.platform || null,
          industry: data.industry || null,
          content_style: data.contentStyle || null,
          language_used: data.language || null,
          prompt_summary: data.promptSummary || null,
          response_length: data.responseLength || null,
          metadata: data.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking interaction:', error.message);
        return null;
      }

      return result;
    } catch (err) {
      console.error('Error in trackInteraction:', err.message);
      return null;
    }
  }

  async recordFeedback(userId, interactionId, feedbackType, rating = null) {
    if (!this.enabled || !userId) return null;

    try {
      const { data: result, error } = await this.client
        .from('user_feedback')
        .insert({
          user_id: userId,
          interaction_id: interactionId,
          feedback_type: feedbackType,
          rating: rating
        })
        .select()
        .single();

      if (error) {
        console.error('Error recording feedback:', error.message);
        return null;
      }

      await this.updatePreferencesFromFeedback(userId);

      return result;
    } catch (err) {
      console.error('Error in recordFeedback:', err.message);
      return null;
    }
  }

  async getUserPreferences(userId) {
    if (!this.enabled || !userId) {
      return this.getDefaultPreferences();
    }

    try {
      const { data, error } = await this.client
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return this.getDefaultPreferences();
      }

      return data;
    } catch (err) {
      console.error('Error getting user preferences:', err.message);
      return this.getDefaultPreferences();
    }
  }

  getDefaultPreferences() {
    return {
      preferred_platforms: {},
      preferred_industries: {},
      preferred_styles: {},
      language_preference: 'zh-TW',
      tone_preference: 'professional',
      interaction_count: 0
    };
  }

  async updatePreferencesFromFeedback(userId) {
    if (!this.enabled || !userId) return null;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: interactions, error: intError } = await this.client
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (intError || !interactions || interactions.length === 0) {
        return null;
      }

      const { data: feedbacks, error: fbError } = await this.client
        .from('user_feedback')
        .select('*, user_interactions!inner(*)')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString());

      const platformCounts = {};
      const industryCounts = {};
      const styleCounts = {};
      const languageCounts = {};
      let totalInteractions = interactions.length;

      interactions.forEach(int => {
        if (int.platform) {
          platformCounts[int.platform] = (platformCounts[int.platform] || 0) + 1;
        }
        if (int.industry) {
          industryCounts[int.industry] = (industryCounts[int.industry] || 0) + 1;
        }
        if (int.content_style) {
          styleCounts[int.content_style] = (styleCounts[int.content_style] || 0) + 1;
        }
        if (int.language_used) {
          languageCounts[int.language_used] = (languageCounts[int.language_used] || 0) + 1;
        }
      });

      if (feedbacks && feedbacks.length > 0) {
        feedbacks.forEach(fb => {
          const boostFactor = fb.feedback_type === 'thumbs_up' ? 2 : 
                             fb.feedback_type === 'thumbs_down' ? -1 : 0;
          
          const int = fb.user_interactions;
          if (int) {
            if (int.platform) {
              platformCounts[int.platform] = (platformCounts[int.platform] || 0) + boostFactor;
            }
            if (int.industry) {
              industryCounts[int.industry] = (industryCounts[int.industry] || 0) + boostFactor;
            }
            if (int.content_style) {
              styleCounts[int.content_style] = (styleCounts[int.content_style] || 0) + boostFactor;
            }
          }
        });
      }

      const toWeights = (counts) => {
        const total = Object.values(counts).reduce((a, b) => a + Math.max(0, b), 0);
        if (total === 0) return {};
        const weights = {};
        Object.entries(counts).forEach(([key, count]) => {
          weights[key] = Math.max(0, Math.round((count / total) * 100));
        });
        return weights;
      };

      const preferredLanguage = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'zh-TW';

      const { error: upsertError } = await this.client
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferred_platforms: toWeights(platformCounts),
          preferred_industries: toWeights(industryCounts),
          preferred_styles: toWeights(styleCounts),
          language_preference: preferredLanguage,
          interaction_count: totalInteractions,
          last_updated: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error upserting preferences:', upsertError.message);
        return null;
      }

      return true;
    } catch (err) {
      console.error('Error updating preferences:', err.message);
      return null;
    }
  }

  async getRecentInteractions(userId, limit = 5) {
    if (!this.enabled || !userId) return [];

    try {
      const { data, error } = await this.client
        .from('user_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error getting recent interactions:', error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in getRecentInteractions:', err.message);
      return [];
    }
  }

  buildPersonalizedContext(preferences, recentInteractions) {
    if (!preferences || preferences.interaction_count === 0) {
      return '';
    }

    let context = '\n【用戶個人化資訊】\n';

    if (Object.keys(preferences.preferred_platforms || {}).length > 0) {
      const topPlatforms = Object.entries(preferences.preferred_platforms)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([p, w]) => `${p}(${w}%)`)
        .join(', ');
      context += `- 常用平台: ${topPlatforms}\n`;
    }

    if (Object.keys(preferences.preferred_industries || {}).length > 0) {
      const topIndustries = Object.entries(preferences.preferred_industries)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([i, w]) => `${i}(${w}%)`)
        .join(', ');
      context += `- 偏好產業: ${topIndustries}\n`;
    }

    if (Object.keys(preferences.preferred_styles || {}).length > 0) {
      const topStyles = Object.entries(preferences.preferred_styles)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([s, w]) => `${s}(${w}%)`)
        .join(', ');
      context += `- 喜歡風格: ${topStyles}\n`;
    }

    if (preferences.language_preference) {
      const langNames = {
        'zh-TW': '繁體中文',
        'en': 'English',
        'vi': 'Tiếng Việt'
      };
      context += `- 語言偏好: ${langNames[preferences.language_preference] || preferences.language_preference}\n`;
    }

    context += `- 歷史互動次數: ${preferences.interaction_count || 0}\n`;

    if (recentInteractions && recentInteractions.length > 0) {
      context += '\n【近期使用摘要】\n';
      recentInteractions.slice(0, 3).forEach((int, i) => {
        const parts = [];
        if (int.feature_tab) parts.push(int.feature_tab);
        if (int.platform) parts.push(int.platform);
        if (int.industry) parts.push(int.industry);
        if (parts.length > 0) {
          context += `${i + 1}. ${parts.join(' - ')}\n`;
        }
      });
    }

    context += '\n請根據以上用戶偏好，調整回應風格使其更符合用戶習慣。\n';

    return context;
  }

  async getPersonalizedPromptContext(userId) {
    if (!this.enabled || !userId) {
      return '';
    }

    try {
      const [preferences, recentInteractions] = await Promise.all([
        this.getUserPreferences(userId),
        this.getRecentInteractions(userId, 5)
      ]);

      return this.buildPersonalizedContext(preferences, recentInteractions);
    } catch (err) {
      console.error('Error getting personalized context:', err.message);
      return '';
    }
  }

  async deleteUserData(userId) {
    if (!this.enabled || !userId) return false;

    try {
      await this.client.from('user_feedback').delete().eq('user_id', userId);
      await this.client.from('user_interactions').delete().eq('user_id', userId);
      await this.client.from('user_preferences').delete().eq('user_id', userId);
      
      console.log(`Deleted all learning data for user: ${userId}`);
      return true;
    } catch (err) {
      console.error('Error deleting user data:', err.message);
      return false;
    }
  }
}

module.exports = new UserLearningService();
