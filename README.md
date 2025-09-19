# Googoogaga Facebook Auto Workflow

自動產生 Googoogaga Facebook 宣傳素材的工作流程 - 嬰幼兒玩具雙語行銷

## 專案概述

本專案是專為 **Googoogaga** 品牌設計的 Facebook 行銷自動化工具，能夠自動生成適合嬰幼兒玩具的雙語（越南文/繁體中文）宣傳素材。

### 品牌理念
- **品牌名稱**: Googoogaga
- **品牌標語**: "Cùng bé khám phá thế giới diệu kỳ mỗi ngày" (與寶貝一同探索每日奇蹟)
- **目標受眾**: 嬰幼兒及其父母
- **產品類型**: 安全、教育、發展性嬰幼兒玩具

## 核心功能

### 🎯 活動類型
- **新玩具上市** (New Toy Launch) - 突出產品創新特色
- **教育學習** (Educational) - 強調寓教於樂效益  
- **安全第一** (Safety First) - 重視材質安全認證
- **發展成長** (Developmental) - 支援各階段發育
- **季節限定** (Seasonal) - 節慶主題促銷

### 🎨 設計風格
- **溫和柔軟** (Gentle) - 淡藍粉色調，溫馨親切
- **活潑可愛** (Playful) - 彩虹漸層，充滿活力
- **教育啟發** (Educational) - 清爽藍調，學習導向
- **值得信賴** (Trustworthy) - 專業藍灰，強調品質

### 🌐 雙語支援
- **越南文 (VI)**: 主要市場語言，強調安全與發展
- **繁體中文 (ZH-TW)**: 台灣市場，重視教育與品質
- **雙語模式**: 自動生成兩種語言版本

## 技術架構

### 前端特色
- 響應式設計，支援行動裝置
- 嬰兒友善的色彩配置（天藍漸變至粉紅）
- 直觀的檔案上傳介面
- 即時狀態回饋

### 後端架構
- **框架**: Express.js (Node.js)
- **檔案處理**: Multer (支援 10MB 圖片上傳)
- **CORS**: 跨來源請求支援
- **環境變數**: Dotenv 配置管理

### API 端點
- `GET /` - 主要應用程式介面
- `GET /api/health` - 健康檢查
- `POST /api/upload-image` - 圖片上傳處理
- `POST /api/generate-workflow` - 工作流程生成

## 環境設置

### 必要配置
```bash
# 複製環境變數範例
cp .env.example .env

# 安裝相依套件
npm install

# 啟動開發伺服器
npm start
```

### 環境變數
- `BRAND_NAME=Googoogaga`
- `BRAND_LOGO_PATH=./public/brand/googoogaga-logo.png`  
- `BRAND_SLOGAN=Cùng bé khám phá thế giới diệu kỳ mỗi ngày`
- `PORT=5000`

## 使用方式

1. **上傳玩具圖片**: 支援 JPG、PNG 格式（最大 10MB）
2. **選擇活動類型**: 根據行銷目標選擇適合的活動
3. **設定設計風格**: 選擇符合品牌調性的視覺風格
4. **自動生成內容**: 系統自動產生雙語 Facebook 貼文內容

## 內容範例

### 越南文版本
```
Khám phá thế giới diệu kỳ cùng bé mỗi ngày – [玩具名稱] nhỏ gọn, an toàn và đáng yêu! 

🧸 Sản phẩm được thiết kế đặc biệt cho sự phát triển của bé
🛡️ An toàn tuyệt đối với chất liệu không độc hại  
🎨 Kích thích trí tưởng tượng và sự sáng tạo
📚 Hỗ trợ học tập qua vui chơi

#Googoogaga #ĐồChơiThôngMinh #AnToànChoBé
```

### 繁體中文版本
```
陪寶貝一起探索奇幻世界 – [玩具名稱] 小巧、安全又可愛！

🧸 專為寶寶發展設計的優質玩具
🛡️ 使用無毒安全材質，父母最安心
🎨 啟發想像力與創造力的最佳夥伴  
📚 寓教於樂，快樂學習每一天

#Googoogaga #益智玩具 #安全第一
```

## 部署資訊

- **平台**: Replit 自動擴展部署
- **連接埠**: 5000 (前端與後端整合)
- **主機**: 0.0.0.0 (Replit 環境相容)

## 品牌資產

- **Logo 位置**: `public/brand/googoogaga-logo.png`
- **色彩主題**: 天空藍 (#87CEEB) 到 粉紅色 (#FFB6C1)
- **字體**: Segoe UI 系列，清晰易讀

## 開發狀態

- ✅ 基礎專案架構完成
- ✅ Googoogaga 品牌整合完成  
- ✅ 雙語 Fallback 函式實作
- ✅ 嬰幼兒主題 UI 設計
- ✅ API 端點測試通過
- ✅ Replit 環境優化完成

---

**Googoogaga** - 與您的寶貝一同探索每個美好時刻 ✨