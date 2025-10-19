// Multi-platform content generation schemas

const PLATFORM_CONFIGS = {
  shopee: {
    name: 'Shopee',
    displayName: 'Shopee 蝦皮購物',
    description: '購物導向內容，強調產品特色和使用情境',
    contentSpecs: {
      maxLength: 1000,
      style: 'persuasive',
      tone: 'direct',
      format: 'product-focused'
    },
    imageSpecs: {
      aspectRatio: '1:1',
      style: 'product-photography',
      background: 'clean-white',
      elements: ['product-detail', 'quality-showcase']
    }
  },
  tiktok: {
    name: 'TikTok',
    displayName: 'TikTok 抖音',
    description: '短影片風格內容，年輕活潑語調',
    contentSpecs: {
      maxLength: 150,
      style: 'trendy',
      tone: 'playful',
      format: 'hook-driven'
    },
    imageSpecs: {
      aspectRatio: '9:16',
      style: 'lifestyle-scene',
      background: 'colorful',
      elements: ['lifestyle-context', 'dynamic-effects']
    }
  },
  instagram: {
    name: 'Instagram',
    displayName: 'Instagram',
    description: '視覺美感內容，重視質感和生活場景',
    contentSpecs: {
      maxLength: 500,
      style: 'aesthetic',
      tone: 'warm',
      format: 'story-driven'
    },
    imageSpecs: {
      aspectRatio: '1:1',
      style: 'lifestyle-aesthetic',
      background: 'natural',
      elements: ['lifestyle-context', 'quality-filter']
    }
  },
  facebook: {
    name: 'Facebook',
    displayName: 'Facebook',
    description: '綜合性社群內容，適合家庭分享',
    contentSpecs: {
      maxLength: 800,
      style: 'comprehensive',
      tone: 'friendly',
      format: 'story-driven'
    },
    imageSpecs: {
      aspectRatio: '16:9',
      style: 'family-friendly',
      background: 'warm',
      elements: ['family-context', 'educational-value']
    }
  }
};

const CONTENT_TEMPLATES = {
  painPointDriven: {
    name: '痛點驅動',
    structure: ['痛點識別', '產品解決方案', '使用場景', '呼籲行動'],
    emotional: 'problem-solving'
  },
  scenarioBased: {
    name: '場景導向',
    structure: ['使用情境', '產品優勢', '效果展示', '購買引導'],
    emotional: 'aspiration'
  },
  featureFocused: {
    name: '功能特色',
    structure: ['產品特色', '教育價值', '安全保證', '信賴建立'],
    emotional: 'trust'
  }
};

const BABY_TOY_CATEGORIES = {
  cognitive: {
    name: '認知發展',
    painPoints: ['學習能力擔憂', '智力發展焦慮', '教育資源不足'],
    scenarios: ['在家學習', '親子互動', '獨立探索'],
    benefits: ['啟發思維', '培養專注', '增強記憶']
  },
  motor: {
    name: '運動發展',
    painPoints: ['活動量不足', '協調能力弱', '體能發展慢'],
    scenarios: ['室內運動', '戶外活動', '精細動作訓練'],
    benefits: ['強化肌肉', '提升協調', '促進發育']
  },
  social: {
    name: '社交情感',
    painPoints: ['情感表達困難', '社交技能缺乏', '親子關係疏離'],
    scenarios: ['家庭聚會', '朋友互動', '情感交流'],
    benefits: ['建立關係', '表達情感', '培養同理心']
  },
  creative: {
    name: '創意想像',
    painPoints: ['創造力不足', '想像力受限', '表達能力弱'],
    scenarios: ['藝術創作', '角色扮演', '故事創編'],
    benefits: ['激發創意', '豐富想像', '自由表達']
  }
};

module.exports = {
  PLATFORM_CONFIGS,
  CONTENT_TEMPLATES,
  BABY_TOY_CATEGORIES
};