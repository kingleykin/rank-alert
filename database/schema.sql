-- Cloudflare D1 Schema cho RankAlert

-- Bảng lưu các nguồn ranking
CREATE TABLE rankings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  source_url TEXT,
  description TEXT,
  update_frequency INTEGER DEFAULT 600, -- seconds
  last_updated TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu items trong ranking (snapshot hiện tại)
CREATE TABLE ranking_items (
  id TEXT PRIMARY KEY,
  ranking_id TEXT NOT NULL,
  position INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_image TEXT,
  score REAL,
  metadata TEXT, -- JSON
  timestamp TEXT NOT NULL,
  FOREIGN KEY (ranking_id) REFERENCES rankings(id)
);

CREATE INDEX idx_ranking_items_ranking ON ranking_items(ranking_id, timestamp);
CREATE INDEX idx_ranking_items_item ON ranking_items(item_id);

-- Bảng lưu lịch sử thay đổi
CREATE TABLE ranking_history (
  id TEXT PRIMARY KEY,
  ranking_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  old_position INTEGER,
  new_position INTEGER,
  change_type TEXT NOT NULL, -- 'up', 'down', 'new', 'out', 'same'
  change_amount INTEGER,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (ranking_id) REFERENCES rankings(id)
);

CREATE INDEX idx_history_ranking ON ranking_history(ranking_id, timestamp);
CREATE INDEX idx_history_item ON ranking_history(item_id, timestamp);

-- Bảng subscription (người dùng theo dõi BXH nào)
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  ranking_id TEXT NOT NULL,
  notify_on_change INTEGER DEFAULT 1, -- boolean
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ranking_id) REFERENCES rankings(id)
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_ranking ON subscriptions(ranking_id);

-- Bảng lưu OneSignal player IDs
CREATE TABLE user_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  onesignal_player_id TEXT NOT NULL,
  device_type TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_devices_user ON user_devices(user_id);
