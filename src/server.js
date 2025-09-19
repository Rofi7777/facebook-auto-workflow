const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs-extra');

dotenv.config();

// Brand configuration from environment variables
const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || '/brand';
const BRAND_CONFIG = {
  name: process.env.BRAND_NAME || 'BabyToyBrand',
  slogan: process.env.BRAND_SLOGAN || 'Discover the wonderful world together every day',
  logoPath: process.env.BRAND_LOGO_PATH || `${ASSETS_BASE_URL}/logo.png`
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

// Brand configuration endpoint
app.get('/api/config', (req, res) => {
  res.json({
    brand: BRAND_CONFIG,
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
    ]
  });
});

// Facebook workflow endpoints
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      filename: req.file.filename,
      path: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
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