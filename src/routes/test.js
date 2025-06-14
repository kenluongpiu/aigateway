/**
 * Simple test routes for debugging
 */
import { Hono } from 'hono';
const testRoutes = new Hono();
// Simple JSON echo test
testRoutes.post('/echo', async (c) => {
    try {
        console.log('📡 Echo endpoint hit');
        const rawText = await c.req.text();
        console.log('📝 Raw request text:', rawText);
        try {
            const jsonData = JSON.parse(rawText);
            console.log('✅ JSON parsed successfully:', jsonData);
            return c.json({
                success: true,
                received: jsonData,
                message: 'JSON parsed successfully'
            });
        }
        catch (jsonError) {
            console.error('❌ JSON parsing failed:', jsonError);
            return c.json({
                success: false,
                error: 'JSON Parse Error',
                rawText: rawText,
                message: String(jsonError)
            }, 400);
        }
    }
    catch (error) {
        console.error('❌ Echo endpoint error:', error);
        return c.json({
            success: false,
            error: 'Internal Error',
            message: String(error)
        }, 500);
    }
});
// Simple auth test
testRoutes.post('/auth-test', async (c) => {
    try {
        const env = c.env;
        return c.json({
            success: true,
            message: 'Auth test endpoint working',
            env: {
                hasDb: !!env.DATABASE_URL,
                hasJwt: !!env.JWT_SECRET
            }
        });
    }
    catch (error) {
        return c.json({
            success: false,
            error: String(error)
        }, 500);
    }
});
export default testRoutes;
