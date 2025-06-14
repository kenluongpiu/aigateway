/**
 * Database connection service using PostgreSQL
 * Compatible with Cloudflare Workers environment
 */
import { Pool } from 'pg';
class DatabaseService {
    pool;
    static instance;
    constructor(databaseUrl) {
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is required to initialize DatabaseService');
        }
        this.pool = new Pool({
            connectionString: databaseUrl,
            ssl: {
                rejectUnauthorized: false // For cloud databases
            },
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        });
        // Handle pool errors
        this.pool.on('error', (err, client) => {
            console.error('Unexpected error on idle client', err);
            process.exit(-1);
        });
    }
    static getInstance(databaseUrl) {
        if (!DatabaseService.instance && databaseUrl) {
            DatabaseService.instance = new DatabaseService(databaseUrl);
        }
        if (!DatabaseService.instance) {
            throw new Error('DatabaseService must be initialized with DATABASE_URL first');
        }
        return DatabaseService.instance;
    }
    /**
     * Initialize database service with environment variables
     */
    static init(env) {
        const databaseUrl = env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }
        return DatabaseService.getInstance(databaseUrl);
    }
    /**
     * Get a client from the pool
     */
    async getClient() {
        return await this.pool.connect();
    }
    /**
     * Execute a query with automatic client management
     */
    async query(text, params) {
        const client = await this.getClient();
        try {
            const result = await client.query(text, params);
            return result;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Execute multiple queries in a transaction
     */
    async transaction(queries) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const results = [];
            for (const query of queries) {
                const result = await client.query(query.text, query.params);
                results.push(result);
            }
            await client.query('COMMIT');
            return results;
        }
        catch (error) {
            await client.query('ROLLBACK');
            console.error('Transaction error:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const result = await this.query('SELECT NOW() as current_time, version() as postgres_version');
            console.log('✅ Database connection successful!');
            console.log(`📅 Current time: ${result.rows[0].current_time}`);
            console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
            return true;
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            return false;
        }
    }
    /**
     * Close all connections
     */
    async close() {
        await this.pool.end();
    }
}
export default DatabaseService;
