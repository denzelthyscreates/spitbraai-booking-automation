
# Spitbraai Automation System Setup Guide

## Overview

This automation system handles the complete post-booking workflow for Thys Gemaak Spitbraai, including:

- 📧 Team notifications and customer emails
- 📅 Google Calendar event creation
- 💰 PayFast payment tracking with 3-tier reminders
- 🛒 Automated shopping list generation
- 📊 Comprehensive logging and error handling

## Prerequisites

- Node.js 18+ installed
- Gmail account with App Password enabled
- Google Service Account for Calendar API
- PayFast merchant account
- Supabase project with appropriate tables

## Installation

1. **Clone and setup the project:**
```bash
cd ~/spitbraai-automation
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Build the project:**
```bash
npm run build
```

## Environment Configuration

### Required Environment Variables

#### Supabase Configuration
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Gmail Configuration
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the generated password:
```env
GMAIL_USER=spitbookings@thysgemaak.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

#### Google Calendar Configuration
1. Create a Google Cloud Project
2. Enable the Calendar API
3. Create a Service Account
4. Download the JSON key file
5. Extract the required fields:
```env
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
```

#### PayFast Configuration
```env
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_secure_passphrase
PAYFAST_SANDBOX=true  # Set to false for production
```

## Database Schema

### Required Supabase Tables

#### 1. bookings table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  event_date DATE NOT NULL,
  guest_count INTEGER NOT NULL,
  package_name TEXT NOT NULL,
  venue_name TEXT,
  venue_address TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid')),
  booking_fee_paid BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  shopping_list JSONB,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  automation_processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment reminder tracking
  booking_fee_reminder_sent BOOLEAN DEFAULT false,
  deposit_reminder_sent BOOLEAN DEFAULT false,
  final_payment_reminder_sent BOOLEAN DEFAULT false,
  
  -- Calendar integration
  calendar_event_id TEXT
);
```

#### 2. automation_logs table
```sql
CREATE TABLE automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. payment_tracking table
```sql
CREATE TABLE payment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('booking_fee', 'deposit', 'final')),
  amount DECIMAL(10,2) NOT NULL,
  payment_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  payfast_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE
);
```

## Running the System

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Using PM2 (Recommended for Production)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start dist/index.js --name "spitbraai-automation"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

## Deployment Options

### 1. VPS/Server Deployment
1. Upload the project to your server
2. Install dependencies: `npm install`
3. Configure environment variables
4. Build the project: `npm run build`
5. Use PM2 to manage the process
6. Setup nginx reverse proxy if needed

### 2. Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Cloud Platform Deployment
- **Heroku**: Add Procfile with `web: npm start`
- **Railway**: Connect GitHub repo and deploy
- **DigitalOcean App Platform**: Use Node.js buildpack

## Webhook Setup

### PayFast Webhook Configuration
1. In your PayFast merchant dashboard, set the notify URL to:
   ```
   https://your-domain.com/payfast-webhook
   ```

2. Create a webhook endpoint (add to your main application):
```javascript
app.post('/payfast-webhook', express.raw({type: 'application/x-www-form-urlencoded'}), (req, res) => {
  const payFastService = new PayFastService();
  payFastService.handleWebhook(req.body);
  res.status(200).send('OK');
});
```

## Monitoring and Maintenance

### Logs
- Application logs are output to console
- Error logs are stored in the `automation_logs` table
- Use PM2 logs: `pm2 logs spitbraai-automation`

### Health Checks
Monitor these key metrics:
- Supabase connection status
- Email sending success rate
- Calendar API response times
- PayFast webhook processing

### Backup Strategy
- Regular Supabase database backups
- Environment variable backup (encrypted)
- Code repository backup

## Troubleshooting

### Common Issues

#### 1. Gmail Authentication Errors
- Verify App Password is correct
- Check 2FA is enabled
- Ensure "Less secure app access" is disabled

#### 2. Google Calendar API Errors
- Verify service account has calendar access
- Check calendar ID is correct
- Ensure private key format is correct

#### 3. Supabase Connection Issues
- Verify URL and keys are correct
- Check RLS policies allow service role access
- Ensure tables exist with correct schema

#### 4. PayFast Integration Issues
- Verify merchant credentials
- Check webhook URL is accessible
- Ensure signature generation is correct

### Debug Mode
Set `NODE_ENV=development` for verbose logging:
```bash
NODE_ENV=development npm run dev
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **Service Account Keys**: Rotate regularly
3. **PayFast Webhooks**: Validate all incoming webhooks
4. **Database Access**: Use RLS policies in Supabase
5. **HTTPS**: Always use HTTPS in production
6. **Rate Limiting**: Implement rate limiting for webhooks

## Support

For technical support:
- Email: spitbookings@thysgemaak.com
- Phone: +27 67 456 7784

## License

This automation system is proprietary to Thys Gemaak Spitbraai.
