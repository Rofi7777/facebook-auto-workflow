# Googoogaga Multi-Platform Content Generator

## Overview
A comprehensive multi-industry AI-powered content generation platform supporting Fashion, Mother&Kids, Art Toy, and other product categories. The system integrates Google Gemini 2.5 Flash AI for intelligent product analysis and automated content generation across multiple platforms (Shopee, TikTok, Instagram, Facebook).

## Recent Changes
- **2025-11-06**: Customizable Image Generation Settings
  - **NEW FEATURE**: Added comprehensive image customization controls for model appearance and scene settings
  - Users can now customize three key aspects of generated marketing images:
    * **Model Nationality**: Taiwan (臺灣) / USA (美國) / Russia (俄羅斯) / Brazil (巴西) / Custom (自訂)
    * **Model Combination**: Parents & Baby (父母與寶寶) / Mom & Baby (媽媽與寶寶) / Dad & Baby (爸爸與寶寶) / Couple (情侶)
    * **Scene Location**: Park (公園) / City (城市) / Beach (海灘) / Mountain (山區) / Custom (自訂)
  - Full multi-language support for all dropdown options (Traditional Chinese, English, Vietnamese)
  - Updated frontend HTML with three new dropdown menus in the image generation section
  - Modified frontend JavaScript to collect and send customization parameters to backend APIs
  - Enhanced backend API routes (/api/generate-platform-content, /api/generate-scenarios) to accept new parameters
  - Updated GeminiAI service: Modified `generateMarketingImage()` to integrate customization into AI prompts
  - Updated ScenarioGenerator service: Modified `generateScenarioImage()` to integrate customization into AI prompts
  - Enhanced `generateScenarioDetails()` method in both services with dynamic character/location mapping
  - AI now generates images with specific ethnic characteristics, family combinations, and location settings
  - Parameter flow: Frontend dropdowns → API routes → AI services → Image generation prompts
  - Ensures generated images match user's brand targeting and marketing preferences
  - Works seamlessly with all scenario types (親子互動, 小孩單人使用, 外出旅遊, 居家遊戲, 其他)
- **2025-11-06**: Transparent Logo Background Implementation
  - **CRITICAL FIX**: Generated images now show Googoogaga logo with transparent background (no white box)
  - Created new transparent PNG logo file: `googoogaga-logo-transparent.png`
  - Updated both GeminiAI and ScenarioGenerator services to use transparent PNG logo
  - Enhanced Sharp image processing with proper alpha channel handling
  - Logo now blends seamlessly with generated marketing images
  - Background configuration: `{ r: 0, g: 0, b: 0, alpha: 0 }` for complete transparency
  - Applied to all platform images (Shopee, TikTok, Instagram, Facebook) and scenario images
- **2025-11-06**: Complete UI Translation Coverage for Analysis Results (Vietnamese Fix)
  - **CRITICAL FIX**: All analysis result labels now display in user's selected language (zh-TW/en/vi)
  - Fixed hardcoded Traditional Chinese labels in analysis results that Vietnamese users couldn't understand
  - Added comprehensive translations for all analysis section headers and field labels:
    * Product Analysis Result (產品分析結果 / Kết quả phân tích sản phẩm)
    * Product Type, Age Range, Educational Value, Product Features, Safety Features, Materials, Colors
    * Identified Pain Points (識別的用戶痛點 / Các vấn đề người dùng đã xác định)
    * Usage Scenario Suggestions (使用場景建議 / Đề xuất kịch bản sử dụng)
  - Modified `displayAnalysisResults()` function to use `t()` translation helper for all labels
  - Vietnamese users now see 100% Vietnamese interface when language is selected
  - All section headers, field labels, and UI elements now respond to language switching
- **2025-11-06**: Complete Language-Aware AI Implementation for Page 1 Product Analysis
  - **CRITICAL FIX**: AI product analysis (Page 1) now fully responds in user's selected language (zh-TW/en/vi)
  - Fixed language bug where AI returned Chinese content regardless of user's language selection
  - Added language-specific JSON example templates in GeminiAI service for all supported languages
  - Implemented English (en) prompts for ALL industry categories (Fashion, Mother&Kids, Art Toy, Others)
  - Enhanced `analyzeProductImage()` method with vi/en JSON templates matching prompt language
  - Enhanced `identifyPainPointsAndScenarios()` method with vi/en JSON templates matching prompt language
  - Ensured complete alignment between AI prompt language and JSON example templates
  - Language flow: Frontend (currentLanguage) → Backend API → GeminiAI service → Language-matched AI prompts + JSON templates
  - Supports zh-TW (Traditional Chinese), en (English), vi (Vietnamese), and bilingual modes
  - Fallback mechanism: unsupported languages default to zh-TW with proper templates
  - All industry-specific AI prompts now available in all three languages
  - Architect-reviewed and verified: no mixed-language pathways remain
