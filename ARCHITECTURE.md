# 🏗️ MediDesk WhatsApp Bot - System Architecture

## Overview

This document explains how all the pieces fit together.

---

## 📊 High-Level Architecture

```
┌─────────────────┐
│   Patient's     │
│  WhatsApp App   │
└────────┬────────┘
         │ 1. Sends message
         ▼
┌─────────────────┐
│   WhatsApp      │
│    Servers      │
└────────┬────────┘
         │ 2. Delivers to linked device
         ▼
┌─────────────────────────────────────────┐
│         Baileys WhatsApp Bot            │
│  (Node.js - Your Server/Railway/VPS)    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  1. Receives WhatsApp message    │  │
│  │  2. Extracts phone & text        │  │
│  │  3. De-duplicates                │  │
│  └──────────┬───────────────────────┘  │
└────────────┼────────────────────────────┘
             │ 3. HTTP POST
             │ {phone, message, messageId}
             ▼
┌─────────────────────────────────────────┐
│      Supabase Edge Function             │
│   /functions/v1/whatsapp-webhook        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  1. Receives webhook request     │  │
│  │  2. Queries conversation history │  │
│  │  3. Formats context for AI       │  │
│  └──────────┬───────────────────────┘  │
└────────────┼────────────────────────────┘
             │ 4. API Request
             ▼
┌─────────────────────────────────────────┐
│        Anthropic Claude API             │
│                                         │
│  Generates response based on:           │
│  - User message                         │
│  - Conversation history                 │
│  - Hospital context (FAQs, doctors)     │
└────────────┬────────────────────────────┘
             │ 5. AI Response
             ▼
┌─────────────────────────────────────────┐
│      Supabase Edge Function             │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  1. Saves conversation to DB     │  │
│  │  2. Returns response to bot      │  │
│  └──────────┬───────────────────────┘  │
└────────────┼────────────────────────────┘
             │ 6. Response JSON
             ▼
┌─────────────────────────────────────────┐
│         Baileys WhatsApp Bot            │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Sends AI response via WhatsApp  │  │
│  └──────────────────────────────────┘  │
└────────────┬────────────────────────────┘
             │ 7. Sends via WhatsApp protocol
             ▼
┌─────────────────┐
│   WhatsApp      │
│    Servers      │
└────────┬────────┘
         │ 8. Delivers to user
         ▼
┌─────────────────┐
│   Patient's     │
│  WhatsApp App   │
└─────────────────┘
```

---

## 🔄 Message Flow Example

### Scenario: Patient asks "What are your visiting hours?"

**Step 1: Patient sends message**
```
Patient WhatsApp → WhatsApp Servers → Baileys Bot
Message: "What are your visiting hours?"
```

**Step 2: Bot processes**
```javascript
// In index.js
const phone = "1234567890"
const message = "What are your visiting hours?"
const messageId = "unique-wa-id-123"

// Send to webhook
POST https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
Body: {
  "phone": "1234567890",
  "message": "What are your visiting hours?",
  "messageId": "unique-wa-id-123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Step 3: Edge function processes**
```javascript
// In whatsapp-webhook edge function

// 1. Find or create conversation
const conversation = await getOrCreateConversation(phone)

// 2. Save user message
await saveMessage(conversationId, phone, message, 'received')

// 3. Get conversation history
const history = await getConversationHistory(conversationId)

// 4. Get hospital context (FAQs, departments)
const context = await getHospitalContext()

// 5. Call Claude API
const aiResponse = await claude.messages.create({
  model: "claude-sonnet-4-20250514",
  messages: [
    ...history,
    { role: "user", content: message }
  ],
  system: `You are MediDesk assistant. Context: ${context}`
})

// 6. Save AI response
await saveMessage(conversationId, 'assistant', aiResponse.content, 'sent')

