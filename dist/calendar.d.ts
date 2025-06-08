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
    additional_notes?: string;
}
export declare class CalendarService {
    private calendar;
    constructor();
    createEvent(booking: Booking): Promise<import("googleapis").calendar_v3.Schema$Event>;
    updateEvent(eventId: string, updates: Partial<Booking>): Promise<import("googleapis").calendar_v3.Schema$Event>;
    deleteEvent(eventId: string): Promise<void>;
}
export {};
//# sourceMappingURL=calendar.d.ts.map