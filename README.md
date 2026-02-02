# 🏥 MediDesk WhatsApp Bot

A production-ready WhatsApp bot using Baileys that integrates with your MediDesk hospital front desk assistant system.

## 📋 Prerequisites

- **Node.js** v18 or higher ([Download here](https://nodejs.org/))
- A **WhatsApp account** (can be a separate number from your personal one)
- **Physical phone** to scan QR code
- Your MediDesk system running on Supabase

---

## 🚀 Step-by-Step Setup

### **Step 1: Download and Extract**

1. Download this entire `whatsapp-bot` folder
2. Extract it to your computer (e.g., `C:\medidesk-bot` or `~/medidesk-bot`)

### **Step 2: Install Node.js**

1. Check if Node.js is installed:
   ```bash
   node --version
   ```
   
2. If not installed, download from [nodejs.org](https://nodejs.org/) (use LTS version)

3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### **Step 3: Install Dependencies**

1. Open terminal/command prompt in the `whatsapp-bot` folder
   - **Windows**: Right-click folder → "Open in Terminal" or "Open Command Prompt here"
   - **Mac/Linux**: Right-click folder → "Open Terminal"

2. Run:
   ```bash
   npm install
   ```
   
   This will install all required packages (~2-3 minutes)

### **Step 4: Configure Environment**

1. Copy `.env.example` to `.env`:
   ```bash
   # Windows
   copy .env.example .env
   
   # Mac/Linux
   cp .env.example .env
   ```

2. Open `.env` file and verify the webhook URL:
   ```
   WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
   ```

### **Step 5: Start the Bot**

1. Run the bot:
   ```bash
   npm start
   ```

2. You should see:
   ```
   🔧 Using WA version v2.3000.x, isLatest: true
   🚀 Health check server running on port 3000
   📱 QR Code generated! Scan it with WhatsApp.
   ```

3. A **QR code** will appear in your terminal

### **Step 6: Connect WhatsApp**

1. Open **WhatsApp** on your phone
2. Go to **Settings** → **Linked Devices**
3. Tap **"Link a Device"**
4. **Scan the QR code** displayed in your terminal

5. You should see:
   ```
   ✅ WhatsApp connection established!
   🟢 MediDesk WhatsApp Bot is running...
   ```

### **Step 7: Test the Bot**

1. Send a message to your WhatsApp number from **another phone**:
   ```
   Hello
   ```

2. You should see in the terminal:
   ```
   📨 New message from 1234567890: "Hello"
   📤 Sending to webhook...
   ✅ Webhook response: {...}
   ✅ Sent message to 1234567890@s.whatsapp.net
   ```

3. The bot should reply with an AI-generated response!

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Terminal shows "✅ WhatsApp connection established!"
- [ ] You can see the connection in WhatsApp → Linked Devices
- [ ] Send a test message and receive AI response
- [ ] Check your MediDesk dashboard for new conversation
- [ ] Terminal logs show message processing

---

## 🖥️ Deployment Options

### **Option 1: Local Computer (Easiest for Testing)**

✅ **Pros**: Free, easy to set up, good for testing  
❌ **Cons**: Computer must stay on 24/7

**Keep it running:**
```bash
npm start
```

**To run in background (Mac/Linux):**
```bash
nohup npm start > bot.log 2>&1 &
```

---

### **Option 2: Railway (Recommended for Production)**

✅ **Pros**: Free tier available, easy deployment, automatic restarts  
❌ **Cons**: Limited free hours per month

**Steps:**

1. Create account at [railway.app](https://railway.app)

2. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

3. Login:
   ```bash
   railway login
   ```

4. Initialize project:
   ```bash
   railway init
   ```

5. Add environment variable:
   ```bash
   railway variables set WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
   ```

6. Deploy:
   ```bash
   railway up
   ```

7. **IMPORTANT**: After first deployment, you need to scan QR code:
   - View logs: `railway logs`
   - Copy the QR code ASCII art
   - Use an online QR generator to recreate it, or
   - Run `railway run npm start` locally once to scan

8. Verify deployment:
   ```bash
   railway logs
   ```

---

### **Option 3: Render**

✅ **Pros**: Free tier, persistent storage  
❌ **Cons**: Sleeps after 15 min inactivity (paid plan needed for 24/7)

**Steps:**

1. Create account at [render.com](https://render.com)

2. Create new **Web Service**

3. Connect your GitHub repo (or upload code)

4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
     ```

5. For persistent QR authentication, add **Disk**:
   - Mount Path: `/opt/render/project/src/auth_info`

---

### **Option 4: VPS (DigitalOcean, Linode, AWS EC2)**

✅ **Pros**: Full control, 24/7 uptime, no sleep  
❌ **Cons**: Costs ~$5-10/month, requires server management

**Quick Setup (Ubuntu):**

```bash
# SSH into your server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone/upload your bot
git clone <your-repo> medidesk-bot
cd medidesk-bot

# Install dependencies
npm install

# Create .env file
nano .env
# Add: WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook

# Install PM2 for process management
npm install -g pm2

# Start bot
pm2 start index.js --name medidesk-bot

# Setup auto-restart on server reboot
pm2 startup
pm2 save

# View logs
pm2 logs medidesk-bot
```

---

## 🔍 Monitoring & Logs

### **View Live Logs**
```bash
npm start
```

### **Check Bot Status**

Visit in browser: `http://localhost:3000/health`

Response:
```json
{
  "status": "running",
  "connected": true,
  "user": "1234567890@s.whatsapp.net",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Common Log Messages**

✅ **Success:**
```
✅ WhatsApp connection established!
📨 New message from 1234567890: "Hello"
✅ Webhook response: {...}
✅ Sent message to...
```

❌ **Errors:**
```
❌ Connection closed. Reconnecting: true
❌ Webhook error: timeout
❌ Failed to send message...
```

---

## 🐛 Troubleshooting

### **QR Code Not Appearing**

```bash
# Delete auth and restart
rm -rf auth_info
npm start
```

### **Connection Keeps Dropping**

- Check internet connection
- Ensure phone has internet
- WhatsApp app is updated
- Try restarting bot

### **Messages Not Sending to Webhook**

1. Check webhook URL in `.env`
2. Test webhook manually:
   ```bash
   curl -X POST https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook \
     -H "Content-Type: application/json" \
     -d '{"phone":"+1234567890","message":"test"}'
   ```

### **Bot Sends Duplicate Messages**

- Normal behavior if restarted - bot processes recent messages
- Duplicate detection is built-in for most cases

### **"Logged Out" Error**

```bash
# Delete authentication and re-scan QR
rm -rf auth_info
npm start
```

---

## 📁 Project Structure

```
whatsapp-bot/
├── index.js              # Main bot logic
├── package.json          # Dependencies
├── .env                  # Configuration (create this)
├── .env.example          # Example config
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── auth_info/           # WhatsApp session (auto-created)
    ├── creds.json
    └── ...
```

---

## 🔐 Security Notes

⚠️ **IMPORTANT:**

1. **Never commit `auth_info/` to Git** - contains your WhatsApp session
2. **Never commit `.env`** - contains your API keys
3. **Keep `auth_info/` backed up** - losing it requires re-scanning QR
4. **Use environment variables** for all sensitive data

---

## 🔄 Updates & Maintenance

### **Update Dependencies**
```bash
npm update
```

### **Restart Bot**
```bash
# Stop with Ctrl+C, then:
npm start
```

### **Backup Auth Session**
```bash
# Backup
cp -r auth_info auth_info.backup

# Restore
cp -r auth_info.backup auth_info
```

---

## 📞 Support

### **Need Help?**

1. Check logs: `npm start` and read error messages
2. Test webhook independently
3. Verify phone has internet connection
4. Try deleting `auth_info/` and re-scanning

### **Common Issues:**

- **QR expired**: Just restart the bot
- **Connection lost**: Bot auto-reconnects in 5 seconds
- **Webhook timeout**: Check your Supabase function logs

---

## 🎯 Next Steps

1. ✅ **Test thoroughly** - Send various messages
2. ✅ **Monitor for 24h** - Ensure stability
3. ✅ **Deploy to production** - Choose Railway/VPS
4. ✅ **Set up monitoring** - Use health endpoint
5. ✅ **Add logging** - Track conversations in database

---

## 📊 Features

✅ Auto-reconnection on disconnect  
✅ Duplicate message detection  
✅ Error handling and user notifications  
✅ Health check endpoint  
✅ Support for text messages  
✅ Graceful shutdown  
✅ Production-ready logging

---

## 📝 License

MIT License - Feel free to modify for your needs

---

## 🤝 Contributing

Found a bug? Have a suggestion? Feel free to modify and improve!

---

**Made with ❤️ for MediDesk**
