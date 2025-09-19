const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs-extra');
const GeminiAIService = require('./services/geminiAI');
const { PLATFORM_CONFIGS, CONTENT_TEMPLATES, BABY_TOY_CATEGORIES } = require('./schemas/platforms');

dotenv.config();

// Initialize AI service
const aiService = new GeminiAIService();

// Brand configuration from environment variables
const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || '/brand';
const BRAND_CONFIG = {
  name: process.env.BRAND_NAME || 'Googoogaga',
  slogan: process.env.BRAND_SLOGAN || 'Cùng bé khám phá thế giới diệu kỳ mỗi ngày',
  logoPath: process.env.BRAND_LOGO_PATH || `${ASSETS_BASE_URL}/googoogaga-logo.png`
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/assets', express.static('assets'));

// Configure multer for file uploads with security validation
const upload = multer({
  dest: 'assets/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: `${BRAND_CONFIG.name} Facebook Auto Workflow API is running` });
});

// Brand configuration endpoint with multi-platform support
app.get('/api/config', (req, res) => {
  res.json({
    brand: BRAND_CONFIG,
    platforms: Object.keys(PLATFORM_CONFIGS).map(key => ({
      value: key,
      label: PLATFORM_CONFIGS[key].displayName,
      description: PLATFORM_CONFIGS[key].description
    })),
    campaignTypes: [
      { value: 'new-toy', label: '新玩具上市 (New Toy Launch)' },
      { value: 'educational', label: '教育學習 (Educational)' },
      { value: 'safety-first', label: '安全第一 (Safety First)' },
      { value: 'developmental', label: '發展成長 (Developmental)' },
      { value: 'seasonal', label: '季節限定 (Seasonal)' }
    ],
    templateStyles: [
      { value: 'gentle', label: '溫和柔軟 (Gentle)' },
      { value: 'playful', label: '活潑可愛 (Playful)' },
      { value: 'educational', label: '教育啟發 (Educational)' },
      { value: 'trustworthy', label: '值得信賴 (Trustworthy)' }
    ],
    contentTemplates: Object.keys(CONTENT_TEMPLATES).map(key => ({
      value: key,
      label: CONTENT_TEMPLATES[key].name,
      structure: CONTENT_TEMPLATES[key].structure
    })),
    categories: Object.keys(BABY_TOY_CATEGORIES).map(key => ({
      value: key,
      label: BABY_TOY_CATEGORIES[key].name
    }))
  });
});

// Multi-platform workflow endpoints
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      path: req.file.path,
      url: `/assets/uploads/${req.file.filename}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// AI-powered product analysis endpoint
app.post('/api/analyze-product', async (req, res) => {
  try {
    const { imagePath, productInfo } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'Image path is required' });
    }

    // Security: Validate imagePath is within uploads directory
    const uploadsDir = path.resolve('assets/uploads');
    const resolvedImagePath = path.resolve(imagePath);
    
    if (!resolvedImagePath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Invalid image path' });
    }
    
    // Check if file exists
    if (!fs.existsSync(resolvedImagePath)) {
      return res.status(400).json({ error: 'Image file not found' });
    }

    console.log('Analyzing product image:', resolvedImagePath);
    
    // Analyze product image with AI
    const productAnalysis = await aiService.analyzeProductImage(resolvedImagePath);
    console.log('Product analysis completed:', productAnalysis);
    
    // Identify pain points and scenarios
    const painPointsAnalysis = await aiService.identifyPainPointsAndScenarios(productAnalysis);
    console.log('Pain points analysis completed');
    
    res.json({
      success: true,
      message: 'Product analysis completed',
      productAnalysis,
      painPointsAnalysis
    });
  } catch (error) {
    console.error('Product analysis error:', error);
    res.status(500).json({ 
      error: 'Product analysis failed: ' + error.message,
      fallback: 'Using fallback analysis mode'
    });
  }
});

// Multi-platform content generation endpoint
app.post('/api/generate-platform-content', async (req, res) => {
  try {
    const { 
      productInfo, 
      painPointsAnalysis, 
      platforms = ['shopee', 'tiktok', 'instagram', 'facebook'], 
      language = 'zh-TW',
      generateImages = false
    } = req.body;
    
    console.log('Generating content for platforms:', platforms);
    
    const results = {};
    
    // Generate content for all platforms in parallel for better performance
    const platformPromises = platforms.map(async (platform) => {
      try {
        console.log(`Generating content for ${platform}`);
        const content = await aiService.generatePlatformContent(
          productInfo, 
          painPointsAnalysis, 
          platform, 
          language
        );
        
        const platformResult = {
          content,
          platformConfig: PLATFORM_CONFIGS[platform],
          status: 'success'
        };
        
        // Generate platform-specific images if requested
        if (generateImages && content.imagePrompt) {
          try {
            const imagePrompt = aiService.generateImagePrompt(platform, productInfo, content);
            const imagePath = `assets/generated/${platform}_${Date.now()}.png`;
            
            console.log(`Generating image for ${platform}:`, imagePrompt);
            const generatedImagePath = await aiService.generateMarketingImage(imagePrompt, imagePath);
            
            // Note: Currently returns image description instead of actual image
            platformResult.generatedImageDescription = generatedImagePath;
            platformResult.imagePrompt = imagePrompt;
            platformResult.imageNote = "圖片描述已生成，需要圖像生成服務來創建實際圖片";
          } catch (imageError) {
            console.error(`Image generation failed for ${platform}:`, imageError);
            platformResult.imageError = imageError.message;
          }
        }
        
        return { platform, result: platformResult };
        
      } catch (contentError) {
        console.error(`Content generation failed for ${platform}:`, contentError);
        return {
          platform,
          result: {
            status: 'error',
            error: contentError.message,
            fallback: getFallbackContent(platform, productInfo, language)
          }
        };
      }
    });
    
    // Wait for all platform content generation to complete
    const platformResults = await Promise.all(platformPromises);
    
    // Organize results by platform
    platformResults.forEach(({ platform, result }) => {
      results[platform] = result;
    });
    
    res.json({
      success: true,
      message: 'Multi-platform content generated',
      results,
      brand: BRAND_CONFIG.name,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Multi-platform content generation error:', error);
    res.status(500).json({ error: 'Content generation failed: ' + error.message });
  }
});

// Baby toy brand fallback functions  
function fallbackVI(productName) {
  return `${BRAND_CONFIG.slogan} – ${productName} nhỏ gọn, an toàn và đáng yêu! 

🧸 Sản phẩm được thiết kế đặc biệt cho sự phát triển của bé
🛡️ An toàn tuyệt đối với chất liệu không độc hại  
🎨 Kích thích trí tưởng tượng và sự sáng tạo
📚 Hỗ trợ học tập qua vui chơi

${BRAND_CONFIG.slogan}

#${BRAND_CONFIG.name} #ĐồChơiThôngMinh #AnToànChoBé #KhámPháThếGiới`;
}

