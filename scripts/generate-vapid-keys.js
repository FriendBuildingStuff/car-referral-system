// Generate VAPID keys for push notifications
// Run this script with: node scripts/generate-vapid-keys.js

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys Generated:');
console.log('');
console.log('Add these to your .env file:');
console.log('');
console.log(`VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('VAPID_EMAIL=your-email@example.com');
console.log('');
console.log('Make sure to replace "your-email@example.com" with your actual email address.');
console.log('');
console.log('These keys should be kept secret and not committed to version control.');
