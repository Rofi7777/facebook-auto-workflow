const { GoogleGenAI, Modality } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');

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
    
    // Model configuration with auto-update capability
    this.modelConfig = {
      primary: "gemini-2.5-flash",        // Latest stable model as requested
      fallback: "gemini-2.0-flash-exp",   // Experimental fallback  
      legacy: "gemini-1.5-flash"          // Legacy support (if needed)
    };
    
    console.log(`🚀 Model Config: Primary=${this.modelConfig.primary}, Fallback=${this.modelConfig.fallback}`);
    console.log('✅ GeminiAI service initialized successfully');
  }

  // Helper method to get the best available model with actual testing
  async getBestAvailableModel() {
    const models = [this.modelConfig.primary, this.modelConfig.fallback];
    
    for (const model of models) {
      try {
        console.log(`🔍 Testing model availability: ${model}`);
        
        // Actually test the model with a simple request
        const testResponse = await this.ai.models.generateContent({
          model: model,
          contents: [{ role: 'user', parts: [{ text: 'Test' }] }]
        });
        
        if (testResponse && testResponse.candidates && testResponse.candidates.length > 0) {
          console.log(`✅ Model ${model} is available and working`);
          return model;
        }
      } catch (error) {
        console.log(`⚠️ Model ${model} failed test, trying next...`, error.message);
        continue;
      }
    }
    
    // If all tests fail, use primary as last resort
    console.log(`🚨 All model tests failed, falling back to primary: ${this.modelConfig.primary}`);
    return this.modelConfig.primary;
  }

  // 分析產品圖片並識別產品特性 - 支援多張圖片和多產業
  async analyzeProductImage(imagePaths, language = 'zh-TW', industryCategory = 'mother-kids') {
    try {
      // Support both single image path (string) and multiple paths (array)
      const pathsArray = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
      
      console.log(`🖼️ Analyzing ${pathsArray.length} image(s) for ${industryCategory} industry`);
      
      const imageParts = [];
      
      // Process each image
      for (const imagePath of pathsArray) {
        const imageBytes = await fs.readFile(imagePath);
        
        // Detect MIME type from file extension
        const ext = path.extname(imagePath).toLowerCase();
        let mimeType = "image/jpeg";
        if (ext === '.png') mimeType = "image/png";
        if (ext === '.gif') mimeType = "image/gif";
        if (ext === '.webp') mimeType = "image/webp";
        
        imageParts.push({
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: mimeType,
          },
        });
      }
      
      // 根據產業類別和語言調整分析提示詞
      const industryPrompts = {
        'fashion': {
          'vi': `Hãy phân tích chi tiết hình ảnh sản phẩm thời trang này và cung cấp thông tin sau:
          1. Loại sản phẩm và phong cách
          2. Chất liệu và thiết kế
          3. Màu sắc và họa tiết
          4. Đối tượng khách hàng phù hợp
          5. Xu hướng thời trang hiện tại
          6. Tình huống sử dụng đề xuất
          Vui lòng trả lời bằng tiếng Việt, định dạng JSON:`,
          'zh-TW': `請詳細分析這個時尚產品圖片，提供以下資訊：
          1. 產品類型和風格
          2. 材質和設計特色
          3. 顏色和圖案
          4. 適合客群
          5. 當前流行趨勢
          6. 使用場景建議
          請用繁體中文回答，格式為JSON：`,
          'en': `Please analyze this fashion product image in detail and provide the following information:
          1. Product type and style
          2. Material and design features
          3. Colors and patterns
          4. Target audience
          5. Current fashion trends
          6. Usage scenario suggestions
          Please answer in English, format as JSON:`,
          'bilingual': `請詳細分析這${pathsArray.length > 1 ? '些' : '個'}時尚產品圖片（請用繁體中文和越南文雙語回答）：
          ${pathsArray.length > 1 ? `注意：這些圖片展示了同一個產品的不同角度，請綜合分析。` : ''}
          1. 產品類型和風格/Loại sản phẩm và phong cách
          2. 材質和設計/Chất liệu và thiết kế
          3. 顏色和圖案/Màu sắc và họa tiết
          4. 適合客群/Đối tượng khách hàng
          5. 流行趨勢/Xu hướng thời trang
          6. 使用場景/Tình huống sử dụng
          請用繁體中文和越南文雙語回答，格式為JSON：`
        },
        'art-toy': {
          'vi': `Hãy phân tích chi tiết hình ảnh đồ chơi nghệ thuật/collectible này và cung cấp thông tin sau:
          1. Loại sản phẩm và phong cách nghệ thuật
          2. Chất liệu và kỹ thuật sản xuất
          3. Màu sắc và chi tiết thiết kế
          4. Đối tượng sưu tập phù hợp
          5. Giá trị nghệ thuật và độc đáo
          6. Đề xuất trưng bày và bảo quản
          Vui lòng trả lời bằng tiếng Việt, định dạng JSON:`,
          'zh-TW': `請詳細分析這個藝術玩具/收藏品圖片，提供以下資訊：
          1. 產品類型和藝術風格
          2. 材質和製作工藝
          3. 顏色和設計細節
          4. 適合收藏族群
          5. 藝術價值和獨特性
          6. 展示和保存建議
          請用繁體中文回答，格式為JSON：`,
          'en': `Please analyze this art toy/collectible image in detail and provide the following information:
          1. Product type and artistic style
          2. Materials and craftsmanship
          3. Colors and design details
          4. Target collector audience
          5. Artistic value and uniqueness
          6. Display and preservation suggestions
          Please answer in English, format as JSON:`,
          'bilingual': `請詳細分析這${pathsArray.length > 1 ? '些' : '個'}藝術玩具產品圖片（請用繁體中文和越南文雙語回答）：
          ${pathsArray.length > 1 ? `注意：這些圖片展示了同一個產品的不同角度，請綜合分析。` : ''}
          1. 產品類型和風格/Loại sản phẩm và phong cách nghệ thuật
          2. 材質和工藝/Chất liệu và kỹ thuật
          3. 顏色和設計/Màu sắc và thiết kế
          4. 收藏族群/Đối tượng sưu tập
          5. 藝術價值/Giá trị nghệ thuật
          6. 展示建議/Đề xuất trưng bày
          請用繁體中文和越南文雙語回答，格式為JSON：`
        },
        'mother-kids': {
          'vi': `Hãy phân tích chi tiết hình ảnh sản phẩm đồ chơi trẻ em/mẹ và bé này và cung cấp thông tin sau:
          1. Loại sản phẩm và đặc điểm chính
          2. Độ tuổi phù hợp
          3. Chức năng chính và giá trị giáo dục
          4. Tính năng an toàn
          5. Chất liệu và màu sắc
          6. Đề xuất tình huống sử dụng
          Vui lòng trả lời bằng tiếng Việt, định dạng JSON:`,
          'zh-TW': `請詳細分析這個嬰幼兒玩具/母嬰產品圖片，提供以下資訊：
          1. 產品類型和主要特徵
          2. 適合年齡層
          3. 主要功能和教育價值
          4. 安全特性
          5. 材質和顏色
          6. 使用場景建議
          請用繁體中文回答，格式為JSON：`,
          'en': `Please analyze this baby toy/mother & kids product image in detail and provide the following information:
          1. Product type and main features
          2. Suitable age range
          3. Main functions and educational value
          4. Safety features
          5. Materials and colors
          6. Usage scenario suggestions
          Please answer in English, format as JSON:`,
          'bilingual': `請詳細分析這${pathsArray.length > 1 ? '些' : '個'}嬰幼兒玩具/母嬰產品圖片（請用繁體中文和越南文雙語回答）：
          ${pathsArray.length > 1 ? `注意：這些圖片展示了同一個產品的不同角度，請綜合分析。` : ''}
          1. 產品類型和主要特徵/Loại sản phẩm và đặc điểm
          2. 適合年齡層/Độ tuổi phù hợp
          3. 教育價值/Giá trị giáo dục
          4. 安全特性/Tính năng an toàn
          5. 材質和顏色/Chất liệu và màu sắc
          6. 使用場景/Tình huống sử dụng
          請用繁體中文和越南文雙語回答，格式為JSON：`
        },
        'others': {
          'vi': `Hãy phân tích chi tiết hình ảnh sản phẩm này và cung cấp thông tin sau:
          1. Loại sản phẩm và đặc điểm chính
          2. Công dụng và tính năng nổi bật
          3. Chất liệu và màu sắc
          4. Đối tượng khách hàng phù hợp
          5. Giá trị và lợi ích
          6. Đề xuất tình huống sử dụng
          Vui lòng trả lời bằng tiếng Việt, định dạng JSON:`,
          'zh-TW': `請詳細分析這個產品圖片，提供以下資訊：
          1. 產品類型和主要特徵
          2. 用途和突出功能
          3. 材質和顏色
          4. 適合客群
          5. 價值和優勢
          6. 使用場景建議
          請用繁體中文回答，格式為JSON：`,
          'en': `Please analyze this product image in detail and provide the following information:
          1. Product type and main features
          2. Usage and standout functions
          3. Materials and colors
          4. Target audience
          5. Value and benefits
          6. Usage scenario suggestions
          Please answer in English, format as JSON:`,
          'bilingual': `請詳細分析這${pathsArray.length > 1 ? '些' : '個'}產品圖片（請用繁體中文和越南文雙語回答）：
          ${pathsArray.length > 1 ? `注意：這些圖片展示了同一個產品的不同角度，請綜合分析。` : ''}
          1. 產品類型/Loại sản phẩm
          2. 用途和功能/Công dụng và tính năng
          3. 材質和顏色/Chất liệu và màu sắc
          4. 適合客群/Đối tượng khách hàng
          5. 價值優勢/Giá trị và lợi ích
          6. 使用場景/Tình huống sử dụng
          請用繁體中文和越南文雙語回答，格式為JSON：`
        }
      };
      
      const industryPromptSet = industryPrompts[industryCategory] || industryPrompts['mother-kids'];
      const promptText = industryPromptSet[language] || industryPromptSet['zh-TW'];
      
      // 根據語言選擇 JSON 示例模板
      let jsonExample;
      if (language === 'bilingual') {
        jsonExample = `{
          "productType": "積木玩具/Đồ chơi xếp hình",
          "ageRange": "1-3歲/1-3 tuổi",
          "features": ["色彩鮮豔/Màu sắc tươi sáng", "質地光滑/Chất liệu mịn màng"],
          "educationalValue": "促進手眼協調/Thúc đẩy phối hợp tay mắt; 認識顏色形狀/Nhận biết màu sắc hình dạng",
          "safetyFeatures": ["無尖銳邊角/Không có góc cạnh sắc", "環保材質/Chất liệu thân thiện"],
          "materials": "環保木材/Gỗ thân thiện với môi trường",
          "colors": ["藍色/Màu xanh dương", "粉色/Màu hồng"],
          "usageScenarios": ["居家遊戲/Trò chơi tại nhà", "親子互動/Tương tác cha mẹ con cái"]
        }`;
      } else if (language === 'vi') {
        jsonExample = `{
          "productType": "Đồ chơi xếp hình",
          "ageRange": "1-3 tuổi",
          "features": ["Màu sắc tươi sáng", "Chất liệu mịn màng"],
          "educationalValue": "Thúc đẩy phối hợp tay mắt; Nhận biết màu sắc hình dạng",
          "safetyFeatures": ["Không có góc cạnh sắc", "Chất liệu thân thiện"],
          "materials": "Gỗ thân thiện với môi trường",
          "colors": ["Màu xanh dương", "Màu hồng"],
          "usageScenarios": ["Trò chơi tại nhà", "Tương tác cha mẹ con cái"]
        }`;
      } else if (language === 'en') {
        jsonExample = `{
          "productType": "Building Blocks Toy",
          "ageRange": "1-3 years old",
          "features": ["Bright colors", "Smooth texture"],
          "educationalValue": "Promotes hand-eye coordination; Recognizes colors and shapes",
          "safetyFeatures": ["No sharp edges", "Eco-friendly materials"],
          "materials": "Environmental-friendly wood",
          "colors": ["Blue", "Pink"],
          "usageScenarios": ["Home play", "Parent-child interaction"]
        }`;
      } else {
        jsonExample = `{
          "productType": "產品類型",
          "ageRange": "適合年齡",
          "features": ["特徵1", "特徵2"],
          "educationalValue": "教育價值",
          "safetyFeatures": ["安全特性1"],
          "materials": "材質描述",
          "colors": ["顏色1", "顏色2"],
          "usageScenarios": ["使用場景1", "使用場景2"]
        }`;
      }
      
      const contents = [
        {
          role: 'user',
          parts: [
            ...imageParts,  // Spread all image parts
            {
              text: `${promptText}
        ${jsonExample}`
            }
          ]
        }
      ];

      // Use dynamic model selection
      const modelName = await this.getBestAvailableModel();
      console.log(`🤖 Using model: ${modelName} for image analysis`);
      
      const response = await this.ai.models.generateContent({
        model: modelName,
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
  async identifyPainPointsAndScenarios(productAnalysis, language = 'zh-TW') {
    try {
      // 根據語言調整痛點分析提示詞
      const languagePrompts = {
        'vi': `Dựa trên phân tích sản phẩm sau, vui lòng xác định các điểm khó khăn mà người tiêu dùng cuối (cha mẹ có em bé) có thể gặp phải và đề xuất các tình huống sử dụng tương ứng:

Phân tích sản phẩm: ${JSON.stringify(productAnalysis, null, 2)}

Vui lòng phân tích và trả về định dạng JSON bằng tiếng Việt:`,
        'zh-TW': `基於以下產品分析，請識別終端消費者（嬰幼兒家長）可能遇到的痛點，並提出相應的使用場景：

產品分析：${JSON.stringify(productAnalysis, null, 2)}

請分析並回傳JSON格式：`,
        'en': `Based on the following product analysis, please identify the pain points that end consumers (parents with young children) may encounter and propose corresponding usage scenarios:

Product Analysis: ${JSON.stringify(productAnalysis, null, 2)}

Please analyze and return in JSON format:`,
        'bilingual': `基於以下產品分析，請識別終端消費者（嬰幼兒家長）可能遇到的痛點，並提出相應的使用場景（請用繁體中文和越南文雙語回答）：

產品分析：${JSON.stringify(productAnalysis, null, 2)}

請分析並回傳雙語JSON格式：`
      };
      
      // 根據語言選擇 JSON 示例模板
      let jsonExample;
      if (language === 'bilingual') {
        jsonExample = `{
        "painPoints": [
          {
            "category": "收納困擾/Vấn đề lưu trữ",
            "description": "積木散落各處，難以收拾/Các khối đồ chơi rải rác khắp nơi, khó dọn dẹp",
            "targetAudience": "所有嬰幼兒家長/Tất cả các bậc phụ huynh có con nhỏ",
            "severity": "中/Trung bình"
          }
        ],
        "usageScenarios": [
          {
            "scenario": "親子共玩時間/Thời gian chơi cùng con",
            "context": "週末下午親子互動/Chiều cuối tuần tương tác cha mẹ con cái",
            "benefits": "增進親子關係/Thúc đẩy mối quan hệ cha mẹ - con cái",
            "emotions": "快樂、滿足/Hạnh phúc, thỏa mãn"
          }
        ],
        "marketingAngles": ["強調安全設計/Nhấn mạnh thiết kế an toàn", "突顯教育價值/Làm nổi bật giá trị giáo dục"]
      }`;
      } else if (language === 'vi') {
        jsonExample = `{
        "painPoints": [
          {
            "category": "Vấn đề lưu trữ",
            "description": "Các khối đồ chơi rải rác khắp nơi, khó dọn dẹp",
            "targetAudience": "Tất cả các bậc phụ huynh có con nhỏ",
            "severity": "Trung bình"
          }
        ],
        "usageScenarios": [
          {
            "scenario": "Thời gian chơi cùng con",
            "context": "Chiều cuối tuần tương tác cha mẹ con cái",
            "benefits": "Thúc đẩy mối quan hệ cha mẹ - con cái",
            "emotions": "Hạnh phúc, thỏa mãn"
          }
        ],
        "marketingAngles": ["Nhấn mạnh thiết kế an toàn", "Làm nổi bật giá trị giáo dục"]
      }`;
      } else if (language === 'en') {
        jsonExample = `{
        "painPoints": [
          {
            "category": "Storage Issues",
            "description": "Building blocks scattered everywhere, difficult to clean up",
            "targetAudience": "All parents with young children",
            "severity": "Medium"
          }
        ],
        "usageScenarios": [
          {
            "scenario": "Parent-child playtime",
            "context": "Weekend afternoon parent-child interaction",
            "benefits": "Enhances parent-child relationship",
            "emotions": "Happy, satisfied"
          }
        ],
        "marketingAngles": ["Emphasize safety design", "Highlight educational value"]
      }`;
      } else {
        jsonExample = `{
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
      }
      
      const prompt = `${languagePrompts[language] || languagePrompts['zh-TW']}
      ${jsonExample}`;

      // Use dynamic model selection
      const modelName = await this.getBestAvailableModel();
      console.log(`🤖 Using model: ${modelName} for pain points analysis`);
      
      const response = await this.ai.models.generateContent({
        model: modelName,
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

      語言：${language === 'vi' ? '越南語' : (language === 'bilingual' ? '繁體中文和越南語雙語' : '繁體中文')}

      ${language === 'bilingual' ? 
        `請產生雙語內容（繁體中文和越南文），包含：
        1. 主要文案（雙語版本）
        2. 建議的hashtag（雙語版本）
        3. 呼籲行動(CTA)（雙語版本）
        4. 情感連結點（雙語版本）

        回傳JSON格式：
        {
          "mainContent": {
            "zh-TW": "繁體中文主要文案內容",
            "vi": "Nội dung chính bằng tiếng Việt"
          },
          "hashtags": {
            "zh-TW": ["#中文hashtag1", "#中文hashtag2"],
            "vi": ["#hashtag_tiếng_việt1", "#hashtag_tiếng_việt2"]
          },
          "cta": {
            "zh-TW": "繁體中文呼籲行動文字",
            "vi": "Lời kêu gọi hành động bằng tiếng Việt"
          },
          "emotionalConnect": {
            "zh-TW": "繁體中文情感連結描述",
            "vi": "Mô tả kết nối cảm xúc bằng tiếng Việt"
          },
          "imagePrompt": "配圖建議描述"
        }` :
        `請產生適合的內容，包含：
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
        }`
      }`;

      // Use dynamic model selection
      const modelName = await this.getBestAvailableModel();
      console.log(`🤖 Using model: ${modelName} for platform content generation`);
      
      const response = await this.ai.models.generateContent({
        model: modelName, 
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
      const structured = language === 'bilingual' ? {
        mainContent: {
          "zh-TW": "",
          "vi": ""
        },
        hashtags: {
          "zh-TW": [],
          "vi": []
        },
        cta: {
          "zh-TW": "",
          "vi": ""
        },
        emotionalConnect: {
          "zh-TW": "",
          "vi": ""
        },
        imagePrompt: ""
      } : {
        mainContent: "",
        hashtags: [],
        cta: "",
        emotionalConnect: "",
        imagePrompt: ""
      };
      
      // Extract content sections
      if (language === 'bilingual') {
        // For bilingual mode, attempt to extract bilingual content
        const zhContent = lines.filter(l => /[\u4e00-\u9fff]/.test(l)).join(' ');
        const viContent = lines.filter(l => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(l)).join(' ');
        
        structured.mainContent['zh-TW'] = zhContent || contentText.substring(0, contentText.length / 2);
        structured.mainContent['vi'] = viContent || contentText.substring(contentText.length / 2);
        
        // Extract hashtags for both languages
        const zhHashtags = (zhContent.match(/#[\u4e00-\u9fff\w]+/g) || []);
        const viHashtags = (viContent.match(/#[a-zA-Z_àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+/g) || []);
        
        structured.hashtags['zh-TW'] = zhHashtags;
        structured.hashtags['vi'] = viHashtags;
        
        // Extract CTA and emotional connect for both languages
        structured.cta['zh-TW'] = zhContent.includes('立即') ? zhContent.match(/立即[^。！？]*[。！？]/)?.[0] || '' : '';
        structured.cta['vi'] = viContent.includes('ngay') ? viContent.match(/[Nn]gay[^.!?]*[.!?]/)?.[0] || '' : '';
        
        structured.emotionalConnect['zh-TW'] = zhContent || '溫馨親子時光';
        structured.emotionalConnect['vi'] = viContent || 'Khoảnh khắc gia đình ấm áp';
      } else {
        // Single language fallback
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.includes('#') && trimmed.includes('hashtags')) {
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
      
      console.log(`✅ Googoogaga logo added to ${imagePath}`);
      return imagePath;
      
    } catch (error) {
      console.error(`❌ Failed to add logo: ${error.message}`);
      return imagePath; // 如果失敗，返回原圖片路徑
    }
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
              
              // 在圖片上疊加 Googoogaga Logo
              await this.addLogoToImage(imagePath);
              
              // 重新讀取添加 Logo 後的圖片大小
              const finalStats = await fs.stat(imagePath);
              
              return { 
                type: 'image', 
                path: imagePath, 
                size: finalStats.size,
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
        model: "gemini-2.5-flash",
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
      shopee: `${basePrompt}，購物平台風格，清潔的白色或淺色背景，產品居中顯示，明亮的照明，專業的產品攝影風格，展示產品細節和特色`,
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