function fallbackTW(productName) {
  return `陪寶貝一起探索奇幻世界 – ${productName} 小巧、安全又可愛！

🧸 專為寶寶發展設計的優質玩具
🛡️ 使用無毒安全材質，父母最安心
🎨 啟發想像力與創造力的最佳夥伴  
📚 寓教於樂，快樂學習每一天

${BRAND_CONFIG.slogan} ✨

#${BRAND_CONFIG.name} #益智玩具 #安全第一 #寶寶成長`;
}

app.post('/api/generate-workflow', (req, res) => {
  try {
    const { productName, campaign, template, language = 'bilingual' } = req.body;
    
    // Generate bilingual content
    const content = {
      vi: fallbackVI(productName),
      zhTW: fallbackTW(productName),
      combined: `${fallbackVI(productName)}\n\n---\n\n${fallbackTW(productName)}`
    };
    
    // Enhanced workflow generation logic for baby toy brand
    const workflow = {
      id: Date.now().toString(),
      brand: BRAND_CONFIG.name,
      productName,
      campaign,
      template,
      language,
      content,
      designBrief: getDesignBrief(template),
      createdAt: new Date().toISOString(),
      status: 'created'
    };
    
    res.json({
      success: true,
      message: `${BRAND_CONFIG.name} workflow generated successfully`,
      workflow
    });
  } catch (error) {
    res.status(500).json({ error: 'Workflow generation failed: ' + error.message });
  }
});

