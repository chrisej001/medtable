const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
require('dotenv').config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook';
const PORT = process.env.PORT || 3000;

let sock;
let qrRetries = 0;
const MAX_QR_RETRIES = 5;

// Store message processing state to avoid duplicates
const processedMessages = new Set();

async function sendToWebhook(phone, message, messageId) {
    try {
        console.log(`📤 Sending to webhook: ${phone} -> "${message}"`);
        
        const response = await axios.post(WEBHOOK_URL, {
            phone: phone,
            message: message,
            messageId: messageId,
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
        printQRInTerminal: true,
        auth: state,
        browser: ['MediDesk Bot', 'Chrome', '1.0.0'],
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
            console.log('🟢 MediDesk WhatsApp Bot is running...');
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

                console.log(`\n📨 New message from ${phone}: "${messageText}"`);

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
