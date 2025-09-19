const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');

// Scene generation service for creating marketing scenarios
class ScenarioGeneratorService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);
  }

  // 根據產品內容生成三種行銷場景
  async generateMarketingScenarios(productInfo, contentData) {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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

      const response = await model.generateContent(prompt);
      const scenarioText = response.response.text();
      
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
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
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

      const response = await model.generateContent(prompt);
      return response.response.text();
    } catch (error) {
      throw new Error(`Image description generation failed: ${error.message}`);
    }
  }

  // 模擬圖片生成（創建設計描述文件）
  async generateScenarioImage(imageDescription, scenarioName, outputPath) {
    try {
      // 由於目前 Gemini 不支援直接圖片生成，我們創建詳細的設計描述
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const enhancedPrompt = `
基於以下圖像描述，創建一個專業的設計指導文件，用於圖像生成：

原始描述：${imageDescription}

請提供：
1. 精確的構圖指導
2. 色彩配置建議（具體色彩代碼）
3. 光線和陰影設置
4. 物件比例和位置
5. 質感和材質描述
6. 後製建議
7. 品牌一致性要求

場景名稱：${scenarioName}`;

      const response = await model.generateContent(enhancedPrompt);
      const designGuide = response.response.text();
      
      // 確保輸出目錄存在
      await fs.ensureDir(path.dirname(outputPath));
      
      // 創建設計指導文件
      const designContent = `# ${scenarioName} 設計指導

## 圖像描述
${imageDescription}

## 詳細設計指導
${designGuide}

## 生成時間
${new Date().toISOString()}

---
註：此文件包含 AI 生成的詳細設計指導，可用於專業圖像生成工具或設計師參考。
`;

      const designFilePath = outputPath.replace('.png', '_design.md');
      fs.writeFileSync(designFilePath, designContent);
      
      console.log(`Design guide saved as ${designFilePath}`);
      return designFilePath;
    } catch (error) {
      throw new Error(`Scenario image generation failed: ${error.message}`);
    }
  }
}

module.exports = ScenarioGeneratorService;