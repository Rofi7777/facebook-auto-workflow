// Googoogaga Facebook Auto Workflow - Brand Contracts Schema

export interface BrandContract {
  brand: string;
  slogan: string;
  logoPath: string;
  targetAudience: string;
  language: string[];
}

export interface WorkflowContract {
  id: string;
  brand: string;
  productName: string;
  campaign: CampaignType;
  template: TemplateStyle;
  language: LanguageCode;
  createdAt: string;
  status: WorkflowStatus;
}

export type CampaignType = 
  | 'new-toy'           // 新玩具上市
  | 'educational'       // 教育學習
  | 'safety-first'      // 安全第一
  | 'developmental'     // 發展成長
  | 'seasonal';         // 季節限定

export type TemplateStyle = 
  | 'gentle'           // 溫和柔軟
  | 'playful'          // 活潑可愛
  | 'educational'      // 教育啟發
  | 'trustworthy';     // 值得信賴

export type LanguageCode = 'vi' | 'zh-TW' | 'bilingual';
export type WorkflowStatus = 'created' | 'processing' | 'completed' | 'failed';

// Default brand configuration for Googoogaga
export const DEFAULT_BRAND: BrandContract = {
  brand: "Googoogaga",
  slogan: "Cùng bé khám phá thế giới diệu kỳ mỗi ngày",
  logoPath: "./public/brand/googoogaga-logo.png",
  targetAudience: "嬰幼兒及父母 (Babies, toddlers and parents)",
  language: ["vi", "zh-TW"]
};

// Product categories for baby toys
export const TOY_CATEGORIES = [
  'đồ chơi thông minh',      // Smart toys
  'đồ chơi giáo dục',        // Educational toys  
  'đồ chơi phát triển',      // Developmental toys
  'đồ chơi an toàn',         // Safe toys
  '益智玩具',                 // Educational toys (Chinese)
  '安全玩具',                 // Safe toys (Chinese)
  '發展玩具'                  // Developmental toys (Chinese)
] as const;