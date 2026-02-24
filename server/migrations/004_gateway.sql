-- Migration 004: OpenClaw Gateway Integration Tables
-- Creates tables for gateway sessions, messages, leads, invoice chasing,
-- certificate reminders, email tracking, outbound queue, and analytics.

-- Gateway sessions (synced from OpenClaw)
CREATE TABLE IF NOT EXISTS gateway_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    openclaw_session_id VARCHAR(255) UNIQUE,
    channel_type VARCHAR(50) NOT NULL,
    sender_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active',
    context JSONB DEFAULT '{}',
    assigned_to VARCHAR(100),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gateway messages (synced from OpenClaw)
CREATE TABLE IF NOT EXISTS gateway_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES gateway_sessions(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    content TEXT,
    content_type VARCHAR(50) DEFAULT 'text',
    media_url TEXT,
    tool_calls JSONB,
    tokens_used INTEGER,
    model_used VARCHAR(100),
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced leads from gateway conversations
CREATE TABLE IF NOT EXISTS gateway_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES gateway_sessions(id),
    customer_id UUID REFERENCES customers(id),
    name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    postcode VARCHAR(20),
    service_type VARCHAR(100),
    description TEXT,
    urgency VARCHAR(50) DEFAULT 'flexible',
    source_channel VARCHAR(50),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice chasing tracker
CREATE TABLE IF NOT EXISTS gateway_invoice_chasing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    reminder_number INTEGER DEFAULT 1,
    channel_used VARCHAR(50),
    message_sent TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    response_received BOOLEAN DEFAULT false,
    payment_received BOOLEAN DEFAULT false
);

-- Certificate renewal tracking
CREATE TABLE IF NOT EXISTS gateway_certificate_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id UUID REFERENCES certificates(id),
    customer_id UUID REFERENCES customers(id),
    reminder_type VARCHAR(50),
    channel_used VARCHAR(50),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    booked BOOLEAN DEFAULT false
);

-- Email tracking
CREATE TABLE IF NOT EXISTS gateway_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES gateway_sessions(id),
    direction VARCHAR(10) NOT NULL,
    from_address VARCHAR(255),
    to_address VARCHAR(255),
    subject TEXT,
    body TEXT,
    message_id VARCHAR(500),
    in_reply_to VARCHAR(500),
    classification VARCHAR(50),
    status VARCHAR(50) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outbound message queue
CREATE TABLE IF NOT EXISTS gateway_outbound_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id VARCHAR(255) NOT NULL,
    channel_type VARCHAR(50) NOT NULL,
    message_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'pending',
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics
CREATE TABLE IF NOT EXISTS gateway_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    channel_type VARCHAR(50) NOT NULL,
    conversations_started INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    leads_captured INTEGER DEFAULT 0,
    invoices_chased INTEGER DEFAULT 0,
    payments_collected_amount DECIMAL(10,2) DEFAULT 0,
    certificates_renewed INTEGER DEFAULT 0,
    emails_processed INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER,
    UNIQUE(date, channel_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gw_sessions_channel ON gateway_sessions(channel_type);
CREATE INDEX IF NOT EXISTS idx_gw_sessions_customer ON gateway_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_gw_sessions_status ON gateway_sessions(status);
CREATE INDEX IF NOT EXISTS idx_gw_messages_session ON gateway_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_gw_messages_created ON gateway_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_gw_leads_status ON gateway_leads(status);
CREATE INDEX IF NOT EXISTS idx_gw_leads_created ON gateway_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_gw_chasing_invoice ON gateway_invoice_chasing(invoice_id);
CREATE INDEX IF NOT EXISTS idx_gw_cert_reminders ON gateway_certificate_reminders(certificate_id);
CREATE INDEX IF NOT EXISTS idx_gw_emails_session ON gateway_emails(session_id);
CREATE INDEX IF NOT EXISTS idx_gw_outbound_status ON gateway_outbound_queue(status);
CREATE INDEX IF NOT EXISTS idx_gw_outbound_scheduled ON gateway_outbound_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_gw_analytics_date ON gateway_analytics(date);
