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
    payment_status: string;
    additional_notes?: string;
}
export declare class EmailService {
    private transporter;
    constructor();
    sendTeamNotification(booking: Booking): Promise<void>;
    sendCustomerThankYou(booking: Booking): Promise<void>;
    sendBookingFeeReminder(booking: Booking): Promise<void>;
    sendDepositReminder(booking: Booking): Promise<void>;
    sendFinalPaymentReminder(booking: Booking): Promise<void>;
}
export {};
//# sourceMappingURL=email.d.ts.map