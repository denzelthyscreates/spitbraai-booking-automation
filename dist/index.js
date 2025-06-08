"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
const cron = __importStar(require("node-cron"));
const email_1 = require("./email");
const calendar_1 = require("./calendar");
const payfast_1 = require("./payfast");
const shoppingList_1 = require("./shoppingList");
dotenv_1.default.config();
class SpitbraaiAutomation {
    constructor() {
        this.processedBookings = new Set();
        // Initialize Supabase client
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        // Initialize services
        this.emailService = new email_1.EmailService();
        this.calendarService = new calendar_1.CalendarService();
        this.payFastService = new payfast_1.PayFastService();
        this.shoppingListService = new shoppingList_1.ShoppingListService();
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
    async checkNewBookings() {
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
        }
        catch (error) {
            console.error('❌ Error in checkNewBookings:', error);
        }
    }
    async processNewBooking(booking) {
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
        }
        catch (error) {
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
    async checkPaymentReminders() {
        try {
            console.log('💰 Checking for payment reminders...');
            const now = new Date();
            // Check for different reminder types
            await this.checkBookingFeeReminders(now);
            await this.checkDepositReminders(now);
            await this.checkFinalPaymentReminders(now);
        }
        catch (error) {
            console.error('❌ Error checking payment reminders:', error);
        }
    }
    async checkBookingFeeReminders(now) {
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
    async checkDepositReminders(now) {
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
    async checkFinalPaymentReminders(now) {
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
//# sourceMappingURL=index.js.map