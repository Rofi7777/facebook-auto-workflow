class UserLearningManager {
  constructor() {
    this.currentInteractionId = null;
    this.enabled = true;
  }

  async trackInteraction(data) {
    if (!this.enabled || !window.authFetch) return null;

    try {
      const response = await authFetch('/api/learning/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureTab: data.featureTab || this.getCurrentTab(),
          actionType: data.actionType || 'generate',
          platform: data.platform || null,
          industry: data.industry || null,
          contentStyle: data.contentStyle || null,
          language: data.language || window.currentLang || 'zh-TW',
          promptSummary: data.promptSummary || null,
          responseLength: data.responseLength || null,
          metadata: data.metadata || {}
        })
      });

      const result = await response.json();
      if (result.success && result.interactionId) {
        this.currentInteractionId = result.interactionId;
        return result.interactionId;
      }
      return null;
    } catch (err) {
      console.warn('Failed to track interaction:', err.message);
      return null;
    }
  }

  async sendFeedback(feedbackType, interactionId = null, rating = null) {
    if (!this.enabled || !window.authFetch) return false;

    try {
      const response = await authFetch('/api/learning/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interactionId: interactionId || this.currentInteractionId,
          feedbackType: feedbackType,
          rating: rating
        })
      });

      const result = await response.json();
      return result.success;
    } catch (err) {
      console.warn('Failed to send feedback:', err.message);
      return false;
    }
  }

  async thumbsUp(interactionId = null) {
    return this.sendFeedback('thumbs_up', interactionId);
  }

  async thumbsDown(interactionId = null) {
    return this.sendFeedback('thumbs_down', interactionId);
  }

  async markCopied(interactionId = null) {
    return this.sendFeedback('copy', interactionId);
  }

  async markRegenerated(interactionId = null) {
    return this.sendFeedback('regenerate', interactionId);
  }

  async markEdited(interactionId = null) {
    return this.sendFeedback('edit', interactionId);
  }

  async markExported(interactionId = null) {
    return this.sendFeedback('export', interactionId);
  }

  async getPreferences() {
    if (!this.enabled || !window.authFetch) return null;

    try {
      const response = await authFetch('/api/learning/preferences');
      const result = await response.json();
      return result.success ? result.preferences : null;
    } catch (err) {
      console.warn('Failed to get preferences:', err.message);
      return null;
    }
  }

  async deleteAllData() {
    if (!window.authFetch) return false;

    try {
      const response = await authFetch('/api/learning/data', {
        method: 'DELETE'
      });
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.warn('Failed to delete learning data:', err.message);
      return false;
    }
  }

  getCurrentTab() {
    const activeBtn = document.querySelector('.tab-btn.active');
    if (activeBtn) {
      const pageNum = activeBtn.getAttribute('onclick')?.match(/showPage\((\d+)\)/)?.[1];
      const tabNames = {
        '1': 'image_generation',
        '2': 'ads_advisor',
        '3': 'course_editor',
        '4': 'bizprompt',
        '5': 'admin'
      };
      return tabNames[pageNum] || 'unknown';
    }
    return 'unknown';
  }

  createFeedbackButtons(interactionId = null) {
    const container = document.createElement('div');
    container.className = 'feedback-buttons';
    container.innerHTML = `
      <span class="feedback-label">${this.getTranslation('feedback_helpful')}</span>
      <button class="feedback-btn thumbs-up" title="${this.getTranslation('feedback_yes')}">
        <span class="icon">👍</span>
      </button>
      <button class="feedback-btn thumbs-down" title="${this.getTranslation('feedback_no')}">
        <span class="icon">👎</span>
      </button>
    `;

    const targetId = interactionId || this.currentInteractionId;

    container.querySelector('.thumbs-up').addEventListener('click', async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;
      btn.classList.add('selected');
      container.querySelector('.thumbs-down').classList.remove('selected');
      await this.thumbsUp(targetId);
      this.showFeedbackThanks(container);
    });

    container.querySelector('.thumbs-down').addEventListener('click', async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;
      btn.classList.add('selected');
      container.querySelector('.thumbs-up').classList.remove('selected');
      await this.thumbsDown(targetId);
      this.showFeedbackThanks(container);
    });

    return container;
  }

  showFeedbackThanks(container) {
    const label = container.querySelector('.feedback-label');
    if (label) {
      label.textContent = this.getTranslation('feedback_thanks');
      label.classList.add('thanks');
    }
  }

  getTranslation(key) {
    const translations = {
      'zh-TW': {
        'feedback_helpful': '這個回應有幫助嗎？',
        'feedback_yes': '有幫助',
        'feedback_no': '沒幫助',
        'feedback_thanks': '感謝您的回饋！'
      },
      'en': {
        'feedback_helpful': 'Was this helpful?',
        'feedback_yes': 'Yes',
        'feedback_no': 'No',
        'feedback_thanks': 'Thanks for your feedback!'
      },
      'vi': {
        'feedback_helpful': 'Điều này có hữu ích không?',
        'feedback_yes': 'Có',
        'feedback_no': 'Không',
        'feedback_thanks': 'Cảm ơn phản hồi của bạn!'
      }
    };

    const lang = window.currentLang || 'zh-TW';
    return translations[lang]?.[key] || translations['zh-TW'][key] || key;
  }
}

const userLearning = new UserLearningManager();
window.userLearning = userLearning;
