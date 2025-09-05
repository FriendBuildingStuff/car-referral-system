"use client"
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function NotificationDebug() {
  const { user, isLoaded } = useUser();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [vapidKey, setVapidKey] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      addDebugInfo('Push notifications are supported');
      
      // Get VAPID key
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          setVapidKey(data.publicKey);
          addDebugInfo(`VAPID key loaded: ${data.publicKey.substring(0, 20)}...`);
        })
        .catch(err => addDebugInfo(`Error loading VAPID key: ${err.message}`));
    } else {
      addDebugInfo('Push notifications not supported');
    }
  }, []);

  const enableNotifications = async () => {
    if (!isSupported || !user) return;

    try {
      addDebugInfo('Requesting notification permission...');
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);
      addDebugInfo(`Permission result: ${permission}`);

      if (permission === 'granted') {
        addDebugInfo('Registering service worker...');
        
        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        addDebugInfo('Service worker registered');

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        addDebugInfo('Service worker ready');

        // Subscribe to push notifications
        addDebugInfo('Creating push subscription...');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });
        
        setSubscription(subscription);
        addDebugInfo('Push subscription created');

        // Send subscription to server
        addDebugInfo('Sending subscription to server...');
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'subscribe',
            subscription,
            userId: user.id
          }),
        });

        if (response.ok) {
          addDebugInfo('Subscription saved to server');
        } else {
          addDebugInfo(`Error saving subscription: ${response.status}`);
        }
      }
    } catch (error) {
      addDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testNotification = async () => {
    try {
      addDebugInfo('Sending test notification...');
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_referral',
          message: 'Test notification from debug panel'
        }),
      });

      const result = await response.json();
      addDebugInfo(`Test notification result: ${JSON.stringify(result)}`);
    } catch (error) {
      addDebugInfo(`Test notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const showBrowserNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Browser Notification', {
        body: 'This is a test notification from the browser',
        icon: '/favicon.ico'
      });
      addDebugInfo('Browser notification shown');
    } else {
      addDebugInfo('No permission for browser notifications');
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Push Notification Debug Panel</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Status</h3>
          <p>Supported: {isSupported ? '✅' : '❌'}</p>
          <p>Permission: {permission}</p>
          <p>User ID: {user?.id}</p>
          <p>Subscription: {subscription ? '✅' : '❌'}</p>
        </div>
        
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold mb-2">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={enableNotifications}
              disabled={!isSupported || permission === 'granted'}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              Enable Push Notifications
            </button>
            <button
              onClick={showBrowserNotification}
              disabled={permission !== 'granted'}
              className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
              Test Browser Notification
            </button>
            <button
              onClick={testNotification}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded"
            >
              Test Push Notification
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <h3 className="font-semibold mb-2">Debug Log</h3>
        <div className="max-h-40 overflow-y-auto text-sm font-mono">
          {debugInfo.map((info, index) => (
            <div key={index} className="mb-1">{info}</div>
          ))}
        </div>
        <button
          onClick={() => setDebugInfo([])}
          className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm"
        >
          Clear Log
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
