const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');

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
    console.log('✅ ScenarioGenerator service initialized successfully');
  }

  // 根據產品內容生成三種行銷場景
  async generateMarketingScenarios(productInfo, contentData) {
    try {
      // 使用更新的 API 格式
      
      const prompt = `
基於以下產品資訊和行銷內容，請為這個嬰幼兒玩具產品創建三種不同的行銷場景。

產品資訊：${JSON.stringify(productInfo, null, 2)}
行銷內容：${JSON.stringify(contentData, null, 2)}

請生成三種場景，每種場景都要包含：
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

      const response = await this.ai.models.generateContent({
        model: "gemini-1.5-flash",
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
  async generateImageDescription(scenario, productInfo) {
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
        model: "gemini-1.5-flash", 
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

  // 自動 Nano Banana 圖片生成（場景專用，使用用戶上傳的產品圖片作為參考）
  async generateScenarioImage(imageDescription, scenarioName, outputPath, productImagePath = null) {
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

        enhancedPrompt = `Create a high-quality marketing scenario image for Googoogaga baby toys using the EXACT SAME toy product shown in the reference image:

Scenario: ${scenarioName}
Description: ${imageDescription}

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
        enhancedPrompt = `Create a high-quality marketing scenario image for Googoogaga baby toys:

Scenario: ${scenarioName}
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
        console.log('🎨 Generating scenario image with gemini-2.5-flash-image-preview...');
        
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
              return {
                type: 'image',
                path: outputPath,
                size: buffer.length,
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
        model: "gemini-1.5-flash",
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