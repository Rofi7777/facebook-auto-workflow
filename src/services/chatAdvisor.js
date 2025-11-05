const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');

class ChatAdvisor {
  constructor() {
    // Use the same API key retrieval pattern as other services
    const apiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found, ChatAdvisor may not function');
      // Don't throw error during initialization, allow graceful degradation
    }
    
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.modelName = 'gemini-2.5-flash';
    
    console.log('🗨️  ChatAdvisor initialized with model:', this.modelName);
    console.log('✅ ChatAdvisor service initialized successfully');
  }
  
  /**
   * 生成分析後的建議問題
   */
  async generateSuggestedQuestions(analysisResult) {
    try {
      console.log('💡 Generating suggested questions based on analysis...');
      
      const prompt = `你是一位專業的廣告策略顧問。基於以下廣告分析結果，請生成3個深入的、有洞察力的問題，幫助客戶更好地思考和優化他們的廣告策略。

【分析結果摘要】
品牌需求摘要：${analysisResult.brandNeedSummary?.substring(0, 200) || '未提供'}
效能洞察：${analysisResult.performanceInsight?.substring(0, 200) || '未提供'}

請生成3個問題，每個問題都應該：
1. 針對分析結果中的關鍵洞察
2. 幫助客戶深入思考策略方向
3. 實用且具體

請以JSON格式回覆，格式如下：
{
  "questions": [
    "問題1",
    "問題2",
    "問題3"
  ]
}`;
      
      const result = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }]
      });
      
      const responseText = result.candidates[0].content.parts[0].text;
      console.log('📝 Raw AI response:', responseText);
      
      // 嘗試解析JSON
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            console.log('✅ Generated', parsed.questions.length, 'suggested questions');
            return parsed.questions.slice(0, 3);
          }
        }
      } catch (parseError) {
        console.warn('⚠️  Failed to parse JSON, extracting questions manually');
      }
      
      // 備用：從文字中提取問題
      const lines = responseText.split('\n').filter(line => line.trim());
      const questions = lines
        .filter(line => line.match(/^[\d一二三1-3][\.\、\)]/))
        .map(line => line.replace(/^[\d一二三1-3][\.\、\)]\s*/, '').trim())
        .filter(q => q.length > 10)
        .slice(0, 3);
      
      if (questions.length > 0) {
        console.log('✅ Extracted', questions.length, 'questions from text');
        return questions;
      }
      
      // 如果都失敗，返回預設問題
      console.warn('⚠️  Using fallback questions');
      return [
        '根據目前的分析結果，您認為哪個平台最適合優先投入預算？為什麼？',
        '您的目標受眾在哪些時段最活躍？我們應該如何調整投放時段來提高效果？',
        '從創意策略角度，您希望強調產品的哪個核心優勢？我們可以如何透過視覺和文案呈現？'
      ];
      
    } catch (error) {
      console.error('❌ Error generating suggested questions:', error);
      // 返回預設問題
      return [
        '根據分析結果，您最關注哪個指標的優化？',
        '您認為當前廣告策略中最大的挑戰是什麼？',
        '有什麼其他資料或資訊可以幫助我提供更精準的建議？'
      ];
    }
  }
  
  /**
   * 處理對話訊息
   */
  async chat(message, chatHistory, analysisContext, uploadedFiles = []) {
    try {
      console.log(`💬 Processing chat message: "${message.substring(0, 50)}..."`);
      console.log(`📁 Files uploaded: ${uploadedFiles.length}`);
      console.log(`📜 Chat history length: ${chatHistory.length}`);
      
      // 準備檔案內容
      const fileParts = await this.prepareFileContents(uploadedFiles);
      
      // 構建對話提示詞
      const systemPrompt = this.buildChatPrompt(analysisContext, chatHistory);
      
      // 準備對話內容
      const contentParts = [
        { text: systemPrompt },
        ...fileParts
      ];
      
      if (message) {
        contentParts.push({ text: `\n\n用戶問題：${message}` });
      }
      
      console.log(`🤖 Sending chat request to AI...`);
      
      // 調用 AI
      const result = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{
          role: 'user',
          parts: contentParts
        }]
      });
      
      const response = result.candidates[0].content.parts[0].text;
      
      console.log('✅ Chat response generated successfully');
      
      return {
        response: response,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw new Error(`對話處理失敗: ${error.message}`);
    }
  }
  
  /**
   * 準備檔案內容給 AI 分析
   */
  async prepareFileContents(uploadedFiles) {
    const fileParts = [];
    
    for (const file of uploadedFiles) {
      try {
        const filePath = file.path;
        const mimeType = file.mimetype;
        
        // 處理圖片檔案
        if (mimeType.startsWith('image/')) {
          console.log(`📷 Reading image file: ${file.filename}`);
          const imageBuffer = await fs.readFile(filePath);
          const base64Data = imageBuffer.toString('base64');
          
          fileParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          });
          
        } else if (mimeType.includes('csv')) {
          console.log(`📊 Reading CSV file: ${file.filename}`);
          try {
            const csvContent = await fs.readFile(filePath, 'utf-8');
            const truncatedContent = csvContent.substring(0, 5000);
            fileParts.push({
              text: `\n[用戶上傳的 CSV 數據文件: ${file.filename}]\n${truncatedContent}\n${csvContent.length > 5000 ? '...(內容已截斷)' : ''}`
            });
          } catch (error) {
            console.warn(`⚠️  Failed to read CSV: ${error.message}`);
          }
          
        } else {
          // 其他檔案類型提供描述
          console.log(`📄 File detected: ${file.filename}`);
          fileParts.push({
            text: `\n[用戶上傳的檔案: ${file.filename} (${mimeType})]\n請分析此檔案並提供專業建議。`
          });
        }
        
      } catch (error) {
        console.error(`❌ Error processing file ${file.filename}:`, error);
      }
    }
    
    return fileParts;
  }
  
  /**
   * 構建對話提示詞
   */
  buildChatPrompt(analysisContext, chatHistory) {
    let prompt = `你是一位專業的廣告策略顧問，專門幫助客戶優化廣告投放策略和提升廣告效果。\n\n`;
    
    // 如果有分析上下文，加入背景資訊
    if (analysisContext) {
      prompt += `【背景資訊 - 之前的廣告分析】\n`;
      if (analysisContext.brandNeedSummary) {
        prompt += `品牌需求摘要：${analysisContext.brandNeedSummary.substring(0, 300)}...\n\n`;
      }
      if (analysisContext.performanceInsight) {
        prompt += `效能洞察：${analysisContext.performanceInsight.substring(0, 300)}...\n\n`;
      }
      if (analysisContext.creativeStrategy) {
        prompt += `創意策略：${analysisContext.creativeStrategy.substring(0, 300)}...\n\n`;
      }
    }
    
    // 加入對話歷史（最近5輪）
    if (chatHistory && chatHistory.length > 0) {
      prompt += `【對話歷史】\n`;
      const recentHistory = chatHistory.slice(-10); // 最近5輪（10條訊息）
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? '用戶' : 'AI顧問';
        prompt += `${role}：${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += `請基於以上背景資訊和對話歷史，為用戶提供專業、具體、可執行的廣告策略建議。回覆時請：
1. 針對用戶的具體問題給出清晰的答案
2. 提供實用的數據和案例支持
3. 給出可執行的下一步行動建議
4. 使用繁體中文和越南文雙語回覆（如果用戶偏好）`;
    
    return prompt;
  }
}

module.exports = ChatAdvisor;
