'use client';

import { useState } from 'react';
import { Button } from '@/app/ui/button';
import { useUser } from '@clerk/nextjs';

export default function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useUser();

  // Check if user is admin
  const isAdmin = user?.organizationMemberships?.some(
    (membership) => membership.role === 'org:admin'
  );

  if (!isAdmin) {
    return null; // Don't show to non-admin users
  }

  const sendTestNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message || 'Test notification from admin panel',
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Test notification sent successfully! Check your browser notifications.');
      } else {
        alert(`Failed to send notification: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        🧪 Notification Tester (Admin Only)
      </h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="test-message" className="block text-sm font-medium text-gray-700 mb-1">
            Test Message (optional)
          </label>
          <input
            id="test-message"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter custom test message..."
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <Button
          onClick={sendTestNotification}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isLoading ? 'Sending...' : 'Send Test Notification'}
        </Button>
        <p className="text-xs text-gray-500">
          This will send a test notification to all admin users who have enabled push notifications.
        </p>
      </div>
    </div>
  );
}
