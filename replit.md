# Googoogaga Facebook Auto Workflow

## Overview
A Node.js web application for automatically generating Googoogaga Facebook promotional materials for baby toys. This project provides a bilingual web interface where users can upload toy images, select campaign types and templates, and generate Facebook marketing workflows in Vietnamese and Traditional Chinese.

## Recent Changes
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
- Baby toy image upload (supports JPG, PNG up to 10MB)
- Bilingual campaign generation (Vietnamese/Traditional Chinese)
- Campaign types: 新玩具上市, 教育學習, 安全第一, 發展成長, 季節限定
- Template styles: 溫和柔軟, 活潑可愛, 教育啟發, 值得信賴
- Automatic fallback content generation with baby toy marketing language
- Design briefs with baby-appropriate color schemes and layouts
- RESTful API with enhanced workflow generation
- Real-time bilingual status feedback

## User Preferences
- Language: Bilingual Vietnamese and Traditional Chinese for Googoogaga branding
- Style: Baby-friendly gradient design (sky blue to pink)
- Target Audience: Babies, toddlers and parents
- Brand Voice: Safe, educational, developmental, nurturing
- Functionality: Bilingual baby toy marketing automation

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

## Development Status
- ✅ Basic project structure complete
- ✅ Server configuration working
- ✅ Frontend interface functional
- ✅ API endpoints operational
- ✅ Deployment configuration set
- ✅ Replit environment optimized

## Current State
The application is fully functional and ready for use. The server is running on port 5000 with a responsive web interface for generating Facebook promotional workflows for Googoogaga baby toys with bilingual content support.