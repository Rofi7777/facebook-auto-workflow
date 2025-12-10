# Googoogaga Multi-Platform Content Generator

## Overview
The Googoogaga platform is an AI-powered content generation system for various industries including Fashion, Mother&Kids, and Art Toy. It leverages Google Gemini AI for intelligent product analysis and automated content creation tailored for multiple social media and e-commerce platforms (Shopee, TikTok, Instagram, Facebook). Key features include an AI Course Editor Expert for educational content and BizPrompt Architect Pro for professional AI prompt generation. The project aims to streamline marketing content creation through multi-language support, interactive AI consultation, and customizable image generation, enhancing brand targeting and marketing efficiency.

## User Preferences
- Language: Bilingual Vietnamese and Traditional Chinese
- Industries: Fashion, Mother&Kids, Art Toy, General Products
- Style: Clean gradient design (sky blue to pink)
- Target Audience: Multi-industry consumers
- Functionality: AI-powered multi-platform marketing content automation with workflow optimization

## System Architecture
The project follows a client-server architecture:
- **Frontend**: Responsive web interface with HTML, CSS, and JavaScript, served from `/public`, featuring a baby-friendly design, multi-language switching, and an interactive chat window. UI includes a four-page tab navigation system, grid preview for multi-image uploads, and professional report output with PDF export.
- **Backend**: An Express.js server (`/src/server.js`) handling API requests, file uploads, and AI service integration, supporting bilingual content generation and intelligent ad analysis.
- **AI Integration**: Utilizes Google Gemini 3 Pro Preview for advanced text reasoning and prompt optimization, and Gemini 2.5 Flash Image Preview for stable image generation. Fallback models include Gemini 2.5 Flash and 2.0 Flash Experimental. Used for product analysis, pain point identification, scenario suggestions, ad analysis, and educational content generation, with language-aware responses.
- **Image Processing**: Incorporates Sharp library for high-quality image manipulation, including automatic Googoogaga logo overlay and customizable image generation based on user input.
- **Data Structures**: TypeScript schemas and interfaces in `/src/schemas/` define data contracts.
- **Routing**: API endpoints are managed in `/src/routes/` for content generation, ad analysis, and chat interactions.
- **Prompts**: AI prompt templates for various industries and marketing scenarios are stored in `/src/prompts/`.
- **File Storage**: Uploaded product images are stored in `/assets/uploads/`.
- **Core Features**:
    - **Multi-Language Support**: Traditional Chinese, English, Vietnamese with dynamic switching.
    - **Interactive AI Chat Advisor**: Continuous consultation with conversation history and file upload.
    - **Multi-Industry Support**: Fashion, Mother&Kids, Art Toy, Others with industry-specific AI prompts.
    - **Scenario Switching**: Quick platform switching without re-entering product information.
    - **Multi-Image Upload**: 1-5 images with comprehensive multi-angle analysis.
    - **Multi-Platform**: Shopee, TikTok, Instagram, Facebook content generation.
    - **Smart Analysis**: AI-powered product recognition, pain point identification, and scenario suggestions.
    - **Automated Image Generation**: Customizable marketing scenario images with real product integration and automatic brand logo.
    - **Ad Analysis**: AI-powered analysis for ad campaigns across TikTok, Shopee, Meta, and Zalo, generating professional reports.
    - **AI Course Editor Expert**: Automated educational course content generation for ages 3-14 across multiple subjects, with customizable teaching styles, multi-language support, and professional Word/PDF export capabilities.
    - **BizPrompt Architect Pro**: Professional AI prompt generation system with three modes:
        - **Business Consultant Mode**: 4-level cascading dropdown (Domain → Industry → Role → Framework) for expert-level business prompts.
        - **Software Development Mode**: Natural language to structured PRD conversion using Gemini AI.
        - **Visual Image Mode**: AI-powered Midjourney/DALL-E prompt optimization with style, ratio, and quality tag customization, and support for various image models (Nano Banana (FLUX), GPT (DALL-E 3), Midjourney (MJ), Custom). Includes advanced options for steps and output format selection. This mode also supports reference material upload (images, documents, URLs) for AI analysis.

## External Dependencies
- **AI Services**: Google Gemini 3 Pro Preview (text reasoning), Google Gemini 2.5 Flash Image Preview (image generation), Google Gemini 2.0 Flash (multimodal vision for reference image analysis), Google Gemini 2.5 Flash (fallback), Google Gemini 2.0 Flash Experimental (legacy)

