# 🔧 Troubleshooting Guide

Common issues and solutions for the MediDesk WhatsApp Bot.

---

## 🚨 Common Issues

### 1. QR Code Not Appearing

**Symptoms:**
- Terminal shows messages but no QR code
- Stuck at "connecting..."

**Solutions:**

```bash
# Solution 1: Delete auth and restart
rm -rf auth_info
npm start

# Solution 2: Check Node version (need 18+)
node --version

# Solution 3: Reinstall dependencies
rm -rf node_modules
npm install
npm start

# Solution 4: Check for port conflicts
# Kill any process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

---

### 2. Connection Keeps Dropping

**Symptoms:**
- "❌ Connection closed. Reconnecting: true"
- Repeated disconnections

**Causes & Solutions:**

**A. Internet Connection**
```bash
# Test your internet
ping google.com

# Check if Supabase is reachable
curl https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
```

**B. WhatsApp Session Expired**
```bash
# Delete session and re-scan QR
rm -rf auth_info
npm start
```

**C. Multiple Devices**
- Only ONE device can be connected to a WhatsApp number
- Check WhatsApp → Settings → Linked Devices
- Remove old/duplicate connections

**D. Phone Internet Issues**
- Ensure phone has stable internet
- WhatsApp must be running on phone
- Try switching phone between WiFi/Mobile data

---

### 3. Messages Not Sending to Webhook

**Symptoms:**
- Bot receives messages but doesn't reply
- "❌ Webhook error: timeout"

**Diagnose:**

```bash
# Test webhook manually
node test-webhook.js

# Or with curl:
curl -X POST https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","message":"test","messageId":"test-123"}'
```

**Solutions:**

**A. Check Webhook URL**
```bash
# Verify .env file
cat .env

# Should show:
WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
```

**B. Supabase Function Issues**
- Check Supabase logs
- Verify edge function is deployed
- Test function in Supabase dashboard

**C. Timeout Issues**
```javascript
// In index.js, increase timeout:
timeout: 60000 // 60 seconds instead of 30
```

**D. Network/Firewall**
```bash
# Test if you can reach Supabase
curl -I https://dkpfvlvrceubufkjkhyl.supabase.co
```

---

### 4. Bot Sends Duplicate Messages

**Symptoms:**
- User receives same message 2-3 times
- Happens after bot restart

**Why it happens:**
- WhatsApp sends recent message history on reconnect
- Bot processes them again

**Solutions:**

**A. Already Built-in**
The bot has duplicate detection using `processedMessages` Set.

**B. Increase Detection Memory**
```javascript
// In index.js, line 76:
if (processedMessages.size > 5000) { // Increase from 1000
    const arr = Array.from(processedMessages);
    processedMessages.clear();
    arr.slice(-2500).forEach(id => processedMessages.add(id));
}
```

**C. Database-based Deduplication**
Store processed message IDs in Supabase:
```javascript
// Check if message already processed
const { data } = await supabase
  .from('processed_messages')
  .select('id')
  .eq('message_id', messageId)
  .single();

if (data) return; // Already processed
```

---

### 5. "Logged Out" Error

**Symptoms:**
```
🔴 Logged out. Please delete auth_info folder and restart.
```

**Solution:**

```bash
# Delete authentication
rm -rf auth_info

# Restart bot
npm start

# Scan new QR code
```

**Why it happens:**
- WhatsApp session invalidated
- Logged out from phone
- Security check by WhatsApp

---

### 6. High Memory Usage

**Symptoms:**
- Bot uses 200MB+ RAM
- System slows down

**Solutions:**

**A. Reduce Logging**
```javascript
// In index.js, line 18:
logger: pino({ level: 'error' }), // Instead of 'silent'
```

**B. Clean Up Message Cache**
```javascript
// Add automatic cleanup
setInterval(() => {
    if (processedMessages.size > 500) {
        const arr = Array.from(processedMessages);
        processedMessages.clear();
        arr.slice(-250).forEach(id => processedMessages.add(id));
    }
}, 3600000); // Every hour
```

**C. Restart Periodically**
```bash
# Using PM2
pm2 start ecosystem.config.js

# PM2 will auto-restart if memory exceeds limit
```

---

### 7. Can't Install Dependencies

**Symptoms:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Solution 1: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use --legacy-peer-deps
npm install --legacy-peer-deps

# Solution 3: Update npm
npm install -g npm@latest

# Solution 4: Use specific Node version
nvm install 18
nvm use 18
npm install
```

