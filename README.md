
# 🔥 Spitbraai Automation System

Complete automation system for Thys Gemaak Spitbraai booking workflow, handling everything from initial booking to final payment reminders.

## 🚀 Features

- **📧 Automated Email System**: Team notifications and customer communications
- **📅 Google Calendar Integration**: Automatic event creation and management
- **💰 PayFast Payment Tracking**: 3-tier payment reminder system
- **🛒 Smart Shopping Lists**: Menu-based ingredient calculation
- **📊 Comprehensive Logging**: Full audit trail and error tracking
- **🔄 Real-time Processing**: Monitors Supabase for new bookings
- **⚡ Production Ready**: Built with TypeScript, error handling, and monitoring

## 📋 System Overview

### Workflow Automation
1. **New Booking Detection**: Monitors Supabase for unprocessed bookings
2. **Team Notification**: Instant email to spitbookings@thysgemaak.com
3. **Customer Thank You**: Professional welcome email with booking details
4. **Calendar Event**: Creates event in "Thys Gemaak Spitbraai Calendar"
5. **Shopping List**: Generates ingredient list based on package and guest count
6. **Payment Tracking**: Sets up PayFast payment links and reminder schedule

### Payment Reminder System
- **Day 3**: Booking fee reminder (R500 to secure date)
- **14 Days Before**: 50% deposit reminder
- **2 Days Before**: Final payment reminder

## 🛠 Quick Start

### Prerequisites
- Node.js 18+
- Gmail account with App Password
- Google Service Account for Calendar API
- PayFast merchant account
- Supabase project

### Installation
```bash
# Clone and setup
cd ~/spitbraai-automation
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Build and run
npm run build
npm start
```

### Development Mode
```bash
npm run dev
```

## 📁 Project Structure

```
spitbraai-automation/
├── src/
│   ├── index.ts           # Main automation service
│   ├── email.ts           # Gmail integration
│   ├── calendar.ts        # Google Calendar service
│   ├── payfast.ts         # PayFast payment handling
│   └── shoppingList.ts    # Menu-based shopping lists
├── templates/
│   ├── thankYou.html      # Customer thank you email
│   ├── reminder1.html     # Booking fee reminder
│   ├── reminder2.html     # Deposit reminder
│   └── reminder3.html     # Final payment reminder
├── docs/
│   ├── SETUP.md           # Detailed setup instructions
│   └── API_REFERENCE.md   # Complete API documentation
├── config/
├── .env.example           # Environment variables template
└── README.md
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gmail
GMAIL_USER=spitbookings@thysgemaak.com
GMAIL_APP_PASSWORD=your_app_password

# Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# PayFast
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
PAYFAST_SANDBOX=true

# Business Details
BUSINESS_EMAIL=spitbookings@thysgemaak.com
BUSINESS_PHONE=+27 67 456 7784
```

## 📊 Database Schema

### Bookings Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  package_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  booking_fee_paid BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  shopping_list JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🍖 Menu Packages

### Essential Celebration
- **Beef**: 0.25kg per person (Silverside/Topside)
- **Pork**: 0.15kg per person (Shoulder)
- **Chicken**: 0.2kg per person (Whole)
- **Boerewors**: 0.1kg per person
- **Sides**: Potato salad, coleslaw, green salad, garlic bread

### Premium Feast
- **Beef**: 0.3kg per person (Ribeye/Sirloin)
- **Lamb**: 0.2kg per person (Leg)
- **Pork**: 0.25kg per person (Ribs)
- **Chicken**: 0.25kg per person (Free Range)
- **Boerewors**: 0.15kg per person (Premium)
- **Sides**: Roasted vegetables, gourmet salads, artisan bread

### Budget Braai
- **Beef**: 0.2kg per person (Chuck/Brisket)
- **Chicken**: 0.2kg per person (Portions)
- **Boerewors**: 0.15kg per person
- **Sides**: Basic salads, bread rolls

## 📧 Email Templates

### Customer Thank You Email
- Professional welcome message
- Booking summary with event details
- Payment schedule explanation
- Next steps and contact information
- Social proof and testimonials

### Payment Reminders
1. **Booking Fee Reminder**: Friendly reminder to secure the date
2. **Deposit Reminder**: 50% payment due 14 days before event
3. **Final Payment**: Urgent reminder 2 days before event

## 🚀 Deployment

### Production with PM2
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name "spitbraai-automation"

# Save configuration
pm2 save

# Setup auto-start
pm2 startup
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## 📈 Monitoring

### Key Metrics
- Booking processing success rate: >99%
- Email delivery rate: >95%
- Calendar event creation: >98%
- Average processing time: <30 seconds

### Logs
- Console output for real-time monitoring
- Database logging for audit trail
- PM2 logs: `pm2 logs spitbraai-automation`

## 🔒 Security

- Environment variables for all secrets
- PayFast webhook signature validation
- Gmail App Password authentication
- Google Service Account with minimal permissions
- Supabase RLS policies

## 🆘 Support

### Documentation
- [Setup Guide](docs/SETUP.md) - Complete installation instructions
- [API Reference](docs/API_REFERENCE.md) - Detailed API documentation

### Contact
- **Email**: spitbookings@thysgemaak.com
- **Phone**: +27 67 456 7784
- **Office Hours**: Monday - Friday, 9:00 AM - 5:00 PM

## 📄 License

Proprietary software for Thys Gemaak Spitbraai Catering Services.

---

**Built with ❤️ for Thys Gemaak Spitbraai**

*Making premium spitbraai affordable and accessible through automation.*
