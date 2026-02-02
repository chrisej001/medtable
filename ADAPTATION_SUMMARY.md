# 🎯 Hospital WhatsApp Bot - Adaptation Summary

## What Was Changed

I've adapted the MediDesk bot to work specifically with your hospital management system. Here's what changed:

---

## 📦 What You're Getting

### **1. Baileys Bot (index.js)**
- ✅ Connects to WhatsApp via QR scan
- ✅ Receives messages from patients
- ✅ Sends messages in **JSON format** (not Twilio FormData)
- ✅ Sends to YOUR webhook: `https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook`
- ✅ Handles bot responses and sends back via WhatsApp

### **2. Updated Supabase Function (whatsapp-webhook.ts)**
- ✅ Accepts **BOTH** Twilio FormData AND Baileys JSON
- ✅ Auto-detects source (Twilio vs Baileys)
- ✅ Maintains all your hospital logic:
  - Multi-hospital routing
  - Conversation state management
  - Medical triage
  - Appointment creation
  - Transcript storage
- ✅ Returns JSON for Baileys, TwiML for Twilio

### **3. Complete Documentation**
- ✅ README.md - Full system documentation
- ✅ QUICKSTART.md - 10-minute setup guide
- ✅ DEPLOYMENT.md - Production deployment
- ✅ package.json - All dependencies
- ✅ .env.example - Configuration template

---

## 🔄 Key Changes from Your Original System

### **Before (Twilio):**
```
Patient
  ↓ WhatsApp
Twilio ($$$)
  ↓ FormData: From, To, Body
Supabase Webhook
  ↓ Process & AI
Twilio
  ↓ WhatsApp
Patient
```

### **After (Baileys):**
```
Patient
  ↓ WhatsApp
Baileys Bot (FREE!)
  ↓ JSON: { from, to, body }
Supabase Webhook (UPDATED)
  ↓ Process & AI
Baileys Bot
  ↓ WhatsApp
Patient
```

---

## 🎯 What Stays the Same

Your entire hospital system logic remains **unchanged**:

✅ **Database Schema** - `hospitals`, `whatsapp_conversations`, `messages`  
✅ **Multi-hospital Routing** - By `whatsapp_number` matching  
✅ **Conversation States** - greeting, collecting_symptoms, triage, etc.  
✅ **AI Integration** - `whatsapp-ai-conversation` function  
✅ **Appointment Creation** - `whatsapp-create-appointment` function  
✅ **Dashboard** - Still shows all conversations  

---

## 🛠️ What You Need to Do

### **Step 1: Deploy Updated Webhook (5 min)**

Replace your current `whatsapp-webhook` function with the new one:

```bash
# Copy new function to your Supabase project
cp supabase-functions/whatsapp-webhook.ts YOUR_PROJECT/supabase/functions/

# Deploy
cd YOUR_PROJECT
supabase functions deploy whatsapp-webhook
```

**What changed in the function:**
```typescript
// OLD (Twilio only)
const formData = await req.formData();
const from = formData.get('From');

// NEW (Both Twilio and Baileys)
const contentType = req.headers.get('content-type');
if (contentType.includes('application/json')) {
  const json = await req.json();  // Baileys
  from = json.from;
} else {
  const formData = await req.formData();  // Twilio
  from = formData.get('From');
}
```

### **Step 2: Setup Bot (5 min)**

```bash
cd hospital-whatsapp-bot
npm install
cp .env.example .env
# Edit .env with your webhook URL
npm start
# Scan QR code
```

### **Step 3: Configure Hospital (1 min)**

```sql
UPDATE hospitals 
SET whatsapp_enabled = true,
    whatsapp_number = '+YOUR_BOT_NUMBER'
WHERE id = 'your-hospital-id';
```

### **Step 4: Test (1 min)**

Send "Hello" to your bot → Should get hospital welcome message!

---

## 📊 Message Format Comparison

### Twilio Format (FormData):
```
From: whatsapp:+1234567890
To: whatsapp:+0987654321
Body: Hello
MessageSid: SM123...
```

### Baileys Format (JSON):
```json
{
  "from": "whatsapp:+1234567890",
  "to": "whatsapp:+0987654321",
  "body": "Hello",
  "messageSid": "unique-id-123"
}
```

### Webhook Response:

**To Twilio (TwiML):**
```xml
<?xml version="1.0"?>
<Response></Response>
```

**To Baileys (JSON):**
```json
{
  "success": true,
  "response": "Hello! Welcome to our hospital...",
  "conversationId": "abc-123"
}
```

---

## 🏥 Multi-Hospital Support

Your system supports multiple hospitals. Here's how routing works:

