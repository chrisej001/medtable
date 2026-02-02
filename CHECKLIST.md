# ✅ MediDesk WhatsApp Bot - Complete Setup Checklist

Use this checklist to ensure everything is configured correctly!

---

## 📦 **Phase 1: Local Setup (Required)**

### Prerequisites
- [ ] Node.js v18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] WhatsApp on phone (updated to latest version)
- [ ] Physical access to phone for QR scanning

### Files & Configuration
- [ ] Downloaded `whatsapp-bot` folder
- [ ] Ran `npm install` successfully
- [ ] Created `.env` file from `.env.example`
- [ ] Verified `WEBHOOK_URL` in `.env` is correct
- [ ] No errors when running `npm start`

### WhatsApp Connection
- [ ] QR code appeared in terminal
- [ ] Scanned QR with WhatsApp (Settings → Linked Devices)
- [ ] Saw "✅ WhatsApp connection established!"
- [ ] Bot shows as connected device in WhatsApp app

### Testing
- [ ] Sent test message from another phone
- [ ] Bot received message (visible in terminal logs)
- [ ] Bot sent webhook request (check logs)
- [ ] Received AI response from bot
- [ ] Conversation appears in MediDesk dashboard

---

## 🧪 **Phase 2: Webhook Testing**

### Webhook Connectivity
- [ ] Ran `npm run test` successfully
- [ ] All 4 test cases passed
- [ ] Response time < 5 seconds
- [ ] No timeout errors

### Manual Testing
```bash
curl -X POST https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","message":"Hello","messageId":"test-1"}'
```
- [ ] Curl command returns 200 OK
- [ ] Response contains AI-generated text
- [ ] No error messages

### End-to-End Flow
- [ ] User sends WhatsApp message
- [ ] Bot logs show "📨 New message from..."
- [ ] Bot logs show "📤 Sending to webhook..."
- [ ] Bot logs show "✅ Webhook response"
- [ ] Bot logs show "✅ Sent message to..."
- [ ] User receives AI response
- [ ] MediDesk dashboard shows conversation

---

## 🚀 **Phase 3: Production Deployment**

Choose ONE deployment method:

### Option A: Railway (Recommended)
- [ ] Created Railway account
- [ ] Pushed code to GitHub
- [ ] Connected GitHub repo to Railway
- [ ] Added `WEBHOOK_URL` environment variable
- [ ] Deployment succeeded
- [ ] Scanned QR code using Railway CLI
- [ ] Bot connected and running
- [ ] Tested with real message
- [ ] Logs show no errors

### Option B: VPS (DigitalOcean, etc.)
- [ ] SSH access to server
- [ ] Node.js installed on server
- [ ] Code uploaded to server
- [ ] `.env` configured on server
- [ ] Dependencies installed (`npm install`)
- [ ] PM2 installed (`npm install -g pm2`)
- [ ] Bot started with PM2 (`pm2 start index.js`)
- [ ] PM2 startup configured (`pm2 startup`)
- [ ] Scanned QR code
- [ ] Bot running 24/7

### Option C: Docker
- [ ] Docker installed
- [ ] Built image (`docker build -t medidesk-bot .`)
- [ ] Created `.env` file
- [ ] Started container (`docker-compose up -d`)
- [ ] Container running (`docker ps`)
- [ ] Scanned QR code
- [ ] Tested messages working

### Option D: Local Computer (Development Only)
- [ ] Computer stays on 24/7
- [ ] Bot runs on startup (optional)
- [ ] Backup power supply (recommended)
- [ ] Remote access configured (for monitoring)

---

## 🔒 **Phase 4: Security & Backup**

### Security
- [ ] `.env` file NOT committed to Git
- [ ] `auth_info/` folder NOT committed to Git
- [ ] `.gitignore` includes sensitive files
- [ ] Environment variables secure (Railway/VPS)
- [ ] Webhook URL kept private

### Backup
- [ ] `auth_info/` folder backed up locally
- [ ] Backup stored securely (not in Git)
- [ ] Know how to restore from backup
- [ ] Tested restoration process

---

## 📊 **Phase 5: Monitoring & Maintenance**

