# Push Notifications Setup Guide

This guide will help you set up web push notifications for admin users when new car referrals are submitted.

## Prerequisites

1. Make sure you have the following packages installed (already included in package.json):
   - `web-push`
   - `@clerk/nextjs`
   - `@supabase/supabase-js`

## Setup Steps

### 1. Generate VAPID Keys

Run the following command to generate VAPID keys:

```bash
node scripts/generate-vapid-keys.js
```

Copy the generated keys to your `.env` file.

### 2. Environment Variables

Add these variables to your `.env` file:

```env
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your-email@example.com

# Site URL for notifications
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Use your production URL in production
```

### 3. Database Setup

Run the SQL script to create the push subscriptions table:

```sql
-- Run this in your database
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
```

Or run the migration file:
```bash
psql -d your_database < sql/create_push_subscriptions.sql
```

### 4. Clerk Organization Setup

Make sure your Clerk organization is set up with admin roles:
1. Go to your Clerk dashboard
2. Set up your organization with `org:admin` roles
3. Assign admin roles to users who should receive notifications

### 5. Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as an admin user (with `org:admin` role)

3. Go to the dashboard and enable push notifications

4. Submit a new referral as a regular user

5. The admin should receive a push notification

## How It Works

1. **Admin Subscription**: Admin users can enable push notifications from the dashboard
2. **Service Worker**: Handles incoming push notifications and displays them
3. **Notification Trigger**: When a referral is submitted, the server sends notifications to all subscribed admin users
4. **Clerk Integration**: Uses Clerk API to identify admin users with `org:admin` role

## File Structure

- `app/api/notifications/route.ts` - API endpoint for managing subscriptions and sending notifications
- `app/hooks/usePushNotifications.ts` - React hook for managing push notification subscriptions
- `app/ui/dashboard/notification-settings.tsx` - Component for admin users to enable/disable notifications
- `public/sw.js` - Service worker for handling push notifications
- `app/lib/actions-m.ts` - Updated to send notifications when referrals are created

## Troubleshooting

1. **Notifications not working**: Check browser permissions and ensure HTTPS is enabled
2. **No admin users found**: Verify Clerk organization setup and admin role assignments
3. **Service worker issues**: Check browser developer tools for console errors
4. **Database errors**: Ensure the push_subscriptions table exists and has proper permissions

## Security Notes

- Keep VAPID keys secret and never commit them to version control
- Use HTTPS in production for push notifications to work
- Regularly clean up expired subscriptions from the database
