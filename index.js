const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://jtotljjdyhxjbbsnpuml.supabase.co/functions/v1/whatsapp-webhook';
const BOT_WHATSAPP_NUMBER = process.env.BOT_WHATSAPP_NUMBER; // Your bot's WhatsApp number (e.g., +1234567890)
const PORT = process.env.PORT || 3000;

let sock;
let qrRetries = 0;
const MAX_QR_RETRIES = 5;

// Store message processing state to avoid duplicates
const processedMessages = new Set();

async function sendToWebhook(fromPhone, message, messageId) {
    try {
        console.log(`📤 Sending to webhook: ${fromPhone} -> "${message}"`);
        
        // Send in format compatible with your webhook
        // Format: { from: "whatsapp:+1234567890", to: "whatsapp:+0987654321", body: "message", messageSid: "id" }
        const response = await axios.post(WEBHOOK_URL, {
            from: `whatsapp:${fromPhone}`,
            to: `whatsapp:${BOT_WHATSAPP_NUMBER}`,
            body: message,
            messageSid: messageId,
            numMedia: 0,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000 // 30 second timeout
        });

        console.log('✅ Webhook response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Webhook error:', error.response?.data || error.message);
        throw error;
    }
}

async function sendWhatsAppMessage(jid, text) {
    try {
        await sock.sendMessage(jid, { text });
        console.log(`✅ Sent message to ${jid}`);
    } catch (error) {
        console.error(`❌ Failed to send message to ${jid}:`, error);
    }
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    console.log(`🔧 Using WA version v${version.join('.')}, isLatest: ${isLatest}`);

    sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }), // Change to 'info' for debugging
        auth: state,
        browser: ['Hospital Assistant Bot', 'Chrome', '1.0.0'],
        getMessage: async (key) => {
            return { conversation: '' };
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrRetries++;
            console.log('\n📱 QR Code generated! Scan it with WhatsApp.');
            console.log(`⚠️  QR Code attempt ${qrRetries}/${MAX_QR_RETRIES}`);
            console.log('\n');
            
            // Display QR code in terminal
            qrcode.generate(qr, { small: true });
            
            console.log('\nScan this QR code with WhatsApp → Settings → Linked Devices → Link a Device');
            
            if (qrRetries >= MAX_QR_RETRIES) {
                console.log('❌ Max QR retries reached. Restarting...');
                qrRetries = 0;
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Connection closed. Reconnecting:', shouldReconnect);
            
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 5000);
            } else {
                console.log('🔴 Logged out. Please delete auth_info folder and restart.');
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connection established!');
            console.log('🟢 Hospital WhatsApp Bot is running...');
            
            // Get bot's phone number
            if (sock.user) {
                const botNumber = sock.user.id.split(':')[0];
                console.log(`📱 Bot WhatsApp Number: +${botNumber}`);
                
                if (!BOT_WHATSAPP_NUMBER) {
                    console.log('⚠️  Set BOT_WHATSAPP_NUMBER in .env to: +' + botNumber);
                }
            }
            
            qrRetries = 0;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            try {
                // Skip if not a message from user
                if (!msg.message || msg.key.fromMe) continue;

                const messageId = msg.key.id;
                
                // Skip if already processed
                if (processedMessages.has(messageId)) {
                    console.log(`⏭️  Skipping duplicate message: ${messageId}`);
                    continue;
                }

                // Mark as processed
                processedMessages.add(messageId);
                
                // Clean up old processed messages (keep last 1000)
                if (processedMessages.size > 1000) {
                    const arr = Array.from(processedMessages);
                    processedMessages.clear();
                    arr.slice(-500).forEach(id => processedMessages.add(id));
                }

                const remoteJid = msg.key.remoteJid;
                const phone = remoteJid.replace('@s.whatsapp.net', '');
                
                // Extract message text
                let messageText = '';
                if (msg.message.conversation) {
                    messageText = msg.message.conversation;
                } else if (msg.message.extendedTextMessage?.text) {
                    messageText = msg.message.extendedTextMessage.text;
                } else if (msg.message.imageMessage?.caption) {
                    messageText = msg.message.imageMessage.caption;
                } else {
                    console.log('⚠️  Unsupported message type, skipping');
                    continue;
                }

                console.log(`\n📨 New message from +${phone}: "${messageText}"`);

                // Send to webhook and get AI response
                const webhookResponse = await sendToWebhook(phone, messageText, messageId);

                // Send AI response back to user
                if (webhookResponse?.response) {
                    await sendWhatsAppMessage(remoteJid, webhookResponse.response);
                }

            } catch (error) {
                console.error('❌ Error processing message:', error);
                
                // Send error message to user
                try {
                    await sendWhatsAppMessage(
                        msg.key.remoteJid,
                        "Sorry, I'm having trouble processing your message right now. Please try again in a moment."
                    );
                } catch (sendError) {
                    console.error('❌ Failed to send error message:', sendError);
                }
            }
        }
    });

    return sock;
}

// Health check endpoint (useful for monitoring)
const express = require('express');
const app = express();

app.get('/health', (req, res) => {
    res.json({
        status: 'running',
        connected: sock?.user ? true : false,
        user: sock?.user?.id || null,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Health check server running on port ${PORT}`);
});

// Start the WhatsApp connection
connectToWhatsApp().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (sock) {
        await sock.logout();
    }
    process.exit(0);
});
