const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export async function subscribeUser() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('User subscribed:', subscription);
    
    // Store subscription in localStorage instead of sending to server
    localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));
    return subscription;

  } catch (err) {
    console.error('Subscription error:', err);
    throw err;
  }
}

export async function unsubscribeUser() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await subscription.unsubscribe();
    console.log('Unsubscribed from push manager.');
    
    // Remove subscription from localStorage
    localStorage.removeItem('pushSubscription');

  } catch (err) {
    console.error('Unsubscribe error:', err);
    throw err;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}
