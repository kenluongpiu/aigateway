/**
 * Authentication Service
 * Handles user registration, login, password management
 */
import { sign } from 'hono/jwt';
class AuthenticationService {
    db;
    jwtSecret;
    jwtExpiresIn;
    constructor(db, env) {
        this.db = db;
        this.jwtSecret = env.JWT_SECRET || 'fallback-secret-key';
        this.jwtExpiresIn = env.JWT_EXPIRES_IN || '14d';
    }
    /**
     * User Registration
     */
    async register(c) {
        try {
            console.log('🔍 Starting registration process...');
            // Parse request body with better error handling
            let body;
            try {
                body = await c.req.json();
                console.log('📝 Request body parsed successfully');
            }
            catch (jsonError) {
                console.error('❌ JSON parsing error:', jsonError);
                return c.json({
                    success: false,
                    error: 'Invalid JSON',
                    message: 'Request body must be valid JSON'
                }, 400);
            }
            // Validate required fields
            if (!body.email || !body.password) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Email and password are required'
                }, 400);
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(body.email)) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Invalid email format'
                }, 400);
            }
            // Validate password strength
            if (body.password.length < 8) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Password must be at least 8 characters long'
                }, 400);
            }
            // Check if email already exists
            const existingUser = await this.db.query('SELECT id FROM customers WHERE email = $1', [body.email.toLowerCase()]);
            if (existingUser.rows.length > 0) {
                return c.json({
                    success: false,
                    error: 'Conflict',
                    message: 'Email already registered'
                }, 409);
            }
            // Hash password
            const bcrypt = await import('bcryptjs');
            const passwordHash = await bcrypt.hash(body.password, 12);
            // Generate email verification token
            const crypto = await import('crypto');
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            // Insert new customer (default to Free plan - id: 1)
            const result = await this.db.query(`
        INSERT INTO customers (
          email, password_hash, full_name, company_name, phone, 
          plan_id, email_verification_token, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, full_name, created_at
      `, [
                body.email.toLowerCase(),
                passwordHash,
                body.full_name || null,
                body.company_name || null,
                body.phone || null,
                1, // Free plan
                emailVerificationToken,
                'active' // For demo, skip email verification
            ]);
            const newUser = result.rows[0];
            // Generate JWT token
            const tokenPayload = {
                userId: newUser.id,
                email: newUser.email,
                role: 'customer',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60) // 14 days
            };
            const token = await sign(tokenPayload, this.jwtSecret);
            // Create default virtual key for new user
            await this.createDefaultVirtualKey(newUser.id, newUser.email);
            return c.json({
                success: true,
                message: 'Registration successful',
                data: {
                    token,
                    expires_in: 14 * 24 * 60 * 60, // 14 days in seconds
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        full_name: newUser.full_name,
                        created_at: newUser.created_at,
                        plan: 'Free'
                    }
                }
            }, 201);
        }
        catch (error) {
            console.error('Registration error:', error);
            return c.json({
                success: false,
                error: 'Internal Server Error',
                message: 'Registration failed'
            }, 500);
        }
    }
    /**
     * User Login
     */
    async login(c) {
        try {
            const body = await c.req.json();
            // Validate required fields
            if (!body.email || !body.password) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Email and password are required'
                }, 400);
            }
            // Get user from database
            const result = await this.db.query(`
        SELECT 
          c.id, c.email, c.password_hash, c.full_name, c.status,
          c.plan_id, p.name as plan_name
        FROM customers c
        LEFT JOIN plans p ON c.plan_id = p.id
        WHERE c.email = $1
      `, [body.email.toLowerCase()]);
            if (result.rows.length === 0) {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid email or password'
                }, 401);
            }
            const user = result.rows[0];
            // Check if user is active
            if (user.status !== 'active') {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: `Account is ${user.status}`
                }, 401);
            }
            // Verify password
            const bcrypt = await import('bcryptjs');
            const isPasswordValid = await bcrypt.compare(body.password, user.password_hash);
            if (!isPasswordValid) {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid email or password'
                }, 401);
            }
            // Update last login
            await this.db.query('UPDATE customers SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
            // Generate JWT token
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                role: 'customer',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (14 * 24 * 60 * 60) // 14 days
            };
            const token = await sign(tokenPayload, this.jwtSecret);
            return c.json({
                success: true,
                message: 'Login successful',
                data: {
                    token,
                    expires_in: 14 * 24 * 60 * 60, // 14 days in seconds
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        plan: user.plan_name || 'Free',
                        status: user.status
                    }
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return c.json({
                success: false,
                error: 'Internal Server Error',
                message: 'Login failed'
            }, 500);
        }
    }
    /**
     * Admin Login
     */
    async adminLogin(c) {
        try {
            const body = await c.req.json();
            if (!body.email || !body.password) {
                return c.json({
                    success: false,
                    error: 'Validation Error',
                    message: 'Username and password are required'
                }, 400);
            }
            // Get admin user
            const result = await this.db.query(`
        SELECT id, username, email, password_hash, full_name, role, is_active
        FROM admin_users 
        WHERE (username = $1 OR email = $1) AND is_active = true
      `, [body.email.toLowerCase()]);
            if (result.rows.length === 0) {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid credentials'
                }, 401);
            }
            const admin = result.rows[0];
            // Verify password
            const bcrypt = await import('bcryptjs');
            const isPasswordValid = await bcrypt.compare(body.password, admin.password_hash);
            if (!isPasswordValid) {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'Invalid credentials'
                }, 401);
            }
            // Update last login
            await this.db.query('UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [admin.id]);
            // Generate JWT token
            const tokenPayload = {
                userId: admin.id,
                email: admin.email,
                role: 'admin',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours for admin
            };
            const token = await sign(tokenPayload, this.jwtSecret);
            return c.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    token,
                    expires_in: 8 * 60 * 60, // 8 hours
                    user: {
                        id: admin.id,
                        username: admin.username,
                        email: admin.email,
                        full_name: admin.full_name,
                        role: admin.role
                    }
                }
            });
        }
        catch (error) {
            console.error('Admin login error:', error);
            return c.json({
                success: false,
                error: 'Internal Server Error',
                message: 'Admin login failed'
            }, 500);
        }
    }
    /**
     * Get User Profile
     */
    async getProfile(c) {
        try {
            const user = c.get('user');
            if (!user) {
                return c.json({
                    success: false,
                    error: 'Unauthorized',
                    message: 'User not found in context'
                }, 401);
            }
            if (user.role === 'customer') {
                // Get customer details with plan info
                const result = await this.db.query(`
          SELECT 
            c.id, c.email, c.full_name, c.company_name, c.phone,
            c.status, c.created_at, c.last_login,
            p.name as plan_name, p.description as plan_description,
            p.token_quota, p.requests_per_minute
          FROM customers c
          LEFT JOIN plans p ON c.plan_id = p.id
          WHERE c.id = $1
        `, [user.id]);
                if (result.rows.length === 0) {
                    return c.json({
                        success: false,
                        error: 'Not Found',
                        message: 'User not found'
                    }, 404);
                }
                const customer = result.rows[0];
                return c.json({
                    success: true,
                    data: {
                        user: {
                            id: customer.id,
                            email: customer.email,
                            full_name: customer.full_name,
                            company_name: customer.company_name,
                            phone: customer.phone,
                            status: customer.status,
                            created_at: customer.created_at,
                            last_login: customer.last_login,
                            plan: {
                                name: customer.plan_name,
                                description: customer.plan_description,
                                token_quota: customer.token_quota,
                                requests_per_minute: customer.requests_per_minute
                            }
                        }
                    }
                });
            }
            else {
                // Admin user
                return c.json({
                    success: true,
                    data: {
                        user: {
                            id: user.id,
                            email: user.email,
                            full_name: user.full_name,
                            role: user.role
                        }
                    }
                });
            }
        }
        catch (error) {
            console.error('Get profile error:', error);
            return c.json({
                success: false,
                error: 'Internal Server Error',
                message: 'Failed to get profile'
            }, 500);
        }
    }
    /**
     * Create default virtual key for new user
     */
    async createDefaultVirtualKey(customerId, email) {
        try {
            const crypto = await import('crypto');
            const bcrypt = await import('bcryptjs');
            // Generate API key
            const apiKey = `pk-${crypto.randomBytes(32).toString('hex')}`;
            const apiKeyHash = await bcrypt.hash(apiKey, 12);
            const apiKeyPrefix = apiKey.substring(0, 8) + '...';
            await this.db.query(`
        INSERT INTO virtual_keys (
          customer_id, key_name, api_key_hash, api_key_prefix,
          status, requests_per_minute, tokens_per_day, concurrent_requests
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
                customerId,
                'Default Key',
                apiKeyHash,
                apiKeyPrefix,
                'active',
                100, // Default rate limits
                10000,
                5
            ]);
            console.log(`✅ Created default API key for user ${email}: ${apiKey}`);
        }
        catch (error) {
            console.error('Error creating default virtual key:', error);
        }
    }
}
export default AuthenticationService;
export { AuthenticationService };
