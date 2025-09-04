-- Create database (run this first)
-- CREATE DATABASE your_database_name;

-- Use the database
-- \c your_database_name;

-- Create kids_gift_boxes table
CREATE TABLE IF NOT EXISTS kids_gift_boxes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    price VARCHAR(20) NOT NULL,
    box_contains TEXT NOT NULL,
    reviews_avg DECIMAL(2,1) CHECK (reviews_avg >= 1.0 AND reviews_avg <= 5.0),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for kids_gift_boxes
INSERT INTO kids_gift_boxes (title, price, box_contains, reviews_avg, description) VALUES 
(
    'Squishmallow Fun', 
    '$39.95', 
    'This Epic Kids Squishmallow gift box contains:
1x 12" Squishmallow plushie
1x Kit Kat Mini
2x Mini Mentos Fruit lolly rolls', 
    4.5, 
    'Perfect gift box for kids who love soft, cuddly companions! This amazing Squishmallow gift box brings joy and sweetness together. The 12-inch Squishmallow plushie is super soft and perfect for snuggles, while the sweet treats add an extra element of fun. Great for birthdays, holidays, or any special occasion!'
);



-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gift_boxes_reviews ON kids_gift_boxes(reviews_avg);
CREATE INDEX IF NOT EXISTS idx_gift_boxes_created_at ON kids_gift_boxes(created_at);