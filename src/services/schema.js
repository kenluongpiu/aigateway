/**
 * Database Schema Definition
 * Complete schema for AI Gateway business logic
 */
import DatabaseService from './database';
const db = DatabaseService.getInstance();
export class DatabaseSchema {
    /**
     * Create all tables for the application
     */
    static async createTables() {
        console.log('🗄️ Creating database schema...');
        const tables = [
            // 1. Plans table - Subscription plans
            `
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly, one-time
        features JSONB DEFAULT '[]'::jsonb,
        token_quota BIGINT DEFAULT 0, -- Monthly token limit
        requests_per_minute INTEGER DEFAULT 100,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 2. Customers table - User accounts
            `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        company_name VARCHAR(255),
        phone VARCHAR(50),
        plan_id INTEGER REFERENCES plans(id) DEFAULT 1,
        status VARCHAR(20) DEFAULT 'active', -- active, suspended, cancelled
        email_verified BOOLEAN DEFAULT false,
        email_verification_token VARCHAR(255),
        password_reset_token VARCHAR(255),
        password_reset_expires TIMESTAMP,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 3. Virtual Keys table - API keys for customers
            `
      CREATE TABLE IF NOT EXISTS virtual_keys (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        key_name VARCHAR(100) NOT NULL,
        api_key_hash VARCHAR(255) NOT NULL UNIQUE,
        api_key_prefix VARCHAR(20) NOT NULL, -- First few chars for display
        provider VARCHAR(50), -- openai, anthropic, google, etc.
        upstream_api_key TEXT, -- Encrypted actual provider API key
        status VARCHAR(20) DEFAULT 'active', -- active, disabled, expired
        requests_per_minute INTEGER DEFAULT 100,
        tokens_per_day BIGINT DEFAULT 10000,
        concurrent_requests INTEGER DEFAULT 5,
        allowed_models JSONB DEFAULT '[]'::jsonb, -- Specific models allowed
        rate_limit_settings JSONB DEFAULT '{}'::jsonb,
        expires_at TIMESTAMP,
        last_used TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 4. Customer Subscriptions table
            `
      CREATE TABLE IF NOT EXISTS customer_subscriptions (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        plan_id INTEGER NOT NULL REFERENCES plans(id),
        status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, pending
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        auto_renew BOOLEAN DEFAULT true,
        stripe_subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 5. Usage Logs table - Track all API usage
            `
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        virtual_key_id INTEGER NOT NULL REFERENCES virtual_keys(id),
        request_id VARCHAR(255) NOT NULL,
        service_type VARCHAR(50) NOT NULL, -- chat_completion, embedding, image_generation, etc.
        model VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        prompt_tokens INTEGER DEFAULT 0,
        completion_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        cost DECIMAL(10,6) DEFAULT 0, -- Cost in USD
        response_time_ms INTEGER,
        status_code INTEGER,
        error_message TEXT,
        request_data JSONB,
        response_data JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 6. Unit Prices table - Pricing for different models/services
            `
      CREATE TABLE IF NOT EXISTS unit_prices (
        id SERIAL PRIMARY KEY,
        service_type VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        unit VARCHAR(20) NOT NULL, -- token, image, minute, etc.
        input_price DECIMAL(10,8) DEFAULT 0, -- Price per input unit
        output_price DECIMAL(10,8) DEFAULT 0, -- Price per output unit
        base_price DECIMAL(10,6) DEFAULT 0, -- Base price (for images, etc.)
        effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(service_type, model, provider, effective_date)
      );
      `,
            // 7. Billing Records table
            `
      CREATE TABLE IF NOT EXISTS billing_records (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        billing_period_start TIMESTAMP NOT NULL,
        billing_period_end TIMESTAMP NOT NULL,
        total_tokens BIGINT DEFAULT 0,
        total_requests INTEGER DEFAULT 0,
        total_cost DECIMAL(10,2) DEFAULT 0,
        subscription_cost DECIMAL(10,2) DEFAULT 0,
        usage_cost DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
        invoice_number VARCHAR(100) UNIQUE,
        stripe_invoice_id VARCHAR(255),
        due_date TIMESTAMP,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 8. Gateway Configs table - Custom configurations per key
            `
      CREATE TABLE IF NOT EXISTS gateway_configs (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES customers(id),
        virtual_key_id INTEGER REFERENCES virtual_keys(id),
        config_name VARCHAR(100) NOT NULL,
        retry_settings JSONB DEFAULT '{
          "attempts": 3,
          "exponential_backoff": true,
          "max_delay_ms": 5000
        }'::jsonb,
        fallback_settings JSONB DEFAULT '{
          "enabled": false,
          "fallback_models": []
        }'::jsonb,
        cache_settings JSONB DEFAULT '{
          "enabled": true,
          "ttl_seconds": 300,
          "semantic_cache": false
        }'::jsonb,
        guardrails_settings JSONB DEFAULT '{
          "input_guardrails": [],
          "output_guardrails": []
        }'::jsonb,
        is_default BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 9. API Limits table - Rate limiting configurations
            `
      CREATE TABLE IF NOT EXISTS api_limits (
        id SERIAL PRIMARY KEY,
        virtual_key_id INTEGER NOT NULL REFERENCES virtual_keys(id) ON DELETE CASCADE,
        requests_per_minute INTEGER DEFAULT 100,
        requests_per_hour INTEGER DEFAULT 1000,
        requests_per_day INTEGER DEFAULT 10000,
        tokens_per_minute BIGINT DEFAULT 10000,
        tokens_per_hour BIGINT DEFAULT 100000,
        tokens_per_day BIGINT DEFAULT 1000000,
        concurrent_requests INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `,
            // 10. Admin Users table - For admin dashboard
            `
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin', -- admin, super_admin, support
        permissions JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `
        ];
        try {
            for (let i = 0; i < tables.length; i++) {
                console.log(`📝 Creating table ${i + 1}/${tables.length}...`);
                await db.query(tables[i]);
            }
            console.log('✅ All tables created successfully!');
        }
        catch (error) {
            console.error('❌ Error creating tables:', error);
            throw error;
        }
    }
    /**
     * Create indexes for better performance
     */
    static async createIndexes() {
        console.log('📊 Creating database indexes...');
        const indexes = [
            // Customers indexes
            'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);',
            'CREATE INDEX IF NOT EXISTS idx_customers_plan_id ON customers(plan_id);',
            'CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);',
            // Virtual Keys indexes
            'CREATE INDEX IF NOT EXISTS idx_virtual_keys_customer_id ON virtual_keys(customer_id);',
            'CREATE INDEX IF NOT EXISTS idx_virtual_keys_api_key_hash ON virtual_keys(api_key_hash);',
            'CREATE INDEX IF NOT EXISTS idx_virtual_keys_status ON virtual_keys(status);',
            // Usage Logs indexes (most important for performance)
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_id ON usage_logs(customer_id);',
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_virtual_key_id ON usage_logs(virtual_key_id);',
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);',
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_service_type ON usage_logs(service_type);',
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_model ON usage_logs(model);',
            'CREATE INDEX IF NOT EXISTS idx_usage_logs_customer_created ON usage_logs(customer_id, created_at);',
            // Billing Records indexes
            'CREATE INDEX IF NOT EXISTS idx_billing_records_customer_id ON billing_records(customer_id);',
            'CREATE INDEX IF NOT EXISTS idx_billing_records_period ON billing_records(billing_period_start, billing_period_end);',
            'CREATE INDEX IF NOT EXISTS idx_billing_records_status ON billing_records(status);',
            // Subscriptions indexes
            'CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);',
            'CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);',
            // Unit Prices indexes
            'CREATE INDEX IF NOT EXISTS idx_unit_prices_service_model ON unit_prices(service_type, model, provider);',
            'CREATE INDEX IF NOT EXISTS idx_unit_prices_active ON unit_prices(is_active, effective_date);'
        ];
        try {
            for (let i = 0; i < indexes.length; i++) {
                console.log(`📊 Creating index ${i + 1}/${indexes.length}...`);
                await db.query(indexes[i]);
            }
            console.log('✅ All indexes created successfully!');
        }
        catch (error) {
            console.error('❌ Error creating indexes:', error);
            throw error;
        }
    }
    /**
     * Insert default data
     */
    static async insertDefaultData() {
        console.log('📋 Inserting default data...');
        try {
            // Insert default plans
            await db.query(`
        INSERT INTO plans (name, description, price, billing_cycle, token_quota, requests_per_minute, features)
        VALUES 
          ('Free', 'Free tier with basic features', 0, 'monthly', 10000, 10, '["API Access", "Community Support"]'),
          ('Starter', 'Perfect for small projects', 10, 'monthly', 100000, 100, '["API Access", "Email Support", "Basic Analytics"]'),
          ('Professional', 'For growing businesses', 50, 'monthly', 1000000, 500, '["API Access", "Priority Support", "Advanced Analytics", "Custom Limits"]'),
          ('Enterprise', 'For large organizations', 200, 'monthly', 10000000, 2000, '["API Access", "24/7 Support", "Advanced Analytics", "Custom Integration", "SLA"]')
        ON CONFLICT (name) DO NOTHING;
      `);
            // Insert default unit prices
            await db.query(`
        INSERT INTO unit_prices (service_type, model, provider, unit, input_price, output_price, base_price)
        VALUES 
          ('chat_completion', 'gpt-4o-mini', 'openai', 'token', 0.00000015, 0.0000006, 0),
          ('chat_completion', 'gpt-4o', 'openai', 'token', 0.000005, 0.000015, 0),
          ('chat_completion', 'claude-3-haiku', 'anthropic', 'token', 0.00000025, 0.00000125, 0),
          ('chat_completion', 'claude-3-sonnet', 'anthropic', 'token', 0.000003, 0.000015, 0),
          ('embedding', 'text-embedding-ada-002', 'openai', 'token', 0.0000001, 0, 0),
          ('image_generation', 'dall-e-3', 'openai', 'image', 0, 0, 0.04),
          ('image_generation', 'dall-e-2', 'openai', 'image', 0, 0, 0.02),
          ('audio_transcription', 'whisper-1', 'openai', 'minute', 0, 0, 0.006),
          ('audio_speech', 'tts-1', 'openai', 'character', 0.000015, 0, 0)
        ON CONFLICT (service_type, model, provider, effective_date) DO NOTHING;
      `); // Insert default admin user (admin/admin123)
            const bcrypt = await import('bcryptjs');
            const adminPasswordHash = await bcrypt.hash('admin123', 10);
            await db.query(`
        INSERT INTO admin_users (username, email, password_hash, full_name, role, permissions)
        VALUES 
          ('admin', 'admin@aigateway.local', $1, 'System Administrator', 'super_admin', '["all"]')
        ON CONFLICT (username) DO NOTHING;
      `, [adminPasswordHash]);
            console.log('✅ Default data inserted successfully!');
            console.log('📝 Default admin user: admin / admin123');
        }
        catch (error) {
            console.error('❌ Error inserting default data:', error);
            throw error;
        }
    }
    /**
     * Setup complete database schema
     */
    static async setupDatabase() {
        try {
            console.log('🚀 Setting up complete database schema...');
            await this.createTables();
            await this.createIndexes();
            await this.insertDefaultData();
            console.log('🎉 Database setup completed successfully!');
            console.log('🔗 Database ready for AI Gateway business logic');
        }
        catch (error) {
            console.error('💥 Database setup failed:', error);
            throw error;
        }
    }
}
