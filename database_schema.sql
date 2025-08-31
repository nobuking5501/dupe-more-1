-- 日報テーブル（スタッフの日々の記録）
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID,
  staff_name VARCHAR(255) NOT NULL DEFAULT 'かなえ',
  report_date DATE NOT NULL,
  weather_temperature TEXT, -- 天気・気温（季節感の演出用）
  customer_attributes TEXT, -- お客様の属性（年代・性別・来店回数）
  visit_reason_purpose TEXT, -- お客様の来店のきっかけ・目的
  treatment_details TEXT, -- 本日の施術内容（部位・時間・機器）
  customer_before_treatment TEXT, -- 施術前のお客様の様子（表情・不安や期待）
  customer_after_treatment TEXT, -- 施術後のお客様の反応（感想・笑顔・変化）
  salon_atmosphere TEXT, -- 今日のサロンの雰囲気や出来事（BGM・香り・小話）
  insights_innovations TEXT, -- 今日の気づき・工夫（喜ばれた点や障害者向け配慮）
  kanae_personal_thoughts TEXT, -- かなえさんのひと言感想（嬉しかったこと・明日への思い）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 月次メッセージテーブル（既存）
CREATE TABLE IF NOT EXISTS monthly_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_month VARCHAR(7) NOT NULL UNIQUE, -- YYYY-MM format
  message TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_reports_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE
);

-- 日報データのサンプル挿入（新項目対応）
INSERT INTO daily_reports (
  staff_name, report_date, weather_temperature, customer_attributes, visit_reason_purpose,
  treatment_details, customer_before_treatment, customer_after_treatment, salon_atmosphere,
  insights_innovations, kanae_personal_thoughts
)
VALUES 
  (
    'かなえ', '2024-08-15', '晴れ 28℃ 暖かく過ごしやすい日',
    '10代後半 女性 初回来店',
    '学校のイベント前に自信を持ちたいとのことでご来店',
    '腕・脚の脱毛施術 約60分 光脱毛機使用',
    '少し緊張されていたが、期待に満ちた表情。お母様も一緒で安心されている様子',
    '施術後は「思ったより痛くなかった」と安心された表情。鏡で確認して笑顔になられた',
    '落ち着いたクラシック音楽とラベンダーの香り。お客様の好きなアニメの話で盛り上がった',
    '初回のお客様には特に丁寧な説明を心がけ、痛みの不安を取り除くことができた',
    '初めてのお客様が安心して帰られた姿を見て、この仕事の意味を改めて感じました。明日も温かい接客を心がけたいです'
  ),
  (
    'かなえ', '2024-08-16', '曇り 24℃ 涼しく落ち着いた天気',
    '20代前半 男性 3回目来店',
    '感覚過敏があり、自己処理の負担を減らしたいとのご希望',
    '顔周り脱毛 約45分 低刺激設定で施術',
    '前回より慣れた様子だが、やや緊張気味。触覚に敏感なため事前に説明を重視',
    '施術中は落ち着いて過ごされ、終了時に「楽になりました」とほっとした表情',
    '静かなピアノ曲と無香料の環境。お客様のペースに合わせてゆっくり進行',
    '感覚過敏の方には機器の設定を下げ、触れる前の声かけを徹底することが効果的',
    'お客様のペースに合わせることで信頼関係が深まったと感じます。障害特性に寄り添う接客ができて嬉しかったです'
  ),
  (
    'かなえ', '2024-08-17', '小雨 22℃ しっとりした涼しい日',
    '30代前半 女性 5回目来店',
    '結婚式前の準備として、美しい肌を目指してご来店',
    '全身脱毛コース 約90分 段階的に部位を変えて施術',
    '今日は体調が少し優れない様子だったが、前向きな気持ちで来店',
    '途中で休憩を挟みながら進めたことで、最後は満足そうな笑顔を見せてくださった',
    '雨音が心地よいBGMと、柑橘系のさわやかな香り。結婚式の話で盛り上がった',
    '体調に配慮して休憩を多めに取ったことで、お客様が最後まで快適に過ごせた',
    '大切な日に向けて頑張るお客様を支えられることに喜びを感じます。一人ひとりに寄り添う時間を大切にしていきたいです'
  )
