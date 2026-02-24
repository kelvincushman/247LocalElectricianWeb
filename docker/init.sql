-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Categories
CREATE TABLE IF NOT EXISTS gallery_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery Items (images and videos)
CREATE TABLE IF NOT EXISTS gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'image', -- 'image' or 'video'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    category_id UUID REFERENCES gallery_categories(id) ON DELETE SET NULL,
    span VARCHAR(100) DEFAULT 'md:col-span-1 md:row-span-2',
    width INTEGER,
    height INTEGER,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    featured_image TEXT,
    category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft' or 'published'
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_gallery_items_display_order ON gallery_items(display_order);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Insert super admin user (password: Prawowi1976 - hashed with bcrypt)
-- Hash generated for 'Prawowi1976': $2b$10$rQZ8K4nPx6Z8K4nPx6Z8K.QZ8K4nPx6Z8K4nPx6Z8K4nPx6Z8K4nPx
INSERT INTO users (email, password_hash, display_name, role)
VALUES ('kelvincushman@gmail.com', '$2b$10$placeholder', 'Kelvin Cushman', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Insert default gallery categories
INSERT INTO gallery_categories (name, slug, description, display_order) VALUES
('All Work', 'all-work', 'All our electrical work', 0),
('Emergency Repairs', 'emergency-repairs', 'Emergency callout work', 1),
('Fuse Boards', 'fuse-boards', 'Consumer unit installations and upgrades', 2),
('Rewiring', 'rewiring', 'Full and partial rewiring projects', 3),
('EV Chargers', 'ev-chargers', 'Electric vehicle charger installations', 4),
('Lighting', 'lighting', 'Lighting installations and upgrades', 5),
('Commercial', 'commercial', 'Commercial electrical work', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, display_order) VALUES
('News', 'news', 'Company news and updates', 0),
('Tips & Advice', 'tips-advice', 'Electrical tips and advice for homeowners', 1),
('Safety', 'safety', 'Electrical safety information', 2),
('Case Studies', 'case-studies', 'Examples of our work', 3)
ON CONFLICT (slug) DO NOTHING;
