-- Add Google OAuth columns to customer table
-- Run this migration to support Google OAuth login

ALTER TABLE customer 
ADD COLUMN customer_google_id VARCHAR(255) NULL UNIQUE,
ADD COLUMN customer_avatar VARCHAR(500) NULL;

-- Create index for faster lookups
CREATE INDEX idx_customer_google_id ON customer(customer_google_id);
