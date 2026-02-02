# 🚀 Deployment Guide - Hospital WhatsApp Bot

## Understanding the System

### What We Changed

Your original system used **Twilio** ($$$) → We replaced with **Baileys** (Free!)

**Before (Twilio):**
```
Patient → Twilio → Webhook → AI → Twilio → Patient
```

**After (Baileys):**
```
Patient → Baileys Bot → Webhook → AI → Baileys Bot → Patient
```

### Key Differences

| Aspect | Twilio (Old) | Baileys (New) |
|--------|--------------|---------------|
| Cost | ~$0.005/msg | FREE |
| Setup | Dashboard | QR Scan |
| Format | FormData | JSON |
| Hosting | Twilio | Your server |
| Reliability | 99.9% | 95% (auto-reconnect) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Patient's Phone                      │
│                  (Sends: "I have fever")                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              WhatsApp Servers (Facebook)                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Baileys Bot (Your Server/Railway)            │
│                                                         │
│  Receives message from WhatsApp                         │
│  Formats as: {                                          │
│    from: "whatsapp:+1234567890",                        │
│    to: "whatsapp:+0987654321",                          │
│    body: "I have fever"                                 │
│  }                                                      │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP POST (JSON)
                        ▼
┌─────────────────────────────────────────────────────────┐
│        Supabase Edge Function: whatsapp-webhook         │
│         (jtotljjdyhxjbbsnpuml.supabase.co)              │
│                                                         │
│  1. Detects content-type = application/json            │
│  2. Parses JSON (instead of FormData)                  │
│  3. Extracts: patientPhone, hospitalWhatsApp           │
│  4. Finds hospital in database                         │
│  5. Creates/finds conversation                         │
│  6. Calls whatsapp-ai-conversation                     │
│  7. Returns JSON: { success: true, response: "..." }   │
└───────────────────────┬─────────────────────────────────┘
                        │ Returns JSON
                        ▼
┌─────────────────────────────────────────────────────────┐
│            Baileys Bot (Your Server/Railway)            │
│                                                         │
│  Receives: { response: "Hello! I can help..." }        │
│  Sends message back via WhatsApp                       │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Patient's Phone                      │
│            (Receives: "Hello! I can help...")           │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Deployment Options

### Option 1: Local Computer (Testing)

**Pros:** Free, easy setup  
**Cons:** Computer must stay on

```bash
# Simple start
npm start

# Keep running
```

---

### Option 2: Railway (Recommended for Production)

**Pros:** $5/month free tier, auto-restart, easy deployment  
**Cons:** Need to scan QR via CLI

**Steps:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Hospital WhatsApp bot"
git remote add origin https://github.com/YOUR_USERNAME/hospital-bot.git
git push -u origin main
```

2. **Deploy to Railway**
- Go to [railway.app](https://railway.app)
- New Project → Deploy from GitHub
- Select your repository
- Add environment variables:
  ```
  WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
  BOT_WHATSAPP_NUMBER=+1234567890
  ```

3. **Scan QR Code**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Run to see QR
railway run npm start
# Scan QR code, then Ctrl+C

# Bot will reconnect automatically on Railway
```

4. **Verify**
- Check Railway logs: `railway logs`
- Should see "✅ WhatsApp connection established!"

---

### Option 3: VPS (DigitalOcean, Linode, AWS)

**Pros:** Full control, 24/7 uptime  
**Cons:** $5-10/month, requires server management

**Steps:**

```bash
# SSH to server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Upload/clone code
git clone https://github.com/YOUR_USERNAME/hospital-bot.git
cd hospital-bot

# Install dependencies
npm install

# Create .env
nano .env
# Paste:
# WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
# BOT_WHATSAPP_NUMBER=+1234567890

# Install PM2
npm install -g pm2

# Start bot
pm2 start index.js --name hospital-bot

# Scan QR (appears in logs)
pm2 logs hospital-bot

# Setup auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
```

---

## 🔄 Updating Supabase Function

Your webhook needs to accept JSON from Baileys (not just Twilio FormData).

### Current Function Flow

```typescript
// OLD (Twilio only)
const formData = await req.formData();
const from = formData.get('From');
// ... Twilio-specific logic
```

### Updated Function Flow

```typescript
// NEW (Both Twilio and Baileys)
const contentType = req.headers.get('content-type');

if (contentType.includes('application/json')) {
  // Baileys Bot
  const json = await req.json();
  from = json.from;
  // ...
} else {
  // Twilio
  const formData = await req.formData();
  from = formData.get('From');
  // ...
}
```

### Deploy Updated Function

