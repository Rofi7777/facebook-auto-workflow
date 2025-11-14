// 多語言翻譯系統
const translations = {
  'zh-TW': {
    // 標題和主要文字
    'app_title': 'Googoogaga Multi-Platform Generator',
    'app_subtitle_line1': 'Cùng bé khám phá thế giới diệu kỳ mỗi ngày',
    'app_subtitle_line2': 'AI 驅動的多平台嬰幼兒玩具營銷內容生成器',
    
    // 分頁標籤
    'tab_image_generation': 'AI 圖片生成',
    'tab_ads_advisor': 'AI 廣告顧問',
    'tab_course_editor': '課程編輯',
    
    // Page 1: AI 圖片生成
    'product_info_input': '產品資訊輸入',
    'industry_category': '產業類別 / Industry Category',
    'product_name': '產品名稱 / Product Name',
    'product_name_placeholder': '輸入 Googoogaga 玩具名稱',
    'product_description': '產品說明 / Description',
    'product_description_placeholder': '描述這個玩具的特色、材質、適合年齡...',
    'image_upload': '產品圖片上傳 / Product Image Upload',
    'image_upload_text': '上傳產品圖片',
    'image_upload_hint': '支援 JPG, PNG (最多5張，每張最大 10MB)',
    'target_platform': '目標平台 / Target Platform',
    'campaign_type': '活動類型 / Campaign Type',
    'template_style': '範本風格 / Template Style',
    'analyze_button': '開始分析 (Start Analysis)',
    'ai_analysis_result': 'AI 分析結果',
    'ai_analysis_wait': '上傳產品圖片並點擊分析按鈕開始 AI 智慧分析',
    'multi_platform_result': '多平台內容生成結果',
    'ai_marketing_scenario': 'AI 生成行銷場景',
    
    // Page 2: AI 廣告顧問
    'data_input_area': '資料輸入區',
    'brand_name': '品牌名稱 / Brand Name (選填)',
    'brand_name_placeholder': '輸入品牌名稱',
    'product_name_optional': '產品名稱 / Product Name (選填)',
    'product_name_optional_placeholder': '輸入產品名稱',
    'core_product': '核心產品 / Core Product (選填)',
    'core_product_placeholder': '描述核心產品特色...',
    'target_market': '目標與市場 / Target Market (選填)',
    'target_market_placeholder': '描述目標客群與市場定位...',
    'file_upload': '檔案上傳 / File Upload (選填，支援 1-10 個檔案)',
    'file_upload_text': '上傳廣告資料檔案',
    'file_upload_hint': '支援 Image, PDF, Excel, Word, CSV (每個檔案最大 10MB，最多10個檔案)',
    'platform_selection': '平台勾選 / Platform Selection',
    'platform_tiktok': 'TikTok Ads',
    'platform_shopee': 'Shopee Ads',
    'platform_meta': 'Meta Ads (Facebook/Instagram)',
    'platform_zalo': 'Zalo Ads',
    'start_analysis': '開始分析 (Start Analysis)',
    'ai_analysis_results_area': 'AI 分析結果區',
    'ai_analysis_results_wait': '上傳廣告資料並點擊分析按鈕開始 AI 智慧分析',
    'export_pdf': '匯出 PDF',
    'reanalyze': '重新分析',
    
    // 互動對話視窗
    'chat_advisor_title': 'AI 廣告顧問對話',
    'chat_placeholder': '輸入您的問題...',
    'chat_send': '發送',
    'chat_upload_file': '上傳檔案',
    'ai_suggested_questions': 'AI 建議的問題：',
    
    // 產業類別
    'industry_fashion': 'Fashion (時尚服飾)',
    'industry_mother_kids': 'Mother & Kids (母嬰用品)',
    'industry_art_toy': 'Art Toy (藝術玩具)',
    'industry_others': 'Others (其他產品)',
    
    // 模特兒和場景設定
    'model_settings': '模特兒設定',
    'model_nationality': '模特兒國籍',
    'model_combination': '人物組合',
    'scene_settings': '場景設定',
    'scene_location': '場景地點',
    
    // 國籍選項
    'nationality_taiwan': '台灣',
    'nationality_usa': '美國',
    'nationality_russia': '俄羅斯',
    'nationality_brazil': '巴西',
    'nationality_custom': '自定義',
    
    // 組合選項
    'combination_parents_baby': '爸媽與嬰兒',
    'combination_mom_baby': '媽媽與嬰兒',
    'combination_dad_baby': '爸爸與嬰兒',
    'combination_couple': '夫妻',
    'combination_custom': '自定義',
    
    // 場景地點選項
    'location_city': '城市',
    'location_beach': '海邊',
    'location_mountain': '山區',
    'location_park': '公園',
    'location_custom': '自定義',
    
    // 自定義輸入框 placeholder
    'custom_nationality_placeholder': '請輸入模特兒國籍或種族描述 (例如: 日本、韓國、混血等)',
    'custom_combination_placeholder': '請輸入人物組合描述 (例如: 祖父母與孫子、三代同堂等)',
    'custom_location_placeholder': '請輸入場景地點描述 (例如: 咖啡廳、遊樂場、森林等)',
    
    // 按鈕和動作
    'generate_image_checkbox': '自動生成行銷圖片 (Generate Marketing Images)',
    'usage_scenario_selection': '使用場景選擇 / Usage Scenario Selection',
    'analyze_generate_button': '分析產品並生成內容',
    'switch_scenario_button': '切換場景重新生成 (同產品不同平台)',
    'generate_scenarios_button': '生成行銷場景',
    'generate_scenarios': '生成場景圖片 (Generate Scenarios)',
    'switch_scenario': '快速切換場景',
    
    // 使用場景選項
    'scenario_parent_child': '親子互動 (Parent-Child Interaction)',
    'scenario_child_solo': '小孩單人使用 (Child Solo Play)',
    'scenario_outdoor_travel': '外出旅遊 (Outdoor Travel)',
    'scenario_home_play': '居家遊戲 (Home Play)',
    'scenario_personal_styling': '個人穿搭 (Personal Styling)',
    'scenario_office_home_decor': '辦公室/居家佈置 (Office/Home Decoration)',
    'scenario_other': '其他 (Other Creative)',
    
    // 狀態訊息
    'uploading': '上傳中...',
    'analyzing': '分析中...',
    'generating': '生成中...',
    'completed': '完成',
    
    // 報告區塊標題
    'brand_need_summary': '品牌需求摘要',
    'performance_insight': '效能洞察',
    'creative_strategy': '創意策略',
    'optimization_plan': '優化計劃',
    'advertising_review_report': '廣告檢視報告',
    
    // 產品分析結果標籤
    'product_analysis_result': '產品分析結果',
    'product_type': '產品類型',
    'age_range': '適合年齡',
    'educational_value': '教育價值',
    'product_features': '產品特色',
    'safety_features': '安全特性',
    'materials': '材質',
    'colors': '顏色',
    'usage_scenarios': '使用場景',
    'identified_pain_points': '識別的用戶痛點',
    'usage_scenario_suggestions': '使用場景建議',
    'target': '目標',
    'emotions': '情感'
  },
  
  'en': {
    // 標題和主要文字
    'app_title': 'Googoogaga Multi-Platform Generator',
    'app_subtitle_line1': 'Explore the wonderful world with your baby every day',
    'app_subtitle_line2': 'AI-Powered Multi-Platform Baby Toy Marketing Content Generator',
    
    // 分頁標籤
    'tab_image_generation': 'AI Image Generation',
    'tab_ads_advisor': 'AI Ads Advisor',
    'tab_course_editor': 'Course Editor',
    
    // Page 1: AI 圖片生成
    'product_info_input': 'Product Information Input',
    'industry_category': 'Industry Category',
    'product_name': 'Product Name',
    'product_name_placeholder': 'Enter Googoogaga toy name',
    'product_description': 'Product Description',
    'product_description_placeholder': 'Describe the toy features, materials, suitable age...',
    'image_upload': 'Product Image Upload',
    'image_upload_text': 'Upload Product Images',
    'image_upload_hint': 'Supports JPG, PNG (Max 5 images, 10MB each)',
    'target_platform': 'Target Platform',
    'campaign_type': 'Campaign Type',
    'template_style': 'Template Style',
    'analyze_button': 'Start Analysis',
    'ai_analysis_result': 'AI Analysis Results',
    'ai_analysis_wait': 'Upload product images and click analyze button to start AI analysis',
    'multi_platform_result': 'Multi-Platform Content Generation Results',
    'ai_marketing_scenario': 'AI Generated Marketing Scenarios',
    
    // Page 2: AI 廣告顧問
    'data_input_area': 'Data Input Area',
    'brand_name': 'Brand Name (Optional)',
    'brand_name_placeholder': 'Enter brand name',
    'product_name_optional': 'Product Name (Optional)',
    'product_name_optional_placeholder': 'Enter product name',
    'core_product': 'Core Product (Optional)',
    'core_product_placeholder': 'Describe core product features...',
    'target_market': 'Target Market (Optional)',
    'target_market_placeholder': 'Describe target audience and market positioning...',
    'file_upload': 'File Upload (Optional, 1-10 files supported)',
    'file_upload_text': 'Upload Advertising Materials',
    'file_upload_hint': 'Supports Image, PDF, Excel, Word, CSV (Max 10MB per file, up to 10 files)',
    'platform_selection': 'Platform Selection',
    'platform_tiktok': 'TikTok Ads',
    'platform_shopee': 'Shopee Ads',
    'platform_meta': 'Meta Ads (Facebook/Instagram)',
    'platform_zalo': 'Zalo Ads',
    'start_analysis': 'Start Analysis',
    'ai_analysis_results_area': 'AI Analysis Results Area',
    'ai_analysis_results_wait': 'Upload advertising materials and click analyze button to start AI analysis',
    'export_pdf': 'Export PDF',
    'reanalyze': 'Re-analyze',
    
    // 互動對話視窗
    'chat_advisor_title': 'AI Advertising Advisor Chat',
    'chat_placeholder': 'Enter your question...',
    'chat_send': 'Send',
    'chat_upload_file': 'Upload File',
    'ai_suggested_questions': 'AI Suggested Questions:',
    
    // 產業類別
    'industry_fashion': 'Fashion',
    'industry_mother_kids': 'Mother & Kids',
    'industry_art_toy': 'Art Toy',
    'industry_others': 'Others',
    
    // 模特兒和場景設定
    'model_settings': 'Model Settings',
    'model_nationality': 'Model Nationality',
    'model_combination': 'Character Combination',
    'scene_settings': 'Scene Settings',
    'scene_location': 'Scene Location',
    
    // 國籍選項
    'nationality_taiwan': 'Taiwan',
    'nationality_usa': 'USA',
    'nationality_russia': 'Russia',
    'nationality_brazil': 'Brazil',
    'nationality_custom': 'Custom',
    
    // 組合選項
    'combination_parents_baby': 'Parents with Baby',
    'combination_mom_baby': 'Mom with Baby',
    'combination_dad_baby': 'Dad with Baby',
    'combination_couple': 'Couple',
    'combination_custom': 'Custom',
    
    // 場景地點選項
    'location_city': 'City',
    'location_beach': 'Beach',
    'location_mountain': 'Mountain',
    'location_park': 'Park',
    'location_custom': 'Custom',
    
    // 自定義輸入框 placeholder
    'custom_nationality_placeholder': 'Enter model nationality or ethnicity (e.g., Japanese, Korean, Mixed)',
    'custom_combination_placeholder': 'Enter character combination (e.g., Grandparents with grandchild, Three generations)',
    'custom_location_placeholder': 'Enter scene location (e.g., Cafe, Playground, Forest)',
    
    // 按鈕和動作
    'generate_image_checkbox': 'Generate Marketing Images',
    'usage_scenario_selection': 'Usage Scenario Selection',
    'analyze_generate_button': 'Analyze Product and Generate Content',
    'switch_scenario_button': 'Switch Scenario and Regenerate (Same Product, Different Platform)',
    'generate_scenarios_button': 'Generate Marketing Scenarios',
    'generate_scenarios': 'Generate Scenario Images',
    'switch_scenario': 'Quick Switch Scenario',
    
    // 使用場景選項
    'scenario_parent_child': 'Parent-Child Interaction',
    'scenario_child_solo': 'Child Solo Play',
    'scenario_outdoor_travel': 'Outdoor Travel',
    'scenario_home_play': 'Home Play',
    'scenario_personal_styling': 'Personal Styling',
    'scenario_office_home_decor': 'Office/Home Decoration',
    'scenario_other': 'Other Creative',
    
    // 狀態訊息
    'uploading': 'Uploading...',
    'analyzing': 'Analyzing...',
    'generating': 'Generating...',
    'completed': 'Completed',
    
    // 報告區塊標題
    'brand_need_summary': 'Brand Need Summary',
    'performance_insight': 'Performance Insight',
    'creative_strategy': 'Creative Strategy',
    'optimization_plan': 'Optimization Plan',
    'advertising_review_report': 'Advertising Review Report',
    
    // 產品分析結果標籤
    'product_analysis_result': 'Product Analysis Results',
    'product_type': 'Product Type',
    'age_range': 'Age Range',
    'educational_value': 'Educational Value',
    'product_features': 'Product Features',
    'safety_features': 'Safety Features',
    'materials': 'Materials',
    'colors': 'Colors',
    'usage_scenarios': 'Usage Scenarios',
    'identified_pain_points': 'Identified User Pain Points',
    'usage_scenario_suggestions': 'Usage Scenario Suggestions',
    'target': 'Target',
    'emotions': 'Emotions'
  },
  
  'vi': {
    // 標題和主要文字
    'app_title': 'Googoogaga Multi-Platform Generator',
    'app_subtitle_line1': 'Cùng bé khám phá thế giới diệu kỳ mỗi ngày',
    'app_subtitle_line2': 'Trình tạo nội dung marketing đồ chơi trẻ em đa nền tảng được hỗ trợ bởi AI',
    
    // 分頁標籤
    'tab_image_generation': 'Tạo hình ảnh AI',
    'tab_ads_advisor': 'Cố vấn quảng cáo AI',
    'tab_course_editor': 'Chỉnh sửa khóa học',
    
    // Page 1: AI 圖片生成
    'product_info_input': 'Nhập thông tin sản phẩm',
    'industry_category': 'Danh mục ngành',
    'product_name': 'Tên sản phẩm',
    'product_name_placeholder': 'Nhập tên đồ chơi Googoogaga',
    'product_description': 'Mô tả sản phẩm',
    'product_description_placeholder': 'Mô tả đặc điểm, chất liệu, độ tuổi phù hợp của đồ chơi...',
    'image_upload': 'Tải lên hình ảnh sản phẩm',
    'image_upload_text': 'Tải lên hình ảnh sản phẩm',
    'image_upload_hint': 'Hỗ trợ JPG, PNG (Tối đa 5 ảnh, mỗi ảnh 10MB)',
    'target_platform': 'Nền tảng mục tiêu',
    'campaign_type': 'Loại chiến dịch',
    'template_style': 'Phong cách mẫu',
    'analyze_button': 'Bắt đầu phân tích',
    'ai_analysis_result': 'Kết quả phân tích AI',
    'ai_analysis_wait': 'Tải lên hình ảnh sản phẩm và nhấp vào nút phân tích để bắt đầu phân tích AI thông minh',
    'multi_platform_result': 'Kết quả tạo nội dung đa nền tảng',
    'ai_marketing_scenario': 'Kịch bản marketing được tạo bởi AI',
    
    // Page 2: AI 廣告顧問
    'data_input_area': 'Khu vực nhập dữ liệu',
    'brand_name': 'Tên thương hiệu (Tùy chọn)',
    'brand_name_placeholder': 'Nhập tên thương hiệu',
    'product_name_optional': 'Tên sản phẩm (Tùy chọn)',
    'product_name_optional_placeholder': 'Nhập tên sản phẩm',
    'core_product': 'Sản phẩm cốt lõi (Tùy chọn)',
    'core_product_placeholder': 'Mô tả đặc điểm sản phẩm cốt lõi...',
    'target_market': 'Thị trường mục tiêu (Tùy chọn)',
    'target_market_placeholder': 'Mô tả đối tượng mục tiêu và định vị thị trường...',
    'file_upload': 'Tải lên tệp (Tùy chọn, hỗ trợ 1-10 tệp)',
    'file_upload_text': 'Tải lên tài liệu quảng cáo',
    'file_upload_hint': 'Hỗ trợ Image, PDF, Excel, Word, CSV (Tối đa 10MB mỗi tệp, tối đa 10 tệp)',
    'platform_selection': 'Lựa chọn nền tảng',
    'platform_tiktok': 'TikTok Ads',
    'platform_shopee': 'Shopee Ads',
    'platform_meta': 'Meta Ads (Facebook/Instagram)',
    'platform_zalo': 'Zalo Ads',
    'start_analysis': 'Bắt đầu phân tích',
    'ai_analysis_results_area': 'Khu vực kết quả phân tích AI',
    'ai_analysis_results_wait': 'Tải lên tài liệu quảng cáo và nhấp vào nút phân tích để bắt đầu phân tích AI thông minh',
    'export_pdf': 'Xuất PDF',
    'reanalyze': 'Phân tích lại',
    
    // 互動對話視窗
    'chat_advisor_title': 'Trò chuyện với cố vấn quảng cáo AI',
    'chat_placeholder': 'Nhập câu hỏi của bạn...',
    'chat_send': 'Gửi',
    'chat_upload_file': 'Tải lên tệp',
    'ai_suggested_questions': 'Câu hỏi được AI đề xuất:',
    
    // 產業類別
    'industry_fashion': 'Thời trang',
    'industry_mother_kids': 'Mẹ và bé',
    'industry_art_toy': 'Đồ chơi nghệ thuật',
    'industry_others': 'Khác',
    
    // 模特兒和場景設定
    'model_settings': 'Cài đặt người mẫu',
    'model_nationality': 'Quốc tịch người mẫu',
    'model_combination': 'Tổ hợp nhân vật',
    'scene_settings': 'Cài đặt cảnh',
    'scene_location': 'Địa điểm cảnh',
    
    // 國籍選項
    'nationality_taiwan': 'Đài Loan',
    'nationality_usa': 'Mỹ',
    'nationality_russia': 'Nga',
    'nationality_brazil': 'Brazil',
    'nationality_custom': 'Tùy chỉnh',
    
    // 組合選項
    'combination_parents_baby': 'Bố mẹ với em bé',
    'combination_mom_baby': 'Mẹ với em bé',
    'combination_dad_baby': 'Bố với em bé',
    'combination_couple': 'Cặp đôi',
    'combination_custom': 'Tùy chỉnh',
    
    // 場景地點選項
    'location_city': 'Thành phố',
    'location_beach': 'Bãi biển',
    'location_mountain': 'Vùng núi',
    'location_park': 'Công viên',
    'location_custom': 'Tùy chỉnh',
    
    // 自定義輸入框 placeholder
    'custom_nationality_placeholder': 'Nhập quốc tịch hoặc dân tộc người mẫu (vd: Nhật Bản, Hàn Quốc, Lai)',
    'custom_combination_placeholder': 'Nhập tổ hợp nhân vật (vd: Ông bà với cháu, Ba thế hệ)',
    'custom_location_placeholder': 'Nhập địa điểm cảnh (vd: Quán cà phê, Sân chơi, Rừng)',
    
    // 按鈕和動作
    'generate_image_checkbox': 'Tự động tạo hình ảnh marketing',
    'usage_scenario_selection': 'Lựa chọn kịch bản sử dụng',
    'analyze_generate_button': 'Phân tích sản phẩm và tạo nội dung',
    'switch_scenario_button': 'Chuyển đổi kịch bản và tạo lại (Cùng sản phẩm, khác nền tảng)',
    'generate_scenarios_button': 'Tạo kịch bản marketing',
    'generate_scenarios': 'Tạo hình ảnh kịch bản',
    'switch_scenario': 'Chuyển đổi kịch bản nhanh',
    
    // 使用場景選項
    'scenario_parent_child': 'Tương tác cha mẹ con cái',
    'scenario_child_solo': 'Trẻ chơi một mình',
    'scenario_outdoor_travel': 'Du lịch ngoài trời',
    'scenario_home_play': 'Chơi tại nhà',
    'scenario_personal_styling': 'Phong cách cá nhân',
    'scenario_office_home_decor': 'Trang trí văn phòng/nhà',
    'scenario_other': 'Sáng tạo khác',
    
    // 狀態訊息
    'uploading': 'Đang tải lên...',
    'analyzing': 'Đang phân tích...',
    'generating': 'Đang tạo...',
    'completed': 'Hoàn thành',
    
    // 報告區塊標題
    'brand_need_summary': 'Tóm tắt nhu cầu thương hiệu',
    'performance_insight': 'Thông tin hiệu suất',
    'creative_strategy': 'Chiến lược sáng tạo',
    'optimization_plan': 'Kế hoạch tối ưu hóa',
    'advertising_review_report': 'Báo cáo đánh giá quảng cáo',
    
    // 產品分析結果標籤
    'product_analysis_result': 'Kết quả phân tích sản phẩm',
    'product_type': 'Loại sản phẩm',
    'age_range': 'Độ tuổi phù hợp',
    'educational_value': 'Giá trị giáo dục',
    'product_features': 'Đặc điểm sản phẩm',
    'safety_features': 'Tính năng an toàn',
    'materials': 'Chất liệu',
    'colors': 'Màu sắc',
    'usage_scenarios': 'Kịch bản sử dụng',
    'identified_pain_points': 'Các vấn đề người dùng đã xác định',
    'usage_scenario_suggestions': 'Đề xuất kịch bản sử dụng',
    'target': 'Mục tiêu',
    'emotions': 'Cảm xúc'
  }
};

