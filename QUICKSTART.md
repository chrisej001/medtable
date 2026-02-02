# 🚀 Quick Setup - Hospital WhatsApp Bot

## Step-by-Step (10 minutes)

### 1️⃣ Install & Configure (3 min)

```bash
cd hospital-whatsapp-bot
npm install
cp .env.example .env
```

Edit `.env`:
```
WEBHOOK_URL=https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook
BOT_WHATSAPP_NUMBER=+1234567890
```

---

### 2️⃣ Update Supabase Function (5 min)

**Deploy the updated webhook:**

```bash
# Copy the new function file to your Supabase project
cp supabase-functions/whatsapp-webhook.ts YOUR_SUPABASE_PROJECT/supabase/functions/

# Deploy
cd YOUR_SUPABASE_PROJECT
supabase functions deploy whatsapp-webhook
```

**What changed:**
- Now accepts JSON (from Baileys) in addition to FormData (from Twilio)
- Returns JSON response instead of TwiML for Baileys
- Auto-detects source and responds appropriately

---

### 3️⃣ Configure Hospital (1 min)

```sql
-- In Supabase SQL Editor
UPDATE hospitals 
SET whatsapp_enabled = true,
    whatsapp_number = '+1234567890'  -- Your bot's number
WHERE id = 'your-hospital-id';
```

---

### 4️⃣ Start Bot (1 min)

```bash
npm start
```

You'll see:
```
🔧 Using WA version v2.3000.x
🚀 Health check server running on port 3000
📱 QR Code generated!
```

---

### 5️⃣ Scan QR Code (30 sec)

1. WhatsApp → Settings → Linked Devices
2. Tap "Link a Device"
3. Scan QR from terminal
4. Wait for "✅ WhatsApp connection established!"

---

### 6️⃣ Test It! (30 sec)

Send a message to your bot:
```
Hello
```

Expected:
- Terminal shows message received
- Bot responds with welcome message
- Check Supabase: new row in `whatsapp_conversations`

---

## ✅ Verification Checklist

- [ ] `npm install` completed without errors
- [ ] `.env` file created with correct webhook URL
- [ ] Supabase function deployed successfully
- [ ] Hospital record updated in database
- [ ] QR code scanned successfully
- [ ] Bot shows "connected" status
- [ ] Test message received and responded to
- [ ] Conversation appears in `whatsapp_conversations` table

---

## 🔍 Troubleshooting

**QR doesn't appear?**
```bash
npm install qrcode-terminal
npm start
```

**"No hospital found" error?**
```sql
-- Check your hospital record
SELECT * FROM hospitals WHERE whatsapp_enabled = true;

-- Update if needed
UPDATE hospitals 
SET whatsapp_number = '+YOUR_BOT_NUMBER'
WHERE id = 'your-hospital-id';
```

**Webhook not responding?**
```bash
# Test it directly
curl -X POST https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"from":"whatsapp:+1234567890","to":"whatsapp:+0987654321","body":"test"}'
```

---

## 🎯 What's Next?

1. **Test with different messages** - Try symptoms, appointment requests
2. **Check dashboard** - Verify conversations appear
3. **Deploy to production** - Use Railway or VPS
4. **Monitor for 24h** - Ensure stability
5. **Go live!** - Share number with patients

---

**Need help?** Read README.md for full documentation!
