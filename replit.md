# POPMART Facebook Auto Workflow

## Overview
A Node.js web application for automatically generating POPMART Facebook promotional materials. This project provides a web interface where users can upload product images, select campaign types and templates, and generate Facebook marketing workflows.

## Recent Changes
- **2025-09-19**: Initial project setup and structure creation
  - Set up Node.js server with Express.js framework
  - Created responsive web frontend with HTML/CSS/JavaScript
  - Implemented file upload functionality for product images
  - Added API endpoints for workflow generation
  - Configured for Replit environment with proper host settings

## Project Architecture
- **Frontend**: Static HTML/CSS/JavaScript served from `/public`
- **Backend**: Express.js server in `/src/server.js`
- **Port Configuration**: Frontend and backend both on port 5000 (Replit requirement)
- **File Storage**: Uploaded images stored in `/assets/uploads/`
- **Dependencies**: Express, CORS, Multer, Dotenv, Axios, Node-cron

## Key Features
- Product image upload (supports JPG, PNG up to 10MB)
- Campaign type selection (New Release, Limited Edition, Collaboration, Seasonal)
- Template style options (Minimal, Colorful, Artistic, Professional)
- RESTful API with health check endpoint
- Real-time status feedback

## User Preferences
- Language: English with Chinese elements for POPMART branding
- Style: Modern, gradient-based UI design
- Functionality: Web-based workflow automation

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
The application is fully functional and ready for use. The server is running on port 5000 with a responsive web interface for generating Facebook promotional workflows for POPMART products.