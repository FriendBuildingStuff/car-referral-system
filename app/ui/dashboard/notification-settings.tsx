'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/app/hooks/usePushNotifications';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/app/ui/button';
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline';

export default function NotificationSettings() {
  const { user } = useUser();
  const { isSupported, isSubscribed, subscribeToPush, unsubscribeFromPush } = usePushNotifications();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.organizationMemberships?.some(
    (membership) => membership.role === 'org:admin'
  );

  if (!isAdmin) {
    return null; // Don't show to non-admin users
  }

  if (!isSupported) {
    return (
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <BellSlashIcon className="h-5 w-5 text-yellow-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Push notifications not supported
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Your browser doesn't support push notifications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex">
          <BellIcon className="h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Push Notifications
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              {isSubscribed 
                ? 'You\'ll receive notifications for new referrals on customers' 
                : 'Enable notifications to get alerted about new referrals'
              }
            </p>
          </div>
        </div>
        <div className="ml-4">
          <Button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`${
              isSubscribed 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading 
              ? 'Loading...' 
              : isSubscribed 
                ? 'Disable' 
                : 'Enable'
            }
          </Button>
        </div>
      </div>
    </div>
  );
}
