import OneSignal from "react-onesignal";

// Use window object to persist initialization state across Next.js page navigations
declare global {
  interface Window {
    _oneSignalInitialized?: boolean;
  }
}

export async function initOneSignal() {
  // Prevent double initialization
  if (typeof window !== 'undefined' && window._oneSignalInitialized) {
    console.log("OneSignal already initialized");
    return;
  }

  try {
    // Skip OneSignal on localhost (only works on production domain)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log("OneSignal skipped on localhost");
      window._oneSignalInitialized = true; // Mark as initialized even on localhost
      return;
    }

    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      allowLocalhostAsSecureOrigin: true,
      welcomeNotification: {
        title: "RankAlert",
        message: "Cảm ơn bạn đã bật thông báo! 🎉",
      },
    });

    if (typeof window !== 'undefined') {
      window._oneSignalInitialized = true;
    }

    // Set external user ID nếu có
    const userId = localStorage.getItem("userId");
    if (userId) {
      await OneSignal.login(userId);
    }

    console.log("OneSignal initialized");
  } catch (error) {
    console.error("OneSignal initialization error:", error);
    // Don't mark as initialized if there was an error
  }
}

export async function subscribeToNotifications() {
  try {
    await OneSignal.Slidedown.promptPush();
    return true;
  } catch (error) {
    console.error("Subscribe error:", error);
    return false;
  }
}

export async function isSubscribed(): Promise<boolean> {
  try {
    const permission = await OneSignal.Notifications.permission;
    return permission;
  } catch (error) {
    return false;
  }
}

export async function getPlayerId(): Promise<string | null> {
  try {
    const userId = await OneSignal.User.PushSubscription.id;
    return userId || null;
  } catch (error) {
    return null;
  }
}

export async function subscribeToRanking(rankingId: string) {
  try {
    await OneSignal.User.addTag("ranking_" + rankingId, "true");
    console.log(`Subscribed to ranking: ${rankingId}`);
  } catch (error) {
    console.error("Subscribe to ranking error:", error);
  }
}

export async function unsubscribeFromRanking(rankingId: string) {
  try {
    await OneSignal.User.removeTag("ranking_" + rankingId);
    console.log(`Unsubscribed from ranking: ${rankingId}`);
  } catch (error) {
    console.error("Unsubscribe from ranking error:", error);
  }
}
