/**
 * Authentication routes for AI Gateway
 */

import { Hono } from 'hono';
import DatabaseService from '../services/database';
import AuthenticationService from '../services/auth';

// Create auth router
const authRouter = new Hono<{ Bindings: { DATABASE_URL: string; JWT_SECRET: string; JWT_EXPIRES_IN: string } }>();

/**
 * POST /auth/register - User registration
 */
authRouter.post('/register', async (c) => {
  try {
    // Initialize auth service (will auto-load environment variables)
    const authService = new AuthenticationService(c.env);

    // Use auth service which handles the full request/response
    return await authService.register(c);

  } catch (error: any) {
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
    // Initialize auth service
    const authService = new AuthenticationService(c.env);

    // Use auth service which handles the full request/response
    return await authService.login(c);

  } catch (error: any) {
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
  try {    // Initialize auth service
    const authService = new AuthenticationService(c.env);

    // Use auth service which handles the full request/response
    return await authService.getProfile(c);

  } catch (error: any) {
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
  try {    // Initialize auth service
    const authService = new AuthenticationService(c.env);

    // Use auth service which handles the full request/response
    return await authService.adminLogin(c);

  } catch (error: any) {
    console.error('Admin login error:', error);
    return c.json({ 
      error: error.message || 'Admin login failed' 
    }, 500);
  }
});

// Export the router as default
export default authRouter;