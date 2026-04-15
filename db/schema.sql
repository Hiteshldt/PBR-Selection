PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS quotes (
  id              TEXT PRIMARY KEY,
  reference       TEXT NOT NULL UNIQUE,
  access_token    TEXT NOT NULL UNIQUE,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'received',
  organisation    TEXT,
  contact_name    TEXT,
  email           TEXT,
  phone           TEXT,
  country         TEXT,
  currency        TEXT,
  delivery        TEXT,
  quotation_date  TEXT,
  total_inr       INTEGER,
  display_total   INTEGER,
  config_json     TEXT NOT NULL,
  pricing_json    TEXT NOT NULL,
  remarks         TEXT
);

CREATE INDEX IF NOT EXISTS idx_quotes_status  ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_email   ON quotes(email);

CREATE TABLE IF NOT EXISTS quote_status_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id    TEXT NOT NULL,
  status      TEXT NOT NULL,
  note        TEXT,
  eta_date    TEXT,
  changed_by  TEXT,
  changed_at  TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_quote ON quote_status_history(quote_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  name           TEXT,
  created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_id    TEXT NOT NULL,
  comment     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);
