
-- Spitbraai Automation Database Setup
-- Run this script in your Supabase SQL editor

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
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
  calendar_event_id TEXT,
  
  -- Indexes for performance
  CONSTRAINT bookings_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT bookings_guest_count_check CHECK (guest_count > 0),
  CONSTRAINT bookings_total_amount_check CHECK (total_amount >= 0)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_processed ON bookings(processed);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Create automation_logs table
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'warning')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for logs
CREATE INDEX IF NOT EXISTS idx_automation_logs_booking_id ON automation_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_created_at ON automation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_automation_logs_status ON automation_logs(status);

-- Create payment_tracking table
CREATE TABLE IF NOT EXISTS payment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('booking_fee', 'deposit', 'final')),
  amount DECIMAL(10,2) NOT NULL,
  payment_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  payfast_payment_id TEXT,
  payfast_transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure unique payment type per booking
  UNIQUE(booking_id, payment_type)
);

-- Create indexes for payment tracking
CREATE INDEX IF NOT EXISTS idx_payment_tracking_booking_id ON payment_tracking(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_tracking_status ON payment_tracking(status);
CREATE INDEX IF NOT EXISTS idx_payment_tracking_payment_type ON payment_tracking(payment_type);

-- Create menu_packages table for dynamic menu management
CREATE TABLE IF NOT EXISTS menu_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  base_price_per_person DECIMAL(8,2),
  menu_items JSONB NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default menu packages
INSERT INTO menu_packages (name, description, base_price_per_person, menu_items) VALUES
('Essential Celebration', 'Perfect for standard celebrations and gatherings', 280.00, '{
  "meat": {
    "Beef (Silverside/Topside)": {"perPerson": 0.25, "unit": "kg"},
    "Pork Shoulder": {"perPerson": 0.15, "unit": "kg"},
    "Chicken (Whole)": {"perPerson": 0.2, "unit": "kg"},
    "Boerewors": {"perPerson": 0.1, "unit": "kg"}
  },
  "sides": {
    "Potato Salad": {"perPerson": 0.15, "unit": "kg"},
    "Coleslaw": {"perPerson": 0.1, "unit": "kg"},
    "Green Salad": {"perPerson": 0.1, "unit": "kg"},
    "Garlic Bread": {"perPerson": 2, "unit": "slices"}
  },
  "condiments": {
    "Tomato Sauce": {"perPerson": 0.02, "unit": "kg"},
    "Mustard": {"perPerson": 0.01, "unit": "kg"},
    "Chutney": {"perPerson": 0.015, "unit": "kg"}
  },
  "equipment": {
    "Disposable Plates": {"perPerson": 2, "unit": "pieces"},
    "Disposable Cups": {"perPerson": 3, "unit": "pieces"},
    "Serviettes": {"perPerson": 4, "unit": "pieces"},
    "Plastic Cutlery Sets": {"perPerson": 1, "unit": "set"}
  }
}'),
('Premium Feast', 'Premium quality meats and gourmet sides for special occasions', 420.00, '{
  "meat": {
    "Beef (Ribeye/Sirloin)": {"perPerson": 0.3, "unit": "kg"},
    "Lamb Leg": {"perPerson": 0.2, "unit": "kg"},
    "Pork Ribs": {"perPerson": 0.25, "unit": "kg"},
    "Chicken (Free Range)": {"perPerson": 0.25, "unit": "kg"},
    "Boerewors (Premium)": {"perPerson": 0.15, "unit": "kg"}
  },
  "sides": {
    "Roasted Vegetables": {"perPerson": 0.2, "unit": "kg"},
    "Potato Salad (Gourmet)": {"perPerson": 0.15, "unit": "kg"},
    "Greek Salad": {"perPerson": 0.12, "unit": "kg"},
    "Garlic Bread (Artisan)": {"perPerson": 2, "unit": "slices"},
    "Rice Salad": {"perPerson": 0.1, "unit": "kg"}
  },
  "condiments": {
    "Gourmet Sauces": {"perPerson": 0.025, "unit": "kg"},
    "Herb Butter": {"perPerson": 0.02, "unit": "kg"},
    "Specialty Chutneys": {"perPerson": 0.02, "unit": "kg"}
  },
  "equipment": {
    "Quality Disposable Plates": {"perPerson": 2, "unit": "pieces"},
    "Disposable Wine Glasses": {"perPerson": 2, "unit": "pieces"},
    "Disposable Cups": {"perPerson": 2, "unit": "pieces"},
    "Linen-look Serviettes": {"perPerson": 4, "unit": "pieces"},
    "Quality Cutlery Sets": {"perPerson": 1, "unit": "set"}
  }
}'),
('Budget Braai', 'Affordable option without compromising on taste', 180.00, '{
  "meat": {
    "Beef (Chuck/Brisket)": {"perPerson": 0.2, "unit": "kg"},
    "Chicken (Portions)": {"perPerson": 0.2, "unit": "kg"},
    "Boerewors": {"perPerson": 0.15, "unit": "kg"}
  },
  "sides": {
    "Potato Salad": {"perPerson": 0.12, "unit": "kg"},
    "Coleslaw": {"perPerson": 0.1, "unit": "kg"},
    "Bread Rolls": {"perPerson": 2, "unit": "pieces"}
  },
  "condiments": {
    "Tomato Sauce": {"perPerson": 0.015, "unit": "kg"},
    "Mustard": {"perPerson": 0.01, "unit": "kg"}
  },
  "equipment": {
    "Paper Plates": {"perPerson": 2, "unit": "pieces"},
    "Paper Cups": {"perPerson": 2, "unit": "pieces"},
    "Serviettes": {"perPerson": 3, "unit": "pieces"},
    "Basic Cutlery": {"perPerson": 1, "unit": "set"}
  }
}')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies (Row Level Security)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_packages ENABLE ROW LEVEL SECURITY;

-- Policy for service role (automation system)
CREATE POLICY "Service role can manage all bookings" ON bookings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all logs" ON automation_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all payments" ON payment_tracking
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can read menu packages" ON menu_packages
  FOR SELECT USING (auth.role() = 'service_role');

-- Policy for authenticated users (website)
CREATE POLICY "Authenticated users can insert bookings" ON bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read menu packages" ON menu_packages
  FOR SELECT USING (active = true);

-- Create functions for automation triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for menu_packages updated_at
CREATE TRIGGER update_menu_packages_updated_at 
  BEFORE UPDATE ON menu_packages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for booking summary
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
  b.id,
  b.name,
  b.email,
  b.event_date,
  b.guest_count,
  b.package_name,
  b.total_amount,
  b.payment_status,
  b.booking_fee_paid,
  b.processed,
  b.created_at,
  CASE 
    WHEN b.event_date < CURRENT_DATE THEN 'completed'
    WHEN b.event_date = CURRENT_DATE THEN 'today'
    WHEN b.event_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'this_week'
    WHEN b.event_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'this_month'
    ELSE 'future'
  END as event_status,
  COUNT(al.id) as log_count,
  COUNT(pt.id) as payment_count
FROM bookings b
LEFT JOIN automation_logs al ON b.id = al.booking_id
LEFT JOIN payment_tracking pt ON b.id = pt.booking_id
GROUP BY b.id, b.name, b.email, b.event_date, b.guest_count, b.package_name, 
         b.total_amount, b.payment_status, b.booking_fee_paid, b.processed, b.created_at;

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Insert sample booking for testing (optional)
-- INSERT INTO bookings (
--   name, email, phone, event_date, guest_count, package_name, 
--   venue_address, total_amount, additional_notes
-- ) VALUES (
--   'Test Customer', 'test@example.com', '+27 82 123 4567', 
--   CURRENT_DATE + INTERVAL '30 days', 50, 'Essential Celebration',
--   '123 Test Street, Cape Town, 8000', 14000.00,
--   'This is a test booking for automation testing'
-- );

-- Display setup completion message
DO $$
BEGIN
  RAISE NOTICE 'Spitbraai Automation Database Setup Complete!';
  RAISE NOTICE 'Tables created: bookings, automation_logs, payment_tracking, menu_packages';
  RAISE NOTICE 'Views created: booking_summary';
  RAISE NOTICE 'RLS policies enabled and configured';
  RAISE NOTICE 'Ready for automation system integration';
END $$;
