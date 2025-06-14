/**
 * Database setup script
 * Run this to initialize the database schema
 */
import DatabaseService from '../services/database';
import { DatabaseSchema } from '../services/schema';
async function setupDatabase() {
    console.log('🚀 Starting database setup...');
    console.log('=' + '='.repeat(50));
    const db = DatabaseService.getInstance();
    try {
        // Test connection first
        console.log('🔍 Testing database connection...');
        const isConnected = await db.testConnection();
        if (!isConnected) {
            console.error('❌ Cannot connect to database. Please check your DATABASE_URL');
            process.exit(1);
        }
        console.log('=' + '='.repeat(50));
        // Setup complete schema
        await DatabaseSchema.setupDatabase();
        console.log('=' + '='.repeat(50));
        console.log('🎉 Database setup completed successfully!');
        console.log('📊 Database is ready for AI Gateway business logic');
        console.log('');
        console.log('🔑 Default Admin Credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   URL: http://localhost:8787/admin (when admin panel is built)');
        console.log('');
        console.log('🔗 Next steps:');
        console.log('   1. Start the gateway: npm run dev');
        console.log('   2. Test API endpoints with authentication');
        console.log('   3. Begin Phase 1.2: Authentication System');
    }
    catch (error) {
        console.error('💥 Database setup failed:', error);
        process.exit(1);
    }
    finally {
        await db.close();
    }
}
// Run setup if this file is executed directly
setupDatabase();
export { setupDatabase };
