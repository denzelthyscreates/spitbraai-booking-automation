
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as cron from 'node-cron';
import { EmailService } from './email';
import { CalendarService } from './calendar';
import { PayFastService } from './payfast';
import { ShoppingListService } from './shoppingList';

dotenv.config();

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  event_date: string;
  guest_count: number;
  package_name: string;
  venue_name?: string;
  venue_address: string;
  total_amount: number;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid';
  booking_fee_paid: boolean;
  created_at: string;
  additional_notes?: string;
}

class SpitbraaiAutomation {
  private supabase;
  private emailService: EmailService;
  private calendarService: CalendarService;
  private payFastService: PayFastService;
  private shoppingListService: ShoppingListService;
  private processedBookings = new Set<string>();

  constructor() {
    // Initialize Supabase client
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Initialize services
    this.emailService = new EmailService();
    this.calendarService = new CalendarService();
    this.payFastService = new PayFastService();
    this.shoppingListService = new ShoppingListService();
  }

  async start() {
    console.log('🚀 Starting Spitbraai Automation System...');
    
    // Check for new bookings every 5 minutes
    const checkInterval = parseInt(process.env.CHECK_INTERVAL_MINUTES || '5');
    cron.schedule(`*/${checkInterval} * * * *`, () => {
      this.checkNewBookings();
    });

    // Check for payment reminders daily at 9 AM
    cron.schedule('0 9 * * *', () => {
      this.checkPaymentReminders();
    });

    // Initial check
    await this.checkNewBookings();
    
    console.log(`✅ Automation system started. Checking for new bookings every ${checkInterval} minutes.`);
  }

  private async checkNewBookings() {
    try {
      console.log('🔍 Checking for new bookings...');
      
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('*')
        .eq('processed', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching bookings:', error);
        return;
      }

      if (!bookings || bookings.length === 0) {
        console.log('📭 No new bookings found.');
        return;
      }

      console.log(`📬 Found ${bookings.length} new booking(s) to process.`);

      for (const booking of bookings) {
        await this.processNewBooking(booking);
      }
    } catch (error) {
      console.error('❌ Error in checkNewBookings:', error);
    }
  }

  private async processNewBooking(booking: Booking) {
    try {
      console.log(`📝 Processing booking ${booking.id} for ${booking.name}`);

      // 1. Send team notification email
      await this.emailService.sendTeamNotification(booking);
      console.log('✅ Team notification sent');

      // 2. Send customer thank you email
      await this.emailService.sendCustomerThankYou(booking);
      console.log('✅ Customer thank you email sent');

      // 3. Create Google Calendar event
      await this.calendarService.createEvent(booking);
      console.log('✅ Calendar event created');

      // 4. Generate shopping list
      const shoppingList = await this.shoppingListService.generateShoppingList(booking);
      console.log('✅ Shopping list generated');

      // 5. Set up PayFast payment tracking
      await this.payFastService.setupPaymentTracking(booking);
      console.log('✅ Payment tracking setup');

      // 6. Mark booking as processed
      await this.supabase
        .from('bookings')
        .update({ 
          processed: true,
          shopping_list: shoppingList,
          automation_processed_at: new Date().toISOString()
        })
        .eq('id', booking.id);

      console.log(`🎉 Successfully processed booking ${booking.id}`);
      
    } catch (error) {
      console.error(`❌ Error processing booking ${booking.id}:`, error);
      
      // Log the error to Supabase for tracking
      await this.supabase
        .from('automation_logs')
        .insert({
          booking_id: booking.id,
          action: 'process_new_booking',
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          created_at: new Date().toISOString()
        });
    }
  }

  private async checkPaymentReminders() {
    try {
      console.log('💰 Checking for payment reminders...');
      
      const now = new Date();
      
      // Check for different reminder types
      await this.checkBookingFeeReminders(now);
      await this.checkDepositReminders(now);
      await this.checkFinalPaymentReminders(now);
      
    } catch (error) {
      console.error('❌ Error checking payment reminders:', error);
    }
  }

  private async checkBookingFeeReminders(now: Date) {
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() - parseInt(process.env.PAYMENT_REMINDER_DAYS_1 || '3'));

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('booking_fee_paid', false)
      .lte('created_at', reminderDate.toISOString())
      .eq('booking_fee_reminder_sent', false);

    if (bookings) {
      for (const booking of bookings) {
        await this.emailService.sendBookingFeeReminder(booking);
        await this.supabase
          .from('bookings')
          .update({ booking_fee_reminder_sent: true })
          .eq('id', booking.id);
      }
    }
  }

  private async checkDepositReminders(now: Date) {
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + parseInt(process.env.PAYMENT_REMINDER_DAYS_2 || '14'));

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('payment_status', 'pending')
      .eq('booking_fee_paid', true)
      .lte('event_date', reminderDate.toISOString())
      .eq('deposit_reminder_sent', false);

    if (bookings) {
      for (const booking of bookings) {
        await this.emailService.sendDepositReminder(booking);
        await this.supabase
          .from('bookings')
          .update({ deposit_reminder_sent: true })
          .eq('id', booking.id);
      }
    }
  }

  private async checkFinalPaymentReminders(now: Date) {
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + parseInt(process.env.PAYMENT_REMINDER_DAYS_3 || '2'));

    const { data: bookings } = await this.supabase
      .from('bookings')
      .select('*')
      .eq('payment_status', 'deposit_paid')
      .lte('event_date', reminderDate.toISOString())
      .eq('final_payment_reminder_sent', false);

    if (bookings) {
      for (const booking of bookings) {
        await this.emailService.sendFinalPaymentReminder(booking);
        await this.supabase
          .from('bookings')
          .update({ final_payment_reminder_sent: true })
          .eq('id', booking.id);
      }
    }
  }
}

// Start the automation system
const automation = new SpitbraaiAutomation();
automation.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down Spitbraai Automation System...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Spitbraai Automation System...');
  process.exit(0);
});
