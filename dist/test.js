"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const email_1 = require("./email");
const calendar_1 = require("./calendar");
const payfast_1 = require("./payfast");
const shoppingList_1 = require("./shoppingList");
dotenv_1.default.config();
// Test booking data
const testBooking = {
    id: 'test-booking-123',
    name: 'John Smith',
    email: 'test@example.com',
    phone: '+27 82 123 4567',
    event_date: '2025-07-15',
    guest_count: 50,
    package_name: 'Essential Celebration',
    venue_name: 'Community Hall',
    venue_address: '123 Main Street, Cape Town, 8000',
    total_amount: 15000,
    payment_status: 'pending',
    booking_fee_paid: false,
    created_at: new Date().toISOString(),
    additional_notes: 'Please include vegetarian options'
};
async function testServices() {
    console.log('🧪 Testing Spitbraai Automation Services...\n');
    try {
        // Test Shopping List Service
        console.log('📋 Testing Shopping List Service...');
        const shoppingListService = new shoppingList_1.ShoppingListService();
        const shoppingList = await shoppingListService.generateShoppingList(testBooking);
        console.log(`✅ Generated shopping list with ${shoppingList.length} items`);
        console.log('Sample items:', shoppingList.slice(0, 3).map(item => `${item.item}: ${item.quantity} ${item.unit}`));
        // Test PayFast Service
        console.log('\n💰 Testing PayFast Service...');
        const payFastService = new payfast_1.PayFastService();
        const paymentLinks = await payFastService.setupPaymentTracking(testBooking);
        console.log('✅ PayFast payment links generated');
        console.log('Booking fee link:', paymentLinks.booking_fee_link.substring(0, 50) + '...');
        // Test Email Service (without actually sending)
        console.log('\n📧 Testing Email Service...');
        const emailService = new email_1.EmailService();
        console.log('✅ Email service initialized');
        console.log('Gmail user:', process.env.GMAIL_USER);
        // Test Calendar Service (without creating event)
        console.log('\n📅 Testing Calendar Service...');
        const calendarService = new calendar_1.CalendarService();
        console.log('✅ Calendar service initialized');
        console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);
        console.log('\n🎉 All services tested successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Configure your .env file with actual credentials');
        console.log('2. Set up your Supabase database tables');
        console.log('3. Configure PayFast webhook endpoints');
        console.log('4. Test with real data in development mode');
        console.log('5. Deploy to production with PM2');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Check your .env file configuration');
        console.log('2. Verify all required environment variables are set');
        console.log('3. Ensure Google Service Account has proper permissions');
        console.log('4. Check PayFast credentials and sandbox mode');
    }
}
// Run tests
testServices();
//# sourceMappingURL=test.js.map