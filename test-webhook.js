#!/usr/bin/env node

/**
 * Webhook Tester - Test your MediDesk webhook endpoint
 * 
 * Usage: node test-webhook.js
 */

const axios = require('axios');
require('dotenv').config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://dkpfvlvrceubufkjkhyl.supabase.co/functions/v1/whatsapp-webhook';

const testMessages = [
    {
        phone: '+1234567890',
        message: 'Hello',
        expected: 'greeting response'
    },
    {
        phone: '+1234567890',
        message: 'I need to book an appointment',
        expected: 'appointment booking flow'
    },
    {
        phone: '+1234567890',
        message: 'What are your visiting hours?',
        expected: 'FAQ response'
    },
    {
        phone: '+1234567890',
        message: 'I need to speak with a doctor',
        expected: 'department/doctor information'
    }
];

async function testWebhook(testCase, index) {
    console.log(`\n📝 Test ${index + 1}/${testMessages.length}`);
    console.log(`📱 Phone: ${testCase.phone}`);
    console.log(`💬 Message: "${testCase.message}"`);
    console.log(`🎯 Expected: ${testCase.expected}`);
    
    try {
        const startTime = Date.now();
        
        const response = await axios.post(WEBHOOK_URL, {
            phone: testCase.phone,
            message: testCase.message,
            messageId: `test-${Date.now()}-${index}`,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000
        });

        const duration = Date.now() - startTime;
        
        console.log(`✅ Success (${duration}ms)`);
        console.log(`📤 Response:`, response.data);
        
        return {
            success: true,
            duration,
            response: response.data
        };
        
    } catch (error) {
        console.log(`❌ Failed`);
        console.log(`Error:`, error.response?.data || error.message);
        
        return {
            success: false,
            error: error.message
        };
    }
}

async function runTests() {
    console.log('🧪 MediDesk Webhook Tester');
    console.log('=' .repeat(50));
    console.log(`🔗 Testing endpoint: ${WEBHOOK_URL}`);
    console.log('=' .repeat(50));

    const results = [];
    
    for (let i = 0; i < testMessages.length; i++) {
        const result = await testWebhook(testMessages[i], i);
        results.push(result);
        
        // Wait 2 seconds between tests
        if (i < testMessages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Summary');
    console.log('=' .repeat(50));
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Passed: ${passed}/${testMessages.length}`);
    console.log(`❌ Failed: ${failed}/${testMessages.length}`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your webhook is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
    
    // Average response time
    const successfulTests = results.filter(r => r.success);
    if (successfulTests.length > 0) {
        const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length;
        console.log(`⏱️  Average response time: ${avgDuration.toFixed(0)}ms`);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
