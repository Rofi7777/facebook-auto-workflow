const { GoogleGenAI } = require('@google/genai');
const path = require('path');
const fs = require('fs-extra');

class CourseGeneratorService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: apiKey });
    this.primaryModel = 'gemini-3-pro-preview'; // Upgraded to Gemini 3 Pro for advanced text reasoning
    this.imageModel = 'gemini-2.5-flash-image-preview'; // Stable Replit-supported image model
    console.log(`📚 CourseGenerator initialized with model: ${this.primaryModel}`);
    console.log(`🎨 Image generation model: ${this.imageModel}`);
  }

  // 根據課程參數生成完整課程內容
  async generateCourseContent(params) {
    const {
      targetAge,
      category,
      topic,
      duration,
      style,
      outputTypes,
      language,
      includeImages
    } = params;

    try {
      console.log('📝 Generating course content with params:', params);

      // 構建課程生成的提示詞
      const prompt = this.buildCoursePrompt(params);
      
      // 調用AI生成課程內容
      const response = await this.ai.models.generateContent({
        model: this.primaryModel,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const generatedText = response.candidates[0].content.parts
        .filter(part => part.text)
        .map(part => part.text)
        .join('\n');

      // 解析生成的內容
      const courseData = this.parseCourseContent(generatedText, params);

      // 如果需要圖片，生成相關插圖
      if (includeImages === 'yes') {
        courseData.images = await this.generateCourseImages(courseData, params);
      }

      return courseData;
    } catch (error) {
      console.error('❌ Course generation failed:', error);
      throw new Error(`Course generation failed: ${error.message}`);
    }
  }

  // 構建課程生成提示詞
  buildCoursePrompt(params) {
    const {
      targetAge,
      category,
      topic,
      duration,
      style,
      outputTypes,
      language
    } = params;

    // 計算內容量（根據時長）
    const contentDepth = this.calculateContentDepth(duration);

    // 語言設定
    const languageInstruction = this.getLanguageInstruction(language);

    // 輸出格式要求
    const formatRequirements = this.getFormatRequirements(outputTypes);

    const prompt = `You are an expert curriculum designer and educator. Please create comprehensive educational course content based on the following requirements:

**Target Audience:**
- Age Group: ${targetAge} years old
- Category: ${category}
- Topic: ${topic}

**Course Parameters:**
- Duration: ${duration} minutes
- Teaching Style: ${style}
- Content Depth: ${contentDepth}

**Output Requirements:**
${formatRequirements}

**Language Requirements:**
${languageInstruction}

**Content Structure Required:**

1. **學習目標 (Learning Objectives)**
   - Clear, measurable learning outcomes appropriate for age group
   - Age-appropriate developmental goals
   - Skills and knowledge to be acquired

2. **課程流程 (Lesson Flow)**
   - Detailed timeline breakdown for ${duration} minutes
   - Each activity with estimated time
   - Transition strategies between activities

3. **活動設計 (Activity Design)**
   - ${contentDepth.activityCount} engaging activities
   - Hands-on, age-appropriate learning experiences
   - Clear instructions for implementation

4. **情境故事 (Story Context)** ${style.includes('Story') || style.includes('故事') ? '(REQUIRED - Make this engaging and vivid)' : '(If applicable)'}
   - Engaging narrative to introduce concepts
   - Age-appropriate storytelling
   - Connect story to learning objectives

5. **提問引導 (Guiding Questions)**
   - Open-ended questions to promote thinking
   - Age-appropriate inquiry prompts
   - Questions that check understanding

6. **評量方式 (Assessment Methods)**
   - Formative assessment strategies
   - Age-appropriate evaluation methods
   - Observable indicators of learning

7. **家庭延伸活動 (Home Extension Activities)**
   - Parent-child activities
   - Materials easily available at home
   - Connection to lesson concepts

8. **教材建議 (Materials & Resources)**
   - Required materials list
   - Optional enrichment resources
   - Safety considerations

${outputTypes.includes('worksheet') ? `
9. **練習題 (Worksheet Questions)**
   - ${this.getWorksheetRequirements(category, targetAge)}
` : ''}

${outputTypes.includes('slides') ? `
10. **簡報大綱 (Slides Outline)**
   - Slide-by-slide content structure
   - Key visuals and talking points
   - Engaging presentation flow
` : ''}

**Special Requirements:**
- Align with ${style} pedagogical approach
- Appropriate for ${targetAge}-year-old developmental stage
- Interactive and engaging for young learners
- Include safety considerations throughout
- Culturally inclusive and diverse examples

Please provide comprehensive, practical, and immediately usable course content. Format the response with clear headers and sections for easy reading.`;

    return prompt;
  }

  // 計算內容深度（根據時長）
  calculateContentDepth(duration) {
    const durationNum = parseInt(duration);
    
    if (durationNum <= 30) {
      return {
        activityCount: '1-2',
        depth: 'focused single-topic exploration',
        description: '短時專注單一主題'
      };
    } else if (durationNum <= 60) {
      return {
        activityCount: '2-3',
        depth: 'balanced multi-activity session with reflection',
        description: '平衡多活動課程加總結'
      };
    } else {
      return {
        activityCount: '3-4',
        depth: 'comprehensive multi-activity session with project',
        description: '完整多活動課程含小專案'
      };
    }
  }

  // 語言設定
  getLanguageInstruction(language) {
    const languageMap = {
      'chinese': 'All content MUST be in Traditional Chinese (繁體中文)',
      'english': 'All content MUST be in English',
      'vietnamese': 'All content MUST be in Vietnamese (Tiếng Việt)',
      'chinese-english': 'All content MUST be bilingual with Traditional Chinese first, then English translation in parentheses',
      'english-vietnamese': 'All content MUST be bilingual with English first, then Vietnamese translation in parentheses',
      'trilingual': 'All content MUST be trilingual with Traditional Chinese, English, and Vietnamese in that order'
    };

    return languageMap[language] || languageMap['chinese'];
  }

  // 輸出格式要求
  getFormatRequirements(outputTypes) {
    const formats = [];
    
    if (outputTypes.includes('outline')) {
      formats.push('- Course Outline (課綱): High-level overview and structure');
    }
    if (outputTypes.includes('lessonPlan')) {
      formats.push('- Detailed Lesson Plan (教案): Complete teaching guide with timing');
    }
    if (outputTypes.includes('story')) {
      formats.push('- Story-based Content (故事內容): Engaging narrative for learning');
    }
    if (outputTypes.includes('worksheet')) {
      formats.push('- Worksheet (練習題): Practice questions and activities');
    }
    if (outputTypes.includes('slides')) {
      formats.push('- Slides Script (簡報文字稿): Presentation outline and talking points');
    }

    return formats.join('\n');
  }

  // 獲取練習題要求（根據科別）
  getWorksheetRequirements(category, targetAge) {
    const age = parseInt(targetAge.split('-')[0]);
    const worksheetMap = {
      'social': `Age-appropriate social awareness questions, matching activities, role-play scenarios`,
      'science': `Observation questions, simple experiments, prediction activities, science vocabulary`,
      'math': `Number recognition, counting, simple calculation, shape identification, pattern matching (difficulty suitable for ${age}-year-olds)`,
      'language': `Vocabulary building, reading comprehension, writing practice, listening activities`,
      'art': `Creative expression prompts, color identification, drawing activities, art appreciation`
    };

    return worksheetMap[category.toLowerCase()] || 'Age-appropriate practice questions and hands-on activities';
  }

  // 解析AI生成的內容
  parseCourseContent(generatedText, params) {
    return {
      title: `${params.topic} - ${params.category} Course for Ages ${params.targetAge}`,
      parameters: params,
      content: generatedText,
      generatedAt: new Date().toISOString(),
      sections: this.extractSections(generatedText)
    };
  }

  // 提取內容中的各個部分
  extractSections(text) {
    const sections = {};
    const sectionRegex = /(?:^|\n)(#{1,3})\s*([^\n]+)\n([\s\S]*?)(?=\n#{1,3}\s|$)/g;
    let match;

    while ((match = sectionRegex.exec(text)) !== null) {
      const [, level, title, content] = match;
      sections[title.trim()] = {
        level: level.length,
        content: content.trim()
      };
    }

    return sections;
  }

  // 生成課程相關插圖
  async generateCourseImages(courseData, params) {
    try {
      console.log('🎨 Generating course illustrations...');
      
      const images = [];
      const imagePrompts = this.createImagePrompts(courseData, params);

      // 為每個提示詞生成圖片
      for (let i = 0; i < Math.min(imagePrompts.length, 3); i++) {
        try {
          const prompt = imagePrompts[i];
          console.log(`🎨 Generating image ${i + 1}/3 with prompt:`, prompt.substring(0, 100) + '...');
          
          const imagePath = `assets/courses/${Date.now()}_image_${i + 1}.png`;
          
          const response = await this.ai.models.generateContent({
            model: this.imageModel,
            contents: [{ 
              role: 'user', 
              parts: [{ text: prompt }] 
            }],
            generationConfig: {
              responseMimeType: 'image/png',
              maxOutputTokens: 2048
            }
          });

          console.log(`📥 API response received for image ${i + 1}`);
          console.log('Response structure:', JSON.stringify({
            hasCandidates: !!response.candidates,
            candidatesLength: response.candidates?.length,
            hasContent: !!response.candidates?.[0]?.content,
            partsLength: response.candidates?.[0]?.content?.parts?.length
          }));

          // 檢查是否有圖片生成
          if (!response.candidates || !response.candidates[0]) {
            console.error(`❌ No candidates in response for image ${i + 1}`);
            continue;
          }

          const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);
          
          if (imagePart && imagePart.inlineData) {
            const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64');
            
            // 確保目錄存在
            await fs.ensureDir(path.dirname(imagePath));
            await fs.writeFile(imagePath, imageBuffer);
            
            console.log(`✅ Course image ${i + 1} generated: ${imagePath}`);
            
            images.push({
              path: imagePath,
              prompt: prompt,
              downloadUrl: `/api/download-image?path=${encodeURIComponent(imagePath)}`
            });
          } else {
            console.error(`❌ No inline image data found in response for image ${i + 1}`);
            console.log('Parts:', JSON.stringify(response.candidates[0].content.parts));
          }
        } catch (imageError) {
          console.error(`❌ Failed to generate image ${i + 1}:`, imageError.message);
          console.error('Full error:', imageError);
        }
      }

      return images;
    } catch (error) {
      console.error('❌ Image generation failed:', error);
      return [];
    }
  }

  // 創建圖片生成提示詞
  createImagePrompts(courseData, params) {
    const { topic, category, targetAge, style } = params;
    
    const prompts = [
      // 主要教學場景
      `Create an educational illustration for a ${category} lesson about "${topic}" for ${targetAge}-year-old children. 
Style: ${style}. Show children engaged in learning activities in a bright, colorful classroom setting. 
Warm, friendly atmosphere with educational elements. Professional children's book illustration style.`,
      
      // 概念視覺化
      `Create a simple, colorful diagram illustrating the concept of "${topic}" for ${targetAge}-year-old children. 
Child-friendly graphics, large clear elements, minimal text. Educational poster style suitable for ${category} learning.`,
      
      // 活動場景
      `Create an illustration showing hands-on learning activities related to "${topic}" for ${targetAge}-year-olds. 
Show children exploring, discovering, and learning together. ${style} approach. 
Inclusive, diverse children, safe learning environment, bright colors.`
    ];

    return prompts;
  }
}

module.exports = CourseGeneratorService;
