-- Reddit Demand Signals Migration

-- Reddit posts cache
CREATE TABLE IF NOT EXISTS reddit_posts (
  id VARCHAR(100) PRIMARY KEY,
  subreddit VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  score INT DEFAULT 0,
  comments INT DEFAULT 0,
  posted_at TIMESTAMP,
  cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(subreddit, id)
);

-- App demand signals derived from Reddit analysis
CREATE TABLE IF NOT EXISTS app_demand_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_type VARCHAR(100) NOT NULL UNIQUE,
  demand_score INT DEFAULT 0,
  trending_keywords TEXT[],
  pain_points TEXT[],
  source VARCHAR(50) DEFAULT 'reddit',
  post_count INT DEFAULT 0,
  avg_engagement INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Demand metrics tracking per analysis
CREATE TABLE IF NOT EXISTS demand_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  app_type VARCHAR(100),
  demand_score_at_time INT,
  market_fit_percentage INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_posts_subreddit ON reddit_posts(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_posts_cached_at ON reddit_posts(cached_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_demand_signals_app_type ON app_demand_signals(app_type);
CREATE INDEX IF NOT EXISTS idx_app_demand_signals_score ON app_demand_signals(demand_score DESC);
CREATE INDEX IF NOT EXISTS idx_demand_metrics_analysis_id ON demand_metrics(analysis_id);
