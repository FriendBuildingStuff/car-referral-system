// Test script to verify push notification setup
// Run with: node scripts/test-notification.js

const fetch = require('node-fetch');

async function testNotification() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  try {
    console.log('Testing notification API...');
    
    const response = await fetch(`${url}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_referral',
        message: 'Test notification: New car referral submitted',
      }),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Notification API test successful:', result);
    } else {
      console.log('❌ Notification API test failed:', result);
    }
  } catch (error) {
    console.error('❌ Error testing notification API:', error.message);
    console.log('Make sure your development server is running (npm run dev)');
  }
}

// Run the test
testNotification();
