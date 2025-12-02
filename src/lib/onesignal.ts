import OneSignal from "react-onesignal";

export async function initOneSignal() {
  try {
    await OneSignal.init({
      appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false, // Tắt button mặc định, dùng custom button
      },
      welcomeNotification: {
        title: "RankAlert",
        message: "Cảm ơn bạn đã bật thông báo! 🎉",
      },
    });

    // Set external user ID nếu có
    const userId = localStorage.getItem("userId");
    if (userId) {
      await OneSignal.setExternalUserId(userId);
    }

    console.log("OneSignal initialized");
  } catch (error) {
    console.error("OneSignal initialization error:", error);
  }
}

export async function subscribeToNotifications() {
  try {
    await OneSignal.showSlidedownPrompt();
    return true;
  } catch (error) {
    console.error("Subscribe error:", error);
    return false;
  }
}

export async function isSubscribed(): Promise<boolean> {
  try {
    return await OneSignal.isPushNotificationsEnabled();
  } catch (error) {
    return false;
  }
}

export async function getPlayerId(): Promise<string | null> {
  try {
    const userId = await OneSignal.getUserId();
    return userId;
  } catch (error) {
    return null;
  }
}

export async function subscribeToRanking(rankingId: string) {
  try {
    await OneSignal.sendTag("ranking_" + rankingId, "true");
    console.log(`Subscribed to ranking: ${rankingId}`);
  } catch (error) {
    console.error("Subscribe to ranking error:", error);
  }
}

export async function unsubscribeFromRanking(rankingId: string) {
  try {
    await OneSignal.deleteTag("ranking_" + rankingId);
    console.log(`Unsubscribed from ranking: ${rankingId}`);
  } catch (error) {
    console.error("Unsubscribe from ranking error:", error);
  }
}
