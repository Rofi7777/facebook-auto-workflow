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
    this.modelName = 'gemini-3-pro-preview'; // Upgraded to Gemini 3 Pro for advanced text reasoning
    
    console.log('🗨️  ChatAdvisor initialized with model:', this.modelName);
    console.log('✅ ChatAdvisor service initialized successfully');
  }
  
  /**
   * 生成分析後的建議問題
   */
  async generateSuggestedQuestions(analysisResult, language = 'zh-TW') {
    try {
      console.log(`💡 Generating suggested questions in ${language}...`);
      
      // 根據語言選擇提示詞
      const languageInstructions = {
        'zh-TW': '請用繁體中文回答',
        'en': 'Please answer in English',
        'vi': 'Vui lòng trả lời bằng tiếng Việt'
      };
      
      const languageInstruction = languageInstructions[language] || languageInstructions['zh-TW'];
      
      const prompt = `You are a professional advertising strategy consultant. Based on the following advertising analysis results, please generate 3 in-depth, insightful questions to help clients better think about and optimize their advertising strategies.

【Analysis Summary】
Brand Need Summary: ${analysisResult.brandNeedSummary?.substring(0, 200) || 'Not provided'}
Performance Insight: ${analysisResult.performanceInsight?.substring(0, 200) || 'Not provided'}

Please generate 3 questions, each question should:
1. Target key insights from the analysis results
2. Help clients think deeply about strategic directions
3. Be practical and specific

${languageInstruction}

Please respond in JSON format as follows:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3"
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
      
      // 如果都失敗，返回預設問題（根據語言）
      console.warn('⚠️  Using fallback questions');
      const fallbackQuestions = {
        'zh-TW': [
          '根據目前的分析結果，您認為哪個平台最適合優先投入預算？為什麼？',
          '您的目標受眾在哪些時段最活躍？我們應該如何調整投放時段來提高效果？',
          '從創意策略角度，您希望強調產品的哪個核心優勢？我們可以如何透過視覺和文案呈現？'
        ],
        'en': [
          'Based on the current analysis results, which platform do you think is best suited for priority budget allocation? Why?',
          'When is your target audience most active? How should we adjust the delivery schedule to improve effectiveness?',
          'From a creative strategy perspective, which core advantage of the product do you want to emphasize? How can we present it through visuals and copy?'
        ],
        'vi': [
          'Dựa trên kết quả phân tích hiện tại, bạn nghĩ nền tảng nào phù hợp nhất để ưu tiên phân bổ ngân sách? Tại sao?',
          'Đối tượng mục tiêu của bạn hoạt động tích cực nhất khi nào? Chúng ta nên điều chỉnh lịch phân phối như thế nào để cải thiện hiệu quả?',
          'Từ góc độ chiến lược sáng tạo, bạn muốn nhấn mạnh lợi thế cốt lõi nào của sản phẩm? Chúng ta có thể trình bày nó thông qua hình ảnh và nội dung như thế nào?'
        ]
      };
      return fallbackQuestions[language] || fallbackQuestions['zh-TW'];
      
    } catch (error) {
      console.error('❌ Error generating suggested questions:', error);
      // 返回預設問題（根據語言）
      const errorFallbackQuestions = {
        'zh-TW': [
          '根據分析結果，您最關注哪個指標的優化？',
          '您認為當前廣告策略中最大的挑戰是什麼？',
          '有什麼其他資料或資訊可以幫助我提供更精準的建議？'
        ],
        'en': [
          'Based on the analysis results, which metric are you most concerned about optimizing?',
          'What do you think is the biggest challenge in your current advertising strategy?',
          'What other data or information could help me provide more precise recommendations?'
        ],
        'vi': [
          'Dựa trên kết quả phân tích, bạn quan tâm nhất đến việc tối ưu hóa chỉ số nào?',
          'Bạn nghĩ thách thức lớn nhất trong chiến lược quảng cáo hiện tại của bạn là gì?',
          'Dữ liệu hoặc thông tin nào khác có thể giúp tôi đưa ra khuyến nghị chính xác hơn?'
        ]
      };
      return errorFallbackQuestions[language] || errorFallbackQuestions['zh-TW'];
    }
  }
  
  /**
   * 處理對話訊息
   */
  async chat(message, chatHistory, analysisContext, uploadedFiles = [], language = 'zh-TW') {
    try {
      console.log(`💬 Processing chat message in ${language}: "${message.substring(0, 50)}..."`);
      console.log(`📁 Files uploaded: ${uploadedFiles.length}`);
      console.log(`📜 Chat history length: ${chatHistory.length}`);
      
      // 準備檔案內容
      const fileParts = await this.prepareFileContents(uploadedFiles);
      
      // 構建對話提示詞（包含語言參數）
      const systemPrompt = this.buildChatPrompt(analysisContext, chatHistory, language);
      
      // 準備對話內容
      const contentParts = [
        { text: systemPrompt },
        ...fileParts
      ];
      
      if (message) {
        const userQuestionLabels = {
          'zh-TW': '用戶問題',
          'en': 'User Question',
          'vi': 'Câu hỏi của người dùng'
        };
        const label = userQuestionLabels[language] || userQuestionLabels['zh-TW'];
        contentParts.push({ text: `\n\n${label}：${message}` });
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
      const errorMessages = {
        'zh-TW': '對話處理失敗',
        'en': 'Chat processing failed',
        'vi': 'Xử lý trò chuyện thất bại'
      };
      const errorMsg = errorMessages[language] || errorMessages['zh-TW'];
      throw new Error(`${errorMsg}: ${error.message}`);
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
  buildChatPrompt(analysisContext, chatHistory, language = 'zh-TW') {
    // 根據語言選擇角色描述和指示
    const roleDescriptions = {
      'zh-TW': '你是一位專業的廣告策略顧問，專門幫助客戶優化廣告投放策略和提升廣告效果。',
      'en': 'You are a professional advertising strategy consultant who specializes in helping clients optimize their advertising delivery strategies and improve advertising effectiveness.',
      'vi': 'Bạn là một chuyên gia tư vấn chiến lược quảng cáo chuyên nghiệp, chuyên giúp khách hàng tối ưu hóa chiến lược phân phối quảng cáo và cải thiện hiệu quả quảng cáo.'
    };
    
    const backgroundLabels = {
      'zh-TW': '【背景資訊 - 之前的廣告分析】',
      'en': '【Background Information - Previous Advertising Analysis】',
      'vi': '【Thông tin nền - Phân tích quảng cáo trước đó】'
    };
    
    const historyLabels = {
      'zh-TW': '【對話歷史】',
      'en': '【Conversation History】',
      'vi': '【Lịch sử hội thoại】'
    };
    
    const instructionsText = {
      'zh-TW': `請基於以上背景資訊和對話歷史，為用戶提供專業、具體、可執行的廣告策略建議。回覆時請：
1. 針對用戶的具體問題給出清晰的答案
2. 提供實用的數據和案例支持
3. 給出可執行的下一步行動建議
4. 請務必使用繁體中文回答`,
      'en': `Based on the above background information and conversation history, please provide professional, specific, and actionable advertising strategy recommendations to users. When responding, please:
1. Provide clear answers to users' specific questions
2. Provide practical data and case support
3. Give executable next-step action recommendations
4. Please answer in English`,
      'vi': `Dựa trên thông tin nền và lịch sử hội thoại ở trên, vui lòng cung cấp các khuyến nghị chiến lược quảng cáo chuyên nghiệp, cụ thể và khả thi cho người dùng. Khi trả lời, vui lòng:
1. Đưa ra câu trả lời rõ ràng cho các câu hỏi cụ thể của người dùng
2. Cung cấp hỗ trợ dữ liệu và trường hợp thực tế
3. Đưa ra các khuyến nghị hành động tiếp theo có thể thực hiện được
4. Vui lòng trả lời bằng tiếng Việt`
    };
    
    let prompt = `${roleDescriptions[language] || roleDescriptions['zh-TW']}\n\n`;
    
    // 如果有分析上下文，加入背景資訊
    if (analysisContext) {
      prompt += `${backgroundLabels[language] || backgroundLabels['zh-TW']}\n`;
      if (analysisContext.brandNeedSummary) {
        prompt += `Brand Need Summary: ${analysisContext.brandNeedSummary.substring(0, 300)}...\n\n`;
      }
      if (analysisContext.performanceInsight) {
        prompt += `Performance Insight: ${analysisContext.performanceInsight.substring(0, 300)}...\n\n`;
      }
      if (analysisContext.creativeStrategy) {
        prompt += `Creative Strategy: ${analysisContext.creativeStrategy.substring(0, 300)}...\n\n`;
      }
    }
    
    // 加入對話歷史（最近5輪）
    if (chatHistory && chatHistory.length > 0) {
      prompt += `${historyLabels[language] || historyLabels['zh-TW']}\n`;
      const recentHistory = chatHistory.slice(-10); // 最近5輪（10條訊息）
      const roleLabels = {
        'zh-TW': { user: '用戶', assistant: 'AI顧問' },
        'en': { user: 'User', assistant: 'AI Advisor' },
        'vi': { user: 'Người dùng', assistant: 'Cố vấn AI' }
      };
      const labels = roleLabels[language] || roleLabels['zh-TW'];
      
      recentHistory.forEach(msg => {
        const role = msg.role === 'user' ? labels.user : labels.assistant;
        prompt += `${role}: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}\n`;
      });
      prompt += `\n`;
    }
    
    prompt += instructionsText[language] || instructionsText['zh-TW'];
    
    return prompt;
  }
}

module.exports = ChatAdvisor;
