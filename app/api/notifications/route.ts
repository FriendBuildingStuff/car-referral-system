import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import webpush from "web-push";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Handle subscription management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subscription, userId, message } = body;

    if (type === 'subscribe') {
      // Store subscription in database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          subscription: subscription,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing subscription:', error);
        return NextResponse.json({ error: 'Failed to store subscription' }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (type === 'new_referral') {
      // Get all push subscriptions from database (no role filtering)
      const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (error) {
        console.error('Error fetching subscriptions:', error);
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
      }

      if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.json({ success: true, message: 'No subscriptions found for users' });
      }

      // Send notifications to all admin subscriptions
      const notificationPromises = subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            sub.subscription,
            JSON.stringify({
              title: '🚗 New Car Referral',
              body: message || 'A new car referral has been submitted and requires your attention.',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              image: '/hero-website.png', // Add a larger image for desktop
              tag: 'car-referral', // Group similar notifications
              renotify: true, // Allow re-notification with same tag
              requireInteraction: true, // Keep notification visible until user interacts
              vibrate: [200, 100, 200], // Vibration pattern for mobile
              actions: [
                {
                  action: 'view',
                  title: 'View Dashboard',
                  icon: '/favicon.ico'
                },
                {
                  action: 'dismiss',
                  title: 'Dismiss',
                  icon: '/favicon.ico'
                }
              ],
              data: {
                url: '/dashboard',
                timestamp: Date.now(),
                type: 'new_referral'
              }
            })
          );
        } catch (error) {
          console.error('Error sending notification to user:', sub.user_id, error);
          // Remove invalid subscriptions
          if (error instanceof Error && error.message.includes('410')) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('user_id', sub.user_id);
          }
        }
      });

      await Promise.allSettled(notificationPromises);

      return NextResponse.json({ 
        success: true, 
        message: `Notifications sent to ${subscriptions.length} users` 
      });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });

  } catch (error) {
    console.error('Notification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get VAPID public key for client
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.VAPID_PUBLIC_KEY!
  });
}

