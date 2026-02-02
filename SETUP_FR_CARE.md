# 🏥 Setup for Virtual Clinic (FR Care)

## Your Configuration

**Hospital:** Virtual Clinic (FR Care)  
**Hospital ID:** `775c0936-72c7-4d9d-8184-8baf633701c5`  
**Bot WhatsApp Number:** `+2349042967356`  
**Webhook URL:** `https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook`

---

## 🚀 Quick Setup (10 minutes)

### **Step 1: Configure Database (1 min)**

Run this in your **Supabase SQL Editor**:

```sql
-- Configure Virtual Clinic (FR Care) with your bot number
UPDATE hospitals 
SET 
  whatsapp_enabled = true,
  whatsapp_number = '+2349042967356'
WHERE id = '775c0936-72c7-4d9d-8184-8baf633701c5';

-- Verify it worked
SELECT id, name, whatsapp_number, whatsapp_enabled 
FROM hospitals 
WHERE id = '775c0936-72c7-4d9d-8184-8baf633701c5';
```

**Expected result:**
```
id: 775c0936-72c7-4d9d-8184-8baf633701c5
name: Virtual Clinic (FR Care)
whatsapp_number: +2349042967356
whatsapp_enabled: true
```

---

### **Step 2: Setup Bot (5 min)**

```bash
# Extract the ZIP file
cd hospital-whatsapp-bot

# Install dependencies
npm install

# Create configuration file
cp .env.example .env
```

Edit `.env` file:
```env
WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
BOT_WHATSAPP_NUMBER=+2349042967356
PORT=3000
```

---

### **Step 3: Deploy Supabase Function (3 min)**

**Option A: Update via Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Click **Edge Functions** → **whatsapp-webhook**
3. Replace the code with the content from `supabase-functions/whatsapp-webhook.ts`
4. Click **Deploy**

**Option B: Deploy via CLI** (if you have Supabase CLI)

```bash
# Copy the updated function to your project
cp supabase-functions/whatsapp-webhook.ts YOUR_SUPABASE_PROJECT/supabase/functions/

# Navigate to your project
cd YOUR_SUPABASE_PROJECT

# Deploy
supabase functions deploy whatsapp-webhook
```

---

### **Step 4: Start Bot (1 min)**

```bash
npm start
```

You'll see:
```
🔧 Using WA version v2.3000.x, isLatest: true
🚀 Health check server running on port 3000
📱 QR Code generated! Scan it with WhatsApp.
```

---

### **Step 5: Scan QR Code (30 sec)**

1. Open **WhatsApp** on your phone with number **+2349042967356**
2. Go to **Settings** → **Linked Devices**
3. Tap **"Link a Device"**
4. **Scan the QR code** showing in your terminal
5. Wait for: `✅ WhatsApp connection established!`
6. You'll see: `📱 Bot WhatsApp Number: +2349042967356`

---

### **Step 6: Test It! (30 sec)**

From **another phone**, send a WhatsApp message to **+2349042967356**:

```
Hello
```

**Expected Response:**
```
Hello! Welcome to Virtual Clinic (FR Care). 
I'm here to help you with your healthcare needs.

How can I assist you today?
```

**Check Terminal Logs:**
```
📨 New message from 234XXXXXXXXX: "Hello"
📤 Sending to webhook: 234XXXXXXXXX -> "Hello"
✅ Webhook response: { success: true, response: "Hello! Welcome..." }
✅ Sent message to 234XXXXXXXXX@s.whatsapp.net
```

---

## ✅ Verification Checklist

- [ ] Database updated (Hospital whatsapp_number = +2349042967356)
- [ ] `.env` file created with correct values
- [ ] Supabase webhook function updated and deployed
- [ ] `npm install` completed successfully
- [ ] Bot started with `npm start`
- [ ] QR code scanned with +2349042967356 WhatsApp account
- [ ] Bot shows "connected" status
- [ ] Test message sent and received response
- [ ] Conversation appears in `whatsapp_conversations` table

---

## 🔍 Troubleshooting

### Database Check

```sql
-- Verify hospital configuration
SELECT id, name, whatsapp_number, whatsapp_enabled 
FROM hospitals 
WHERE id = '775c0936-72c7-4d9d-8184-8baf633701c5';

-- Check if conversations are being created
SELECT * FROM whatsapp_conversations 
WHERE hospital_id = '775c0936-72c7-4d9d-8184-8baf633701c5'
ORDER BY created_at DESC 
LIMIT 5;
```

### Test Webhook Directly

```bash
curl -X POST https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "from": "whatsapp:+2348012345678",
    "to": "whatsapp:+2349042967356",
    "body": "Test message",
    "messageSid": "test-123"
  }'
```

**Expected:** JSON response with success: true

### Bot Not Responding?

1. **Check bot is connected:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"running","connected":true,...}`

2. **Check logs for errors:**
   - Look for `❌` symbols in terminal
   - Common issues: timeout, hospital not found

3. **Verify WhatsApp number matches:**
   - Bot logs should show: `📱 Bot WhatsApp Number: +2349042967356`
   - Database should have: `whatsapp_number = '+2349042967356'`

---

## 📊 What Happens After Setup

When a patient messages **+2349042967356**:

1. ✅ **Bot receives** via WhatsApp
2. ✅ **Bot sends to webhook** with `to: "whatsapp:+2349042967356"`
3. ✅ **Webhook finds hospital** by matching whatsapp_number
4. ✅ **Creates conversation** with hospital_id = `775c0936-72c7-4d9d-8184-8baf633701c5`
5. ✅ **AI processes** and generates response
6. ✅ **Bot sends back** to patient
7. ✅ **Dashboard shows** conversation under "Virtual Clinic (FR Care)"

---

## 🎯 Next Steps After Testing

1. **Monitor for 24 hours** - Check bot stays connected
2. **Review conversations** - Check quality of AI responses
3. **Train staff** - Show them the dashboard
4. **Deploy to production** - Use Railway or VPS (see DEPLOYMENT.md)
5. **Share with patients** - Start promoting the WhatsApp number

---

## 🚀 Production Deployment

Once testing is successful, deploy to production:

**Option 1: Railway (Recommended)**
- Free $5/month credit
- Auto-restart
- Easy deployment
- See DEPLOYMENT.md for details

**Option 2: VPS (DigitalOcean, etc.)**
- ~$5/month
- Full control
- 24/7 uptime
- See DEPLOYMENT.md for setup

---

## 📞 Support Resources

- **QUICKSTART.md** - Detailed setup guide
- **README.md** - Complete documentation
- **DEPLOYMENT.md** - Production deployment
- **TROUBLESHOOTING.md** - Common issues

---

## ⚡ Quick Commands Reference

```bash
# Start bot
npm start

# Test webhook
npm run test

# Check health
curl http://localhost:3000/health

# View logs (if using PM2)
pm2 logs hospital-bot

# Restart bot (if using PM2)
pm2 restart hospital-bot
```

---

**You're all set for Virtual Clinic (FR Care)!** 🎉

Start with Step 1 above and you'll be running in 10 minutes!
