# 🚂 Railway Deployment Guide

Deploy your MediDesk WhatsApp bot to Railway for 24/7 operation with just a few clicks!

## Why Railway?

✅ **$5 free credit monthly** (enough for small-medium usage)  
✅ **Automatic restarts** if bot crashes  
✅ **Easy deployment** from GitHub  
✅ **Built-in monitoring** and logs  
✅ **No server management** needed

---

## 📋 Prerequisites

1. GitHub account (free)
2. Railway account (free)
3. WhatsApp bot code in a GitHub repository

---

## 🚀 Step-by-Step Deployment

### **Step 1: Push Code to GitHub**

If you haven't already:

```bash
# Initialize git in your whatsapp-bot folder
cd whatsapp-bot
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: MediDesk WhatsApp bot"

# Create a new repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/medidesk-whatsapp-bot.git
git branch -M main
git push -u origin main
```

---

### **Step 2: Create Railway Account**

1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign in with GitHub
3. Authorize Railway to access your GitHub

---

### **Step 3: Deploy New Project**

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `medidesk-whatsapp-bot` repository
4. Railway will automatically detect it's a Node.js project

---

### **Step 4: Configure Environment Variables**

1. In your Railway project, click **"Variables"** tab
2. Click **"+ New Variable"**
3. Add:
   ```
   WEBHOOK_URL=https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook
   ```
4. Click **"Add"**

---

### **Step 5: Deploy!**

1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Check the **"Deployments"** tab - should show "Success ✅"

---

### **Step 6: Scan QR Code (IMPORTANT!)**

Railway doesn't show QR codes in the web interface, so you need to:

**Option A: Use Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run locally with Railway environment
railway run npm start
```

Now scan the QR code that appears!

**Option B: View Logs & Use QR Generator**

1. In Railway dashboard, click **"View Logs"**
2. You'll see ASCII art of QR code in logs
3. Copy the QR code text
4. Use online QR generator to recreate it
5. Scan with WhatsApp

**Option C: Use Persistent Storage (Advanced)**

1. Add a **Volume** to persist `auth_info`:
   - Click "Settings" → "Volumes"
   - Mount path: `/app/auth_info`
2. Run bot locally once to scan QR
3. Copy `auth_info` folder to Railway volume

---

### **Step 7: Verify Deployment**

1. Check logs: Click **"View Logs"** in Railway
2. Look for:
   ```
   ✅ WhatsApp connection established!
   🟢 MediDesk WhatsApp Bot is running...
   ```

3. Get your service URL (if health endpoint is public):
   - Click "Settings" → "Generate Domain"
   - Visit `https://your-app.up.railway.app/health`

4. Send a test message to your WhatsApp bot

---

## 📊 Monitoring

### **View Logs**

In Railway dashboard:
1. Click your service
2. Click **"View Logs"**
3. See real-time logs

### **Metrics**

- **CPU usage**: Railway dashboard → Metrics
- **Memory usage**: Railway dashboard → Metrics
- **Deployment status**: Deployments tab

### **Health Check**

If you've exposed the port:
```
https://your-app.up.railway.app/health
```

---

## 🔄 Updates & Redeployment

### **Automatic Deployment**

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update bot features"
git push
```

Railway will automatically build and deploy!

### **Manual Redeployment**

In Railway dashboard:
1. Click **"Deployments"**
2. Click **"Redeploy"** on any deployment

### **Rollback**

1. Go to **"Deployments"**
2. Find previous working deployment
3. Click **"..."** → **"Redeploy"**

---

## 💰 Pricing & Usage

### **Free Tier**

- **$5 credit/month** (includes)
- ~550 hours/month runtime
- Good for: Development, testing, small-scale production

### **When You Need to Upgrade**

Signs you need paid plan:
- Bot handles 1000+ messages/day
- Running out of monthly credits
- Need guaranteed 24/7 uptime

Paid plans start at **$5/month** for more credits.

### **Optimize Usage**

```javascript
// In index.js, reduce log verbosity:
logger: pino({ level: 'error' }), // Instead of 'silent' or 'info'
```

---

## 🐛 Troubleshooting

### **Deployment Fails**

**Check build logs:**
1. Click failed deployment
2. View **"Build Logs"**
3. Look for errors

**Common fixes:**
- Missing dependencies in `package.json`
- Node version mismatch (add `"engines"` in package.json)

### **Bot Connects but Immediately Disconnects**

**Logs show "Connection closed":**

1. Delete old session:
   ```bash
   railway run npm start
   # Then Ctrl+C and delete auth_info locally
   ```

2. Scan QR again

### **Can't Scan QR Code**

**Use Railway CLI:**
```bash
railway login
railway link
railway run npm start
# Scan QR that appears
```

### **Out of Credits**

1. Check usage: Railway dashboard → Settings → Usage
2. Options:
   - Wait for monthly reset
   - Add payment method for more credits
   - Optimize bot to use less resources

---

## 🔐 Security Best Practices

### **1. Environment Variables**

Never commit:
- ✅ Use Railway Variables for `WEBHOOK_URL`
- ❌ Don't hardcode in code

### **2. GitHub Secrets**

Add to `.gitignore`:
```
auth_info/
.env
node_modules/
```

### **3. Volume Permissions**

If using volumes, ensure they're private to your Railway project.

---

## 📈 Scaling

### **Horizontal Scaling (Not Needed)**

WhatsApp bot should run as **single instance** (not multiple).
- Baileys doesn't support multi-instance for same number
- Keep `instances: 1` in any config

### **Vertical Scaling**

If bot is slow:
1. Upgrade Railway plan for more CPU/RAM
2. Optimize code (reduce logging, etc.)

---

## 🎯 Production Checklist

Before going live:

- [ ] Environment variables set in Railway
- [ ] QR code scanned and connected
- [ ] Test messages work end-to-end
- [ ] Health endpoint responding
- [ ] Logs show no errors
- [ ] Webhook URL is correct
- [ ] `.gitignore` includes `auth_info/`
- [ ] Monitoring/alerts set up
- [ ] Backup plan if Railway goes down

---

## 🆘 Support

### **Railway Issues**

- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- Email: team@railway.app

### **Bot Issues**

- Check logs in Railway dashboard
- Test webhook independently: `npm run test`
- Verify WhatsApp connection in app

---

## 🔗 Useful Links

- [Railway Dashboard](https://railway.app/dashboard)
- [Railway Docs](https://docs.railway.app/)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Railway Pricing](https://railway.app/pricing)

---

**🎉 That's it! Your bot is now running 24/7 on Railway!**
