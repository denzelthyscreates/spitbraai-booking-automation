"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }
    async sendTeamNotification(booking) {
        const subject = `🔥 New Spitbraai Booking - ${booking.name} (${booking.guest_count} guests)`;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b35, #f7931e); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🔥 New Spitbraai Booking!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Booking Details</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #ff6b35; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #ff6b35; margin-top: 0;">Event Details</h3>
            <p><strong>Date:</strong> ${new Date(booking.event_date).toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}</p>
            <p><strong>Guest Count:</strong> ${booking.guest_count} people</p>
            <p><strong>Package:</strong> ${booking.package_name}</p>
            <p><strong>Venue:</strong> ${booking.venue_name || 'Not specified'}</p>
            <p><strong>Address:</strong> ${booking.venue_address}</p>
            <p><strong>Total Amount:</strong> R${booking.total_amount.toLocaleString()}</p>
          </div>
          
          ${booking.additional_notes ? `
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #ff6b35; margin-top: 0;">Additional Notes</h3>
            <p>${booking.additional_notes}</p>
          </div>
          ` : ''}
          
          <div style="background: #ff6b35; color: white; padding: 15px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0;">Next Steps</h3>
            <p style="margin: 10px 0;">1. Confirm availability and send quote</p>
            <p style="margin: 10px 0;">2. Process booking fee payment</p>
            <p style="margin: 10px 0;">3. Finalize menu details</p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center;">
          <p style="margin: 0;">Thys Gemaak Spitbraai Automation System</p>
        </div>
      </div>
    `;
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: process.env.BUSINESS_EMAIL,
            subject,
            html
        });
    }
    async sendCustomerThankYou(booking) {
        const template = fs_1.default.readFileSync(path_1.default.join(__dirname, '../templates/thankYou.html'), 'utf8');
        const html = template
            .replace(/{{customerName}}/g, booking.name)
            .replace(/{{eventDate}}/g, new Date(booking.event_date).toLocaleDateString('en-ZA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }))
            .replace(/{{guestCount}}/g, booking.guest_count.toString())
            .replace(/{{packageName}}/g, booking.package_name)
            .replace(/{{totalAmount}}/g, booking.total_amount.toLocaleString())
            .replace(/{{businessEmail}}/g, process.env.BUSINESS_EMAIL)
            .replace(/{{businessPhone}}/g, process.env.BUSINESS_PHONE);
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: booking.email,
            subject: '🔥 Thank you for your Spitbraai booking!',
            html
        });
    }
    async sendBookingFeeReminder(booking) {
        const template = fs_1.default.readFileSync(path_1.default.join(__dirname, '../templates/reminder1.html'), 'utf8');
        const html = template
            .replace(/{{customerName}}/g, booking.name)
            .replace(/{{eventDate}}/g, new Date(booking.event_date).toLocaleDateString('en-ZA'))
            .replace(/{{businessEmail}}/g, process.env.BUSINESS_EMAIL)
            .replace(/{{businessPhone}}/g, process.env.BUSINESS_PHONE);
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: booking.email,
            subject: '💰 Booking Fee Payment Required - Thys Gemaak Spitbraai',
            html
        });
    }
    async sendDepositReminder(booking) {
        const template = fs_1.default.readFileSync(path_1.default.join(__dirname, '../templates/reminder2.html'), 'utf8');
        const depositAmount = Math.round(booking.total_amount * 0.5);
        const html = template
            .replace(/{{customerName}}/g, booking.name)
            .replace(/{{eventDate}}/g, new Date(booking.event_date).toLocaleDateString('en-ZA'))
            .replace(/{{depositAmount}}/g, depositAmount.toLocaleString())
            .replace(/{{businessEmail}}/g, process.env.BUSINESS_EMAIL)
            .replace(/{{businessPhone}}/g, process.env.BUSINESS_PHONE);
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: booking.email,
            subject: '📅 50% Deposit Due - Your Spitbraai Event Approaches',
            html
        });
    }
    async sendFinalPaymentReminder(booking) {
        const template = fs_1.default.readFileSync(path_1.default.join(__dirname, '../templates/reminder3.html'), 'utf8');
        const remainingAmount = Math.round(booking.total_amount * 0.5);
        const html = template
            .replace(/{{customerName}}/g, booking.name)
            .replace(/{{eventDate}}/g, new Date(booking.event_date).toLocaleDateString('en-ZA'))
            .replace(/{{remainingAmount}}/g, remainingAmount.toLocaleString())
            .replace(/{{businessEmail}}/g, process.env.BUSINESS_EMAIL)
            .replace(/{{businessPhone}}/g, process.env.BUSINESS_PHONE);
        await this.transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: booking.email,
            subject: '🔥 Final Payment Due - Spitbraai Event in 2 Days!',
            html
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=email.js.map