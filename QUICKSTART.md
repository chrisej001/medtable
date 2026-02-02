# 🚀 Quick Start Guide - MediDesk WhatsApp Bot

## For Complete Beginners

### 1️⃣ Install Node.js (5 minutes)

**Windows:**
1. Go to https://nodejs.org/
2. Download the "LTS" version (left button)
3. Run the installer
4. Click "Next" through all steps
5. Restart your computer

**Mac:**
1. Go to https://nodejs.org/
2. Download the "LTS" version
3. Open the .pkg file
4. Follow installation steps

**Verify installation:**
Open Command Prompt (Windows) or Terminal (Mac) and type:
```bash
node --version
```
You should see something like `v18.17.0`

---

### 2️⃣ Setup the Bot (5 minutes)

**Windows:**
1. Download the `whatsapp-bot` folder to your Desktop
2. Right-click the folder → "Open in Terminal" (or "Open Command Prompt here")
3. Type these commands one by one:

```bash
npm install
copy .env.example .env
npm start
```

**Mac/Linux:**
1. Download the `whatsapp-bot` folder to your Desktop
2. Right-click the folder → "New Terminal at Folder"
3. Type these commands one by one:

```bash
npm install
cp .env.example .env
npm start
```

---

### 3️⃣ Connect WhatsApp (2 minutes)

1. A QR code will appear in your terminal
2. Open WhatsApp on your phone
3. Go to Settings → Linked Devices
4. Tap "Link a Device"
5. Scan the QR code

You should see: ✅ **WhatsApp connection established!**

---

### 4️⃣ Test It! (1 minute)

1. From another phone, send a WhatsApp message to your bot number
2. The bot should reply automatically!
3. Check your MediDesk dashboard - you'll see the conversation

---

## ✅ That's it! Your bot is running!

**To stop the bot:** Press `Ctrl + C` in the terminal

**To start again:** Open terminal in the folder and run:
```bash
npm start
```

---

## 🆘 Having Issues?

### QR Code doesn't appear?
```bash
npm start
```
Wait 10-15 seconds

### "npm: command not found"?
Node.js isn't installed. Go back to Step 1.

### Bot disconnects?
Normal! It will auto-reconnect in 5 seconds.

### Need to re-scan QR?
```bash
# Delete old session
# Windows:
rmdir /s auth_info

# Mac/Linux:
rm -rf auth_info

# Then restart
npm start
```

---

## 📱 Deployment for 24/7 Running

**Option 1: Keep your computer on**
- Free but your PC must stay on

**Option 2: Railway.app (Recommended)**
- Free tier available
- Follow the Railway section in main README.md

**Option 3: VPS Server**
- ~$5/month for 24/7 uptime
- Follow VPS section in main README.md

---

## 💡 Pro Tips

1. **Keep the terminal open** while testing
2. **Watch the logs** - they tell you everything
3. **Test with real messages** before going live
4. **Backup auth_info folder** - it's your session data

---

## 📞 Next Steps

1. ✅ Test with 5-10 different messages
2. ✅ Check MediDesk dashboard for conversations
3. ✅ Verify AI responses make sense
4. ✅ Deploy to Railway for 24/7 operation

---

**Questions?** Read the full README.md for detailed information!
