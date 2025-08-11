-- Dupe&more データベーステーブル作成SQL
-- Supabaseの SQL Editor で実行してください

-- 1. スタッフテーブル
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 日報テーブル
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_id UUID REFERENCES staff(id),
  date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ブログ記事テーブル
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  author_id UUID REFERENCES staff(id),
  original_report_id UUID REFERENCES daily_reports(id),
  tags TEXT[],
  image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 4. イベントテーブル（将来拡張用）
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ニューステーブル（将来拡張用）
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 6. オーナーメッセージテーブル
CREATE TABLE IF NOT EXISTS owner_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  year_month VARCHAR(7) NOT NULL, -- YYYY-MM format
  title VARCHAR(255) NOT NULL,
  body_md TEXT NOT NULL,
  highlights TEXT[],
  sources UUID[], -- daily_reports のIDの配列
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(year_month, status) -- 月ごとに1つのpublished messageのみ
);

-- Row Level Security (RLS) の設定
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_messages ENABLE ROW LEVEL SECURITY;

-- ポリシーの作成

-- スタッフテーブルのポリシー
CREATE POLICY "Allow service role full access to staff" ON staff
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow anon read published blog posts" ON blog_posts
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow service role full access to blog_posts" ON blog_posts
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access to daily_reports" ON daily_reports
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow anon read published events" ON events
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow service role full access to events" ON events
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow anon read published news" ON news
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow service role full access to news" ON news
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow anon read published owner messages" ON owner_messages
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "Allow service role full access to owner_messages" ON owner_messages
  FOR ALL TO service_role USING (true);

-- 初期データの投入
-- 管理者アカウント（パスワード: admin123）
INSERT INTO staff (name, email, password_hash, role) 
VALUES ('管理者', 'admin@dupe-more.com', '$2b$10$rGK.5H7K9xJ8P9Q2L3M4weOWGI7P9Q2L3M4weOWGI7', 'admin')
ON CONFLICT (email) DO NOTHING;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_staff ON daily_reports(staff_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_owner_messages_year_month ON owner_messages(year_month);
CREATE INDEX IF NOT EXISTS idx_owner_messages_status ON owner_messages(status);