/**
 * Authentication Middleware for AI Gateway
 * Handles JWT token validation and user authentication
 */
import { verify } from 'hono/jwt';
import DatabaseService from '../services/database';
class AuthService {
    db;
    jwtSecret;
    constructor() {
        this.db = DatabaseService.getInstance();
        this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        if (!process.env.JWT_SECRET) {
            console.warn('⚠️ JWT_SECRET not set in environment variables!');
        }
    }
    /**
     * JWT Authentication Middleware
     */
    async jwtAuth(c, next) {
        try {
            const authHeader = c.req.header('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'Missing or invalid Authorization header. Use: Bearer <token>'
                }, 401);
            }
            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            if (!token) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'No token provided'
                }, 401);
            } // Verify JWT token
            const payload = await verify(token, this.jwtSecret);
            if (!payload || !payload.userId) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'Invalid token payload'
                }, 401);
            }
            // Get user from database
            const user = await this.getUserById(payload.userId, payload.role);
            if (!user) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'User not found or inactive'
                }, 401);
            }
            // Attach user to context
            c.set('user', user);
            await next();
        }
        catch (error) {
            console.error('JWT Auth Error:', error);
            if (error.name === 'JwtTokenExpired') {
                return c.json({
                    error: 'Token Expired',
                    message: 'JWT token has expired. Please login again.'
                }, 401);
            }
            if (error.name === 'JwtTokenInvalid') {
                return c.json({
                    error: 'Invalid Token',
                    message: 'JWT token is invalid'
                }, 401);
            }
            return c.json({
                error: 'Authentication Error',
                message: 'Failed to authenticate token'
            }, 401);
        }
    }
    /**
     * Virtual Key Authentication Middleware
     * For API key-based authentication
     */
    async virtualKeyAuth(c, next) {
        try {
            const apiKey = c.req.header('X-API-Key') || c.req.header('x-portkey-api-key');
            if (!apiKey) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'Missing API key. Use X-API-Key header.'
                }, 401);
            }
            // Get virtual key from database
            const keyData = await this.getVirtualKey(apiKey);
            if (!keyData) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'Invalid API key'
                }, 401);
            }
            if (keyData.status !== 'active') {
                return c.json({
                    error: 'Unauthorized',
                    message: `API key is ${keyData.status}`
                }, 401);
            }
            // Check if key is expired
            if (keyData.expires_at && new Date() > new Date(keyData.expires_at)) {
                return c.json({
                    error: 'Unauthorized',
                    message: 'API key has expired'
                }, 401);
            }
            // Update last used timestamp
            await this.updateKeyLastUsed(keyData.id);
            // Attach key data and customer to context
            c.set('virtualKey', keyData);
            c.set('customer', keyData.customer);
            await next();
        }
        catch (error) {
            console.error('Virtual Key Auth Error:', error);
            return c.json({
                error: 'Authentication Error',
                message: 'Failed to authenticate API key'
            }, 401);
        }
    }
    /**
     * Admin Role Middleware
     */
    async adminAuth(c, next) {
        const user = c.get('user');
        if (!user || user.role !== 'admin') {
            return c.json({
                error: 'Forbidden',
                message: 'Admin access required'
            }, 403);
        }
        await next();
    }
    /**
     * Get user by ID and role
     */
    async getUserById(userId, role) {
        try {
            if (role === 'admin') {
                const result = await this.db.query('SELECT id, username as email, full_name, role FROM admin_users WHERE id = $1 AND is_active = true', [userId]);
                if (result.rows.length === 0)
                    return null;
                return {
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    role: 'admin',
                    full_name: result.rows[0].full_name
                };
            }
            else {
                const result = await this.db.query('SELECT id, email, full_name, plan_id FROM customers WHERE id = $1 AND status = $2', [userId, 'active']);
                if (result.rows.length === 0)
                    return null;
                return {
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    role: 'customer',
                    full_name: result.rows[0].full_name,
                    plan_id: result.rows[0].plan_id
                };
            }
        }
        catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
    /**
     * Get virtual key data
     */
    async getVirtualKey(apiKey) {
        try {
            const bcrypt = await import('bcryptjs');
            // Get all active keys and check hash
            const result = await this.db.query(`
        SELECT 
          vk.id, vk.customer_id, vk.key_name, vk.api_key_hash, 
          vk.status, vk.expires_at, vk.requests_per_minute, 
          vk.tokens_per_day, vk.concurrent_requests,
          c.id as customer_id, c.email, c.full_name, c.plan_id, c.status as customer_status
        FROM virtual_keys vk
        JOIN customers c ON vk.customer_id = c.id
        WHERE vk.status = 'active' AND c.status = 'active'
      `);
            // Check each key hash
            for (const row of result.rows) {
                const isMatch = await bcrypt.compare(apiKey, row.api_key_hash);
                if (isMatch) {
                    return {
                        id: row.id,
                        customer_id: row.customer_id,
                        key_name: row.key_name,
                        status: row.status,
                        expires_at: row.expires_at,
                        requests_per_minute: row.requests_per_minute,
                        tokens_per_day: row.tokens_per_day,
                        concurrent_requests: row.concurrent_requests,
                        customer: {
                            id: row.customer_id,
                            email: row.email,
                            full_name: row.full_name,
                            plan_id: row.plan_id,
                            status: row.customer_status
                        }
                    };
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error getting virtual key:', error);
            return null;
        }
    }
    /**
     * Update last used timestamp for virtual key
     */
    async updateKeyLastUsed(keyId) {
        try {
            await this.db.query('UPDATE virtual_keys SET last_used = CURRENT_TIMESTAMP WHERE id = $1', [keyId]);
        }
        catch (error) {
            console.error('Error updating key last used:', error);
        }
    }
}
// Export singleton instance
const authService = new AuthService();
export const jwtAuth = authService.jwtAuth.bind(authService);
export const virtualKeyAuth = authService.virtualKeyAuth.bind(authService);
export const adminAuth = authService.adminAuth.bind(authService);
export default authService;
