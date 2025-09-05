import { NextRequest, NextResponse } from "next/server";

// Test endpoint for manually triggering notifications during development
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    // Call the main notifications API
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'new_referral',
        message: message || 'Test notification: New car referral submitted for testing',
      }),
    });

    const result = await notificationResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result: result
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json({ error: 'Failed to send test notification' }, { status: 500 });
  }
}
