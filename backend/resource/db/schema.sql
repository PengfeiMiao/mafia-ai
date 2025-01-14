-- table schema
CREATE TABLE IF NOT EXISTS message (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL
);