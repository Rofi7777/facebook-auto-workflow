const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs-extra');
const GeminiAIService = require('../src/services/geminiAI');
const ScenarioGeneratorService = require('../src/services/scenarioGenerator');
const AdsAnalyzer = require('../src/services/adsAnalyzer');
const ChatAdvisor = require('../src/services/chatAdvisor');
const CourseGeneratorService = require('../src/services/courseGenerator');
const DocumentExportService = require('../src/services/documentExport');
const SupabaseAuthService = require('../src/services/supabaseAuth');
const AdminService = require('../src/services/adminService');
const UserLearningService = require('../src/services/userLearningService');
const DatabaseAdminService = require('../src/services/databaseAdminService');
const { authMiddleware, optionalAuthMiddleware } = require('../src/middleware/authMiddleware');
const { requireAdmin, requireSuperAdmin, adminService } = require('../src/middleware/adminMiddleware');
const { PLATFORM_CONFIGS, CONTENT_TEMPLATES, BABY_TOY_CATEGORIES } = require('../src/schemas/platforms');

dotenv.config();

// Initialize Supabase Auth Service
let supabaseAuth;
try {
  supabaseAuth = new SupabaseAuthService();
} catch (error) {
  console.error('Failed to initialize Supabase Auth Service:', error);
  // Create a fallback service
  supabaseAuth = {
    isEnabled: () => true,
    signUp: async () => { throw new Error('Supabase not initialized'); },
    signIn: async () => { throw new Error('Supabase not initialized'); },
    signOut: async () => { throw new Error('Supabase not initialized'); },
    verifyToken: async () => { throw new Error('Supabase not initialized'); }
  };
}

// Initialize AI services with error handling
let aiService, scenarioService, adsAnalyzer, chatAdvisor, courseGenerator, documentExporter;
try {
const apiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
  aiService = new GeminiAIService();
  scenarioService = new ScenarioGeneratorService();
  adsAnalyzer = new AdsAnalyzer();
  chatAdvisor = new ChatAdvisor();
  courseGenerator = new CourseGeneratorService(apiKey);
  documentExporter = new DocumentExportService();
  console.log('✅ AI services initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize AI services:', error);
  // Services will be undefined, but we'll handle errors in routes
}

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
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));
app.use(express.static('public'));
app.use('/assets', express.static('assets'));

