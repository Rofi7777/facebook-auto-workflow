// Googoogaga Facebook Auto Workflow - Prompt Templates

import { CampaignType, TemplateStyle } from '../schemas/contracts.js';

/**
 * Design brief templates for Googoogaga baby toys
 */
export const DESIGN_BRIEFS = {
  gentle: {
    style: "Soft, pastel colors with rounded corners and gentle shadows",
    bg: "Gradient from soft sky blue (#E6F3FF) to powder pink (#FFF0F5) with subtle star elements",
    layout: "Hero image featuring toy close-up, minimal text overlay, bottom space for brand logo",
    badges: ["An toàn", "安全", "Organic", "Non-toxic"]
  },
  
  playful: {
    style: "Bright, cheerful colors with dynamic shapes and playful elements", 
    bg: "Colorful rainbow gradient with floating toy elements and sparkles",
    layout: "Dynamic composition with toy in action, animated elements, bold typography",
    badges: ["Vui học", "快樂學習", "Interactive", "Fun Learning"]
  },
  
  educational: {
    style: "Clean, modern design emphasizing learning benefits",
    bg: "Light blue gradient with geometric learning elements (ABC, 123, shapes)",
    layout: "Split layout showing toy and learning outcomes, bullet points for benefits",
    badges: ["Giáo dục", "教育啟發", "STEM", "Developmental"]
  },
  
  trustworthy: {
    style: "Professional, clean design with emphasis on safety and quality",
    bg: "Subtle white-to-blue gradient with quality certification badges",
    layout: "Product-focused with safety certifications, parent testimonials area",
    badges: ["Chứng nhận", "認證", "CE Certified", "Parent Approved"]
  }
};

/**
 * Campaign-specific prompt templates
 */
export const CAMPAIGN_PROMPTS = {
  'new-toy': {
    vi: `Tạo nội dung Facebook cho đồ chơi thông minh mới của Googoogaga:
    - Nhấn mạnh tính mới lạ và độc đáo
    - Kích thích sự tò mò của cha mẹ  
    - Highlight các tính năng phát triển trí tuệ`,
    
    'zh-TW': `為 Googoogaga 新玩具創作 Facebook 內容：
    - 強調產品創新特色
    - 吸引父母關注
    - 突出智力發展功能`
  },
  
  'educational': {
    vi: `Tạo nội dung giáo dục cho đồ chơi Googoogaga:
    - Giải thích lợi ích học tập
    - Kết hợp vui chơi và giáo dục
    - Thúc đẩy sự phát triển toàn diện`,
    
    'zh-TW': `為 Googoogaga 教育玩具創作內容：
    - 說明學習效益
    - 結合遊戲與教育
    - 促進全面發展`
  },
  
  'safety-first': {
    vi: `Tạo nội dung an toàn cho đồ chơi Googoogaga:
    - Nhấn mạnh chất liệu an toàn
    - Chứng nhận chất lượng quốc tế
    - Yên tâm cho cha mẹ`,
    
    'zh-TW': `為 Googoogaga 安全玩具創作內容：
    - 強調安全材質
    - 國際品質認證
    - 讓父母安心`
  },
  
  'developmental': {
    vi: `Tạo nội dung phát triển cho đồ chơi Googoogaga:
    - Hỗ trợ các giai đoạn phát triển
    - Kích thích vận động và tư duy
    - Phù hợp từng độ tuổi`,
    
    'zh-TW': `為 Googoogaga 發展玩具創作內容：
    - 支援各發展階段
    - 刺激運動與思維
    - 適合各年齡層`
  },
  
  'seasonal': {
    vi: `Tạo nội dung mùa lễ cho đồ chơi Googoogaga:
    - Kết hợp tinh thần lễ hội
    - Ý tưởng quà tặng ý nghĩa
    - Tạo kỷ niệm gia đình`,
    
    'zh-TW': `為 Googoogaga 季節玩具創作內容：
    - 結合節慶精神
    - 有意義的禮物選擇
    - 創造家庭回憶`
  }
};

/**
 * Replace POPMART/Keychain examples with baby toy descriptions
 */
export const TOY_DESCRIPTIONS = [
  // Vietnamese descriptions
  "đồ chơi thông minh phát triển trí tuệ",
  "đồ chơi giáo dục an toàn cho bé", 
  "đồ chơi kích thích sáng tạo",
  "đồ chơi phát triển vận động tinh",
  "đồ chơi học tập qua vui chơi",
  
  // Traditional Chinese descriptions  
  "益智玩具促進腦部發育",
  "安全教育玩具",
  "啟發創意思維玩具", 
  "精細動作發展玩具",
  "寓教於樂學習玩具"
];

/**
 * Generate contextual prompt based on product and campaign
 */
export function generatePrompt(
  productName: string,
  campaign: CampaignType, 
  template: TemplateStyle,
  language: 'vi' | 'zh-TW' = 'vi'
): string {
  const campaignPrompt = CAMPAIGN_PROMPTS[campaign][language];
  const designBrief = DESIGN_BRIEFS[template];
  
  return `${campaignPrompt}

Sản phẩm: ${productName}
Phong cách thiết kế: ${designBrief.style}
Bố cục: ${designBrief.layout}
Màu nền: ${designBrief.bg}
Badges: ${designBrief.badges.join(', ')}

Thương hiệu: Googoogaga - "Cùng bé khám phá thế giới diệu kỳ mỗi ngày"`;
}