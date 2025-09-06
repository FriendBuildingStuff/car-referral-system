// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      image: data.image, // Large image for desktop notifications
      data: data.data,
      actions: data.actions || [
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
      requireInteraction: data.requireInteraction || true,
      tag: data.tag || 'car-referral-notification',
      renotify: data.renotify || true,
      vibrate: data.vibrate || [200, 100, 200],
      silent: false, // Ensure notification makes sound
      timestamp: data.data?.timestamp || Date.now()
    }; 

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'view' || !event.action) {
    const url = event.notification.data?.url || '/dashboard';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // Check if there's already an open window/tab with the app
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(new URL(url, self.location.origin).origin) && 'focus' in client) {
            // Navigate to the specific URL and focus the window
            return client.navigate(url).then(() => client.focus());
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification - no action needed
    console.log('Notification dismissed by user');
  }
});

self.addEventListener('notificationclose', function(event) {
  // Optional: Track notification close events
  console.log('Notification closed:', event.notification.tag);
});