// Fallback content generation for when AI fails
function getFallbackContent(platform, productInfo, language) {
  const productName = productInfo?.productType || productInfo?.name || '嬰幼兒玩具';
  
  const fallbacks = {
    shopee: {
      'zh-TW': `🎉 ${productName} 限時特價！

🧸 優質嬰幼兒玩具，安全無毒材質
🛡️ 通過安全認證，父母安心首選  
🎨 啟發寶寶創造力和想像力
📚 寓教於樂，快樂學習成長

💰 現在下單享優惠價
🚚 快速出貨，品質保證

#${BRAND_CONFIG.name} #嬰幼兒玩具 #安全認證 #教育玩具`,
      'vi': `🎉 ${productName} giá đặc biệt!

🧸 Đồ chơi chất lượng cao cho trẻ em
🛡️ Chất liệu an toàn, không độc hại
🎨 Kích thích sáng tạo và tưởng tượng  
📚 Học mà chơi, vui mà học

#${BRAND_CONFIG.name} #ĐồChơiAnToàn #GiáTốt`
    },
    tiktok: {
      'zh-TW': `這個玩具太棒了！🤩

寶寶玩得超開心 ✨
安全材質媽媽放心 💕
教育功能一級棒 📚

你家寶貝也需要嗎？ 
#育兒好物 #${BRAND_CONFIG.name}`,
      'vi': `Đồ chơi này quá tuyệt! 🤩

Bé chơi siêu vui ✨  
Chất liệu an toàn 💕
Giáo dục tốt 📚

#${BRAND_CONFIG.name} #ĐồChơiTuyệt`
    },
    instagram: {
      'zh-TW': `✨ 每個孩子都值得最好的

當看到寶貝專注玩耍的模樣，那份純真的快樂就是我們最大的幸福 💕

${productName} - 不只是玩具，更是陪伴成長的好夥伴

#親子時光 #${BRAND_CONFIG.name} #寶寶成長 #優質玩具`,
      'vi': `✨ Mỗi em bé đều xứng đáng có những điều tốt nhất

Khi thấy bé chăm chú chơi đùa, niềm vui trong sáng ấy chính là hạnh phúc lớn nhất của chúng ta 💕

#${BRAND_CONFIG.name} #ThờiGianGiaDình`
    }
  };
  
  return fallbacks[platform]?.[language] || fallbacks[platform]?.['zh-TW'] || `${productName} - ${BRAND_CONFIG.slogan}`;
}

// Get design brief based on template
function getDesignBrief(template) {
  const briefs = {
    'gentle': {
      style: "Soft, pastel colors with rounded corners and gentle shadows",
      bg: "Gradient from soft sky blue to powder pink with subtle star elements",
      mood: "溫和柔軟 - nurturing and calm"
    },
    'playful': {
      style: "Bright, cheerful colors with dynamic shapes and playful elements", 
      bg: "Colorful rainbow gradient with floating toy elements",
      mood: "活潑可愛 - fun and energetic"
    },
    'educational': {
      style: "Clean, modern design emphasizing learning benefits",
      bg: "Light blue gradient with geometric learning elements",
      mood: "教育啟發 - learning focused"
    },
    'trustworthy': {
      style: "Professional, clean design with emphasis on safety",
      bg: "Subtle white-to-blue gradient with quality badges",
      mood: "值得信賴 - reliable and safe"
    }
  };
  
  return briefs[template] || briefs['gentle'];
}

// Start server - CRITICAL: Must bind to 0.0.0.0 for Replit
app.listen(PORT, '0.0.0.0', () => {
  console.log(`${BRAND_CONFIG.name} Facebook Auto Workflow server running on http://0.0.0.0:${PORT}`);
  console.log(`Ready to generate ${BRAND_CONFIG.name} Facebook promotional materials for babies!`);
});