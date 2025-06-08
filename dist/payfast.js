"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayFastService = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
class PayFastService {
    constructor() {
        this.merchantId = process.env.PAYFAST_MERCHANT_ID;
        this.merchantKey = process.env.PAYFAST_MERCHANT_KEY;
        this.passphrase = process.env.PAYFAST_PASSPHRASE;
        this.sandbox = process.env.PAYFAST_SANDBOX === 'true';
    }
    async setupPaymentTracking(booking) {
        try {
            // Create payment links for different stages
            const bookingFeeLink = await this.createPaymentLink(booking, 'booking_fee', 500);
            const depositLink = await this.createPaymentLink(booking, 'deposit', Math.round(booking.total_amount * 0.5));
            const finalPaymentLink = await this.createPaymentLink(booking, 'final', Math.round(booking.total_amount * 0.5));
            console.log(`💳 Payment links created for booking ${booking.id}`);
            return {
                booking_fee_link: bookingFeeLink,
                deposit_link: depositLink,
                final_payment_link: finalPaymentLink
            };
        }
        catch (error) {
            console.error('❌ Error setting up payment tracking:', error);
            throw error;
        }
    }
    async createPaymentLink(booking, paymentType, amount) {
        const baseUrl = this.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
        const paymentData = {
            merchant_id: this.merchantId,
            merchant_key: this.merchantKey,
            return_url: `https://spitbraai.thysgemaak.com/payment-success`,
            cancel_url: `https://spitbraai.thysgemaak.com/payment-cancelled`,
            notify_url: `https://your-webhook-url.com/payfast-webhook`, // You'll need to set this up
            name_first: booking.name.split(' ')[0],
            email_address: booking.email,
            amount: amount.toFixed(2),
            item_name: `Spitbraai ${paymentType.replace('_', ' ')}`,
            item_description: `${paymentType.replace('_', ' ')} for spitbraai event on ${new Date(booking.event_date).toLocaleDateString()}`,
            custom_str1: booking.id,
            custom_str2: paymentType
        };
        // Generate signature
        const signature = this.generateSignature(paymentData);
        // Create payment URL
        const params = new URLSearchParams({
            ...paymentData,
            signature
        });
        return `${baseUrl}/eng/process?${params.toString()}`;
    }
    generateSignature(data) {
        // Create parameter string
        const paramString = Object.entries(data)
            .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        // Add passphrase if provided
        const stringToHash = this.passphrase ? `${paramString}&passphrase=${encodeURIComponent(this.passphrase)}` : paramString;
        // Generate MD5 hash
        return crypto_1.default.createHash('md5').update(stringToHash).digest('hex');
    }
    async verifyPayment(paymentData) {
        try {
            const baseUrl = this.sandbox ? 'https://sandbox.payfast.co.za' : 'https://www.payfast.co.za';
            const response = await axios_1.default.post(`${baseUrl}/eng/query/validate`, paymentData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data === 'VALID';
        }
        catch (error) {
            console.error('❌ Error verifying payment:', error);
            return false;
        }
    }
    async handleWebhook(webhookData) {
        try {
            // Verify the webhook signature
            const isValid = await this.verifyPayment(webhookData);
            if (!isValid) {
                console.error('❌ Invalid PayFast webhook signature');
                return false;
            }
            const bookingId = webhookData.custom_str1;
            const paymentType = webhookData.custom_str2;
            const paymentStatus = webhookData.payment_status;
            if (paymentStatus === 'COMPLETE') {
                // Update booking payment status in Supabase
                console.log(`✅ Payment completed for booking ${bookingId}, type: ${paymentType}`);
                // You would update the Supabase record here
                // await this.updateBookingPaymentStatus(bookingId, paymentType);
            }
            return true;
        }
        catch (error) {
            console.error('❌ Error handling PayFast webhook:', error);
            return false;
        }
    }
}
exports.PayFastService = PayFastService;
//# sourceMappingURL=payfast.js.map