// 當前語言設定（預設繁體中文）
let currentLanguage = localStorage.getItem('preferredLanguage') || 'zh-TW';

// 翻譯函數
function t(key) {
  return translations[currentLanguage][key] || key;
}

// 切換語言
function switchLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('preferredLanguage', lang);
  updatePageLanguage();
}

// 更新頁面所有翻譯文字
function updatePageLanguage() {
  // 更新所有 data-i18n 元素的文字內容
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = t(key);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      if (element.hasAttribute('placeholder')) {
        element.setAttribute('placeholder', translation);
      }
    } else if (element.tagName === 'OPTION') {
      element.textContent = translation;
    } else {
      element.textContent = translation;
    }
  });
  
  // 更新所有 data-i18n-placeholder 元素的 placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = t(key);
    if (element.hasAttribute('placeholder')) {
      element.setAttribute('placeholder', translation);
    }
  });
  
  // 更新語言選擇器顯示
  const langDisplay = document.getElementById('currentLanguageDisplay');
  if (langDisplay) {
    const langNames = {
      'zh-TW': '繁體中文',
      'en': 'English',
      'vi': 'Tiếng Việt'
    };
    langDisplay.textContent = langNames[currentLanguage];
  }
  
  // 更新語言選擇器選項的激活狀態
  document.querySelectorAll('.language-option').forEach(option => {
    option.classList.remove('active');
  });
  document.querySelectorAll('.language-option').forEach((option, index) => {
    const langs = ['zh-TW', 'en', 'vi'];
    if (langs[index] === currentLanguage) {
      option.classList.add('active');
    }
  });
}