- **2025-11-05**: Language-Aware AI Responses Implementation (Page 2 & Chat)
  - **AI now responds in user's selected language** (Traditional Chinese, English, or Vietnamese)
  - ChatAdvisor service fully supports multi-language AI prompts and responses
  - Suggested questions after ad analysis generated in selected language
  - Interactive chat responses adapt to user's language preference
  - Language parameter flows from frontend (currentLanguage) → API endpoints → ChatAdvisor service → AI prompts
  - Implemented comprehensive fallback questions in all three languages (zh-TW, en, vi)
  - Error messages localized based on user's selected language
  - AI prompt instructions include language-specific directives for accurate responses
  - Backend API endpoints (/api/analyze-ads, /api/chat-with-advisor) accept language parameter
  - All ChatAdvisor methods (generateSuggestedQuestions, chat, buildChatPrompt) language-aware
- **2025-11-05**: Multi-Language Support & Interactive AI Chat Advisor
  - Implemented comprehensive multi-language switching system (Traditional Chinese, English, Vietnamese)
  - Added language selector in top-right corner with persistent preference via localStorage
  - Created centralized translations.js module with complete translations for all UI elements
  - Built interactive chat window below analysis button on Page 2
  - Implemented ChatAdvisor service for continuous user consultation with conversation history
  - AI automatically generates 3 suggested questions after analysis completion
  - Supports file uploads during conversation (images, PDFs, documents)
  - Backend API endpoint: /api/chat-with-advisor
  - Chat messages distinguished by sender (user vs AI) with proper styling
  - Conversation context preserved across multiple interactions
  - All four AI services (GeminiAI, ScenarioGenerator, AdsAnalyzer, ChatAdvisor) fully operational
- **2025-10-29**: Page 2 "AI 廣告顧問" Feature Added & Optional Fields Update
  - Created dual-page tab navigation system (AI 圖片生成 | AI 廣告顧問)
  - Implemented Page 2 UI with left input panel and right analysis results panel
  - Added multi-format file upload support (Image, PDF, Excel, Word, CSV, 1-10 files)
  - **All input fields are now optional** - users can analyze with just files or just text info
  - Created AdsAnalyzer service using Gemini AI for intelligent ad analysis
  - Implemented 5-section professional report output:
    * Brand Need Summary (品牌需求摘要)
    * Performance Insight (效能洞察) 
    * Creative Strategy (創意策略)
    * Optimization Plan (優化計劃)
    * Advertising Review Report (廣告檢視報告)
  - Added PDF export functionality (using window.print())
  - Supports TikTok, Shopee, Meta, and Zalo ad platforms
  - Backend API endpoint: /api/analyze-ads
  - Smart validation: requires only files OR text info (not both mandatory)
- **2025-10-29**: Automatic brand logo integration on all generated images
  - Implemented automatic Googoogaga logo overlay on all platform images (Shopee, TikTok, Instagram, Facebook)
  - Added logo overlay for scenario marketing images
  - Used Sharp image processing library for high-quality logo compositing
  - Logo sized at 20% of image width, positioned at bottom-right corner
  - Supports all image formats (PNG, JPG, WEBP, etc.)
- **2025-10-19**: Shopee image generation fixes and optimization
  - Fixed Shopee platform image generation issue when JSON parsing fails
  - Removed price tags and promotion badges from Shopee images per user request
  - Modified Shopee image style to focus on product details and quality showcase
  - Ensured all platforms generate images consistently regardless of content format
- **2025-09-30**: Expanded usage scenarios and bug fixes
  - Fixed viContext undefined error in bilingual scenario display
  - Added new usage scenarios: Personal Styling (個人穿搭), Office/Home Decoration (辦公室/居家佈置)
  - Improved bilingual parsing with safe fallback handling