---

### 8. QR Code Expired

**Symptoms:**
- "QR Code attempt 5/5"
- QR keeps refreshing

**Solution:**

```bash
# Just restart the bot
# Press Ctrl+C
npm start

# New QR will appear - scan within 20 seconds
```

---

### 9. Webhook Returns Error

**Symptoms:**
```
❌ Webhook error: Request failed with status code 500
```

**Diagnose:**

```bash
# Check Supabase function logs
# Go to Supabase Dashboard → Edge Functions → Logs

# Test webhook directly
curl -X POST https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","message":"test"}'
```

**Common webhook errors:**

**A. Missing required fields**
```javascript
// Ensure you're sending all required fields:
{
  "phone": "+1234567890",
  "message": "Hello",
  "messageId": "unique-id",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**B. Database connection issues**
- Check Supabase connection string
- Verify RLS policies

**C. AI API timeout**
- Anthropic API might be slow
- Increase webhook timeout

---

### 10. Bot Doesn't Start on Server Reboot

**Symptoms:**
- VPS reboots, bot stops
- Have to manually restart

**Solution:**

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start index.js --name medidesk-bot

# Save PM2 configuration
pm2 save

# Enable PM2 startup
pm2 startup
# Follow the command it gives you

# Verify
pm2 list
```

---

## 📱 Phone/WhatsApp Issues

### WhatsApp Shows "This account is not allowed to use this service"

**Solution:**
- Your WhatsApp number is banned/restricted
- Use a different number
- Contact WhatsApp support

### Phone Battery Saver Kills WhatsApp

**Solution:**
- Disable battery optimization for WhatsApp
- Keep phone charged
- Use WhatsApp Business (more stable for bots)

### Can't Scan QR Code

**Solution:**
- Ensure phone has internet
- Update WhatsApp to latest version
- Try different camera/lighting
- Screenshot QR and upload to phone if needed

---

## 🔍 Debugging Tips

### Enable Verbose Logging

```javascript
// In index.js, line 18:
logger: pino({ level: 'debug' }), // Shows everything
```

### Monitor Network Requests

```javascript
// Add request logging
sock.ev.on('messages.upsert', async ({ messages }) => {
    console.log('Raw message:', JSON.stringify(messages, null, 2));
});
```

### Check Health Endpoint

```bash
# While bot is running
curl http://localhost:3000/health

# Should return:
{
  "status": "running",
  "connected": true,
  "user": "1234567890@s.whatsapp.net",
  "timestamp": "..."
}
```

---

## 🆘 Still Having Issues?

### Collect Information

Before asking for help, gather:

1. **Error message** (full text from terminal)
2. **Bot logs** (last 50 lines)
3. **Node version**: `node --version`
4. **npm version**: `npm --version`
5. **Operating system** (Windows/Mac/Linux)
6. **What you've already tried**

### Test Checklist

Run through this:

- [ ] Node.js version 18+ installed
- [ ] Dependencies installed (`npm install` worked)
- [ ] `.env` file exists with correct `WEBHOOK_URL`
- [ ] Can access webhook URL (test with curl)
- [ ] WhatsApp is updated on phone
- [ ] Phone has internet connection
- [ ] No firewall blocking connections
- [ ] Port 3000 is not in use
- [ ] `auth_info` folder permissions are correct

### Get Logs

```bash
# Run bot with full logging
npm start > bot.log 2>&1

# Check the log file
cat bot.log

# Or tail in real-time
tail -f bot.log
```

---

## 🔄 Nuclear Option (Start Fresh)

If nothing works:

```bash
# 1. Complete cleanup
rm -rf node_modules
rm -rf auth_info
rm package-lock.json
rm .env

# 2. Fresh install
npm install

# 3. Reconfigure
cp .env.example .env
# Edit .env with your webhook URL

# 4. Start fresh
npm start
```

---

## 📚 Additional Resources

- **Baileys Documentation**: https://github.com/WhiskeySockets/Baileys
- **Node.js Troubleshooting**: https://nodejs.org/en/docs/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

**💡 Remember:** Most issues are solved by:
1. Deleting `auth_info` and rescanning QR
2. Checking internet connection
3. Verifying webhook URL is correct
4. Ensuring phone's WhatsApp is active

---

**Still stuck?** Create a GitHub issue with full error logs and system info!
