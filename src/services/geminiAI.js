const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');

// DON'T DELETE THIS COMMENT - Following javascript_gemini integration blueprint
// Using Gemini AI for multi-platform content generation and image analysis

class GeminiAIService {
  constructor() {
    // Use the new API key to avoid the corrupted one
    const apiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
    
    // Validate API key format
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY_NEW environment variable is required');
    }
    
    console.log('🔑 Using API Key:', apiKey.startsWith('AIzaSy') ? 'VALID FORMAT' : 'INVALID FORMAT');
    console.log('📊 API Key length:', apiKey.length);
    
    if (!apiKey.startsWith('AIzaSy')) {
      console.error('⚠️ API KEY FORMAT ERROR - Expected format: AIzaSy...');
    } else {
      console.log('✅ API Key format is correct!');
    }
    
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    console.log('✅ GeminiAI service initialized successfully');
  }

  // 分析產品圖片並識別產品特性
  async analyzeProductImage(imagePath) {
    try {
      const imageBytes = await fs.readFile(imagePath);
      
      // Detect MIME type from file extension
      const ext = path.extname(imagePath).toLowerCase();
      let mimeType = "image/jpeg";
      if (ext === '.png') mimeType = "image/png";
      if (ext === '.gif') mimeType = "image/gif";
      if (ext === '.webp') mimeType = "image/webp";
      
      const contents = [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: imageBytes.toString("base64"),
                mimeType: mimeType,
              },
            },
            {
              text: `請詳細分析這個嬰幼兒玩具產品圖片，提供以下資訊：
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
            }
          ]
        }
      ];

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: contents
      });
      
      // 安全檢查回應格式
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('Invalid AI response format');
      }
      
      // 合併所有文字部分
      const analysisText = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
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

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      // 安全檢查回應格式
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('Invalid AI response format');
      }
      
      const analysisText = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
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

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash", 
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      // 安全檢查回應格式
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('Invalid AI response format');
      }
      
      const contentText = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      try {
        // Try to parse if it looks like JSON
        const jsonMatch = contentText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return parsed;
        }
      } catch (parseError) {
        console.log('JSON parsing failed for platform content, using structured fallback');
      }
      
      // If JSON parsing fails, create structured content from raw text
      const lines = contentText.split('\n').filter(line => line.trim());
      const structured = {
        mainContent: "",
        hashtags: [],
        cta: "",
        emotionalConnect: "",
        imagePrompt: ""
      };
      
      // Extract content sections
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('#') && trimmed.includes('hashtags')) {
          // Extract hashtags
          const hashtagMatch = trimmed.match(/#\w+/g);
          if (hashtagMatch) {
            structured.hashtags = hashtagMatch;
          }
        } else if (trimmed.toLowerCase().includes('cta') || trimmed.includes('行動呼籲')) {
          structured.cta = trimmed.replace(/^.*?[:：]/, '').trim();
        } else if (trimmed.includes('情感連結') || trimmed.includes('emotional')) {
          structured.emotionalConnect = trimmed.replace(/^.*?[:：]/, '').trim();
        } else if (!structured.mainContent && trimmed.length > 20) {
          structured.mainContent = trimmed;
        }
      });
      
      // If no structured content found, use the raw text as main content
      if (!structured.mainContent) {
        structured.mainContent = contentText.trim();
      }
      
      return structured;
    } catch (error) {
      throw new Error(`Platform content generation failed: ${error.message}`);
    }
  }

  // 根據場景類型生成創造性場景詳情
  generateScenarioDetails(scenarioType) {
    const scenarioMap = {
      '親子互動': {
        setting: 'Cozy family living room or nursery with soft lighting, comfortable seating, books and toys visible',
        characters: 'Loving parent (mother or father, varying ethnicities) actively playing with a happy toddler (12-24 months old), genuine smiles and eye contact, natural interaction',
        background: 'Warm home environment with family photos, soft pillows, children books on shelves, educational posters',
        specificRequirements: '- Focus on bonding and connection between parent and child\n- Show active engagement and interaction\n- Warm, nurturing atmosphere',
        visualStyle: 'heartwarming family moments, emotional connection emphasis'
      },
      '小孩單人使用': {
        setting: 'Child-safe play area, colorful play mat, age-appropriate surrounding toys',
        characters: 'Independent toddler (18-30 months) exploring and playing alone, focused and curious expression, natural child behavior',
        background: 'Bright, safe play environment with soft toys, building blocks, colorful activity mats, safety gates visible',
        specificRequirements: '- Emphasize independent play and learning\n- Show child development and exploration\n- Safe, child-proofed environment',
        visualStyle: 'child development focus, exploration and discovery theme'
      },
      '外出旅遊': {
        setting: 'Outdoor park, beach, or family-friendly travel destination with natural scenery',
        characters: 'Family with toddler in portable travel scenario, child in stroller or being carried, outdoor adventure mood',
        background: 'Beautiful natural landscape, travel-friendly setting like parks, beaches, family picnic areas, travel gear visible',
        specificRequirements: '- Portable and travel-friendly product usage\n- Outdoor adventure theme\n- Family bonding during travel',
        visualStyle: 'adventure and exploration theme, natural outdoor lighting'
      },
      '居家遊戲': {
        setting: 'Well-organized playroom or family room with toys and learning materials',
        characters: 'Child playing at home with family nearby, comfortable casual clothes, relaxed home atmosphere',
        background: 'Home interior with toy storage, comfortable furniture, natural window lighting, home comfort elements',
        specificRequirements: '- Comfortable home environment\n- Daily play routine atmosphere\n- Organized, child-friendly space',
        visualStyle: 'home comfort theme, daily life naturalism'
      },
      '其他': {
        setting: 'Creative and unique setting that varies each time - could be imaginative themed room, artistic space, or innovative play environment',
        characters: 'Diverse family scenarios with varying ages, ethnicities, and family structures, creative interaction styles',
        background: 'Artistic and creative backgrounds that change each generation - themed rooms, colorful artistic spaces, innovative educational environments',
        specificRequirements: '- Be highly creative and unique each time\n- Surprise elements and innovative scenarios\n- Varied and diverse family representations',
        visualStyle: 'highly creative and artistic, unique visual approach each time'
      }
    };
    
    return scenarioMap[scenarioType] || scenarioMap['親子互動'];
  }

  // 增強版 Nano Banana 圖片生成 (支援真實圖片生成和下載，使用用戶上傳的產品圖片作為參考)
  async generateMarketingImage(prompt, imagePath, productImagePath = null, scenarioType = '親子互動') {
    try {
      console.log('🎨 Starting Nano Banana image generation process...');
      
      // 準備文字提示詞（根據是否有產品圖片參考調整）
      let enhancedPrompt;
      let contentParts = [];
      
      if (productImagePath) {
        // 如果有產品圖片，讀取並轉換為 base64
        const productImageBuffer = await fs.readFile(productImagePath);
        const productImageBase64 = productImageBuffer.toString('base64');
        
        // 判斷圖片類型
        const ext = path.extname(productImagePath).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === ".png") {
          mimeType = "image/png";
        } else if (ext === ".webp") {
          mimeType = "image/webp";
        } else if (ext === ".gif") {
          mimeType = "image/gif";
        }

        // 根據場景類型生成創造性的場景描述
        const scenarioDetails = this.generateScenarioDetails(scenarioType);
        
        enhancedPrompt = `Create a professional marketing image using the EXACT SAME toy product shown in the reference image.

Marketing Context: ${prompt}
Usage Scenario: ${scenarioType}

CRITICAL REQUIREMENTS:
- Use the EXACT same toy product from the reference image - same colors, same shape, same design details
- Create a ${scenarioType} scenario around this specific product
${scenarioDetails.specificRequirements}
- Bright, safe, educational visual elements  
- Soft pastel color palette (sky blue to pink gradient)
- High-quality product photography style
- Googoogaga brand aesthetic (safe, nurturing, developmental)
- Composition suitable for social media marketing
- Professional commercial photography lighting

SCENARIO SETTING:
${scenarioDetails.setting}

CHARACTERS & INTERACTION:
${scenarioDetails.characters}

BACKGROUND & ENVIRONMENT:
${scenarioDetails.background}

IMPORTANT: The generated image MUST feature the identical toy product shown in the reference image. Do not create a different or similar product - use the exact same one.

Style: Professional product photography, warm family moments, high-quality visual appeal, commercially polished, ${scenarioDetails.visualStyle}`;

        // 準備多模態內容：產品圖片 + 文字提示
        contentParts = [
          { text: enhancedPrompt },
          { 
            inlineData: {
              mimeType: mimeType,
              data: productImageBase64
            }
          }
        ];
      } else {
        // 沒有產品圖片時的一般提示詞
        const scenarioDetails = this.generateScenarioDetails(scenarioType);
        
        enhancedPrompt = `Create a professional marketing image for a baby toy product.

Product: ${prompt}
Usage Scenario: ${scenarioType}

Requirements:
- Create a ${scenarioType} scenario around this product
${scenarioDetails.specificRequirements}
- Bright, safe, educational visual elements  
- Soft pastel color palette (sky blue to pink gradient)
- High-quality product photography style
- Googoogaga brand aesthetic (safe, nurturing, developmental)
- Composition suitable for social media marketing
- Professional commercial photography lighting
- Clear focus on the toy product

SCENARIO SETTING:
${scenarioDetails.setting}

CHARACTERS & INTERACTION:
${scenarioDetails.characters}

BACKGROUND & ENVIRONMENT:
${scenarioDetails.background}

Style: Professional product photography, warm family moments, high-quality visual appeal, commercially polished, ${scenarioDetails.visualStyle}`;

        contentParts = [{ text: enhancedPrompt }];
      }

      // 使用正確的圖片生成模型
      try {
        console.log('🎨 Attempting real image generation with gemini-2.5-flash-image-preview...');
        
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: [{ 
            role: 'user', 
            parts: contentParts 
          }],
          generationConfig: {
            responseMimeType: 'image/png',
            maxOutputTokens: 2048
          }
        });
        
        // 檢查是否有圖片數據返回
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
              const imageData = part.inlineData.data;
              const buffer = Buffer.from(imageData, "base64");
              
              // 確保目錄存在並保存圖片
              await fs.ensureDir(path.dirname(imagePath));
              await fs.writeFile(imagePath, buffer);
              
              console.log(`✅ Real Nano Banana image generated: ${imagePath} (${buffer.length} bytes)`);
              return { 
                type: 'image', 
                path: imagePath, 
                size: buffer.length,
                downloadUrl: `/api/download-image?path=${encodeURIComponent(imagePath)}`,
                isRealImage: true
              };
            }
          }
        }
        
        console.log('⚠️ Image generation model returned no image data');
      } catch (imageError) {
        console.log(`⚠️ Image generation failed: ${imageError.message}`);
      }
      
      // 如果所有圖片生成方法都失敗，創建詳細的設計規格文件
      console.log('📋 Creating detailed design specification for external generation...');
      const designSpec = await this.createDetailedDesignSpec(prompt, imagePath);
      return designSpec;
      
    } catch (error) {
      throw new Error(`Nano Banana image generation failed: ${error.message}`);
    }
  }

  // 創建詳細設計規格文件（當無法直接生成圖片時）
  async createDetailedDesignSpec(prompt, imagePath) {
    try {
      const specPrompt = `Create a comprehensive design specification for a baby toy marketing image:

Product: ${prompt}

Please provide detailed specifications including:
1. Exact composition and layout (camera angle, framing, focal points)
2. Precise color palette with hex codes for Googoogaga brand
3. Lighting setup (natural/artificial, direction, intensity)
4. Object placement and proportions
5. Background and environment details
6. Human subjects (age, expressions, clothing, poses)
7. Typography and text overlay suggestions
8. Brand elements integration (logo placement, slogan)
9. Technical specs (resolution: 1024x1024, format: PNG)
10. Style references (realistic photography vs illustration)

Make this specification detailed enough for any designer or AI tool to recreate the exact vision.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [{ role: 'user', parts: [{ text: specPrompt }] }]
      });
      
      const designSpec = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      
      // 保存設計規格文件
      await fs.ensureDir(path.dirname(imagePath));
      const specPath = imagePath.replace('.png', '_design_spec.md');
      
      const fullSpec = `# Googoogaga Baby Toy Marketing Image Specification
**Generated:** ${new Date().toISOString()}  
**Original Request:** ${prompt}

## Executive Summary
This specification provides detailed instructions for creating a professional marketing image for Googoogaga baby toy products. The image should convey safety, education, and family warmth while showcasing the product effectively.

## Detailed Design Specification
${designSpec}

## Googoogaga Brand Guidelines
- **Primary Colors:** Soft pastels with sky blue to pink gradient
- **Typography:** Clean, modern, child-friendly sans-serif fonts
- **Tone:** Safe, educational, nurturing, developmental
- **Target Audience:** Parents with babies and toddlers (0-3 years)
- **Brand Values:** Safety first, educational development, family bonding

## Technical Requirements
- **Resolution:** 1024x1024 pixels minimum
- **Format:** PNG with transparency support
- **Quality:** High resolution suitable for both digital and print
- **Composition:** Rule of thirds, clear focal hierarchy
- **Accessibility:** High contrast, clear visibility

## Implementation Tools
This specification can be used with:
- Professional AI image generators (DALL-E 3, Midjourney, Stable Diffusion)
- Professional designers and photographers
- Internal design teams
- External marketing agencies

## Quality Assurance Checklist
- [ ] Product is clearly visible and appealing
- [ ] Brand colors are accurate
- [ ] Family atmosphere is warm and inviting
- [ ] Safety aspects are visually apparent
- [ ] Educational value is communicated
- [ ] Image is suitable for target platforms
- [ ] Googoogaga brand identity is maintained
`;

      fs.writeFileSync(specPath, fullSpec);
      
      console.log(`📋 Professional design specification saved as ${specPath}`);
      
      return { 
        type: 'specification', 
        path: specPath, 
        description: designSpec,
        downloadUrl: `/api/download-image?path=${encodeURIComponent(specPath)}`,
        isRealImage: false,
        useCase: 'External image generation with professional tools'
      };
      
    } catch (error) {
      throw new Error(`Design specification creation failed: ${error.message}`);
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