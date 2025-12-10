-- =============================================
-- Googoogaga AI Hub - User Learning Schema
-- AI 自動學習與個人化記憶系統
-- =============================================

-- 用戶互動記錄表
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_tab TEXT,
  action_type TEXT NOT NULL DEFAULT 'unknown',
  platform TEXT,
  industry TEXT,
  content_style TEXT,
  language_used TEXT,
  prompt_summary TEXT,
  response_length INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用戶偏好設定表（AI 學習後的彙整）
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_platforms JSONB DEFAULT '{}',
  preferred_industries JSONB DEFAULT '{}',
  preferred_styles JSONB DEFAULT '{}',
  language_preference TEXT DEFAULT 'zh-TW',
  tone_preference TEXT DEFAULT 'professional',
  interaction_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 用戶回饋記錄表
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_id UUID REFERENCES user_interactions(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL,
  rating INTEGER CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 索引（提升查詢效能）
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id 
ON user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at 
ON user_interactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_date 
ON user_interactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id 
ON user_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_user_feedback_interaction_id 
ON user_feedback(interaction_id);

-- =============================================
-- Row Level Security (RLS) 政策
-- 確保用戶只能存取自己的數據
-- =============================================

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- 用戶互動記錄 RLS
CREATE POLICY "Users can view own interactions" ON user_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用戶偏好 RLS
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用戶回饋 RLS
CREATE POLICY "Users can view own feedback" ON user_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON user_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Service Role 政策（後端服務使用）
-- =============================================

CREATE POLICY "Service role full access interactions" ON user_interactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access feedback" ON user_feedback
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 註解說明
-- =============================================

COMMENT ON TABLE user_interactions IS '用戶與 AI 功能的互動記錄';
COMMENT ON TABLE user_preferences IS 'AI 學習後彙整的用戶偏好';
COMMENT ON TABLE user_feedback IS '用戶對 AI 回應的回饋（👍👎）';

COMMENT ON COLUMN user_interactions.feature_tab IS '使用的功能頁籤（image_gen, ads_advisor, course_editor, bizprompt）';
COMMENT ON COLUMN user_interactions.action_type IS '操作類型（generate, copy, edit, regenerate, export）';
COMMENT ON COLUMN user_interactions.platform IS '目標平台（shopee, tiktok, instagram, facebook）';
COMMENT ON COLUMN user_interactions.industry IS '產業類型（fashion, mother_kids, pet, art_toy, others）';
COMMENT ON COLUMN user_interactions.content_style IS '內容風格偏好';
COMMENT ON COLUMN user_interactions.metadata IS '其他擴展資料（JSON格式）';

COMMENT ON COLUMN user_preferences.preferred_platforms IS '平台偏好權重（JSON格式，如 {"shopee": 40, "tiktok": 30}）';
COMMENT ON COLUMN user_preferences.preferred_industries IS '產業偏好權重（JSON格式）';
COMMENT ON COLUMN user_preferences.interaction_count IS '歷史互動總次數';

COMMENT ON COLUMN user_feedback.feedback_type IS '回饋類型（thumbs_up, thumbs_down, edit, regenerate）';
COMMENT ON COLUMN user_feedback.rating IS '評分（1-5，可選）';