- **2025-09-30**: Multi-industry expansion and workflow optimization
  - Added Industry Category selection (Fashion, Mother&Kids, Art Toy, Others)
  - Implemented scenario switching feature for quick platform changes
  - Industry-specific AI prompts for accurate content generation
  - Enhanced user workflow to reduce repetitive input
- **2025-09-29**: Gemini 2.5 Flash upgrade and multi-image support
  - Upgraded to Gemini 2.5 Flash model with automatic fallback
  - Implemented multi-image upload (1-5 images) with grid preview
  - Enhanced AI accuracy with multi-angle product analysis
  - Improved model availability testing and selection
- **2025-09-19**: Initial project setup and structure creation
  - Set up Node.js server with Express.js framework
  - Created responsive web frontend with HTML/CSS/JavaScript
  - Implemented file upload functionality for toy images
  - Added API endpoints for workflow generation
  - Configured for Replit environment with proper host settings
- **2025-09-19**: Brand adaptation for Googoogaga
  - Updated all POPMART references to Googoogaga brand
  - Implemented bilingual fallback functions (VI/ZH-TW)
  - Created baby toy appropriate campaign types and templates
  - Updated color scheme to baby-friendly pastels (sky blue to pink gradient)
  - Added brand assets and logo integration
  - Created TypeScript schemas and routes structure

## Project Architecture
- **Frontend**: Static HTML/CSS/JavaScript served from `/public` with baby-friendly design
- **Backend**: Express.js server in `/src/server.js` with bilingual content generation
- **Schemas**: TypeScript contracts and interfaces in `/src/schemas/`
- **Routes**: Facebook-specific routes and fallback functions in `/src/routes/`
- **Prompts**: Template systems for baby toy marketing in `/src/prompts/`
- **Port Configuration**: Frontend and backend both on port 5000 (Replit requirement)
- **File Storage**: Uploaded toy images stored in `/assets/uploads/`
- **Brand Assets**: Googoogaga logo and assets in `/public/brand/`
- **Dependencies**: Express, CORS, Multer, Dotenv, Axios, Node-cron

## Key Features
- **Multi-Language Support**: Traditional Chinese, English, Vietnamese with dynamic language switching
- **Interactive AI Chat Advisor**: Continuous consultation with conversation history and file upload support
- **Multi-Industry Support**: Fashion, Mother&Kids, Art Toy, Others with industry-specific AI prompts
- **Scenario Switching**: Quick platform switching without re-entering product information
- **Multi-Image Upload**: 1-5 images with comprehensive multi-angle analysis
- **AI Model**: Gemini 2.5 Flash with automatic fallback to Gemini 2.0 Flash Experimental
- **Multi-Platform**: Shopee, TikTok, Instagram, Facebook content generation
- **Smart Analysis**: AI-powered product recognition, pain point identification, and scenario suggestions
- **Automated Image Generation**: Optional marketing scenario images with real product integration
- **Real-time Processing**: Live status updates with progress indicators

## User Preferences
- Language: Bilingual Vietnamese and Traditional Chinese
- Industries: Fashion, Mother&Kids, Art Toy, General Products
- Style: Clean gradient design (sky blue to pink)
- Target Audience: Multi-industry consumers
- Functionality: AI-powered multi-platform marketing content automation with workflow optimization

## Environment Setup
- Server binds to `0.0.0.0:5000` for Replit compatibility
- CORS enabled for cross-origin requests
- Environment variables configured via dotenv
- Deployment configured for autoscale target

## API Endpoints
- `GET /`: Main application interface
- `GET /api/health`: Health check endpoint
- `POST /api/upload-image`: Image upload handling
- `POST /api/generate-workflow`: Workflow generation
- `POST /api/analyze-ads`: Ad analysis with AI-generated suggested questions
- `POST /api/chat-with-advisor`: Interactive chat with AI advisor (supports file uploads)

## Development Status
- ✅ Basic project structure complete
- ✅ Server configuration working
- ✅ Frontend interface functional
- ✅ API endpoints operational
- ✅ Deployment configuration set
- ✅ Replit environment optimized

## Current State
The application is a comprehensive multi-industry content generation platform. Users can select from Fashion, Mother&Kids, Art Toy, or Others categories, upload 1-5 product images, and generate platform-specific marketing content. The scenario switching feature allows users to quickly change platforms without re-entering product information, significantly improving workflow efficiency. The system uses Gemini 2.5 Flash AI for intelligent analysis and content generation across all platforms.