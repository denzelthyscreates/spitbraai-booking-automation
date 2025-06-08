"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const googleapis_1 = require("googleapis");
class CalendarService {
    constructor() {
        const auth = new googleapis_1.google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        this.calendar = googleapis_1.google.calendar({ version: 'v3', auth });
    }
    async createEvent(booking) {
        const eventDate = new Date(booking.event_date);
        // Set event time from 10 AM to 6 PM (typical spitbraai duration)
        const startTime = new Date(eventDate);
        startTime.setHours(10, 0, 0, 0);
        const endTime = new Date(eventDate);
        endTime.setHours(18, 0, 0, 0);
        const event = {
            summary: `🔥 Spitbraai - ${booking.name} (${booking.guest_count} guests)`,
            description: `
Spitbraai Catering Event

Customer: ${booking.name}
Email: ${booking.email}
Phone: ${booking.phone}
Package: ${booking.package_name}
Guest Count: ${booking.guest_count}
Total Amount: R${booking.total_amount.toLocaleString()}

${booking.additional_notes ? `Notes: ${booking.additional_notes}` : ''}

Booking ID: ${booking.id}
      `.trim(),
            location: `${booking.venue_name ? booking.venue_name + ', ' : ''}${booking.venue_address}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Africa/Johannesburg',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Africa/Johannesburg',
            },
            attendees: [
                { email: booking.email, displayName: booking.name },
                { email: process.env.BUSINESS_EMAIL }
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 1 day before
                    { method: 'popup', minutes: 60 }, // 1 hour before
                ],
            },
            colorId: '11', // Red color for spitbraai events
        };
        try {
            const response = await this.calendar.events.insert({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                requestBody: event,
                sendUpdates: 'all', // Send invites to attendees
            });
            console.log(`📅 Calendar event created: ${response.data.htmlLink}`);
            return response.data;
        }
        catch (error) {
            console.error('❌ Error creating calendar event:', error);
            throw error;
        }
    }
    async updateEvent(eventId, updates) {
        try {
            const response = await this.calendar.events.patch({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId,
                requestBody: {
                    summary: updates.name ? `🔥 Spitbraai - ${updates.name} (${updates.guest_count} guests)` : undefined,
                    description: updates.additional_notes,
                    location: updates.venue_address,
                },
                sendUpdates: 'all',
            });
            return response.data;
        }
        catch (error) {
            console.error('❌ Error updating calendar event:', error);
            throw error;
        }
    }
    async deleteEvent(eventId) {
        try {
            await this.calendar.events.delete({
                calendarId: process.env.GOOGLE_CALENDAR_ID,
                eventId: eventId,
                sendUpdates: 'all',
            });
            console.log(`🗑️ Calendar event deleted: ${eventId}`);
        }
        catch (error) {
            console.error('❌ Error deleting calendar event:', error);
            throw error;
        }
    }
}
exports.CalendarService = CalendarService;
//# sourceMappingURL=calendar.js.map