### Health Monitoring
- [ ] Health endpoint accessible (`/health`)
- [ ] Set up uptime monitoring (optional)
- [ ] Alert system for downtime (optional)
- [ ] Log rotation configured (for VPS)

### Regular Checks
- [ ] Check logs daily for errors
- [ ] Monitor message volume
- [ ] Verify AI responses are appropriate
- [ ] Check Supabase function logs
- [ ] Monitor Railway/VPS usage

### Weekly Maintenance
- [ ] Review conversation quality
- [ ] Check for any disconnections
- [ ] Verify backup is current
- [ ] Update dependencies if needed

---

## 🎯 **Phase 6: Go-Live Checklist**

Before announcing to users:

### Testing
- [ ] Tested with 10+ different message types
- [ ] Tested appointment booking flow
- [ ] Tested FAQ responses
- [ ] Tested error handling (invalid inputs)
- [ ] Tested during high load (optional)

### Performance
- [ ] Response time < 5 seconds average
- [ ] No message delays or queuing
- [ ] Handles concurrent messages
- [ ] No memory leaks (monitor for 24h)

### User Experience
- [ ] AI responses are helpful and accurate
- [ ] Tone is appropriate for medical context
- [ ] No confusing or misleading responses
- [ ] Handoff to human staff works smoothly

### Documentation
- [ ] User guide created for patients
- [ ] Staff trained on taking over conversations
- [ ] Escalation process defined
- [ ] Support contact information ready

---

## 🚨 **Emergency Procedures**

### If Bot Goes Down
1. [ ] Check health endpoint
2. [ ] Check logs for errors
3. [ ] Restart bot (`pm2 restart` or Railway redeploy)
4. [ ] If auth expired, rescan QR
5. [ ] Notify team

### If Messages Not Sending
1. [ ] Test webhook with `curl`
2. [ ] Check Supabase function status
3. [ ] Verify environment variables
4. [ ] Check bot logs
5. [ ] Restart bot if needed

### If Duplicate Messages
1. [ ] Don't panic - usually harmless
2. [ ] Check `processedMessages` size
3. [ ] May need to restart bot
4. [ ] Monitor for pattern

---

## 📈 **Success Metrics**

Track these to measure success:

### Day 1-7
- [ ] Bot stays connected 24/7
- [ ] No crashes or restarts needed
- [ ] 100% of messages get responses
- [ ] < 5 second average response time
- [ ] No duplicate messages

### Week 2-4
- [ ] Patient satisfaction with bot
- [ ] Reduction in manual front desk work
- [ ] Appointment booking success rate
- [ ] Escalation to human rate
- [ ] Common questions identified

### Month 1-3
- [ ] Total messages handled
- [ ] Peak usage times identified
- [ ] Most common query types
- [ ] AI accuracy improvements
- [ ] ROI calculation

---

## 🎓 **Knowledge Transfer**

Ensure team knows:

### Technical Staff
- [ ] How to view logs
- [ ] How to restart bot
- [ ] How to rescan QR code
- [ ] Where documentation is
- [ ] Who to contact for issues

### Front Desk Staff
- [ ] How to view conversations in dashboard
- [ ] How to take over a conversation
- [ ] When to escalate to bot team
- [ ] How to report bot issues

---

## ✨ **Optional Enhancements**

Consider adding:

- [ ] Analytics dashboard for bot metrics
- [ ] A/B testing different AI prompts
- [ ] Multi-language support
- [ ] Voice message support
- [ ] Rich media responses (images, buttons)
- [ ] Integration with appointment system
- [ ] Automated follow-ups
- [ ] Patient satisfaction surveys

---

## 📝 **Notes & Issues**

Track issues here:

**Date:** ___________
**Issue:** ___________
**Resolution:** ___________

**Date:** ___________
**Issue:** ___________
**Resolution:** ___________

---

## 🎉 **Ready to Go Live?**

If you've checked ALL boxes in Phases 1-5:

✅ **You're ready for production!**

Share with your team and start helping patients! 🏥

---

**Last Updated:** ___________ by ___________
**Next Review:** ___________
