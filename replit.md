# Googoogaga Multi-Platform Content Generator

## Overview
The Googoogaga platform is an AI-powered content generation system designed for various industries including Fashion, Mother&Kids, and Art Toy. It leverages Google Gemini AI for intelligent product analysis and automated content creation tailored for multiple social media and e-commerce platforms (Shopee, TikTok, Instagram, Facebook). The project aims to streamline marketing content creation by offering multi-language support, interactive AI consultation, and customizable image generation, ultimately enhancing brand targeting and marketing efficiency across diverse consumer bases.

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
- **AI Integration**: Utilizes Google Gemini 2.5 Flash (with fallback to 2.0 Flash Experimental) for product analysis, pain point identification, scenario suggestions, and ad analysis. AI responses are language-aware.
- **Image Processing**: Incorporates Sharp library for high-quality image manipulation, including automatic Googoogaga logo overlay with transparent backgrounds and customizable image generation based on user input for model nationality, combination, and scene location.
- **Data Structures**: TypeScript schemas and interfaces in `/src/schemas/` define data contracts.
- **Routing**: API endpoints are managed in `/src/routes/` with specific routes for content generation, ad analysis, and chat interactions.
- **Prompts**: AI prompt templates for various industries and marketing scenarios are stored in `/src/prompts/`.
- **File Storage**: Uploaded product images are stored in `/assets/uploads/`.
- **UI/UX**: Features a dual-page tab navigation system ("AI 圖片生成" and "AI 廣告顧問"), grid preview for multi-image uploads, and professional report output with PDF export functionality for ad analysis. All UI elements support dynamic language switching.
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

## External Dependencies
- **AI Services**: Google Gemini 2.5 Flash, Google Gemini 2.0 Flash Experimental
- **Web Framework**: Express.js
- **Middleware**: CORS, Multer (for file uploads), Dotenv (for environment variables)
- **HTTP Client**: Axios
- **Image Processing**: Sharp
- **Scheduling**: Node-cron (though not explicitly detailed in functionality, listed as dependency)
- **Deployment Environment**: Replit (requires specific port and host configurations)