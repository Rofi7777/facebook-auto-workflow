# Googoogaga Multi-Platform Content Generator

## Overview
The Googoogaga platform is an AI-powered content generation system designed for various industries including Fashion, Mother&Kids, and Art Toy. It leverages Google Gemini AI for intelligent product analysis and automated content creation tailored for multiple social media and e-commerce platforms (Shopee, TikTok, Instagram, Facebook). **NEW**: Now includes AI Course Editor Expert for educational content generation and **BizPrompt Architect Pro** for professional AI prompt generation. The project aims to streamline marketing content creation by offering multi-language support, interactive AI consultation, and customizable image generation, ultimately enhancing brand targeting and marketing efficiency across diverse consumer bases.

## User Preferences
- Language: Bilingual Vietnamese and Traditional Chinese
- Industries: Fashion, Mother&Kids, Art Toy, General Products
- Style: Clean gradient design (sky blue to pink)
- Target Audience: Multi-industry consumers
- Functionality: AI-powered multi-platform marketing content automation with workflow optimization

## System Architecture
The project follows a client-server architecture:
- **Frontend**: Responsive web interface built with HTML, CSS, and JavaScript, served from the `/public` directory. It features a baby-friendly design, multi-language switching, and an interactive chat window.
- **Backend**: An Express.js server (`/src/server.js`) handling API requests, file uploads, and integrating with AI services. It supports bilingual content generation and intelligent ad analysis.
- **AI Integration**: Utilizes Google Gemini 3 Pro Preview for advanced text reasoning and prompt optimization, with Gemini 2.5 Flash Image Preview for stable image generation. Fallback models include Gemini 2.5 Flash and 2.0 Flash Experimental. Used for product analysis, pain point identification, scenario suggestions, ad analysis, and educational content generation. AI responses are language-aware.
- **Image Processing**: Incorporates Sharp library for high-quality image manipulation, including automatic Googoogaga logo overlay with transparent backgrounds and customizable image generation based on user input for model nationality, combination, and scene location.
- **Data Structures**: TypeScript schemas and interfaces in `/src/schemas/` define data contracts.
- **Routing**: API endpoints are managed in `/src/routes/` with specific routes for content generation, ad analysis, and chat interactions.
- **Prompts**: AI prompt templates for various industries and marketing scenarios are stored in `/src/prompts/`.
- **File Storage**: Uploaded product images are stored in `/assets/uploads/`.
- **UI/UX**: Features a four-page tab navigation system ("AI 圖片生成", "AI 廣告顧問", "AI 課程編輯專家", and "AI 指令架構師"), grid preview for multi-image uploads, and professional report output with PDF export functionality. All UI elements support dynamic language switching.
- **Core Features**:
    - **Multi-Language Support**: Traditional Chinese, English, Vietnamese with dynamic switching for all pages.
    - **Interactive AI Chat Advisor**: Continuous consultation with conversation history and file upload.
    - **Multi-Industry Support**: Fashion, Mother&Kids, Art Toy, Others with industry-specific AI prompts.
    - **Scenario Switching**: Quick platform switching without re-entering product information.
    - **Multi-Image Upload**: 1-5 images with comprehensive multi-angle analysis.
    - **Multi-Platform**: Shopee, TikTok, Instagram, Facebook content generation.
    - **Smart Analysis**: AI-powered product recognition, pain point identification, and scenario suggestions.
    - **Automated Image Generation**: Customizable marketing scenario images with real product integration and automatic brand logo.
    - **Ad Analysis**: AI-powered analysis for ad campaigns across TikTok, Shopee, Meta, and Zalo, generating professional reports.
    - **AI Course Editor Expert**: Automated educational course content generation for ages 3-14 across multiple subjects (Social, Science, Math, Language, Art) with customizable teaching styles, multi-language support, and professional Word/PDF export capabilities.
    - **BizPrompt Architect Pro (NEW)**: Professional AI prompt generation system featuring three modes:
        - **Business Consultant Mode**: 4-level cascading dropdown (Domain → Industry → Role → Framework) for generating expert-level business prompts with professional models like SWOT, Porter Five Forces, Lean Canvas, etc.
        - **Software Development Mode**: Natural language to structured PRD conversion using Gemini AI, with platform and complexity selection.
        - **Visual Image Mode**: AI-powered Midjourney/DALL-E prompt optimization with style, ratio, and quality tag customization.

## External Dependencies
- **AI Services**: Google Gemini 3 Pro Preview (text reasoning), Google Gemini 2.5 Flash Image Preview (image generation), Google Gemini 2.5 Flash (fallback), Google Gemini 2.0 Flash Experimental (legacy)
- **Web Framework**: Express.js
- **Middleware**: CORS, Multer (for file uploads), Dotenv (for environment variables)
- **HTTP Client**: Axios
- **Image Processing**: Sharp
- **Document Generation**: docx (Word), pdfkit (PDF), html-docx-js (HTML to Word conversion)
- **Font Support**: Source Han Sans OTF (16MB bundled) for proper CJK character rendering in PDF exports
- **System Packages**: noto-fonts-cjk-sans, unzip
- **Scheduling**: Node-cron
- **Deployment Environment**: Replit (requires specific port and host configurations)

