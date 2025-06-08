
import dotenv from 'dotenv';
import { EmailService } from './email';
import { CalendarService } from './calendar';
import { PayFastService } from './payfast';
import { ShoppingListService } from './shoppingList';

dotenv.config();

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
  payment_status: 'pending' as const,
  booking_fee_paid: false,
  created_at: new Date().toISOString(),
  additional_notes: 'Please include vegetarian options'
};

async function testServices() {
  console.log('🧪 Testing Spitbraai Automation Services...\n');

  try {
    // Test Shopping List Service
    console.log('📋 Testing Shopping List Service...');
    const shoppingListService = new ShoppingListService();
    const shoppingList = await shoppingListService.generateShoppingList(testBooking);
    console.log(`✅ Generated shopping list with ${shoppingList.length} items`);
    console.log('Sample items:', shoppingList.slice(0, 3).map(item => `${item.item}: ${item.quantity} ${item.unit}`));

    // Test PayFast Service
    console.log('\n💰 Testing PayFast Service...');
    const payFastService = new PayFastService();
    const paymentLinks = await payFastService.setupPaymentTracking(testBooking);
    console.log('✅ PayFast payment links generated');
    console.log('Booking fee link:', paymentLinks.booking_fee_link.substring(0, 50) + '...');

    // Test Email Service (without actually sending)
    console.log('\n📧 Testing Email Service...');
    const emailService = new EmailService();
    console.log('✅ Email service initialized');
    console.log('Gmail user:', process.env.GMAIL_USER);

    // Test Calendar Service (without creating event)
    console.log('\n📅 Testing Calendar Service...');
    const calendarService = new CalendarService();
    console.log('✅ Calendar service initialized');
    console.log('Calendar ID:', process.env.GOOGLE_CALENDAR_ID);

    console.log('\n🎉 All services tested successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Configure your .env file with actual credentials');
    console.log('2. Set up your Supabase database tables');
    console.log('3. Configure PayFast webhook endpoints');
    console.log('4. Test with real data in development mode');
    console.log('5. Deploy to production with PM2');

  } catch (error) {
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
