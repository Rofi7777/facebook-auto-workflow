// Googoogaga Facebook Auto Workflow - Facebook Routes

import { DEFAULT_BRAND, WorkflowContract, LanguageCode } from '../schemas/contracts.js';

/**
 * Vietnamese fallback function for Googoogaga baby toy marketing
 */
export function fallbackVI(productName: string): string {
  return `Khám phá thế giới diệu kỳ cùng bé mỗi ngày – ${productName} nhỏ gọn, an toàn và đáng yêu! 

🧸 Sản phẩm được thiết kế đặc biệt cho sự phát triển của bé
🛡️ An toàn tuyệt đối với chất liệu không độc hại  
🎨 Kích thích trí tưởng tượng và sự sáng tạo
📚 Hỗ trợ học tập qua vui chơi

${DEFAULT_BRAND.slogan}

#Googoogaga #ĐồChơiThôngMinh #AnToànChoBé #KhámPháThếGiới`;
}

/**
 * Traditional Chinese (Taiwan) fallback function for Googoogaga baby toy marketing  
 */
export function fallbackTW(productName: string): string {
  return `陪寶貝一起探索奇幻世界 – ${productName} 小巧、安全又可愛！

🧸 專為寶寶發展設計的優質玩具
🛡️ 使用無毒安全材質，父母最安心
🎨 啟發想像力與創造力的最佳夥伴  
📚 寓教於樂，快樂學習每一天

與寶貝一同探索每日奇蹟 ✨

#Googoogaga #益智玩具 #安全第一 #寶寶成長`;
}

/**
 * Generate bilingual Facebook post content
 */
export function generateBilingualPost(
  productName: string, 
  campaign: string, 
  template: string
): { vi: string; zhTW: string; combined: string } {
  const viContent = fallbackVI(productName);
  const zhTWContent = fallbackTW(productName);
  
  const combined = `${viContent}

---

${zhTWContent}`;

  return {
    vi: viContent,
    zhTW: zhTWContent,
    combined: combined
  };
}

/**
 * Get campaign-specific messaging
 */
export function getCampaignMessage(campaign: string, language: LanguageCode): string {
  const messages = {
    'new-toy': {
      vi: '🎉 SẢN PHẨM MỚI RA MẮT!',
      'zh-TW': '🎉 全新玩具隆重登場！'
    },
    'educational': {
      vi: '📚 HỌC TẬP QUA VUI CHƠI',
      'zh-TW': '📚 寓教於樂新體驗'
    },
    'safety-first': {
      vi: '🛡️ AN TOÀN TUYỆT ĐỐI',
      'zh-TW': '🛡️ 安全第一保證'
    },
    'developmental': {
      vi: '🌱 HỖ TRỢ PHÁT TRIỂN BÉ',
      'zh-TW': '🌱 促進寶寶成長發育'
    },
    'seasonal': {
      vi: '🎪 ĐẶC BIỆT MÙA LỄ',
      'zh-TW': '🎪 季節限定特惠'
    }
  };
  
  return messages[campaign]?.[language] || messages['new-toy'][language];
}

/**
 * Get template-specific styling
 */
export function getTemplateStyle(template: string): {
  bgColor: string;
  accentColor: string;
  mood: string;
} {
  const styles = {
    'gentle': {
      bgColor: 'linear-gradient(135deg, #E6F3FF 0%, #FFF0F5 100%)', // 淡藍到淡粉
      accentColor: '#87CEEB',
      mood: 'soft and nurturing'
    },
    'playful': {
      bgColor: 'linear-gradient(135deg, #FFE4E6 0%, #FFF9E6 100%)', // 淡粉到淡黃
      accentColor: '#FFB6C1', 
      mood: 'fun and energetic'
    },
    'educational': {
      bgColor: 'linear-gradient(135deg, #F0F8FF 0%, #E6F7FF 100%)', // 淡天藍色調
      accentColor: '#4A90E2',
      mood: 'learning and discovery'
    },
    'trustworthy': {
      bgColor: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)', // 信賴的藍灰色
      accentColor: '#6B73FF',
      mood: 'reliable and safe'
    }
  };
  
  return styles[template] || styles['gentle'];
}