// 7. Return to bot
return {
  success: true,
  response: aiResponse.content[0].text
}
```

**Step 4: Bot sends response**
```javascript
// In index.js
const webhookResponse = await sendToWebhook(phone, message, messageId)

// Send to WhatsApp
await sock.sendMessage(
  `${phone}@s.whatsapp.net`,
  { text: webhookResponse.response }
)
```

**Step 5: Patient receives**
```
Bot → WhatsApp Servers → Patient WhatsApp
Message: "Our visiting hours are 10 AM - 8 PM daily. 
         ICU visitors are allowed 2-4 PM and 6-8 PM. 
         Would you like to know more?"
```

---

## 🗄️ Database Schema

### Tables Used

```sql
-- conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL,
  patient_name TEXT,
  status TEXT, -- 'active', 'archived', 'human_takeover'
  assigned_to UUID, -- staff member if taken over
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  sender TEXT, -- phone number or 'assistant'
  content TEXT,
  direction TEXT, -- 'received' or 'sent'
  whatsapp_message_id TEXT, -- for deduplication
  created_at TIMESTAMPTZ
);

-- patients (optional, for linking)
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMPTZ
);
```

---

## 🔌 Integration Points

### 1. Baileys ↔ WhatsApp

**Protocol:** WhatsApp Web Protocol (via Baileys library)

**Authentication:** QR Code scan (creates session in `auth_info/`)

**Connection:** WebSocket to WhatsApp servers

**Reliability:** Auto-reconnect on disconnect

### 2. Baileys Bot ↔ Supabase Edge Function

**Protocol:** HTTP POST

**Endpoint:** `/functions/v1/whatsapp-webhook`

**Authentication:** None (can add API key if needed)

**Format:**
```json
Request:
{
  "phone": "+1234567890",
  "message": "Hello",
  "messageId": "wa-msg-123",
  "timestamp": "2024-01-15T10:30:00Z"
}

Response:
{
  "success": true,
  "response": "Hello! How can I help you?",
  "conversationId": "uuid"
}
```

### 3. Edge Function ↔ Anthropic API

**Protocol:** HTTPS REST API

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Authentication:** API key in headers

**Format:** Standard Claude Messages API

### 4. Edge Function ↔ Supabase Database

**Protocol:** PostgREST (via supabase-js client)

**Authentication:** Service role key

**Operations:** 
- Insert messages
- Query conversations
- Fetch FAQs, doctors, departments

---

## 🔐 Security Layers

### Layer 1: WhatsApp Authentication
- QR code scan required
- Session tokens stored locally
- End-to-end encryption (WhatsApp's)

### Layer 2: Bot Server
- Environment variables for sensitive data
- No credentials in code
- `auth_info/` never committed to Git

### Layer 3: Edge Function
- Supabase authentication
- RLS (Row Level Security) on database
- Rate limiting (can be added)

### Layer 4: Database
- RLS policies enforce access control
- Encrypted at rest
- Audit logs available

---

## 📈 Scalability Considerations

### Current Limitations

**Single Bot Instance:**
- Baileys requires single instance per WhatsApp number
- Can't horizontally scale the bot itself
- One bot = one WhatsApp number

**Solutions for High Volume:**

1. **Multiple Numbers**
   - Deploy bot per WhatsApp number
   - Load balance across numbers
   - E.g., +1-555-0001, +1-555-0002, etc.

2. **Message Queue**
   - Add Redis/RabbitMQ between bot and webhook
   - Bot pushes to queue
   - Workers process from queue
   - Prevents webhook timeouts

3. **Database Optimization**
   - Add indexes on frequently queried fields
   - Use connection pooling
   - Cache FAQs/doctors in memory

4. **Edge Function Scaling**
   - Supabase auto-scales edge functions
   - Can handle 1000s of concurrent requests
   - Add caching for common queries

---

## 🔧 Configuration

### Environment Variables

**Bot (`/whatsapp-bot/.env`):**
```env
WEBHOOK_URL=https://[project].supabase.co/functions/v1/whatsapp-webhook
PORT=3000
```

**Edge Function:**
```env
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://[project].supabase.co
SUPABASE_ANON_KEY=eyJ...
```

---

## 📊 Monitoring Points

### 1. Bot Health
- `/health` endpoint
- Connection status
- Memory usage
- Uptime

### 2. Message Processing
- Messages received
- Messages sent
- Average response time
- Error rate

### 3. Webhook Performance
- Request count
- Response time
- Error rate
- Timeout rate

### 4. Database
- Query performance
- Connection pool usage
- Row counts
- Slow queries

---

## 🚨 Failure Modes & Recovery

### Bot Crashes
**Detection:** Health endpoint stops responding  
**Recovery:** PM2/Railway auto-restarts  
**Impact:** Messages queued, delivered on reconnect

### WhatsApp Disconnection
**Detection:** "Connection closed" in logs  
**Recovery:** Auto-reconnect after 5 seconds  
**Impact:** 5-10 second delay in responses

### Webhook Timeout
**Detection:** "Webhook error: timeout" in logs  
**Recovery:** User gets error message, can retry  
**Impact:** Single message fails, others continue

### Database Unavailable
**Detection:** Edge function returns 500 error  
**Recovery:** Automatic Supabase failover  
**Impact:** Brief disruption (~seconds)

### Auth Session Expired
**Detection:** "Logged out" message  
**Recovery:** Manual - rescan QR code required  
**Impact:** Bot offline until QR rescanned

---

## 🔄 Update & Deployment Strategy

### Bot Updates

```bash
# 1. Test locally
npm start