## Recent Changes

### BizPrompt Architect Pro - Major Expansion (November 28, 2025)
- **Comprehensive 4-Level Cascading System**: Expanded business consultant mode with 8 domains, 40+ industries, 207 roles, and corresponding frameworks
- **User-Specific Industries Integrated**:
  - Fashion/Footwear/Accessories across E-commerce, Product, and Design domains
  - Mother & Baby across E-commerce, Product, and Design domains
  - Pet Industry across E-commerce and Product domains
  - Art Toy (Popmart) across E-commerce, Product, and Design domains
- **Domain Coverage (8 Total)**:
  - E-commerce Operations (TikTok Shop, Shopee, FB Marketplace, Fashion, Mother&Baby, Pet, Art Toy)
  - Marketing (SEO/GEO, Social, Performance, Brand, Content)
  - Product Management (Fashion, Baby, Pet, Toy, Tech Products)
  - Product Design (Industrial, Fashion, Toy, UX/UI, Graphic)
  - Software Development (Vibe Coding, Web, Mobile, AI/ML, E-commerce)
  - Strategy (E-com, Brand, Growth, Consulting, Startup)
  - Finance (E-com, Corporate, Accounting, Investment, Business)
  - Human Resources (Talent, OD, Compensation, Learning, HR Tech)
- **Role Framework System**: 207 unique roles, each with 5+ professional frameworks plus custom option
- **Custom Input Support**: Full custom input support at all 4 levels (L1/L2/L3/L4)
- **Complete Translation Coverage**: All domains, industries, and roles translated in zh-TW, en, vi

### BizPrompt Architect Pro - New Tab 4 (November 28, 2025)
- **New Feature**: Added 4th tab "AI 指令架構師" (BizPrompt Architect Pro) to the platform
- **Three-Mode System**:
  - **Business Consultant Mode**: 4-level cascading dropdown (L1 Domain → L2 Industry → L3 Role → L4 Framework) with support for custom inputs at each level
  - **Software Development Mode**: Natural language input with AI-powered conversion to structured PRD using Gemini 3 Pro
  - **Visual Image Mode**: AI-powered Midjourney/DALL-E prompt optimization with style, ratio, and quality tag selection
- **New API Endpoints**:
  - `/api/refine-prompt`: Handles AI prompt refinement for coding and image modes
  - `/api/export-prompt-word`: Exports generated prompts to Word documents
- **Tool Features**: One-click copy to clipboard and Word document export
- **Multi-Language Support**: Full i18n support for Traditional Chinese, English, and Vietnamese
- **UI Consistency**: Follows existing design patterns with sky blue to pink gradient theme

### AI Model Upgrade to Gemini 3 Pro (November 23, 2025)
- **Upgrade Scope**: Platform-wide AI model upgrade with hybrid configuration
- **Text Reasoning Models Upgraded** ✅:
  - `geminiAI.js`: gemini-2.5-flash → **gemini-3-pro-preview**
  - `scenarioGenerator.js` (Tab 1): gemini-2.5-flash → **gemini-3-pro-preview**
  - `adsAnalyzer.js` (Tab 2): gemini-2.5-flash → **gemini-3-pro-preview**
  - `chatAdvisor.js`: gemini-2.5-flash → **gemini-3-pro-preview**
  - `courseGenerator.js` (Tab 3): gemini-2.5-flash → **gemini-3-pro-preview**
- **Image Generation Models** ⚠️:
  - **Status**: Kept at **gemini-2.5-flash-image-preview** (stable Replit-supported model)
  - **Reason**: gemini-3-pro-image-preview is not supported by Replit AI Integrations
  - **Decision**: Use stable 2.5 Flash Image model for reliable image generation
- **Benefits**:
  - ✅ Enhanced text reasoning and response quality across all AI-powered features
  - ✅ Better multi-language understanding and content generation
  - ✅ More sophisticated prompt optimization and analysis capabilities
  - ✅ Stable and reliable image generation with proven 2.5 Flash Image model
- **Fallback Strategy**: Text models use gemini-2.5-flash and gemini-2.0-flash-exp as fallbacks

### PDF Chinese Font Support Fix (November 14, 2025)
- **Issue**: PDF exports displayed Chinese characters as mojibake (����) due to missing CJK font support
- **Solution**: 
  - Downloaded genuine Source Han Sans CN Regular OTF font (16MB) from Adobe/jsDelivr CDN
  - Bundled font in `assets/fonts/SourceHanSansCN-Regular.otf` for deployment reliability
  - Modified `DocumentExportService` to load bundled OTF font before PDF text rendering
  - Verified font signature (OTTO) and successful PDFKit integration
- **Result**: All Traditional Chinese, Simplified Chinese, Japanese, and Korean characters now render correctly in exported PDFs