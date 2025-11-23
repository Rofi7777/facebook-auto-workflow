const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

// Scene generation service for creating marketing scenarios
class ScenarioGeneratorService {
  constructor() {
    // Use the new API key to avoid the corrupted one
    const apiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY_NEW environment variable is required');
    }
    
    console.log('🔑 ScenarioGenerator using API Key format:', apiKey.startsWith('AIzaSy') ? 'VALID' : 'INVALID');
    
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Model configuration with auto-update capability
    this.modelConfig = {
      primary: "gemini-3-pro-preview",    // Upgraded to Gemini 3 Pro for advanced text reasoning
      fallback: "gemini-2.5-flash",       // Fallback to stable 2.5 Flash
      legacy: "gemini-2.0-flash-exp"      // Legacy support (if needed)
    };
    
    console.log('✅ ScenarioGenerator service initialized successfully');
  }

  // Helper method to get the best available model with actual testing
  async getBestAvailableModel() {
    const models = [this.modelConfig.primary, this.modelConfig.fallback];
    
    for (const model of models) {
      try {
        console.log(`🔍 Testing scenario model availability: ${model}`);
        
        // Actually test the model with a simple request
        const testResponse = await this.ai.models.generateContent({
          model: model,
          contents: [{ role: 'user', parts: [{ text: 'Test' }] }]
        });
        
        if (testResponse && testResponse.candidates && testResponse.candidates.length > 0) {
          console.log(`✅ Scenario model ${model} is available and working`);
          return model;
        }
      } catch (error) {
        console.log(`⚠️ Scenario model ${model} failed test, trying next...`, error.message);
        continue;
      }
    }
    
    // If all tests fail, use primary as last resort
    console.log(`🚨 All scenario model tests failed, falling back to primary: ${this.modelConfig.primary}`);
    return this.modelConfig.primary;
  }

  // 根據產品內容生成三種行銷場景
  async generateMarketingScenarios(productInfo, contentData, scenarioType = '親子互動') {
    try {
      // 使用更新的 API 格式
      
      const prompt = `
基於以下產品資訊和行銷內容，請為這個嬰幼兒玩具產品創建三種不同的行銷場景。
重點關注「${scenarioType}」使用情境，並創造多樣化的創意變化。

產品資訊：${JSON.stringify(productInfo, null, 2)}
行銷內容：${JSON.stringify(contentData, null, 2)}
使用場景：${scenarioType}

請生成三種「${scenarioType}」場景的創意變化，每種場景都要包含：
1. 場景名稱
2. 詳細的場景描述（環境、角色、互動）
3. 情感氛圍
4. 適合的平台
5. 視覺設計重點
6. 圖片生成描述（詳細的視覺元素描述，適合用於AI圖像生成）

請用以下 JSON 格式回答：
{
  "scenarios": [
    {
      "name": "場景名稱1",
      "description": "詳細場景描述",
      "emotion": "情感氛圍",
      "suitablePlatforms": ["platform1", "platform2"],
      "visualFocus": "視覺設計重點",
      "imageDescription": "詳細的圖片生成描述，包含構圖、色彩、光線、物件位置等"
    },
    {
      "name": "場景名稱2", 
      "description": "詳細場景描述",
      "emotion": "情感氛圍",
      "suitablePlatforms": ["platform1", "platform2"],
      "visualFocus": "視覺設計重點",
      "imageDescription": "詳細的圖片生成描述"
    },
    {
      "name": "場景名稱3",
      "description": "詳細場景描述", 
      "emotion": "情感氛圍",
      "suitablePlatforms": ["platform1", "platform2"],
      "visualFocus": "視覺設計重點",
      "imageDescription": "詳細的圖片生成描述"
    }
  ]
}`;

      // Use dynamic model selection
      const modelName = await this.getBestAvailableModel();
      console.log(`🤖 Using model: ${modelName} for scenario generation`);
      
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      // 安全檢查回應格式
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('Invalid AI response format for scenario generation');
      }
      
      const scenarioText = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      
      try {
        const jsonMatch = scenarioText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('JSON parsing failed for scenarios, returning raw text');
      }
      
      return { rawScenarios: scenarioText };
    } catch (error) {
      throw new Error(`Scenario generation failed: ${error.message}`);
    }
  }

  // 為場景生成詳細的圖片描述
  async generateImageDescription(scenario, productInfo, scenarioType = '親子互動') {
    try {
      // 使用更新的 API 格式
      
      const prompt = `
為以下嬰幼兒玩具行銷場景創建詳細的圖像生成描述：

場景：${JSON.stringify(scenario, null, 2)}
產品：${JSON.stringify(productInfo, null, 2)}

請創建一個非常詳細的圖像描述，包含：
1. 構圖和視角（如：特寫、全景、45度角等）
2. 主要物件和位置
3. 人物（如果有）的年齡、表情、姿態
4. 環境設定（室內/戶外、具體場所）
5. 色彩搭配和色調
6. 光線效果（自然光、暖光等）
7. 氛圍和情感表達
8. 品牌元素和文字建議
9. 圖像風格（攝影風格、插畫風格等）

請用一段詳細的描述文字回答，適合直接用於 AI 圖像生成工具。`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      // 安全檢查回應格式
      if (!response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts) {
        throw new Error('Invalid AI response format for image description');
      }
      
      return response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
    } catch (error) {
      throw new Error(`Image description generation failed: ${error.message}`);
    }
  }

  // 根據場景類型生成創造性場景詳情
  generateScenarioDetails(scenarioType, modelNationality = 'taiwan', modelCombination = 'parents_baby', sceneLocation = 'park') {
    // Map nationality to specific ethnic characteristics
    const nationalityMap = {
      'taiwan': 'East Asian/Taiwanese',
      'usa': 'American (diverse ethnic backgrounds)',
      'russia': 'Eastern European/Russian',
      'brazil': 'Latin American/Brazilian',
      'custom': 'diverse international backgrounds'
    };
    
    // Map model combinations to character descriptions
    const combinationMap = {
      'parents_baby': 'Both parents (mother and father) with baby',
      'mom_baby': 'Mother with baby',
      'dad_baby': 'Father with baby',
      'couple': 'Couple together (parents without baby visible in focus)'
    };
    
    // Map locations to scene settings
    const locationMap = {
      'city': 'Urban city environment with modern buildings, streets, cafes',
      'beach': 'Beautiful beach setting with sand, ocean waves, sunny weather',
      'mountain': 'Mountain landscape with scenic views, fresh air, natural surroundings',
      'park': 'Public park with green grass, trees, playground equipment',
      'custom': 'creative unique location that varies'
    };
    
    // Use mapped value if available, otherwise use the custom input directly
    const ethnicity = nationalityMap[modelNationality] || modelNationality;
    const characterDesc = combinationMap[modelCombination] || modelCombination;
    const locationDesc = locationMap[sceneLocation] || sceneLocation;
    
    const scenarioMap = {
      '親子互動': {
        setting: `${locationDesc}, soft lighting, comfortable atmosphere with the product visible`,
        characters: `${characterDesc} of ${ethnicity} ethnicity, actively engaging with the product, genuine smiles and eye contact, natural interaction`,
        background: `${locationDesc} with warm, family-friendly elements and safe environment`,
        visualStyle: 'heartwarming family moments, emotional connection emphasis'
      },
      '小孩單人使用': {
        setting: `${locationDesc}, child-safe area with the product, colorful and engaging`,
        characters: `Independent toddler (18-30 months) of ${ethnicity} ethnicity exploring and playing alone with the product, focused and curious expression`,
        background: `${locationDesc} with safe, child-friendly elements and bright colors`,
        visualStyle: 'child development focus, exploration and discovery theme'
      },
      '外出旅遊': {
        setting: `${locationDesc}, outdoor travel destination with natural scenery`,
        characters: `${characterDesc} of ${ethnicity} ethnicity in outdoor adventure with the product, travel-friendly mood`,
        background: `${locationDesc} with beautiful natural landscape and family-friendly travel setting`,
        visualStyle: 'adventure and exploration theme, natural outdoor lighting'
      },
      '居家遊戲': {
        setting: `Home interior or ${locationDesc} adapted for play, organized and comfortable`,
        characters: `${characterDesc} of ${ethnicity} ethnicity playing with the product, comfortable casual clothes, relaxed atmosphere`,
        background: `Comfortable home-like setting in ${locationDesc} with natural lighting and cozy elements`,
        visualStyle: 'home comfort theme, daily life naturalism'
      },
      '其他': {
        setting: `${locationDesc} with creative and unique elements that vary each time`,
        characters: `${characterDesc} of ${ethnicity} ethnicity in creative interaction with the product, unique scenario`,
        background: `${locationDesc} with artistic and creative elements, innovative environment`,
        visualStyle: 'highly creative and artistic, unique visual approach each time'
      }
    };
    
    return scenarioMap[scenarioType] || scenarioMap['親子互動'];
  }

  // 在生成的圖片上疊加 Googoogaga Logo
  async addLogoToImage(imagePath) {
    try {
      const logoPath = path.resolve(__dirname, '../../public/brand/googoogaga-logo-transparent.png');
      
      // 檢查 Logo 是否存在
      const logoExists = await fs.pathExists(logoPath);
      if (!logoExists) {
        console.warn('⚠️ Googoogaga logo not found, skipping logo overlay');
        return imagePath;
      }
      
      // 讀取原始圖片和 Logo
      const image = sharp(imagePath);
      const metadata = await image.metadata();
      
      // 計算 Logo 大小（原圖寬度的 20%）
      const logoWidth = Math.floor(metadata.width * 0.2);
      
      // 調整 Logo 大小，保持透明背景
      const resizedLogo = await sharp(logoPath)
        .resize(logoWidth, null, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
      
      // 創建臨時文件路徑（安全處理所有擴展名）
      const parsedPath = path.parse(imagePath);
      const tempPath = path.join(parsedPath.dir, `${parsedPath.name}_temp${parsedPath.ext}`);
      
      // 將 Logo 疊加到右下角
      await image
        .composite([{
          input: resizedLogo,
          gravity: 'southeast',
          blend: 'over'
        }])
        .toFile(tempPath);
      
      // 替換原文件
      await fs.move(tempPath, imagePath, { overwrite: true });
      
      console.log(`✅ Googoogaga logo added to scenario image: ${imagePath}`);
      return imagePath;
      
    } catch (error) {
      console.error(`❌ Failed to add logo to scenario: ${error.message}`);
      return imagePath; // 如果失敗，返回原圖片路徑
    }
  }

  // 自動 Nano Banana 圖片生成（場景專用，使用用戶上傳的產品圖片作為參考）
  async generateScenarioImage(imageDescription, scenarioName, outputPath, productImagePath = null, scenarioType = '親子互動', modelNationality = 'taiwan', modelCombination = 'parents_baby', sceneLocation = 'park') {
    try {
      console.log(`🎨 Generating scenario image for: ${scenarioName}`);
      
      // 準備文字提示詞和圖片內容（根據是否有產品圖片參考調整）
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

        // 根據場景類型添加創造性變化
        const scenarioDetails = this.generateScenarioDetails(scenarioType, modelNationality, modelCombination, sceneLocation);
        
        enhancedPrompt = `Create a high-quality marketing scenario image for Googoogaga baby toys using the EXACT SAME toy product shown in the reference image:

Scenario: ${scenarioName} (${scenarioType})
Description: ${imageDescription}

SCENARIO-SPECIFIC CREATIVE ELEMENTS:
${scenarioDetails.setting}
Characters: ${scenarioDetails.characters}
Background: ${scenarioDetails.background}
Visual Style: ${scenarioDetails.visualStyle}

CRITICAL REQUIREMENTS:
- Use the EXACT same toy product from the reference image - same colors, same shape, same design details
- Create the specified marketing scenario around this specific product
- Professional photography style
- Warm, family-friendly atmosphere  
- Soft pastel colors (sky blue to pink gradient)
- Safe, educational environment
- Clear product visibility
- Natural lighting and realistic shadows
- High resolution suitable for marketing
- Googoogaga brand aesthetic (nurturing, developmental, safe)
- Composition optimized for social media platforms

IMPORTANT: The generated image MUST feature the identical toy product shown in the reference image in the specified scenario context.

Style: Realistic photography, commercial quality, warm family moments, professionally lit`;

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
        const scenarioDetails = this.generateScenarioDetails(scenarioType, modelNationality, modelCombination, sceneLocation);
        
        enhancedPrompt = `Create a high-quality marketing scenario image for Googoogaga baby toys:

Scenario: ${scenarioName} (${scenarioType})
SCENARIO-SPECIFIC CREATIVE ELEMENTS:
${scenarioDetails.setting}
Characters: ${scenarioDetails.characters}  
Background: ${scenarioDetails.background}
Visual Style: ${scenarioDetails.visualStyle}
Description: ${imageDescription}

Requirements:
- Professional photography style
- Warm, family-friendly atmosphere  
- Soft pastel colors (sky blue to pink gradient)
- Safe, educational environment
- Clear product visibility
- Natural lighting and realistic shadows
- High resolution suitable for marketing
- Googoogaga brand aesthetic (nurturing, developmental, safe)
- Composition optimized for social media platforms

Style: Realistic photography, commercial quality, warm family moments, professionally lit`;

        contentParts = [{ text: enhancedPrompt }];
      }

      // 使用正確的圖片生成模型進行場景圖片生成
      try {
        console.log('🎨 Generating scenario image with gemini-3-pro-image-preview...');
        
        const response = await this.ai.models.generateContent({
          model: "gemini-3-pro-image-preview",
          contents: [{ 
            role: 'user', 
            parts: contentParts 
          }],
          generationConfig: {
            responseMimeType: 'image/png',
            maxOutputTokens: 2048
          }
        });
        
        // 檢查是否返回真實圖片
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
              const imageData = part.inlineData.data;
              const buffer = Buffer.from(imageData, "base64");
              
              // 確保輸出目錄存在並保存圖片
              await fs.ensureDir(path.dirname(outputPath));
              await fs.writeFile(outputPath, buffer);
              
              console.log(`✅ Real scenario image generated: ${outputPath} (${buffer.length} bytes)`);
              
              // 在圖片上疊加 Googoogaga Logo
              await this.addLogoToImage(outputPath);
              
              // 重新讀取添加 Logo 後的圖片大小
              const finalStats = await fs.stat(outputPath);
              
              return {
                type: 'image',
                path: outputPath,
                size: finalStats.size,
                downloadUrl: `/api/download-image?path=${encodeURIComponent(outputPath)}`,
                isRealImage: true,
                scenario: scenarioName
              };
            }
          }
        }
        
        console.log('⚠️ Scenario image generation returned no image data');
      } catch (imageError) {
        console.log(`⚠️ Scenario image generation failed: ${imageError.message}`);
      }
      
      // 如果圖片生成失敗，創建專業設計指導文件
      console.log('📋 Creating professional design guide for external generation...');
      const designGuide = await this.createScenarioDesignGuide(imageDescription, scenarioName, outputPath);
      return designGuide;
      
    } catch (error) {
      throw new Error(`Scenario image generation failed: ${error.message}`);
    }
  }

  // 創建場景專用的詳細設計指導文件
  async createScenarioDesignGuide(imageDescription, scenarioName, outputPath) {
    try {
      const enhancedPrompt = `Create a comprehensive design guide for a baby toy marketing scenario image:

Scenario: ${scenarioName}
Base Description: ${imageDescription}

Provide detailed specifications for:
1. Camera setup (angle, distance, lens type)
2. Lighting design (key light, fill light, rim light positions)
3. Set design and props placement
4. Character directions (baby/parent poses, expressions)
5. Color grading and post-production notes
6. Brand integration guidelines
7. Platform-specific adaptations
8. Technical photography settings

Make this guide professional enough for a commercial photographer or AI generation tool.`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }]
      });
      
      const designGuide = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('');
      
      // 確保輸出目錄存在
      await fs.ensureDir(path.dirname(outputPath));
      
      // 創建專業設計指導文件
      const designContent = `# ${scenarioName} - Professional Photography Guide
**Project:** Googoogaga Baby Toy Marketing Campaign  
**Generated:** ${new Date().toISOString()}  
**Scenario:** ${scenarioName}

## Original Creative Brief
${imageDescription}

## Professional Photography Specification
${designGuide}

## Googoogaga Brand Standards
- **Color Palette:** Soft pastels with sky blue to pink gradient (#87CEEB to #FFB6C1)
- **Typography:** Clean, modern sans-serif fonts (Nunito, Open Sans)
- **Mood:** Safe, nurturing, developmental, educational
- **Target Demographic:** Parents with babies/toddlers (0-3 years)
- **Core Values:** Safety first, developmental growth, family bonding

## Technical Specifications
- **Resolution:** Minimum 1024x1024, preferred 2048x2048
- **Format:** PNG with transparency support
- **Quality:** Commercial grade, suitable for print and digital
- **Color Space:** sRGB for digital, Adobe RGB for print
- **File Size:** Optimized for web while maintaining quality

## Production Notes
- Ensure all toys appear safe and age-appropriate
- Maintain consistent lighting across campaign images
- Include subtle Googoogaga branding without overwhelming the scene
- Focus on emotional connection between product and family
- Verify accessibility standards (contrast, visibility)

## Usage Rights
This design guide is for Googoogaga marketing campaign use only.
Compatible with professional AI image generation tools:
- DALL-E 3 (OpenAI)
- Midjourney
- Stable Diffusion XL
- Adobe Firefly

## Quality Checklist
- [ ] Product clearly visible and appealing
- [ ] Brand guidelines followed
- [ ] Safety messaging apparent
- [ ] Educational value communicated
- [ ] Family warmth conveyed
- [ ] Technical specs met
- [ ] Platform requirements satisfied
`;

      const designFilePath = outputPath.replace('.png', '_professional_guide.md');
      fs.writeFileSync(designFilePath, designContent);
      
      console.log(`📋 Professional design guide created: ${designFilePath}`);
      
      return {
        type: 'guide',
        path: designFilePath,
        description: designGuide,
        downloadUrl: `/api/download-image?path=${encodeURIComponent(designFilePath)}`,
        isRealImage: false,
        scenario: scenarioName,
        useCase: 'Professional external image generation'
      };
      
    } catch (error) {
      throw new Error(`Design guide creation failed: ${error.message}`);
    }
  }
}

module.exports = ScenarioGeneratorService;