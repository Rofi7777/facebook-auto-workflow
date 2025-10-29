const { GoogleGenAI } = require('@google/genai');
const fs = require('fs-extra');
const path = require('path');

class AdsAnalyzer {
  constructor() {
    // Use the same API key retrieval pattern as other services
    const apiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not found, AdsAnalyzer may not function');
      // Don't throw error during initialization, allow graceful degradation
    }
    
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.modelName = 'gemini-2.5-flash'; // Primary model
    this.fallbackModel = 'gemini-2.0-flash-exp'; // Fallback model
    
    console.log('🚀 AdsAnalyzer initialized with model:', this.modelName);
    console.log('✅ AdsAnalyzer service initialized successfully');
  }
  
  /**
   * 分析廣告資料並生成專業報告
   */
  async analyzeAds(data) {
    try {
      const { brandName, productName, coreProduct, targetMarket, platforms, uploadedFiles } = data;
      
      console.log(`📊 Starting ads analysis for brand: ${brandName}, product: ${productName}`);
      console.log(`📁 Uploaded files: ${uploadedFiles.length}`);
      console.log(`🎯 Target platforms: ${platforms.join(', ')}`);
      
      // 準備檔案內容給 AI（實際讀取檔案並轉換為 AI 可處理的格式）
      const fileParts = await this.prepareFileContents(uploadedFiles);
      
      // 構建 AI 分析提示詞
      const prompt = this.buildAnalysisPrompt(brandName, productName, coreProduct, targetMarket, platforms, uploadedFiles);
      
      // 準備 AI 請求的 parts（包含文字提示和檔案內容）
      const contentParts = [
        { text: prompt },
        ...fileParts
      ];
      
      console.log(`🤖 Sending ${fileParts.length} file(s) to AI for analysis...`);
      
      // 調用 AI 生成分析報告（包含實際檔案內容）
      const result = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [{
          role: 'user',
          parts: contentParts
        }]
      });
      
      const analysisText = result.candidates[0].content.parts[0].text;
      
      console.log('✅ AI analysis completed');
      
      // 解析 AI 回應，提取五大報告區塊
      const parsedReport = this.parseAnalysisReport(analysisText);
      
      return {
        success: true,
        ...parsedReport,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ Ads analysis error:', error);
      throw new Error(`廣告分析失敗: ${error.message}`);
    }
  }
  
  /**
   * 準備檔案內容給 AI 分析（實際讀取檔案並轉換格式）
   */
  async prepareFileContents(uploadedFiles) {
    const fileParts = [];
    
    for (const file of uploadedFiles) {
      try {
        const filePath = file.path;
        const mimeType = file.mimetype;
        
        // 處理圖片檔案 - 使用 base64 編碼
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
          
        } else if (mimeType === 'application/pdf') {
          // PDF 檔案 - 提供檔案描述（Gemini 可能支援 PDF，但為了穩定性我們提供描述）
          console.log(`📕 PDF file detected: ${file.filename}`);
          fileParts.push({
            text: `\n[PDF 文件: ${file.filename}]\n分析者注意：用戶上傳了 PDF 廣告文件 "${file.filename}"，請根據此檔案可能包含的廣告數據、圖表、報告內容進行專業分析。`
          });
          
        } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
          // Excel 檔案
          console.log(`📊 Excel file detected: ${file.filename}`);
          fileParts.push({
            text: `\n[Excel 數據文件: ${file.filename}]\n分析者注意：用戶上傳了 Excel 廣告數據文件 "${file.filename}"，這可能包含廣告投放數據、CTR、CVR、ROAS 等效能指標。請根據此類數據文件的典型內容進行專業分析。`
          });
          
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
          // Word 檔案
          console.log(`📝 Word document detected: ${file.filename}`);
          fileParts.push({
            text: `\n[Word 文件: ${file.filename}]\n分析者注意：用戶上傳了 Word 廣告文件 "${file.filename}"，這可能包含廣告文案、創意簡報、策略文件等內容。請根據此文件進行專業分析。`
          });
          
        } else if (mimeType.includes('csv')) {
          // CSV 檔案 - 可以實際讀取內容
          console.log(`📊 CSV file detected: ${file.filename}`);
          try {
            const csvContent = await fs.readFile(filePath, 'utf-8');
            // 限制 CSV 內容長度避免過大
            const truncatedContent = csvContent.substring(0, 5000);
            fileParts.push({
              text: `\n[CSV 數據文件: ${file.filename}]\n文件內容預覽:\n${truncatedContent}\n${csvContent.length > 5000 ? '...(內容已截斷)' : ''}`
            });
          } catch (error) {
            console.warn(`⚠️ Failed to read CSV: ${error.message}`);
            fileParts.push({
              text: `\n[CSV 數據文件: ${file.filename}]\n分析者注意：用戶上傳了 CSV 數據文件，請根據此類數據文件的典型內容進行分析。`
            });
          }
          
        } else {
          // 其他未知類型
          console.log(`📄 Other file type detected: ${file.filename}`);
          fileParts.push({
            text: `\n[檔案: ${file.filename} (${mimeType})]\n分析者注意：用戶上傳了此檔案作為廣告素材的一部分，請將其納入分析考量。`
          });
        }
        
      } catch (error) {
        console.error(`❌ Error processing file ${file.filename}:`, error);
        // 即使某個檔案處理失敗，也繼續處理其他檔案
        fileParts.push({
          text: `\n[檔案處理錯誤: ${file.filename}]\n無法讀取此檔案，但請繼續分析其他可用資料。`
        });
      }
    }
    
    return fileParts;
  }
  
  /**
   * 構建 AI 分析提示詞
   */
  buildAnalysisPrompt(brandName, productName, coreProduct, targetMarket, platforms, uploadedFiles) {
    const filesInfo = uploadedFiles.length > 0 
      ? uploadedFiles.map((file, index) => `${index + 1}. ${file.filename} (${file.mimetype})`).join('\n')
      : '未上傳檔案';
    
    // 構建靈活的客戶資訊部分
    let clientInfo = '【客戶資訊】\n';
    if (brandName) clientInfo += `品牌名稱: ${brandName}\n`;
    if (productName) clientInfo += `產品名稱: ${productName}\n`;
    if (coreProduct) clientInfo += `核心產品: ${coreProduct}\n`;
    if (targetMarket) clientInfo += `目標市場: ${targetMarket}\n`;
    clientInfo += `目標平台: ${platforms.join(', ')}\n`;
    
    // 如果所有文字資訊都是空的，添加提示
    const hasTextInfo = brandName || productName || coreProduct || targetMarket;
    if (!hasTextInfo) {
      clientInfo += '\n⚠️ 注意：客戶未提供詳細的品牌或產品資訊，請主要根據上傳的檔案內容進行分析。\n';
    }
    
    return `你是一位專業的廣告策略顧問，專門為越南市場提供 AI 智能廣告分析。

${clientInfo}
【上傳的廣告資料檔案】
${filesInfo}

請根據以上可用資訊，為客戶提供五大專業分析報告。即使某些資訊未提供，請根據已有的資料（特別是上傳的檔案內容）進行專業推測和分析。每個報告都要具體、可執行、有洞察力：

## 1. Brand Need Summary (品牌需求摘要)
分析品牌的核心需求、市場定位和當前挑戰。包括：
- 品牌定位分析
- 核心競爭優勢
- 市場機會點
- 當前面臨的挑戰

## 2. Performance Insight (效能洞察)
基於廣告平台（${platforms.join(', ')}）的特性，提供效能分析和預測。包括：
- 預期 CTR (Click-Through Rate) 範圍
- 預期 CVR (Conversion Rate) 範圍
- 預期 ROAS (Return on Ad Spend) 評估
- 各平台效能對比建議

## 3. Creative Strategy (創意策略)
提供具體的創意方向和內容策略。包括：
- 主要創意方向（至少3個具體方向）
- 視覺風格建議
- 文案調性建議
- 越南市場文化考量

## 4. Optimization Plan (優化計劃)
提供分階段的廣告優化計劃。包括：
- 短期優化目標（1-2週）
- 中期優化目標（1-2個月）
- 長期優化目標（3-6個月）
- 各階段具體執行步驟

## 5. Advertising Review Report (廣告檢視報告)
綜合性的廣告執行建議。包括：
- 預算分配建議
- 投放時段建議
- 目標受眾細分建議
- 風險提示與注意事項

請用繁體中文和越南文雙語提供報告，格式清晰，重點突出。每個區塊都要有具體的數據或案例支持。

請按照以下格式輸出：

[BRAND_NEED_SUMMARY]
（這裡是品牌需求摘要內容）
[/BRAND_NEED_SUMMARY]

[PERFORMANCE_INSIGHT]
（這裡是效能洞察內容）
[/PERFORMANCE_INSIGHT]

[CREATIVE_STRATEGY]
（這裡是創意策略內容）
[/CREATIVE_STRATEGY]

[OPTIMIZATION_PLAN]
（這裡是優化計劃內容）
[/OPTIMIZATION_PLAN]

[ADVERTISING_REVIEW_REPORT]
（這裡是廣告檢視報告內容）
[/ADVERTISING_REVIEW_REPORT]`;
  }
  
  /**
   * 解析 AI 回應，提取五大報告區塊
   */
  parseAnalysisReport(analysisText) {
    const report = {
      brandNeedSummary: '',
      performanceInsight: '',
      creativeStrategy: '',
      optimizationPlan: '',
      advertisingReviewReport: ''
    };
    
    try {
      // 提取 Brand Need Summary
      const brandNeedMatch = analysisText.match(/\[BRAND_NEED_SUMMARY\]([\s\S]*?)\[\/BRAND_NEED_SUMMARY\]/);
      if (brandNeedMatch) {
        report.brandNeedSummary = brandNeedMatch[1].trim();
      }
      
      // 提取 Performance Insight
      const performanceMatch = analysisText.match(/\[PERFORMANCE_INSIGHT\]([\s\S]*?)\[\/PERFORMANCE_INSIGHT\]/);
      if (performanceMatch) {
        report.performanceInsight = performanceMatch[1].trim();
      }
      
      // 提取 Creative Strategy
      const creativeMatch = analysisText.match(/\[CREATIVE_STRATEGY\]([\s\S]*?)\[\/CREATIVE_STRATEGY\]/);
      if (creativeMatch) {
        report.creativeStrategy = creativeMatch[1].trim();
      }
      
      // 提取 Optimization Plan
      const optimizationMatch = analysisText.match(/\[OPTIMIZATION_PLAN\]([\s\S]*?)\[\/OPTIMIZATION_PLAN\]/);
      if (optimizationMatch) {
        report.optimizationPlan = optimizationMatch[1].trim();
      }
      
      // 提取 Advertising Review Report
      const reviewMatch = analysisText.match(/\[ADVERTISING_REVIEW_REPORT\]([\s\S]*?)\[\/ADVERTISING_REVIEW_REPORT\]/);
      if (reviewMatch) {
        report.advertisingReviewReport = reviewMatch[1].trim();
      }
      
      // 如果沒有正確解析到任何區塊，使用原始文本
      if (!report.brandNeedSummary && !report.performanceInsight && !report.creativeStrategy && 
          !report.optimizationPlan && !report.advertisingReviewReport) {
        console.warn('⚠️ Failed to parse structured report, using fallback');
        // 將整個回應分成五等份作為備用方案
        const sections = this.splitIntoSections(analysisText, 5);
        report.brandNeedSummary = sections[0] || analysisText;
        report.performanceInsight = sections[1] || '';
        report.creativeStrategy = sections[2] || '';
        report.optimizationPlan = sections[3] || '';
        report.advertisingReviewReport = sections[4] || '';
      }
      
    } catch (error) {
      console.error('❌ Error parsing analysis report:', error);
      // 發生錯誤時，將整個回應放在第一個區塊
      report.brandNeedSummary = analysisText;
    }
    
    return report;
  }
  
  /**
   * 將文本分割成指定數量的區塊（備用方案）
   */
  splitIntoSections(text, count) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    const sectionSize = Math.ceil(paragraphs.length / count);
    const sections = [];
    
    for (let i = 0; i < count; i++) {
      const start = i * sectionSize;
      const end = start + sectionSize;
      sections.push(paragraphs.slice(start, end).join('\n\n'));
    }
    
    return sections;
  }
}

module.exports = AdsAnalyzer;