### **Database:**
```sql
hospitals table:
- id: "hosp-1"
- name: "General Hospital"
- whatsapp_number: "+1234567890"
- whatsapp_enabled: true

- id: "hosp-2"
- name: "Children's Hospital"
- whatsapp_number: "+1234567890"  (same or different)
- whatsapp_enabled: true
```

### **Routing Logic:**
```typescript
// In webhook function
const hospitalWhatsApp = to.replace('whatsapp:', '');

// Find hospital by whatsapp_number
const { data: hospital } = await supabase
  .from('hospitals')
  .select('*')
  .eq('whatsapp_number', hospitalWhatsApp)
  .single();

// Routes to correct hospital automatically!
```

---

## 💰 Cost Comparison

| Aspect | Twilio | Baileys |
|--------|--------|---------|
| **Setup** | $0 | $0 |
| **Per Message** | $0.005 | $0 |
| **Monthly (1000 msgs)** | $5 | $0 |
| **Monthly (10000 msgs)** | $50 | $0 |
| **Hosting** | Included | ~$5/month (Railway/VPS) |

**Total Cost:**
- Twilio: $50-100/month for moderate usage
- Baileys: $5/month (just hosting)

**Savings: ~$45-95/month** 💰

---

## ⚠️ Important Notes

### **1. WhatsApp Terms of Service**
Baileys violates WhatsApp ToS. Use for:
- ✅ Internal testing
- ✅ Small-scale pilots
- ❌ Large commercial operations (risk of ban)

### **2. Reliability**
- **Twilio:** 99.9% uptime
- **Baileys:** 95% uptime (auto-reconnects, but brief gaps possible)

### **3. Scaling**
- **One bot = One WhatsApp number**
- For multiple hospital numbers, deploy multiple bot instances

### **4. Session Management**
- Keep `auth_info/` folder backed up
- Losing it = need to rescan QR code

---

## 🚀 Deployment Recommendations

### **For Testing:**
- Run locally on your computer
- Easy to stop/start, view logs

### **For Production:**
- **Railway.app** - $5/month, auto-restart, easy deployment
- **VPS (DigitalOcean)** - $5/month, full control, 24/7 uptime

---

## 📁 File Structure

```
hospital-whatsapp-bot/
├── index.js                    # Main bot code
├── package.json                # Dependencies
├── .env.example                # Config template
├── .gitignore                  # Git ignore rules
├── README.md                   # Full documentation
├── QUICKSTART.md               # 10-min setup guide
├── DEPLOYMENT.md               # Production deployment
└── supabase-functions/
    └── whatsapp-webhook.ts     # Updated webhook function
```

---

## ✅ Integration Checklist

- [ ] Downloaded hospital-whatsapp-bot.zip
- [ ] Extracted files
- [ ] Ran `npm install`
- [ ] Created `.env` with correct webhook URL
- [ ] Updated Supabase webhook function
- [ ] Configured hospital in database
- [ ] Started bot and scanned QR
- [ ] Tested with real message
- [ ] Verified conversation in database
- [ ] Checked dashboard shows conversation

---

## 🎯 Expected Behavior

**When patient sends: "I have a fever"**

1. ✅ Baileys bot receives message
2. ✅ Bot logs: `📨 New message from +1234567890: "I have a fever"`
3. ✅ Bot sends to webhook (JSON format)
4. ✅ Webhook finds hospital by bot's number
5. ✅ Creates/finds conversation in `whatsapp_conversations`
6. ✅ Calls `whatsapp-ai-conversation` for AI response
7. ✅ Saves to database with triage assessment
8. ✅ Returns JSON response to bot
9. ✅ Bot sends AI response via WhatsApp
10. ✅ Patient receives helpful medical guidance
11. ✅ Dashboard shows conversation in real-time

---

## 🆘 Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| QR doesn't appear | `npm install qrcode-terminal && npm start` |
| "No hospital found" | Update hospital record with bot's number |
| Webhook timeout | Check Supabase function logs |
| Bot disconnects | Wait 5 sec, auto-reconnects |
| Dashboard empty | Disable RLS temporarily to test |
| Messages duplicate | Built-in dedup, restart bot if persists |

---

## 📞 Next Steps

1. **Read QUICKSTART.md** - Follow 10-min setup
2. **Test locally** - Verify everything works
3. **Read DEPLOYMENT.md** - Deploy to production
4. **Monitor for 24-48h** - Ensure stability
5. **Train staff** - Show them the dashboard
6. **Go live!** - Share bot number with patients

---

## 🎉 What You've Achieved

✅ **Replaced expensive Twilio with free Baileys**  
✅ **Maintained all hospital management features**  
✅ **Saved ~$50-100/month in messaging costs**  
✅ **Kept your entire existing system intact**  
✅ **Got production-ready bot with full documentation**  

---

**You're all set!** 🚀

Read QUICKSTART.md to get started in 10 minutes!
