import type { RankingChange } from './types';
import type { Env } from './index';

export async function sendNotifications(ranking: any, changes: RankingChange[], env: Env) {
  const subscriptions = await env.DB.prepare(
    'SELECT DISTINCT ud.onesignal_player_id FROM subscriptions s JOIN user_devices ud ON s.user_id = ud.user_id WHERE s.ranking_id = ? AND s.notify_on_change = 1'
  ).bind(ranking.id).all();

  if (subscriptions.results.length === 0) {
    console.log('No subscribers for this ranking');
    return;
  }

  const significantChanges = changes.filter(c =>
    c.change === 'new' ||
    c.change === 'out' ||
    (c.changeAmount && c.changeAmount >= 1)
  );

  if (significantChanges.length === 0) {
    console.log('No significant changes to notify');
    return;
  }

  const message = formatNotificationMessage(ranking.name, significantChanges);
  const playerIds = subscriptions.results.map((s: any) => s.onesignal_player_id);

  await sendOneSignalNotification(
    env.ONESIGNAL_APP_ID,
    env.ONESIGNAL_API_KEY,
    playerIds,
    message
  );

  console.log(`Sent notifications to ${playerIds.length} devices`);
}

function formatNotificationMessage(rankingName: string, changes: RankingChange[]): string {
  const change = changes[0];

  if (change.change === 'new') {
    return `🆕 ${change.itemName} mới vào ${rankingName}!`;
  } else if (change.change === 'out') {
    return `📉 ${change.itemName} rơi khỏi ${rankingName}`;
  } else if (change.change === 'up') {
    return `📈 ${change.itemName} tăng ${change.changeAmount} hạng trong ${rankingName}!`;
  } else {
    return `📊 ${change.itemName} giảm ${change.changeAmount} hạng trong ${rankingName}`;
  }
}

async function sendOneSignalNotification(
  appId: string,
  apiKey: string,
  playerIds: string[],
  message: string
) {
  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: playerIds,
      contents: { en: message, vi: message },
      headings: { en: 'RankAlert', vi: 'RankAlert' }
    })
  });

  if (!response.ok) {
    throw new Error(`OneSignal API error: ${response.statusText}`);
  }

  return response.json();
}
