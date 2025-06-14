/**
 * Authentication routes for AI Gateway
 */
import { Hono } from 'hono';
import DatabaseService from '../services/database';
import AuthenticationService from '../services/auth';
// Create auth router
const authRouter = new Hono();
/**
 * POST /auth/register - User registration
 */
authRouter.post('/register', async (c) => {
    try {
        // Get database URL from environment
        const databaseUrl = c.env.DATABASE_URL;
        if (!databaseUrl) {
            return c.json({ error: 'Database configuration error' }, 500);
        }
        // Initialize database and auth service
        const db = DatabaseService.getInstance(databaseUrl);
        const authService = new AuthenticationService(db, c.env);
        // Use auth service which handles the full request/response
        return await authService.register(c);
    }
    catch (error) {
        console.error('Registration error:', error);
        return c.json({
            error: error.message || 'Registration failed'
        }, 500);
    }
});
/**
 * POST /auth/login - User login
 */
authRouter.post('/login', async (c) => {
    try {
        // Get database URL from environment
        const databaseUrl = c.env.DATABASE_URL;
        if (!databaseUrl) {
            return c.json({ error: 'Database configuration error' }, 500);
        }
        // Initialize database and auth service
        const db = DatabaseService.getInstance(databaseUrl);
        const authService = new AuthenticationService(db, c.env);
        // Use auth service which handles the full request/response
        return await authService.login(c);
    }
    catch (error) {
        console.error('Login error:', error);
        return c.json({
            error: error.message || 'Login failed'
        }, 500);
    }
});
/**
 * GET /auth/profile - Get user profile (requires authentication)
 */
authRouter.get('/profile', async (c) => {
    try {
        // Get database URL from environment
        const databaseUrl = c.env.DATABASE_URL;
        if (!databaseUrl) {
            return c.json({ error: 'Database configuration error' }, 500);
        }
        // Initialize database and auth service
        const db = DatabaseService.getInstance(databaseUrl);
        const authService = new AuthenticationService(db, c.env);
        // Use auth service which handles the full request/response
        return await authService.getProfile(c);
    }
    catch (error) {
        console.error('Profile error:', error);
        return c.json({
            error: error.message || 'Authentication failed'
        }, 500);
    }
});
/**
 * POST /auth/admin/login - Admin login
 */
authRouter.post('/admin/login', async (c) => {
    try {
        // Get database URL from environment
        const databaseUrl = c.env.DATABASE_URL;
        if (!databaseUrl) {
            return c.json({ error: 'Database configuration error' }, 500);
        }
        // Initialize database and auth service
        const db = DatabaseService.getInstance(databaseUrl);
        const authService = new AuthenticationService(db, c.env);
        // Use auth service which handles the full request/response
        return await authService.adminLogin(c);
    }
    catch (error) {
        console.error('Admin login error:', error);
        return c.json({
            error: error.message || 'Admin login failed'
        }, 500);
    }
});
// Export the router as default
export default authRouter;
