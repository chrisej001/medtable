# 🏥 Hospital WhatsApp Bot - Baileys Edition

A production-ready WhatsApp bot using Baileys that integrates with your multi-hospital management system. This bot replaces Twilio with a free, self-hosted solution while maintaining all your hospital features.

## 🌟 What's Different from MediDesk Bot?

This bot is specifically designed for your **hospital management system** with:

✅ **Multi-hospital routing** - Routes patients to correct hospital  
✅ **Conversation state management** - Tracks greeting, symptoms, triage, appointment  
✅ **Medical triage** - Assesses urgency and provides first aid  
✅ **Appointment creation** - Auto-creates appointments in your system  
✅ **Transcript storage** - Saves full conversation history  
✅ **Hospital database integration** - Works with your hospitals, doctors, departments tables

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **WhatsApp account** (separate number recommended)
- **Your Supabase project** with hospital schema
- **Physical phone** to scan QR code

---

## 🗄️ Database Schema Required

Your Supabase must have these tables:

### `hospitals` table
```sql
- id (uuid, primary key)
- name (text)
- whatsapp_number (text) -- e.g., "+1234567890"
- whatsapp_enabled (boolean)
- organization_type (text) -- "hospital"
```

### `whatsapp_conversations` table
```sql
- id (uuid, primary key)
- hospital_id (uuid, foreign key → hospitals.id)
- patient_phone (text) -- without "whatsapp:" prefix
- patient_name (text, nullable)
- conversation_state (text) -- "greeting", "collecting_symptoms", etc.
- transcript (jsonb) -- array of message objects
- collected_symptoms (text, nullable)
- triage_level (text, nullable) -- "LOW", "MEDIUM", "HIGH", "CRITICAL"
- urgency_score (integer, nullable)
- first_aid_given (text, nullable)
- appointment_created (boolean, default false)
- last_message_at (timestamptz)
- created_at (timestamptz)
```

### `messages` table (optional, for dashboard display)
```sql
- id (uuid, primary key)
- conversation_id (uuid)
- sender (text) -- phone or "assistant"
- content (text)
- direction (text) -- "received" or "sent"
- created_at (timestamptz)
```

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**
```bash
cd hospital-whatsapp-bot
npm install
```

### **Step 2: Configure**
```bash
cp .env.example .env
# Edit .env file
```

Update `.env`:
```env
WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
BOT_WHATSAPP_NUMBER=+1234567890  # Your bot's number
PORT=3000
```

### **Step 3: Update Supabase Function**

Deploy the updated `whatsapp-webhook.ts` to your Supabase:

```bash
# In your Supabase project directory
supabase functions deploy whatsapp-webhook
```

Or manually update your existing function to accept JSON (see `supabase-functions/whatsapp-webhook.ts`)

### **Step 4: Configure Hospital in Database**

```sql
-- Update your hospital record with bot's WhatsApp number
UPDATE hospitals 
SET whatsapp_enabled = true, 
    whatsapp_number = '+1234567890'  -- Your bot's number
WHERE id = 'your-hospital-id';
```

### **Step 5: Start Bot**
```bash
npm start
```

### **Step 6: Scan QR Code**

1. QR code will appear in terminal
2. Open WhatsApp → Settings → Linked Devices
3. Scan the QR code
4. Wait for "✅ WhatsApp connection established!"

---

## 🔄 How It Works

```
Patient sends WhatsApp message
    ↓
Baileys Bot receives message
    ↓
Bot sends to Supabase Edge Function
    Format: { from: "whatsapp:+1234...", to: "whatsapp:+0987...", body: "Hello", ... }
    ↓
Edge Function processes:
    1. Finds hospital by "to" number
    2. Creates/finds conversation
    3. Calls whatsapp-ai-conversation function
    4. Returns AI response
    ↓
Bot receives JSON response
    { success: true, response: "Hello! Welcome to...", conversationId: "..." }
    ↓
Bot sends response via WhatsApp
    ↓
Patient receives message
```

---

## 🏗️ System Architecture

### **Multi-Hospital Support**

The system routes patients to hospitals based on the bot's WhatsApp number:

1. **Patient sends message** to +1234567890
2. **Bot forwards** to webhook with `to: "whatsapp:+1234567890"`
3. **Webhook queries** `hospitals` table: `WHERE whatsapp_number = '+1234567890'`
4. **Finds hospital** and routes conversation appropriately

### **Conversation Flow**

```
State: greeting
  ↓ (patient shares symptoms)
State: collecting_symptoms
  ↓ (AI assesses severity)
State: triage_complete
  ↓ (if not critical)
State: scheduling_appointment
  ↓ (appointment created)
State: completed
```

---

## 🔧 Configuration

### **Multiple Hospitals**

To support multiple hospitals with ONE bot:

**Option A: Use ONE bot number for ALL hospitals (Recommended)**
```sql
-- All hospitals use same bot number
UPDATE hospitals 
SET whatsapp_enabled = true, 
    whatsapp_number = '+1234567890'  -- Same number
WHERE organization_type = 'hospital';
```

Bot will route based on context or ask patient which hospital they want.

**Option B: Run SEPARATE bots per hospital**
- Each hospital gets its own bot instance
- Each bot runs with different WhatsApp number
- Deploy multiple instances on different servers/ports