# 2. Commit to Git
git add .
git commit -m "Update bot features"
git push

# 3. Railway auto-deploys
# OR manually redeploy on VPS

# 4. Verify deployment
curl https://[bot-url]/health

# 5. Monitor logs
railway logs
# OR
pm2 logs
```

### Zero-Downtime Updates

1. **Keep old instance running**
2. **Deploy new instance**
3. **Test new instance**
4. **Stop old instance**
5. **Monitor for issues**

---

## 📝 Key Files & Their Roles

```
whatsapp-bot/
├── index.js               # Main bot logic, message handling
├── package.json           # Dependencies & scripts
├── .env                   # Configuration (created by you)
├── auth_info/            # WhatsApp session (auto-created)
├── ecosystem.config.js   # PM2 configuration
├── Dockerfile            # Container image definition
├── docker-compose.yml    # Docker orchestration
├── test-webhook.js       # Webhook testing utility
├── README.md             # Full documentation
├── QUICKSTART.md         # Beginner guide
├── RAILWAY.md            # Railway deployment
├── TROUBLESHOOTING.md    # Common issues
└── CHECKLIST.md          # Setup checklist
```

---

## 🎯 Design Decisions

### Why Baileys?
- ✅ Free (no WhatsApp Business API fees)
- ✅ Full control over bot
- ✅ Works with regular WhatsApp number
- ❌ Requires persistent server
- ❌ Against WhatsApp ToS (use at own risk)

### Why Edge Functions?
- ✅ Serverless (auto-scaling)
- ✅ Near database (low latency)
- ✅ Integrated with Supabase
- ✅ Built-in auth & RLS

### Why Separate Bot & Function?
- ✅ Baileys needs persistent connection
- ✅ Edge function scales independently
- ✅ Can swap bot implementation later
- ✅ Easier to debug & monitor

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Message queue (Redis)
- [ ] Multi-number support
- [ ] Admin dashboard for bot status
- [ ] A/B testing framework
- [ ] Analytics dashboard
- [ ] Automated testing suite

### Potential Integrations
- [ ] Appointment booking system API
- [ ] Patient records system
- [ ] Payment gateway
- [ ] SMS fallback
- [ ] Email notifications

---

**Architecture Version:** 1.0  
**Last Updated:** January 2024  
**Reviewed By:** MediDesk Team
