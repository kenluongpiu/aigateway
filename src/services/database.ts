/**
 * Database connection service using PostgreSQL
 * Compatible with Cloudflare Workers environment
 */

import { Pool, PoolClient } from 'pg';

class DatabaseService {
  private pool: Pool;
  private static instance: DatabaseService;
  private constructor(databaseUrl?: string) {
    // Get DATABASE_URL from parameter or environment
    const dbUrl = databaseUrl || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    this.pool = new Pool({
      connectionString: dbUrl,
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
  public static getInstance(databaseUrl?: string): DatabaseService {
    if (!DatabaseService.instance) {
      // Try to get database URL from parameter or environment
      const dbUrl = databaseUrl || process.env.DATABASE_URL;
      if (!dbUrl) {
        throw new Error('DATABASE_URL is required to initialize DatabaseService');
      }
      DatabaseService.instance = new DatabaseService(dbUrl);
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database service with environment variables
   */
  public static init(env: any): DatabaseService {
    const databaseUrl = env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    return DatabaseService.getInstance(databaseUrl);
  }

  /**
   * Get a client from the pool
   */
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute a query with automatic client management
   */
  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction(queries: Array<{ text: string; params?: any[] }>): Promise<any[]> {
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
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as postgres_version');
      console.log('✅ Database connection successful!');
      console.log(`📅 Current time: ${result.rows[0].current_time}`);
      console.log(`🐘 PostgreSQL version: ${result.rows[0].postgres_version.split(' ')[0]}`);
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Close all connections
   */
  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default DatabaseService;
