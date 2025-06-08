# 🚀 Spitbraai Automation Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env`
- [ ] Configure Supabase credentials
- [ ] Set up Gmail App Password
- [ ] Configure Google Service Account
- [ ] Set PayFast merchant credentials
- [ ] Update business contact information

### 2. Database Setup
- [ ] Run `scripts/setup-database.sql` in Supabase SQL editor
- [ ] Verify all tables are created
- [ ] Test RLS policies
- [ ] Insert sample menu packages

### 3. Google Services Setup
- [ ] Create Google Cloud Project
- [ ] Enable Calendar API
- [ ] Create Service Account
- [ ] Download service account JSON
- [ ] Share calendar with service account email
- [ ] Extract private key and email for .env

### 4. Gmail Setup
- [ ] Enable 2-Factor Authentication
- [ ] Generate App Password
- [ ] Test email sending capability

### 5. PayFast Setup
- [ ] Configure merchant account
- [ ] Set up webhook URL
- [ ] Test in sandbox mode
- [ ] Configure production settings

## 🔧 Deployment Steps

### Local Testing
```bash
# 1. Install dependencies
npm install

# 2. Build project
npm run build

# 3. Run tests
npm run test

# 4. Test in development mode
npm run dev
```

### Production Deployment
```bash
# 1. Use deployment script
npm run deploy

# OR manual deployment:
npm ci --only=production
npm run build
pm2 start dist/index.js --name "spitbraai-automation"
pm2 save
pm2 startup
```

## 📊 Post-Deployment Verification

### 1. System Health Checks
- [ ] PM2 process running: `pm2 status`
- [ ] Check logs: `pm2 logs spitbraai-automation`
- [ ] Monitor resource usage: `pm2 monit`

### 2. Integration Testing
- [ ] Create test booking in Supabase
- [ ] Verify email notifications sent
- [ ] Check calendar event creation
- [ ] Test payment link generation
- [ ] Verify shopping list generation

### 3. Webhook Testing
- [ ] Test PayFast webhook endpoint
- [ ] Verify payment status updates
- [ ] Check reminder email triggers

## 🔍 Monitoring & Maintenance

### Daily Checks
- [ ] Review automation logs
- [ ] Check email delivery rates
- [ ] Monitor payment processing
- [ ] Verify calendar sync

### Weekly Maintenance
- [ ] Review error logs
- [ ] Check system performance
- [ ] Update dependencies if needed
- [ ] Backup configuration

### Monthly Tasks
- [ ] Review and optimize queries
- [ ] Update menu packages if needed
- [ ] Check API rate limits
- [ ] Security audit

## 🚨 Troubleshooting

### Common Issues
1. **Email not sending**: Check Gmail App Password and 2FA
2. **Calendar events not created**: Verify service account permissions
3. **PayFast errors**: Check merchant credentials and webhook URL
4. **Database connection**: Verify Supabase credentials and RLS policies

### Emergency Contacts
- **Technical Support**: spitbookings@thysgemaak.com
- **Phone**: +27 67 456 7784

## 📈 Success Metrics

### Target Performance
- **Booking Processing**: < 30 seconds
- **Email Delivery**: > 95% success rate
- **Calendar Creation**: > 98% success rate
- **System Uptime**: > 99.5%

### Key Indicators
- New bookings processed automatically
- Payment reminders sent on schedule
- Shopping lists generated accurately
- Zero manual intervention required

---

**🎉 Congratulations! Your Spitbraai Automation System is ready for production!**