## Recent Changes (December 10, 2025)

### Admin Dashboard System
- **New Feature**: Implemented admin management panel for user administration
- **Backend Components**:
  - `src/services/adminService.js` - Admin service for user management operations (list users, approve, suspend, promote, demote, delete)
  - `src/middleware/adminMiddleware.js` - Express middleware for admin-only route protection (requireAdmin, requireSuperAdmin)
  - Admin API endpoints: `/api/admin/users`, `/api/admin/pending`, `/api/admin/users/:id/approve`, `/api/admin/users/:id/suspend`, `/api/admin/users/:id/promote`, `/api/admin/users/:id/demote`, `/api/admin/users/:id` (DELETE), `/api/admin/status`
- **Frontend Components**:
  - `public/js/admin.js` - Client-side admin manager for UI and API interactions
  - Admin tab (page5) with pending users and all users tables
  - Role badges (super_admin, admin, user, pending) and status badges (active, suspended, pending)
- **Admin Roles**:
  - Super Admin (rofi90@hotmail.com): Full access to all admin functions including promote/demote/delete
  - Admin: Can view users, approve, and suspend
  - User: Regular authenticated user
- **Features**:
  - View all registered users with role and status information
  - Approve pending user registrations
  - Suspend/unsuspend user accounts
  - Promote users to admin (super admin only)
  - Demote admins to regular users (super admin only)
  - Delete users (super admin only)
  - Multi-language support (zh-TW, en, vi)
- **Requirements**:
  - SUPABASE_SERVICE_KEY required for full admin operations
  - Without service key, admin tab displays but operations are limited

## Previous Changes (December 9, 2025)

### User Authentication System (Supabase Integration)
- **New Feature**: Implemented complete user authentication system using Supabase Auth
- **Backend Components**:
  - `src/services/supabaseAuth.js` - Supabase authentication service with signUp, signIn, signOut, token verification, and session refresh
  - `src/middleware/authMiddleware.js` - Express middleware for protecting API endpoints
  - All AI-consuming endpoints now require authentication (analyze-product, generate-platform-content, generate-scenarios, analyze-ads, generate-course, chat-with-advisor, refine-prompt)
- **Frontend Components**:
  - `public/js/auth.js` - Client-side authentication manager with token storage, automatic session refresh, and authFetch for authenticated API calls
  - Login/Register modal with professional UI matching the existing gradient design
  - User info display and logout button in header
- **Features**:
  - Email/password authentication
  - JWT token-based API authorization
  - Automatic session refresh on token expiration
  - Multi-language support for auth UI (zh-TW, en, vi)
  - Graceful fallback when auth is disabled
- **Benefits**:
  - Control Gemini API costs by requiring user login
  - Track API usage per user
  - Foundation for future usage-based billing

## Previous Changes (November 29, 2025)

### Gemini Multimodal Vision Integration
- **New Feature**: Implemented Gemini's native multimodal vision capabilities for reference material analysis in BizPrompt Architect Pro
- **How it works**:
  - When users upload reference images in Software Development or Visual Image mode, the system now uses `gemini-2.0-flash` multimodal model to actually "see" and analyze the images
  - AI provides detailed visual analysis including: color palette, composition, lighting, style characteristics, visual elements, and emotional atmosphere
  - Analysis results are integrated into the prompt generation context for more accurate and style-consistent outputs
- **Technical Implementation**:
  - `analyzeReferenceImagesWithVision()` function in server.js
  - Uses Gemini inlineData format for base64-encoded images
  - Supports JPEG, PNG, GIF, WebP, BMP formats
  - Mode-specific analysis prompts (image mode vs coding mode)
  - Graceful fallback to text-only description if multimodal fails
- **Benefits**:
  - AI can now truly understand uploaded reference images
  - Generated prompts accurately reflect reference material styles
  - Better reverse-engineering of design patterns and visual elements

## Other Dependencies
- **Web Framework**: Express.js
- **Middleware**: CORS, Multer (file uploads), Dotenv (environment variables)
- **HTTP Client**: Axios
- **Image Processing**: Sharp
- **Document Generation**: docx (Word), pdfkit (PDF), html-docx-js (HTML to Word)
- **Font Support**: Source Han Sans OTF (for CJK character rendering in PDF exports)
- **System Packages**: noto-fonts-cjk-sans, unzip
- **Scheduling**: Node-cron