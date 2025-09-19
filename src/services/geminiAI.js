const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');

// DON'T DELETE THIS COMMENT - Following javascript_gemini integration blueprint
// Using Gemini AI for multi-platform content generation and image analysis

class GeminiAIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
  }

  // 分析產品圖片並識別產品特性
  async analyzeProductImage(imagePath) {
    try {
      const imageBytes = fs.readFileSync(imagePath);
      
      // Detect MIME type from file extension
      const ext = path.extname(imagePath).toLowerCase();
      let mimeType = "image/jpeg";
      if (ext === '.png') mimeType = "image/png";
      if (ext === '.gif') mimeType = "image/gif";
      if (ext === '.webp') mimeType = "image/webp";
      
      const contents = [
        {
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: mimeType,
          },
        },
        `請詳細分析這個嬰幼兒玩具產品圖片，提供以下資訊：
        1. 產品類型和主要特徵
        2. 適合年齡層
        3. 主要功能和教育價值
        4. 安全特性
        5. 材質和顏色
        6. 使用場景建議
        請用繁體中文回答，格式為JSON：
        {
          "productType": "產品類型",
          "ageRange": "適合年齡",
          "features": ["特徵1", "特徵2"],
          "educationalValue": "教育價值",
          "safetyFeatures": ["安全特性1"],
          "materials": "材質描述",
          "colors": ["顏色1", "顏色2"],
          "usageScenarios": ["使用場景1", "使用場景2"]
        }`
      ];

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const response = await model.generateContent(contents);
      
      const analysisText = response.response.text();
      // 嘗試解析 JSON 回應
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parsing failed, returning raw analysis');
      }
      
      return { rawAnalysis: analysisText };
    } catch (error) {
      throw new Error(`Product image analysis failed: ${error.message}`);
    }
  }

  // 識別用戶痛點和使用場景
  async identifyPainPointsAndScenarios(productAnalysis) {
    try {
      const prompt = `
      基於以下產品分析，請識別終端消費者（嬰幼兒家長）可能遇到的痛點，並提出相應的使用場景：

      產品分析：${JSON.stringify(productAnalysis, null, 2)}

      請分析並回傳JSON格式：
      {
        "painPoints": [
          {
            "category": "痛點類別",
            "description": "痛點描述",
            "targetAudience": "目標對象",
            "severity": "高|中|低"
          }
        ],
        "usageScenarios": [
          {
            "scenario": "場景名稱",
            "context": "使用情境",
            "benefits": "解決的問題",
            "emotions": "引發的情感"
          }
        ],
        "marketingAngles": ["行銷角度1", "行銷角度2"]
      }`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const response = await model.generateContent(prompt);
      
      const analysisText = response.response.text();
      try {
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parsing failed for pain points analysis');
      }
      
      return { rawAnalysis: analysisText };
    } catch (error) {
      throw new Error(`Pain points analysis failed: ${error.message}`);
    }
  }

  // 為不同平台生成專屬內容
  async generatePlatformContent(productInfo, painPointsAnalysis, platform, language = 'zh-TW') {
    try {
      const platformSpecs = {
        shopee: {
          style: '購物導向，強調價格優勢、產品特色、買家評價，使用促銷語言',
          format: '標題 + 特色列表 + 價格訊息 + 購買誘因',
          maxLength: 1000,
          tone: '直接、說服性強'
        },
        tiktok: {
          style: '年輕活潑，使用流行詞彙、emoji，適合短影片配文',
          format: 'Hook開頭 + 產品介紹 + 互動引導 + 相關hashtag',
          maxLength: 150,
          tone: '輕鬆、趣味、互動性強'
        },
        instagram: {
          style: '視覺美感，生活化場景，重視hashtag策略',
          format: '情境描述 + 產品特色 + 生活連結 + hashtag群組',
          maxLength: 500,
          tone: '溫馨、美好、有質感'
        },
        facebook: {
          style: '家庭友善，詳細說明，重視親子互動和教育價值',
          format: '故事開場 + 產品介紹 + 家長關切點 + 社群互動',
          maxLength: 800,
          tone: '親切、可信賴、家庭導向'
        }
      };

      const spec = platformSpecs[platform] || platformSpecs.instagram;
      
      const prompt = `
      請為${platform}平台創作嬰幼兒玩具的行銷內容。

      產品資訊：${JSON.stringify(productInfo, null, 2)}
      痛點分析：${JSON.stringify(painPointsAnalysis, null, 2)}

      平台規格：
      - 風格：${spec.style}
      - 格式：${spec.format}
      - 最大長度：${spec.maxLength}字
      - 語調：${spec.tone}

      語言：${language === 'vi' ? '越南語' : '繁體中文'}

      請產生適合的內容，包含：
      1. 主要文案
      2. 建議的hashtag
      3. 呼籲行動(CTA)
      4. 情感連結點

      回傳JSON格式：
      {
        "mainContent": "主要文案內容",
        "hashtags": ["#hashtag1", "#hashtag2"],
        "cta": "呼籲行動文字",
        "emotionalConnect": "情感連結描述",
        "imagePrompt": "配圖建議描述"
      }`;

      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const response = await model.generateContent(prompt);
      
      const contentText = response.response.text();
      try {
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parsing failed for platform content');
      }
      
      return { rawContent: contentText };
    } catch (error) {
      throw new Error(`Platform content generation failed: ${error.message}`);
    }
  }

  // 生成行銷圖片 (目前使用文字描述生成，實際圖片生成需要其他服務)
  async generateMarketingImage(prompt, imagePath) {
    try {
      // Note: Current Gemini models don't support direct image generation
      // This generates a detailed image description that can be used with image generation services
      const model = this.ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const enhancedPrompt = `請為以下產品創建一個詳細的圖片設計描述，可以用於圖像生成AI工具：
      
${prompt}

請提供包含以下元素的詳細描述：
1. 構圖和布局
2. 色彩搭配
3. 光線和氛圍
4. 具體物件和場景
5. 文字元素建議
6. 整體風格定位

回傳純文字描述，詳細且具體。`;
      
      const response = await model.generateContent(enhancedPrompt);
      const imageDescription = response.response.text();
      
      // 暫時創建一個包含描述的文本文件，作為圖片生成的指導
      await fs.ensureDir(path.dirname(imagePath));
      const descriptionPath = imagePath.replace('.png', '_description.txt');
      fs.writeFileSync(descriptionPath, imageDescription);
      
      console.log(`Image description saved as ${descriptionPath}`);
      console.log('Image description:', imageDescription);
      
      // 返回描述文件路徑，表示功能已執行但需要外部圖像生成服務
      return descriptionPath;
    } catch (error) {
      throw new Error(`Image description generation failed: ${error.message}`);
    }
  }

  // 生成平台專屬的圖片設計提示
  generateImagePrompt(platform, productInfo, contentData) {
    const basePrompt = `創建一個吸引人的嬰幼兒玩具行銷圖片，產品：${productInfo.productType || '嬰幼兒玩具'}`;
    
    const platformStyles = {
      shopee: `${basePrompt}，購物平台風格，清潔的白色背景，產品居中顯示，添加價格標籤和促銷貼紙，明亮的照明，專業的產品攝影風格`,
      tiktok: `${basePrompt}，適合短影片的直式構圖，活潑多彩的背景，年輕父母和嬰幼兒使用場景，動感的視覺效果，趣味性強`,
      instagram: `${basePrompt}，方形構圖，美好的生活場景，溫馨的家庭氛圍，自然光線，Instagram風格的濾鏡效果，質感優雅`,
      facebook: `${basePrompt}，家庭友善的16:9橫式構圖，溫暖的家庭環境，父母與孩子互動場景，柔和的燈光，強調安全和教育價值`
    };

    const enhancedPrompt = platformStyles[platform] || platformStyles.instagram;
    
    // 添加產品特定的描述
    if (productInfo.colors && productInfo.colors.length > 0) {
      return `${enhancedPrompt}，主要顏色：${productInfo.colors.join('、')}`;
    }
    
    return enhancedPrompt;
  }
}

module.exports = GeminiAIService;