// Debug middleware - Log all incoming requests
app.use((req, res, next) => {
  console.log(`🔍 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Configure multer for multi-file uploads with security validation (Product Images)
// Note: In Vercel, we use /tmp for file uploads (temporary storage)
const upload = multer({
  dest: process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp/uploads/' : path.join(__dirname, '..', 'assets', 'uploads'),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed'), false);
    }
  }
});

// Configure multer for ads analysis files (images, PDF, Excel, Word, CSV)
const adsUpload = multer({
  dest: process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp/ads-uploads/' : path.join(__dirname, '..', 'assets', 'ads-uploads'),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept images, PDF, Excel, Word, CSV
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv', 'application/csv'
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支援 Image, PDF, Excel, Word, CSV 檔案'), false);
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/health', (req, res) => {
  try {
    res.json({ 
      status: 'OK', 
      message: `${BRAND_CONFIG.name} Facebook Auto Workflow API is running`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message 
    });
  }
});

// ==================== Authentication Routes ====================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!supabaseAuth || typeof supabaseAuth.signUp !== 'function') {
      return res.status(500).json({ error: 'Authentication service not available' });
    }

    const data = await supabaseAuth.signUp(email, password);
    console.log(`📧 New user signed up: ${email}`);

    res.json({
      success: true,
      message: 'Sign up successful. Please check your email for verification.',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Sign up error:', error.message);
    res.status(400).json({ error: error.message || 'Sign up failed' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!supabaseAuth || typeof supabaseAuth.signIn !== 'function') {
      return res.status(500).json({ error: 'Authentication service not available' });
    }

    const data = await supabaseAuth.signIn(email, password);
    console.log(`🔓 User signed in: ${email}`);

    res.json({
      success: true,
      message: 'Sign in successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Sign in error:', error.message);
    res.status(401).json({ error: error.message || 'Sign in failed' });
  }
});

app.post('/api/auth/signout', authMiddleware, async (req, res) => {
  try {
    console.log(`🔒 User signed out: ${req.user?.email}`);
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign out error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/user', authMiddleware, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userMetadata = req.user?.user_metadata || {};
    const role = await adminService.getUserRole(userEmail, userMetadata);
    
    res.json({
      success: true,
      user: {
        ...req.user,
        role: role,
        isAdmin: role === 'admin' || role === 'super_admin',
        isSuperAdmin: role === 'super_admin'
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const data = await supabaseAuth.refreshSession(refresh_token);

    res.json({
      success: true,
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await supabaseAuth.resetPassword(email);
    console.log(`📧 Password reset email sent to: ${email}`);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/status', (req, res) => {
  try {
    const enabled = supabaseAuth ? supabaseAuth.isEnabled() : false;
  res.json({
    enabled: enabled,
    message: enabled ? 'Authentication is enabled' : 'Authentication is disabled',
    requiresLogin: enabled
  });
  } catch (error) {
    console.error('Auth status error:', error);
    // 如果出错，默认返回认证已启用（安全起见）
    res.status(200).json({
      enabled: true,
      message: 'Authentication is enabled',
      requiresLogin: true
    });
  }
});

// ==================== End Authentication Routes ====================

// ==================== Admin Routes ====================

const adminServiceInstance = new AdminService();

app.get('/api/admin/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { users, error } = await adminServiceInstance.getAllUsers();
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Admin get users error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/pending', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { users, error } = await adminServiceInstance.getPendingUsers();
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Admin get pending users error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/users/:userId', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { user, error } = await adminServiceInstance.getUserById(userId);
    
    if (error) {
      return res.status(404).json({ success: false, error });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Admin get user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/users/:userId/approve', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminServiceInstance.approveUser(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`✅ User ${userId} approved by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Admin approve user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/users/:userId/suspend', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminServiceInstance.suspendUser(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`⏸️ User ${userId} suspended by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Admin suspend user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/users/:userId/promote', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminServiceInstance.promoteToAdmin(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`⬆️ User ${userId} promoted to admin by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Admin promote user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/users/:userId/demote', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminServiceInstance.demoteFromAdmin(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`⬇️ User ${userId} demoted from admin by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Admin demote user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/users/:userId', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminServiceInstance.deleteUser(userId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`🗑️ User ${userId} deleted by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/status', authMiddleware, requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      hasServiceKey: adminServiceInstance.hasServiceKey,
      enabled: adminServiceInstance.isEnabled(),
      isSuperAdmin: req.isSuperAdmin
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== Database Admin Routes ====================

app.get('/api/admin/db/tables', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await DatabaseAdminService.listTables();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('List tables error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/db/tables/:tableName/schema', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await DatabaseAdminService.getTableSchema(tableName);
    res.json({ success: true, tableName, ...result });
  } catch (error) {
    console.error('Get schema error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/db/tables/:tableName/rows', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { page = 1, pageSize = 50, orderBy, orderDir, ...filters } = req.query;
    
    const result = await DatabaseAdminService.fetchRows(tableName, {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      orderBy,
      orderDir,
      filters
    });
    
    res.json({ success: true, tableName, ...result });
  } catch (error) {
    console.error('Fetch rows error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/db/tables/:tableName/rows', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await DatabaseAdminService.insertRow(tableName, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`📝 Row inserted into ${tableName} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Insert row error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/db/tables/:tableName/rows/:rowId', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName, rowId } = req.params;
    const result = await DatabaseAdminService.updateRow(tableName, rowId, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`✏️ Row ${rowId} updated in ${tableName} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Update row error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/db/tables/:tableName/rows/:rowId', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName, rowId } = req.params;
    const result = await DatabaseAdminService.deleteRow(tableName, rowId);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`🗑️ Row ${rowId} deleted from ${tableName} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Delete row error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/db/tables/:tableName/rows/bulk-delete', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { rowIds } = req.body;
    
    if (!rowIds || !Array.isArray(rowIds) || rowIds.length === 0) {
      return res.status(400).json({ success: false, error: 'rowIds array required' });
    }
    
    const result = await DatabaseAdminService.deleteRows(tableName, rowIds);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`🗑️ ${rowIds.length} rows deleted from ${tableName} by ${req.user.email}`);
    res.json(result);
  } catch (error) {
    console.error('Bulk delete error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/db/sql', authMiddleware, requireSuperAdmin, async (req, res) => {
  try {
    const { sql } = req.body;
    
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, error: 'SQL query required' });
    }
    
    const result = await DatabaseAdminService.runSql(sql);
    
    console.log(`🔍 SQL executed by ${req.user.email}: ${sql.substring(0, 100)}...`);
    res.json(result);
  } catch (error) {
    console.error('SQL execution error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/db/tables/:tableName/export', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { tableName } = req.params;
    const { format = 'json' } = req.query;
    
    const result = await DatabaseAdminService.exportTable(tableName, format);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    console.log(`📤 Table ${tableName} exported as ${format} by ${req.user.email}`);
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.csv"`);
      res.send(result.data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${tableName}_export.json"`);
      res.json(result.data);
    }
  } catch (error) {
    console.error('Export error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/db/stats', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const result = await DatabaseAdminService.getStats();
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Stats error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/db/activity', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const result = await DatabaseAdminService.getRecentActivity(parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Activity error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== End Admin Routes ====================

// ==================== User Learning Routes ====================

app.post('/api/learning/track', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await UserLearningService.trackInteraction(userId, req.body);
    res.json({ success: true, interactionId: result?.id || null });
  } catch (error) {
    console.error('Track interaction error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/learning/feedback', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { interactionId, feedbackType, rating } = req.body;
    const result = await UserLearningService.recordFeedback(userId, interactionId, feedbackType, rating);
    res.json({ success: true, feedbackId: result?.id || null });
  } catch (error) {
    console.error('Record feedback error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/learning/preferences', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const preferences = await UserLearningService.getUserPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Get preferences error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/learning/data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await UserLearningService.deleteUserData(userId);
    res.json({ success: result, message: result ? 'All learning data deleted' : 'Failed to delete data' });
  } catch (error) {
    console.error('Delete learning data error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== End User Learning Routes ====================

// 安全的圖片下載端點 - 防止路徑遍歷攻擊
app.get('/api/download-image', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath || filePath === 'undefined') {
      console.log('🚨 Forbidden file access attempt:', filePath);
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // 定義安全的基礎目錄
    const baseDirs = {
      'assets/generated/': path.resolve(__dirname, '..', 'assets', 'generated'),
      'assets/scenarios/': path.resolve(__dirname, '..', 'assets', 'scenarios'),
      'assets/uploads/': path.resolve(__dirname, '..', 'assets', 'uploads'),
      'assets/exports/': path.resolve(__dirname, '..', 'assets', 'exports'),
      'assets/courses/': path.resolve(__dirname, '..', 'assets', 'courses')
    };
    
    // 驗證檔案路徑在允許的目錄內
    let allowedBaseDir = null;
    let resolvedFilePath = null;
    
    for (const [prefix, baseDir] of Object.entries(baseDirs)) {
      if (filePath.startsWith(prefix)) {
        resolvedFilePath = path.resolve(__dirname, '..', filePath);
        
        // 安全檢查：確保解析後的路徑仍在允許的基礎目錄內
        if (resolvedFilePath.startsWith(baseDir)) {
          allowedBaseDir = baseDir;
          break;
        }
      }
    }
    
    if (!allowedBaseDir || !resolvedFilePath) {
      console.warn(`🚨 Forbidden file access attempt: ${filePath}`);
      return res.status(403).json({ error: 'Access to this file is forbidden' });
    }
    
    // 異步檢查檔案是否存在並獲取統計資訊
    let stat;
    try {
      stat = await fs.stat(resolvedFilePath);
      if (!stat.isFile()) {
        return res.status(404).json({ error: 'Not a valid file' });
      }
    } catch (statError) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const fileExtension = path.extname(resolvedFilePath).toLowerCase();
    
    // 檔案類型白名單驗證（生產安全性）
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.md', '.txt'];
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(415).json({ error: 'File type not supported for download' });
    }
    
    // 設定適當的 Content-Type
    let contentType = 'application/octet-stream';
    if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.webp') {
      contentType = 'image/webp';
    } else if (fileExtension === '.md') {
      contentType = 'text/markdown';
    } else if (fileExtension === '.txt') {
      contentType = 'text/plain';
    }
    
    // 設定安全的下載標頭
    const fileName = path.basename(resolvedFilePath);
    const sanitizedFileName = fileName.replace(/[^\w\-_\.]/g, '_'); // 全局清理檔名
    
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // 傳送檔案
    const fileStream = fs.createReadStream(resolvedFilePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('File download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'File download failed' });
      }
    });
    
    console.log(`📥 Secure file download: ${sanitizedFileName} (${stat.size} bytes) from ${allowedBaseDir}`);
    
  } catch (error) {
    console.error('Download endpoint error:', error);
    res.status(500).json({ error: 'Download failed: ' + error.message });
  }
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
app.post('/api/upload-image', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }
    
    console.log(`📤 ${req.files.length} image(s) uploaded successfully`);
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      url: `/assets/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size
    }));
    
    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      files: uploadedFiles,
      paths: req.files.map(f => f.path), // For easy access to paths array
      filename: req.files[0].filename,   // For backward compatibility
      path: req.files[0].path,          // For backward compatibility
      url: `/assets/uploads/${req.files[0].filename}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// AI-powered product analysis endpoint - Support multiple images
app.post('/api/analyze-product', authMiddleware, async (req, res) => {
  console.log('📥 /api/analyze-product route hit');
  try {
    const { imagePath, imagePaths, productInfo } = req.body;
    
    // Support both single image path and multiple paths
    const pathsToAnalyze = imagePaths && imagePaths.length > 0 ? imagePaths : [imagePath];
    
    if (!pathsToAnalyze || pathsToAnalyze.length === 0 || pathsToAnalyze.every(p => !p)) {
      return res.status(400).json({ error: 'At least one image path is required' });
    }

    // Security: Validate all image paths are within uploads directory
    const uploadsDir = path.resolve('assets/uploads');
    const validatedPaths = [];
    
    for (const imgPath of pathsToAnalyze) {
      if (!imgPath) continue;
      
      const resolvedImagePath = path.resolve(imgPath);
      
      if (!resolvedImagePath.startsWith(uploadsDir)) {
        return res.status(400).json({ error: 'Invalid image path detected' });
      }
      
      // 異步檢查文件是否存在
      try {
        await fs.access(resolvedImagePath);
        validatedPaths.push(resolvedImagePath);
      } catch (accessError) {
        console.log(`⚠️ Image file not found: ${resolvedImagePath}`);
        // Continue with other images if one is missing
      }
    }
    
    if (validatedPaths.length === 0) {
      return res.status(400).json({ error: 'No valid image files found' });
    }

    console.log(`🖼️ Analyzing ${validatedPaths.length} product image(s):`, validatedPaths);
    
    // Get language and industry category from request
    const language = req.body.language || 'zh-TW';
    const industryCategory = productInfo?.industryCategory || 'mother-kids';
    console.log('🌐 Analysis request language:', language);
    console.log('🏭 Industry category:', industryCategory);
    
    // Check if aiService is initialized
    if (!aiService) {
      return res.status(500).json({ 
        error: 'AI service not available',
        message: 'AI service is not initialized. Please check GEMINI_API_KEY_NEW environment variable.'
      });
    }

    // Analyze product image(s) with AI
    const productAnalysis = await aiService.analyzeProductImage(validatedPaths, language, industryCategory);
    console.log('Product analysis completed:', productAnalysis);
    
    // Identify pain points and scenarios
    const painPointsAnalysis = await aiService.identifyPainPointsAndScenarios(productAnalysis, language);
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
      error: 'Product analysis failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// Multi-platform content generation endpoint
app.post('/api/generate-platform-content', authMiddleware, async (req, res) => {
  console.log('📥 /api/generate-platform-content route hit');
  try {
    const { 
      productInfo, 
      painPointsAnalysis, 
      platforms = ['shopee', 'tiktok', 'instagram', 'facebook'], 
      language = 'zh-TW',
      generateImages = false,
      scenarioType = '親子互動',
      productImagePath = null,
      modelNationality = 'taiwan',
      modelCombination = 'parents_baby',
      sceneLocation = 'park'
    } = req.body;
    
    console.log('Generating content for platforms:', platforms);
    
    // 安全性檢查：如果有 productImagePath，驗證路徑安全性
    let validatedProductImagePath = null;
    if (productImagePath) {
      try {
        const uploadsDir = path.resolve(__dirname, '..', 'assets', 'uploads');
        const resolvedImagePath = path.resolve(__dirname, '..', productImagePath);
        
        // 安全檢查：確保路徑在上傳目錄內
        if (resolvedImagePath.startsWith(uploadsDir)) {
          // 檢查文件是否存在
          await fs.access(resolvedImagePath);
          validatedProductImagePath = resolvedImagePath;
          console.log('Validated product image path for generation:', validatedProductImagePath);
        } else {
          console.warn('🚨 Invalid product image path (outside uploads directory):', productImagePath);
        }
      } catch (validationError) {
        console.warn('🚨 Product image validation failed:', validationError.message);
      }
    }
    
    // Check if aiService is initialized
    if (!aiService) {
      return res.status(500).json({ 
        error: 'AI service not available',
        message: 'AI service is not initialized. Please check GEMINI_API_KEY_NEW environment variable.'
      });
    }
    
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
        if (generateImages) {
          try {
            const imagePrompt = aiService.generateImagePrompt(platform, productInfo, content);
            const imagePath = `assets/generated/${platform}_${Date.now()}.png`;
            
            console.log(`Generating image for ${platform}:`, imagePrompt);
            const generatedImageResult = await aiService.generateMarketingImage(
              imagePrompt, 
              imagePath, 
              validatedProductImagePath, 
              scenarioType,
              modelNationality,
              modelCombination,
              sceneLocation
            );
            
            // Check if actual image was generated or just description
            if (generatedImageResult && generatedImageResult.type === 'image' && generatedImageResult.isRealImage) {
              platformResult.generatedImageDescription = "AI 生成的真實圖片";
              platformResult.path = generatedImageResult.path;
              platformResult.isRealImage = true;
              platformResult.downloadUrl = generatedImageResult.downloadUrl;
              platformResult.imageSize = generatedImageResult.size;
            } else {
              platformResult.generatedImageDescription = generatedImageResult;
              platformResult.isRealImage = false;
              platformResult.imageNote = "圖片描述已生成，需要圖像生成服務來創建實際圖片";
            }
            platformResult.imagePrompt = imagePrompt;
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

// Scene generation endpoint for creating marketing scenarios
app.post('/api/generate-scenarios', authMiddleware, async (req, res) => {
  try {
    const { 
      productInfo, 
      contentData, 
      productImagePath = null, 
      scenarioType = '親子互動',
      modelNationality = 'taiwan',
      modelCombination = 'parents_baby',
      sceneLocation = 'park'
    } = req.body;
    
    if (!productInfo || !contentData) {
      return res.status(400).json({ error: 'Product info and content data are required' });
    }

    console.log('Generating marketing scenarios for product:', productInfo);
    
    // 安全性檢查：如果有 productImagePath，驗證路徑安全性
    let validatedProductImagePath = null;
    if (productImagePath) {
      try {
        const uploadsDir = path.resolve(__dirname, '..', 'assets', 'uploads');
        const resolvedImagePath = path.resolve(__dirname, '..', productImagePath);
        
        // 安全檢查：確保路徑在上傳目錄內
        if (resolvedImagePath.startsWith(uploadsDir)) {
          // 檢查文件是否存在
          await fs.access(resolvedImagePath);
          validatedProductImagePath = resolvedImagePath;
          console.log('Validated product image path for scenarios:', validatedProductImagePath);
        } else {
          console.warn('🚨 Invalid product image path (outside uploads directory):', productImagePath);
        }
      } catch (validationError) {
        console.warn('🚨 Product image validation failed for scenarios:', validationError.message);
      }
    }
    
    // Generate three marketing scenarios
    const scenarios = await scenarioService.generateMarketingScenarios(productInfo, contentData, scenarioType);
    console.log('Scenarios generated successfully');
    
    // Generate detailed image descriptions for each scenario
    const scenariosWithImages = await Promise.all(
      scenarios.scenarios?.map(async (scenario, index) => {
        try {
          const imageDescription = await scenarioService.generateImageDescription(scenario, productInfo, scenarioType);
          const imagePath = `assets/scenarios/${Date.now()}_scenario_${index + 1}.png`;
          const scenarioImageResult = await scenarioService.generateScenarioImage(
            imageDescription, 
            scenario.name, 
            imagePath, 
            validatedProductImagePath, 
            scenarioType,
            modelNationality,
            modelCombination,
            sceneLocation
          );
          
          // Handle both image and design guide results
          const scenarioData = {
            ...scenario,
            imageDescription,
            scenarioIndex: index + 1
          };
          
          if (scenarioImageResult && scenarioImageResult.type === 'image' && scenarioImageResult.isRealImage) {
            scenarioData.isRealImage = true;
            scenarioData.path = scenarioImageResult.path;
            scenarioData.downloadUrl = scenarioImageResult.downloadUrl;
            scenarioData.imageSize = scenarioImageResult.size;
          } else {
            scenarioData.isRealImage = false;
            scenarioData.designGuidePath = scenarioImageResult;
          }
          
          return scenarioData;
        } catch (error) {
          console.error(`Error generating image for scenario ${index + 1}:`, error);
          return {
            ...scenario,
            imageError: error.message,
            scenarioIndex: index + 1,
            isRealImage: false
          };
        }
      }) || []
    );
    
    res.json({
      success: true,
      message: 'Marketing scenarios generated successfully',
      scenarios: scenariosWithImages,
      brand: BRAND_CONFIG.name,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scenario generation error:', error);
    res.status(500).json({ 
      error: 'Scenario generation failed: ' + error.message,
      fallback: 'Please try again or use manual scenario creation'
    });
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

// ==================== Page 2: AI 廣告顧問 API ====================

// API endpoint for ads analysis
app.post('/api/analyze-ads', authMiddleware, adsUpload.array('files', 10), async (req, res) => {
  try {
    console.log('📊 Received ads analysis request');
    
    const { brandName, productName, coreProduct, targetMarket, platforms, language } = req.body;
    const uploadedFiles = req.files || [];
    const userLanguage = language || 'zh-TW'; // 預設繁體中文
    
    console.log(`📝 Brand: ${brandName || '(未提供)'}, Product: ${productName || '(未提供)'}`);
    console.log(`📁 Files uploaded: ${uploadedFiles.length}`);
    console.log(`🌐 Language: ${userLanguage}`);
    
    // 驗證是否有任何可分析的資訊
    const hasTextInfo = brandName || productName || coreProduct || targetMarket;
    const hasFiles = uploadedFiles.length > 0;
    
    if (!hasTextInfo && !hasFiles) {
      return res.status(400).json({ 
        error: '請至少上傳檔案或提供品牌/產品資訊' 
      });
    }
    
    // 解析平台資訊
    let platformsList = [];
    try {
      platformsList = JSON.parse(platforms);
    } catch (e) {
      platformsList = [platforms];
    }
    
    if (platformsList.length === 0) {
      return res.status(400).json({ 
        error: '請至少選擇一個廣告平台' 
      });
    }
    
    // 準備分析資料（允許空值）
    const analysisData = {
      brandName: brandName || '',
      productName: productName || '',
      coreProduct: coreProduct || '',
      targetMarket: targetMarket || '',
      platforms: platformsList,
      uploadedFiles: uploadedFiles.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }))
    };
    
    console.log('🤖 Calling AI ads analyzer...');
    
    // 調用 AI 分析服務
    const analysisResult = await adsAnalyzer.analyzeAds(analysisData);
    
    console.log('✅ Ads analysis completed successfully');
    
    // 生成建議問題（使用用戶選擇的語言）
    console.log(`💡 Generating suggested questions in ${userLanguage}...`);
    const suggestedQuestions = await chatAdvisor.generateSuggestedQuestions(analysisResult, userLanguage);
    
    // 返回分析結果和建議問題
    res.json({
      success: true,
      brandNeedSummary: analysisResult.brandNeedSummary,
      performanceInsight: analysisResult.performanceInsight,
      creativeStrategy: analysisResult.creativeStrategy,
      optimizationPlan: analysisResult.optimizationPlan,
      advertisingReviewReport: analysisResult.advertisingReviewReport,
      suggestedQuestions: suggestedQuestions,
      timestamp: analysisResult.timestamp
    });
    
  } catch (error) {
    console.error('❌ Ads analysis error:', error);
    res.status(500).json({ 
      error: '廣告分析失敗',
      message: error.message 
    });
  }
});

// Configure multer for chat advisor files
const chatUpload = multer({
  dest: process.env.VERCEL || process.env.NODE_ENV === 'production' ? '/tmp/chat-uploads/' : path.join(__dirname, '..', 'assets', 'chat-uploads'),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files per message
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv', 'application/csv'
    ];
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.xls', '.xlsx', '.doc', '.docx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支援的檔案格式'), false);
    }
  }
});

// API endpoint for generating course content
app.post('/api/generate-course', authMiddleware, async (req, res) => {
  try {
    console.log('📚 Generating course content...');
    
    // Check if courseGenerator is initialized
    if (!courseGenerator) {
      return res.status(500).json({ 
        error: 'Course generation service not available',
        message: 'Course generator service is not initialized. Please check GEMINI_API_KEY_NEW environment variable.'
      });
    }
    
    const {
      targetAge,
      category,
      topic,
      duration,
      style,
      outputTypes,
      language,
      includeImages
    } = req.body;

    // Validate required fields
    if (!targetAge || !category || !topic || !duration || !style || !outputTypes || !language) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['targetAge', 'category', 'topic', 'duration', 'style', 'outputTypes', 'language']
      });
    }

    console.log(`📖 Course: ${topic} (${category}) for ages ${targetAge}`);
    console.log(`⏱️  Duration: ${duration} minutes | Style: ${style}`);
    console.log(`🌐 Language: ${language} | Images: ${includeImages}`);

    // Generate course content
    const courseData = await courseGenerator.generateCourseContent({
      targetAge,
      category,
      topic,
      duration,
      style,
      outputTypes: Array.isArray(outputTypes) ? outputTypes : [outputTypes],
      language,
      includeImages: includeImages || 'no'
    });

    console.log('✅ Course content generated successfully');

    res.json({
      success: true,
      message: 'Course content generated successfully',
      course: courseData
    });

  } catch (error) {
    console.error('❌ Course generation error:', error);
    res.status(500).json({ 
      error: 'Course generation failed',
      message: error.message || 'Unknown error occurred'
    });
  }
});

// API endpoint for exporting course to Word/PDF
app.post('/api/export-document', async (req, res) => {
  try {
    console.log('📄 Exporting course document...');
    
    const { courseData, format } = req.body;

    if (!courseData || !format) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['courseData', 'format']
      });
    }

    console.log(`📝 Exporting to ${format.toUpperCase()} format`);

    let exportResult;

    if (format === 'word') {
      exportResult = await documentExporter.exportToWord(courseData);
    } else if (format === 'pdf') {
      exportResult = await documentExporter.exportToPDF(courseData);
    } else {
      return res.status(400).json({ 
        error: 'Invalid format. Must be "word" or "pdf"' 
      });
    }

    console.log(`✅ Document exported: ${exportResult.fileName}`);

    res.json({
      success: true,
      message: `Course exported to ${format.toUpperCase()} successfully`,
      ...exportResult
    });

  } catch (error) {
    console.error('❌ Document export error:', error);
    res.status(500).json({ 
      error: 'Document export failed',
      message: error.message 
    });
  }
});

// Safe document download endpoint
app.get('/api/download-document', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    
    if (!filePath || filePath === 'undefined') {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    // Define safe base directory for course exports
    const baseDir = path.resolve(__dirname, '..', 'assets', 'exports');
    const resolvedFilePath = path.resolve(__dirname, '..', filePath);
    
    // Security check: ensure path is within allowed directory
    if (!resolvedFilePath.startsWith(baseDir)) {
      console.log('🚨 Forbidden file access attempt:', filePath);
      console.log('📁 Resolved path:', resolvedFilePath);
      console.log('📁 Expected base:', baseDir);
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check if file exists
    const fileExists = await fs.pathExists(resolvedFilePath);
    if (!fileExists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Send file
    res.download(resolvedFilePath, path.basename(resolvedFilePath), (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed' });
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Document download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Download failed', message: error.message });
    }
  }
});

// API endpoint for chat with advisor
app.post('/api/chat-with-advisor', authMiddleware, chatUpload.array('files', 5), async (req, res) => {
  try {
    console.log('💬 Received chat message');
    
    const { message, chatHistory, analysisContext, language } = req.body;
    const uploadedFiles = req.files || [];
    const userLanguage = language || 'zh-TW'; // 預設繁體中文
    
    console.log(`📝 Message: ${message ? message.substring(0, 50) + '...' : '(無訊息)'}`);
    console.log(`📁 Files uploaded: ${uploadedFiles.length}`);
    console.log(`🌐 Language: ${userLanguage}`);
    
    // 解析對話歷史和分析上下文
    let parsedChatHistory = [];
    let parsedAnalysisContext = null;
    
    try {
      if (chatHistory) {
        parsedChatHistory = JSON.parse(chatHistory);
      }
      if (analysisContext) {
        parsedAnalysisContext = JSON.parse(analysisContext);
      }
    } catch (parseError) {
      console.warn('⚠️  Failed to parse chat history or context:', parseError);
    }
    
    // 準備檔案資訊
    const fileInfos = uploadedFiles.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));
    
    console.log(`🤖 Calling chat advisor in ${userLanguage}...`);
    
    // 獲取用戶個人化上下文
    let personalizedContext = '';
    try {
      const userId = req.user?.id;
      if (userId && UserLearningService.isEnabled()) {
        personalizedContext = await UserLearningService.getPersonalizedPromptContext(userId);
        if (personalizedContext) {
          console.log('🧠 Personalized context injected for user');
        }
      }
    } catch (learningErr) {
      console.warn('⚠️ Failed to get personalized context:', learningErr.message);
    }
    
    // 調用對話服務（傳入用戶選擇的語言）
    const chatResult = await chatAdvisor.chat(
      message || '',
      parsedChatHistory,
      parsedAnalysisContext,
      fileInfos,
      userLanguage,
      personalizedContext
    );
    
    console.log('✅ Chat response generated successfully');
    
    // 返回對話結果
    res.json({
      success: true,
      response: chatResult.response,
      timestamp: chatResult.timestamp
    });
    
  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({ 
      error: '對話處理失敗',
      message: error.message 
    });
  }
});

// ==================== Page 4: BizPrompt Architect Pro APIs ====================

// Helper function to analyze reference images using Gemini multimodal vision
async function analyzeReferenceImagesWithVision(references, mode = 'image') {
  if (!references || references.length === 0) {
    return { textContext: '', imageAnalysis: null };
  }
  
  const imageRefs = references.filter(ref => ref.type === 'image' && ref.data);
  const urlRefs = references.filter(ref => ref.type === 'url');
  const docRefs = references.filter(ref => ref.type === 'document');
  
  let textContext = '\n\n【參考資料分析】\n用戶提供了以下參考資料，請深度分析並整合到生成的提示詞中：\n\n';
  let imageAnalysis = null;
  
  // If there are images, use Gemini multimodal to analyze them
  if (imageRefs.length > 0) {
    try {
      console.log(`🖼️ Analyzing ${imageRefs.length} image(s) with Gemini multimodal vision...`);
      
      // Prepare image parts for Gemini multimodal API
      const imageParts = [];
      for (const ref of imageRefs) {
        try {
          // Handle base64 data (remove data URL prefix if present)
          let base64Data = ref.data;
          if (base64Data && base64Data.includes(',')) {
            base64Data = base64Data.split(',')[1];
          }
          
          if (!base64Data) {
            console.log(`⚠️ Skipping image ${ref.name} - no valid base64 data`);
            continue;
          }
          
          // Detect MIME type
          let mimeType = 'image/jpeg';
          if (ref.name) {
            const ext = ref.name.toLowerCase().split('.').pop();
            if (ext === 'png') mimeType = 'image/png';
            else if (ext === 'gif') mimeType = 'image/gif';
            else if (ext === 'webp') mimeType = 'image/webp';
            else if (ext === 'bmp') mimeType = 'image/bmp';
          }
          
          imageParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } catch (imgError) {
          console.log(`⚠️ Error processing image ${ref.name}:`, imgError.message);
        }
      }
      
      if (imageParts.length > 0) {
        // Create analysis prompt based on mode
        const analysisPrompt = mode === 'image' 
          ? `請詳細分析這${imageParts.length > 1 ? '些' : '張'}參考圖片，作為 AI 繪圖提示詞生成的參考。請提供以下分析：

1. 🎨 **色彩分析**：主色調、輔助色、色彩搭配風格（如：暖色調、冷色調、高飽和、低飽和、復古、現代等）
2. 📐 **構圖分析**：構圖方式、視覺焦點、空間布局、前中後景安排
3. 💡 **光影效果**：光線方向、陰影處理、明暗對比、整體亮度
4. 🌟 **風格特徵**：藝術風格（如：寫實、插畫、3D渲染、水彩、油畫等）、視覺特效
5. 🔍 **細節元素**：重要的視覺元素、紋理、材質、特殊效果
6. 💭 **氛圍情緒**：整體情緒、氛圍營造、給人的感受

請用繁體中文回答，提供具體且可用於 AI 繪圖提示詞的描述。`
          : `請詳細分析這${imageParts.length > 1 ? '些' : '張'}參考圖片/截圖，作為軟體開發需求的參考。請提供以下分析：

1. 🖥️ **界面分析**：UI 佈局、設計風格、導航結構
2. 🎨 **視覺設計**：配色方案、字體風格、圖標設計
3. ⚙️ **功能識別**：可見的功能模塊、交互元素、資料展示方式
4. 📱 **用戶體驗**：操作流程、信息架構、關鍵交互點
5. 💡 **技術推測**：可能使用的技術棧、框架建議
6. 🔍 **需求提取**：從圖片中可推斷的業務需求和功能需求

請用繁體中文回答，提供具體且可用於 PRD 編寫的描述。`;
        
        // Build parts array with images first, then text prompt
        const allParts = [...imageParts, { text: analysisPrompt }];
        
        // Use Gemini multimodal model with correct API format
        const { GoogleGenAI } = require('@google/genai');
        const geminiApiKey = process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        // Use gemini-2.0-flash for multimodal (supports vision) with correct contents format
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [{ 
            role: 'user', 
            parts: allParts 
          }]
        });
        
        // Safely extract response text
        if (response && response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            imageAnalysis = candidate.content.parts[0].text || '';
            console.log(`✅ Image analysis completed successfully (${imageAnalysis.length} chars)`);
          }
        }
      }
      
    } catch (error) {
      console.error(`❌ Multimodal image analysis failed:`, error.message);
      // Fallback to text description if multimodal fails
      imageAnalysis = null;
    }
  }
  
  // Add AI-analyzed image content if available
  if (imageAnalysis) {
    textContext += `\n===== AI 視覺分析結果 (Gemini Multimodal) =====\n`;
    textContext += `以下是 AI 對上傳參考圖片的深度分析：\n\n`;
    textContext += `${imageAnalysis}\n\n`;
  } else if (imageRefs.length > 0) {
    // Fallback text description for images if multimodal failed
    imageRefs.forEach((ref, index) => {
      textContext += `🖼️ 參考圖片 ${index + 1}：${ref.name}\n`;
      textContext += `   [圖片已上傳，請分析其視覺特點]\n\n`;
    });
  }
  
  // Add URL references
  urlRefs.forEach((ref, index) => {
    textContext += `📎 參考連結 ${index + 1}：${ref.url}\n`;
    textContext += `   請參考該網站/頁面的設計、功能或內容特點\n\n`;
  });
  
  // Add document references
  docRefs.forEach((ref, index) => {
    textContext += `📄 參考文件 ${index + 1}：${ref.name} (${ref.fileType})\n`;
    if (ref.content && !ref.content.startsWith('[')) {
      textContext += `   文件內容：\n${ref.content.substring(0, 2000)}${ref.content.length > 2000 ? '...(內容已截斷)' : ''}\n\n`;
    } else {
      textContext += `   [${ref.fileType.toUpperCase()} 文件已上傳]\n\n`;
    }
  });
  
  // Only add integration requirements if there's any context
  if (imageRefs.length > 0 || urlRefs.length > 0 || docRefs.length > 0) {
    textContext += `\n===== 參考資料整合要求 =====
請根據上述參考資料${imageAnalysis ? '和 AI 視覺分析結果' : ''}：
1. 深度理解參考資料的設計理念和風格特點
2. 提取關鍵視覺元素和設計語言
3. 將分析結果精準融入生成的提示詞
4. 確保生成的提示詞能還原參考資料的核心風格

`;
  } else {
    textContext = '';
  }
  
  return { textContext, imageAnalysis };
}

// Legacy helper function (kept for backward compatibility)
function buildReferenceContext(references) {
  if (!references || references.length === 0) {
    return '';
  }
  
  let context = '\n\n【參考資料分析】\n用戶提供了以下參考資料，請深度分析並整合到生成的提示詞中：\n\n';
  
  references.forEach((ref, index) => {
    if (ref.type === 'url') {
      context += `📎 參考連結 ${index + 1}：${ref.url}\n`;
      context += `   請分析該網站/頁面的設計、功能或內容特點，並融入提示詞中\n\n`;
    } else if (ref.type === 'image') {
      context += `🖼️ 參考圖片 ${index + 1}：${ref.name}\n`;
      context += `   [圖片內容已上傳]\n`;
      context += `   請分析圖片的：\n`;
      context += `   - 色彩搭配與調色風格\n`;
      context += `   - 構圖方式與視覺層次\n`;
      context += `   - 光影效果與氛圍\n`;
      context += `   - 主題元素與細節\n\n`;
    } else if (ref.type === 'document') {
      context += `📄 參考文件 ${index + 1}：${ref.name} (${ref.fileType})\n`;
      if (ref.content && !ref.content.startsWith('[')) {
        context += `   文件內容：\n${ref.content.substring(0, 2000)}${ref.content.length > 2000 ? '...(內容已截斷)' : ''}\n\n`;
      } else {
        context += `   [${ref.fileType.toUpperCase()} 文件已上傳，請根據檔案名稱和類型推測內容相關性]\n\n`;
      }
    }
  });
  
  context += `\n===== 參考資料整合要求 =====
請根據上述參考資料：
1. 逆向工程分析其設計理念和風格特點
2. 提取關鍵元素並融入生成的提示詞
3. 保持與參考資料一致的風格調性
4. 如有多個參考資料，進行智能融合

`;
  
  return context;
}

// API endpoint for refining prompts (coding and image modes)
app.post('/api/refine-prompt', authMiddleware, async (req, res) => {
  try {
    const { mode, input, platform, complexity, style, ratio, qualityTags, references } = req.body;
    
    console.log(`📝 Refining prompt in ${mode} mode...`);
    if (references && references.length > 0) {
      console.log(`📎 Processing ${references.length} reference(s)...`);
      const hasImages = references.some(ref => ref.type === 'image' && ref.data);
      if (hasImages) {
        console.log(`🖼️ Found images in references - will use multimodal analysis`);
      }
    }
    
    let refinedPrompt = '';
    let systemPrompt = '';
    
    // Use multimodal analysis for modes with references (coding, image)
    let referenceContext = '';
    if (references && references.length > 0 && (mode === 'coding' || mode === 'image')) {
      const analysisResult = await analyzeReferenceImagesWithVision(references, mode);
      referenceContext = analysisResult.textContext;
      if (analysisResult.imageAnalysis) {
        console.log(`✅ Multimodal image analysis integrated into prompt context`);
      }
    } else {
      referenceContext = buildReferenceContext(references);
    }
    
    if (mode === 'coding') {
      const platformLabels = {
        'web': 'Web 網頁應用',
        'mobile': 'Mobile App',
        'desktop': 'Desktop 桌面應用',
        'api': 'API / Backend',
        'fullstack': 'Full Stack 全端'
      };
      
      const complexityLabels = {
        'mvp': 'MVP 最小可行產品',
        'standard': 'Standard 標準功能',
        'enterprise': 'Enterprise 企業級'
      };
      
      systemPrompt = `你是一位資深軟體架構師和產品經理。用戶用自然語言描述了一個軟體需求，請幫助將其轉化為專業的結構化 PRD (Product Requirements Document)。

用戶需求描述：
${input}

目標平台：${platformLabels[platform] || platform}
複雜度級別：${complexityLabels[complexity] || complexity}
${referenceContext}
請生成一個專業的 Prompt，這個 Prompt 可以直接交給 AI（如 ChatGPT、Gemini、Claude）來生成完整的軟體開發方案。

輸出格式要求：
1. 首先定義清晰的角色設定（如：你是一位全端開發專家）
2. 詳細描述功能需求和技術規格
3. 包含推薦的技術棧
4. 列出核心功能模塊
5. 定義 API 端點結構（如適用）
6. 描述資料模型
7. 提供 MVP 功能優先級排序
${references && references.length > 0 ? '8. 根據 AI 視覺分析結果，整合參考資料中的設計理念、UI 佈局和功能特點' : ''}

請直接輸出可以使用的 Prompt 內容，不需要額外說明。`;
      
    } else if (mode === 'business') {
      // Business Consultant Mode - Deep AI-generated professional prompts
      const { domain, industry, role, framework, context } = req.body;
      
      systemPrompt = `你是一位專業的 AI Prompt 架構師，專精於設計高品質的商業顧問 System Prompt。你的任務是根據用戶選擇的專業領域資訊，生成一個深度專業、結構完整、可直接使用的 AI System Prompt。

【用戶選擇的專業背景】
• 專業領域 (Domain)：${domain || '未指定'}
• 行業細分 (Industry)：${industry || '未指定'}
• 專業角色 (Role)：${role || '未指定'}
• 分析框架 (Framework)：${framework || '未指定'}

【用戶補充描述】
${context || '無額外描述'}

【你的任務】
請深度思考上述專業背景的內涵，並生成一個專業級的 AI System Prompt。這個 Prompt 必須具備以下結構和深度：

===== 必須包含的模塊 =====

🎯 【System Role 角色設定】
• 定義 AI 扮演的專業角色（建議 10 年以上經驗）
• 列出 5-8 個該角色必須精通的專業領域和技能
• 描述該角色的實戰經驗和核心價值
• 明確 AI 的核心任務目標

📌 【工作目標 Expected Outputs】
根據該角色的實際工作場景，列出 5-7 個 AI 可以協助用戶完成的具體工作項目，每個項目需包含：
• 項目名稱
• 3-5 個具體的子任務或分析維度
• 預期產出物

🧠 【核心分析框架 Analysis Framework】
設計 4-6 個該角色在分析問題時應該使用的結構化框架維度，例如：
• 市場/行業洞察
• 競品評估
• 風險與因應
• 決策建議
每個框架需包含 3-5 個具體的分析要點

🗣️ 【語氣與風格 Tone & Style】
定義 AI 回覆時應該遵循的語氣和風格，例如：
• 專業程度
• 可操作性要求
• 數據/邏輯支持要求
• 回覆結構要求

📥 【用戶需提供的資料 Required User Inputs】
列出 AI 在提供建議前，應該向用戶詢問的 5-7 個關鍵問題
這些問題應該能幫助 AI 獲得足夠的背景資訊來提供精準建議

===== 輸出格式要求 =====

1. 使用繁體中文輸出
2. 必須包含表情符號來區分各個模塊（🎯📌🧠🗣️📥等）
3. 內容必須專業、具體、可操作
4. 充分發揮「${framework}」分析框架的應用場景
5. 確保生成的 Prompt 可以直接複製使用於 ChatGPT、Claude 或 Gemini

請直接輸出完整的 System Prompt，不需要額外的說明或前言。`;
      
    } else if (mode === 'image') {
      const { imageModel, customModelName, imageSteps, imageFormat } = req.body;
      
      const styleLabels = {
        'photorealistic': 'photorealistic, ultra-realistic, photograph',
        'anime': 'anime style, manga art, Japanese animation',
        'oil-painting': 'oil painting, classical art, brush strokes, canvas texture',
        'watercolor': 'watercolor painting, soft colors, paint splatter',
        '3d-render': '3D render, Octane render, Blender, Cinema 4D',
        'cyberpunk': 'cyberpunk, neon lights, futuristic, sci-fi',
        'minimalist': 'minimalist, simple, clean design, flat',
        'fantasy': 'fantasy art, magical, ethereal, dreamlike',
        'vintage': 'vintage, retro, film grain, nostalgic'
      };
      
      const ratioLabels = {
        '1:1': '--ar 1:1',
        '16:9': '--ar 16:9',
        '9:16': '--ar 9:16',
        '4:3': '--ar 4:3',
        '3:2': '--ar 3:2'
      };
      
      const targetModel = imageModel || 'midjourney';
      const modelName = targetModel === 'custom' ? customModelName : targetModel;
      
      const platformPromptGuides = {
        'nanobanana': `【Nano Banana / FLUX 專用提示詞格式】
Nano Banana 使用 FLUX 模型，特點：
- 支援自然語言描述，不需要特殊參數格式
- 擅長理解複雜場景和細節描述
- 支援中英文混合提示詞
- 重視光影和材質的描述

輸出格式要求：
1. 使用流暢的自然語言描述（可中英混合）
2. 詳細描述場景、主體、光線、氛圍
3. 包含材質、質感、色調描述
4. 無需添加特殊參數符號

範例格式：
【FLUX Prompt】
(自然語言描述的完整提示詞)

【場景細節補充】
(可選：額外的細節建議)`,

        'gpt': `【GPT / DALL-E 3 專用提示詞格式】
DALL-E 3 特點：
- 支援自然語言對話式描述
- 理解能力強，可處理複雜抽象概念
- 傾向寫實風格，對細節描述敏感
- 支援情緒、氛圍的文字描述

輸出格式要求：
1. 使用完整的英文句子描述
2. 包含主體、場景、風格、光線、視角
3. 可加入情緒和故事性描述
4. 明確指定藝術風格（如 digital art, oil painting 等）

範例格式：
【DALL-E 3 Prompt】
A detailed description in natural language...

【風格建議】
Recommended artistic style specifications`,

        'midjourney': `【Midjourney 專用提示詞格式】
Midjourney 特點：
- 使用逗號分隔的關鍵字堆疊
- 支援特殊參數（--ar, --q, --s, --v 等）
- 權重語法 (word::weight)
- 支援負面提示詞 --no

輸出格式要求：
1. 使用英文關鍵字，逗號分隔
2. 包含主題、風格、光影、品質標籤
3. 添加 Midjourney 專屬參數
4. 包含負面提示詞

範例格式：
【Positive Prompt】
subject description, style keywords, lighting, quality tags ${ratioLabels[ratio] || ''} --q 2 --s 750

【Negative Prompt / --no】
unwanted elements

【完整指令】
/imagine prompt: (完整可複製的 MJ 指令)`,

        'custom': `【${customModelName} 專用提示詞格式】
針對自定義平台 "${customModelName}" 優化提示詞。

請根據您對該平台的了解，生成最適合的提示詞格式：
1. 分析該平台可能的提示詞偏好
2. 提供通用的高品質提示詞結構
3. 包含正向和負向提示詞
4. 建議可能適用的參數

輸出格式：
【${customModelName} Prompt】
(優化後的提示詞)

【負向提示詞】
(需避免的元素)

【參數建議】
(可能適用的參數)`
      };

      const stepsLabel = imageSteps ? `${imageSteps} 步` : '預設';
      const formatLabel = imageFormat ? imageFormat.toUpperCase() : '預設';
      
      const advancedOptionsInfo = (imageSteps || imageFormat) ? `
【進階選項】
${imageSteps ? `- 生成步數 (Steps): ${imageSteps}` : ''}
${imageFormat ? `- 輸出格式: ${imageFormat.toUpperCase()}` : ''}` : '';

      const advancedParamsGuide = (imageSteps || imageFormat) ? `

【進階參數輸出】
${imageSteps ? `在提示詞末尾添加步數參數：
- Midjourney: 不適用（使用 --q 控制品質）
- Stable Diffusion / ComfyUI / FLUX: Steps: ${imageSteps}
- 其他平台: 依據平台語法添加 steps 或 iterations 參數` : ''}
${imageFormat ? `在輸出建議中包含：
- 建議輸出格式: ${imageFormat.toUpperCase()}
- 格式特點: ${imageFormat === 'png' ? '無損壓縮，支援透明背景' : imageFormat === 'jpg' ? '有損壓縮，檔案較小' : imageFormat === 'webp' ? '網頁優化，平衡品質與大小' : imageFormat === 'tiff' ? '印刷品質，無損高解析度' : '標準格式'}` : ''}` : '';

      systemPrompt = `你是一位專業的 AI 繪圖提示詞工程師，精通各種 AI 繪圖平台的提示詞優化技術。

【目標平台】${modelName === 'nanobanana' ? 'Nano Banana (FLUX)' : modelName === 'gpt' ? 'GPT (DALL-E 3)' : modelName === 'midjourney' ? 'Midjourney' : modelName}

【用戶想要生成的畫面】
${input}

【選擇的藝術風格】${styleLabels[style] || style}
【畫面比例】${ratio}
【品質標籤】${(qualityTags || []).join(', ')}
${advancedOptionsInfo}
${referenceContext}
${platformPromptGuides[targetModel] || platformPromptGuides['custom']}
${advancedParamsGuide}

===== 重要指示 =====
1. 嚴格按照目標平台的格式要求輸出
2. 確保提示詞能在該平台上獲得最佳效果
3. 包含專業的光影、構圖、細節描述
${imageSteps ? `4. 在適當位置包含步數參數 (${imageSteps} steps)` : ''}
${imageFormat ? `5. 在輸出末尾添加格式建議區塊：【輸出格式建議】${imageFormat.toUpperCase()}` : ''}
${references && references.length > 0 ? '6. 深度分析參考資料的視覺風格並融入提示詞，包括色調、構圖、氛圍等元素' : ''}
7. 直接輸出可複製使用的內容，無需額外說明`;
    }
    
    if (!systemPrompt) {
      throw new Error('Invalid mode specified');
    }
    
    const { GoogleGenAI } = require('@google/genai');
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_NEW || process.env.GEMINI_API_KEY });
    
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }]
    });
    
    if (response && response.candidates && response.candidates.length > 0) {
      refinedPrompt = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No response from AI model');
    }
    
    console.log('✅ Prompt refined successfully');
    
    res.json({
      success: true,
      refinedPrompt: refinedPrompt,
      mode: mode
    });
    
  } catch (error) {
    console.error('❌ Prompt refinement error:', error);
    res.status(500).json({
      error: 'Prompt 優化失敗',
      message: error.message
    });
  }
});

// API endpoint for exporting prompt to Word document
app.post('/api/export-prompt-word', async (req, res) => {
  try {
    const { prompt, mode, timestamp } = req.body;
    
    console.log(`📄 Exporting prompt to Word...`);
    
    // 生成 Word 文檔
    const modeLabels = {
      'business': '商業顧問模式',
      'coding': '軟體開發模式',
      'image': '視覺繪圖模式'
    };
    
    const docContent = {
      title: `BizPrompt Architect Pro - ${modeLabels[mode] || mode}`,
      generatedAt: timestamp || new Date().toISOString(),
      content: prompt
    };
    
    // 使用 DocumentExportService 生成 Word
    const result = await documentExporter.exportPromptToWord(docContent);
    
    console.log('✅ Word document generated:', result.filename);
    
    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      filename: result.filename
    });
    
  } catch (error) {
    console.error('❌ Word export error:', error);
    res.status(500).json({
      error: 'Word 導出失敗',
      message: error.message
    });
  }
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  // Always return JSON, never HTML
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// 404 handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  });
});

// Export for Vercel serverless functions
// Vercel expects the handler to be the default export
module.exports = app;
module.exports.default = app;

// Start server - Only for local development
if (require.main === module) {
  const listenHost = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  app.listen(PORT, listenHost, () => {
    console.log(`${BRAND_CONFIG.name} Facebook Auto Workflow server running on http://${listenHost}:${PORT}`);
    console.log(`Ready to generate ${BRAND_CONFIG.name} Facebook promotional materials for babies!`);
  });
}