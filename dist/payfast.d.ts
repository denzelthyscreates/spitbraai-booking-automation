interface Booking {
    id: string;
    name: string;
    email: string;
    total_amount: number;
    event_date: string;
}
export declare class PayFastService {
    private merchantId;
    private merchantKey;
    private passphrase;
    private sandbox;
    constructor();
    setupPaymentTracking(booking: Booking): Promise<{
        booking_fee_link: string;
        deposit_link: string;
        final_payment_link: string;
    }>;
    private createPaymentLink;
    private generateSignature;
    verifyPayment(paymentData: any): Promise<boolean>;
    handleWebhook(webhookData: any): Promise<boolean>;
}
export {};
//# sourceMappingURL=payfast.d.ts.map