### **Environment Variables**

```env
# Required
WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
BOT_WHATSAPP_NUMBER=+1234567890

# Optional
PORT=3000
```

---

## 🧪 Testing

### **Test Webhook Directly**
```bash
npm run test
```

### **Test End-to-End**

1. Send WhatsApp message to bot: "Hello"
2. Check bot terminal logs
3. Check Supabase function logs
4. Check `whatsapp_conversations` table
5. Verify bot responds

### **Expected Flow**

```
Terminal Output:
📨 New message from +1234567890: "Hello"
📤 Sending to webhook: +1234567890 -> "Hello"
✅ Webhook response: { success: true, response: "Hello! Welcome to..." }
✅ Sent message to 1234567890@s.whatsapp.net
```

---

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3000/health
```

### **Bot Logs**
Watch terminal for real-time logs:
- 📨 Incoming messages
- 📤 Webhook requests
- ✅ Successful responses
- ❌ Errors

### **Supabase Logs**
1. Go to Supabase Dashboard
2. Edge Functions → whatsapp-webhook
3. View Logs tab

---

## 🐛 Troubleshooting

### **Conversations Not Showing in Dashboard**

1. **Check database:**
```sql
SELECT * FROM whatsapp_conversations 
ORDER BY created_at DESC LIMIT 10;
```

2. **Check RLS policies:**
```sql
-- Temporarily disable for testing
ALTER TABLE whatsapp_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

3. **Check edge function logs** for errors

### **Bot Not Responding**

1. **Check bot connection:**
   - Terminal should show "✅ WhatsApp connection established!"
   - WhatsApp app should show linked device

2. **Test webhook:**
```bash
curl -X POST https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"from":"whatsapp:+1234567890","to":"whatsapp:+0987654321","body":"test"}'
```

3. **Check hospital configuration:**
```sql
SELECT id, name, whatsapp_number, whatsapp_enabled 
FROM hospitals 
WHERE whatsapp_enabled = true;
```

### **"No hospital found" Error**

**Problem:** Bot's number not in database

**Fix:**
```sql
UPDATE hospitals 
SET whatsapp_enabled = true,
    whatsapp_number = '+YOUR_BOT_NUMBER'
WHERE id = 'your-hospital-id';
```

---

## 🔄 Updating Webhook Function

Your current webhook expects **Twilio FormData**. The updated version accepts **both formats**.

### **Changes Made:**

1. ✅ Detects content-type (JSON vs FormData)
2. ✅ Parses accordingly
3. ✅ Returns JSON for Baileys, TwiML for Twilio
4. ✅ Skips Twilio API call for Baileys messages

### **Deploy Updated Function:**

```bash
# Copy the updated file
cp supabase-functions/whatsapp-webhook.ts your-supabase-project/supabase/functions/

# Deploy
cd your-supabase-project
supabase functions deploy whatsapp-webhook
```

---

## 🚀 Deployment

### **Development (Local)**
```bash
npm start
# Keep terminal open
```

### **Production (Railway)**

1. Push code to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy
5. Use Railway CLI to scan QR

See main README.md for detailed Railway instructions.

### **Production (VPS)**

```bash
# SSH to server
ssh root@your-server

# Install dependencies
npm install

# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name hospital-bot

# Setup auto-restart
pm2 startup
pm2 save
```

---

## 📝 Key Differences from Twilio

| Feature | Twilio | Baileys Bot |
|---------|--------|-------------|
| **Cost** | ~$0.005/message | Free |
| **Setup** | Dashboard config | QR scan |
| **Reliability** | 99.9%+ | ~95% (depends on connection) |
| **Compliance** | WhatsApp approved | Against ToS (use at own risk) |
| **Scalability** | Unlimited | 1 bot = 1 number |
| **Message format** | FormData | JSON |

---

## ⚠️ Important Notes

1. **WhatsApp ToS:** Baileys bots violate WhatsApp Terms of Service. Use for internal/testing purposes only.

2. **One Number Per Bot:** Each bot instance = one WhatsApp number. For multiple hospitals with different numbers, run multiple bot instances.

3. **Session Persistence:** Keep `auth_info/` folder backed up. Losing it requires re-scanning QR.

4. **Connection Stability:** Bot auto-reconnects but brief downtime possible during disconnections.

5. **Message Limit:** WhatsApp may ban numbers sending too many messages. Start slow.

---

## 🎯 Next Steps

1. ✅ **Deploy bot** to production (Railway/VPS)
2. ✅ **Update hospital records** with bot number
3. ✅ **Test with real patients**
4. ✅ **Monitor logs** for 24-48 hours
5. ✅ **Set up alerts** for downtime
6. ✅ **Train staff** on conversation takeover

---

## 📚 Additional Files

- `QUICKSTART.md` - 5-minute setup guide
- `DEPLOYMENT.md` - Production deployment guide
- `TROUBLESHOOTING.md` - Common issues & fixes
- `ARCHITECTURE.md` - System design details

---

## 🤝 Support

- Check Supabase function logs first
- Test webhook independently
- Verify database has correct data
- Check bot terminal logs

---

**Made for Multi-Hospital Management System** 🏥
