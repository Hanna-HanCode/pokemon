CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    set VARCHAR(255) NOT NULL,
    collector_number VARCHAR(20),
    image TEXT
);

CREATE TABLE IF NOT EXISTS listings_raw (
    id SERIAL PRIMARY KEY,
    card_name VARCHAR(255),
    price_text VARCHAR(50),
    condition_text VARCHAR(50),
    seller_name VARCHAR(255),
    language VARCHAR(50),
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings_normalized (
    id SERIAL PRIMARY KEY,
    card_id VARCHAR(50) REFERENCES cards(id),
    price DECIMAL(10, 2),
    condition VARCHAR(50),
    language VARCHAR(50),
    collected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    card_id VARCHAR(50) REFERENCES cards(id),
    language VARCHAR(50),
    avg_price DECIMAL(10, 2),
    min_price DECIMAL(10, 2),
    max_price DECIMAL(10, 2),
    listing_count INTEGER,
    UNIQUE(date, card_id, language)
);