ON CONFLICT DO NOTHING;

-- ブログ記事テーブル（週次日報データから生成される記事）
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- 2000文字程度の記事内容
  week_start_date DATE NOT NULL, -- 対象週の開始日（月曜日）
  week_end_date DATE NOT NULL, -- 対象週の終了日（日曜日）
  source_reports_count INTEGER DEFAULT 0, -- 使用した日報件数
  status VARCHAR(20) DEFAULT 'draft', -- draft, published
  author_name VARCHAR(255) DEFAULT 'システム管理者',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 小話テーブル（日報データから毎日自動生成される小話）
CREATE TABLE IF NOT EXISTS short_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- 小話の内容（300-500文字程度）
  source_report_id UUID, -- 元になった日報のID
  report_date DATE NOT NULL, -- 対象日報の日付
  weather_info VARCHAR(255), -- 天気情報（季節感用）
  customer_type VARCHAR(255), -- お客様タイプ（匿名化）
  key_moment TEXT, -- 印象的な瞬間
  emotional_tone VARCHAR(50), -- 感情のトーン（heartwarming, inspiring, gentle等）
  status VARCHAR(20) DEFAULT 'active', -- active, archived
  is_featured BOOLEAN DEFAULT FALSE, -- トップページ掲載フラグ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) ポリシー
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_stories ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow read access for daily_reports" ON daily_reports FOR SELECT USING (true);
CREATE POLICY "Allow read access for monthly_messages" ON monthly_messages FOR SELECT USING (true);
CREATE POLICY "Allow read access for blog_posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Allow read access for short_stories" ON short_stories FOR SELECT USING (true);

-- 認証されたユーザーのみ挿入・更新可能（将来的な管理機能用）
CREATE POLICY "Allow insert access for daily_reports" ON daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access for daily_reports" ON daily_reports FOR UPDATE USING (true);
CREATE POLICY "Allow insert access for monthly_messages" ON monthly_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access for monthly_messages" ON monthly_messages FOR UPDATE USING (true);
CREATE POLICY "Allow insert access for blog_posts" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access for blog_posts" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Allow insert access for short_stories" ON short_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update access for short_stories" ON short_stories FOR UPDATE USING (true);

-- 小話サンプルデータ
INSERT INTO short_stories (
  title, content, report_date, weather_info, customer_type, key_moment, emotional_tone, is_featured
)
VALUES 
  (
    '初めての安心、二度目の笑顔',
    '暖かな春の日差しが差し込むサロンで、初回来店の女子高生のお客様をお迎えしました。最初は少し緊張されていましたが、お母様と一緒ということもあり、だんだんリラックスしていただけました。

施術が始まると「思ったより痛くない」と安心された表情を見せてくださり、最後は鏡で仕上がりを確認して素敵な笑顔を浮かべられました。「また来ます」という言葉と共に、明るい気持ちで帰られる姿を見て、私たちも温かい気持ちになりました。

お一人お一人の「初めての一歩」に寄り添えることは、私たちにとって何よりの喜びです。',
    '2024-08-15',
    '晴れ 28℃ 暖かく過ごしやすい日',
    '10代後半女性・初回来店',
    '施術後の安心した笑顔と「また来ます」という言葉',
    'heartwarming',
    true
  ),
  (
    'ペースに合わせて、信頼を築く',
    '少し涼しい曇りの日、感覚過敏をお持ちの男性のお客様が3回目の来店をしてくださいました。前回より慣れた様子でしたが、やはり触覚に敏感なため、事前の説明を特に丁寧に行いました。

機器の設定を低刺激にし、触れる前には必ず声をかけるよう心がけました。お客様は静かなピアノ曲と無香料の環境の中で、落ち着いて施術を受けられ、終了時には「楽になりました」とほっとした表情を見せてくださいました。

お客様のペースに合わせることで、信頼関係が深まっていくのを感じています。障害特性に寄り添う接客ができることに、深い喜びを感じています。',
    '2024-08-16',
    '曇り 24℃ 涼しく落ち着いた天気',
    '20代前半男性・3回目来店',
    'お客様のペースに合わせた配慮で深まる信頼関係',
    'gentle',
    false
  )
ON CONFLICT DO NOTHING;