```bash
# Copy new function
cp supabase-functions/whatsapp-webhook.ts YOUR_SUPABASE_PROJECT/supabase/functions/

# Deploy
cd YOUR_SUPABASE_PROJECT
supabase functions deploy whatsapp-webhook

# Verify
curl -X POST https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"from":"whatsapp:+1234567890","to":"whatsapp:+0987654321","body":"test"}'
```

---

## 🗄️ Database Configuration

### 1. Verify Tables Exist

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('hospitals', 'whatsapp_conversations');
```

### 2. Update Hospital Record

```sql
-- Set your bot's WhatsApp number
UPDATE hospitals 
SET whatsapp_enabled = true,
    whatsapp_number = '+1234567890'  -- Your bot's number
WHERE id = 'your-hospital-id';

-- Verify
SELECT id, name, whatsapp_number, whatsapp_enabled 
FROM hospitals 
WHERE whatsapp_enabled = true;
```

### 3. Check RLS Policies

```sql
-- Disable for testing (re-enable in production!)
ALTER TABLE whatsapp_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

---

## 🧪 Testing Deployment

### 1. Test Webhook Endpoint

```bash
curl -X POST https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "whatsapp:+1234567890",
    "to": "whatsapp:+0987654321",
    "body": "Hello",
    "messageSid": "test-123"
  }'
```

**Expected:** JSON response with `success: true` and `response` field

### 2. Test Bot End-to-End

1. Send WhatsApp message to bot: "Hello"
2. Check bot logs for "📨 New message"
3. Check Supabase function logs
4. Check database: `SELECT * FROM whatsapp_conversations;`
5. Verify bot responds

### 3. Test Multi-Hospital Routing

```sql
-- Add second hospital
UPDATE hospitals 
SET whatsapp_enabled = true,
    whatsapp_number = '+1234567890'  -- Same bot number
WHERE id = 'second-hospital-id';

-- Test: Send message, check which hospital it routes to
```

---

## 📊 Monitoring

### Bot Health

```bash
# Health check endpoint
curl http://your-bot-url:3000/health

# Expected:
{
  "status": "running",
  "connected": true,
  "user": "1234567890@s.whatsapp.net",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Logs

**Railway:**
```bash
railway logs --tail
```

**VPS (PM2):**
```bash
pm2 logs hospital-bot
```

**Supabase:**
- Dashboard → Edge Functions → whatsapp-webhook → Logs

---

## 🔐 Security Checklist

- [ ] `.env` file NOT committed to Git
- [ ] `auth_info/` folder NOT committed to Git
- [ ] Environment variables set in Railway/server
- [ ] Supabase service role key secure
- [ ] RLS policies enabled in production
- [ ] `auth_info/` folder backed up

---

## 🚨 Emergency Procedures

### Bot Goes Down

1. Check health endpoint
2. Check logs for errors
3. Restart bot:
   ```bash
   # Railway
   railway restart
   
   # VPS
   pm2 restart hospital-bot
   ```

### QR Code Expired

```bash
# Delete auth folder
rm -rf auth_info

# Restart and rescan
npm start
# (or railway run npm start)
```

### Webhook Not Responding

1. Test webhook URL directly (curl command above)
2. Check Supabase function status
3. Redeploy function if needed
4. Check environment variables

---

## 📈 Scaling

### Multiple Hospitals, Same Bot Number

**Current Setup:** All hospitals share bot number

**Pros:** Simple, one bot to manage  
**Cons:** Can't identify which hospital patient wants

**Solution:** Bot asks patient which hospital in greeting

### Multiple Hospitals, Different Numbers

**Setup:** One bot instance per hospital

1. Deploy bot 1 with number A → Hospital A
2. Deploy bot 2 with number B → Hospital B
3. Each bot has own `auth_info` folder
4. Each hospital record has different `whatsapp_number`

---

## ✅ Production Checklist

Before going live:

- [ ] Bot deployed to production (Railway/VPS)
- [ ] QR code scanned successfully
- [ ] Webhook function updated and deployed
- [ ] Hospital records configured in database
- [ ] End-to-end test successful
- [ ] Monitoring/alerts set up
- [ ] `auth_info` backed up
- [ ] Staff trained on system
- [ ] Fallback plan if bot goes down
- [ ] 24-hour monitoring period completed

---

## 🎯 Post-Deployment

1. **Monitor for 48 hours**
   - Check logs regularly
   - Respond to any errors immediately
   - Track conversation success rate

2. **Train Staff**
   - How to view conversations in dashboard
   - How to take over from bot
   - When to escalate issues

3. **Optimize**
   - Review conversation transcripts
   - Improve AI prompts if needed
   - Adjust triage logic

4. **Scale**
   - Add more hospitals
   - Deploy additional bot instances if needed
   - Implement load balancing

---

**Your bot is now ready for production!** 🎉
