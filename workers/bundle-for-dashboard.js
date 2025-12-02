// ============================================
// RankAlert Worker - Bundle for Cloudflare Dashboard
// ============================================
// Copy toàn bộ file này và paste vào Cloudflare Workers Dashboard

// ============================================
// TYPES
// ============================================
// interface RankingItem {
//   id: string;
//   rankingId: string;
//   position: number;
//   itemId: string;
//   itemName: string;
//   itemImage?: string;
//   score?: number;
//   metadata?: Record<string, any>;
//   timestamp: string;
// }

// interface RankingChange {
//   itemId: string;
//   itemName: string;
//   oldPosition?: number;
//   newPosition: number;
//   change: 'up' | 'down' | 'new' | 'out' | 'same';
//   changeAmount?: number;
// }

// ============================================
// FETCHERS - VieON
// ============================================
async function fetchVieONRanking(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.items.map((item, index) => ({
      id: `${item.id}-${Date.now()}`,
      rankingId: "vieon-atsh",
      position: index + 1,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.avatar,
      score: item.votes,
      metadata: {
        votes: item.votes,
        percentage: item.percentage,
      },
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching VieON ranking:", error);

    // Fallback mock data
    return [
      {
        id: "1",
        rankingId: "vieon-atsh",
        position: 1,
        itemId: "atsh-001",
        itemName: "Anh Trai A",
        itemImage: "https://example.com/avatar1.jpg",
        score: 15000,
        metadata: { votes: 15000 },
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        rankingId: "vieon-atsh",
        position: 2,
        itemId: "atsh-002",
        itemName: "Anh Trai B",
        itemImage: "https://example.com/avatar2.jpg",
        score: 12000,
        metadata: { votes: 12000 },
        timestamp: new Date().toISOString(),
      },
    ];
  }
}

// ============================================
// COMPARE ENGINE
// ============================================
function compareRankings(oldItems, newItems) {
  const changes = [];

  const oldMap = new Map(oldItems.map((item) => [item.item_id, item]));
  const newMap = new Map(newItems.map((item) => [item.itemId, item]));

  for (const newItem of newItems) {
    const oldItem = oldMap.get(newItem.itemId);

    if (!oldItem) {
      changes.push({
        itemId: newItem.itemId,
        itemName: newItem.itemName,
        newPosition: newItem.position,
        change: "new",
        changeAmount: 0,
      });
    } else if (oldItem.position !== newItem.position) {
      const changeAmount = oldItem.position - newItem.position;
      changes.push({
        itemId: newItem.itemId,
        itemName: newItem.itemName,
        oldPosition: oldItem.position,
        newPosition: newItem.position,
        change: changeAmount > 0 ? "up" : "down",
        changeAmount: Math.abs(changeAmount),
      });
    }
  }

  for (const oldItem of oldItems) {
    if (!newMap.has(oldItem.item_id)) {
      changes.push({
        itemId: oldItem.item_id,
        itemName: oldItem.item_name,
        oldPosition: oldItem.position,
        newPosition: -1,
        change: "out",
        changeAmount: 0,
      });
    }
  }

  return changes;
}

// ============================================
// NOTIFICATIONS
// ============================================
function formatNotificationMessage(rankingName, changes) {
  const change = changes[0];

  if (change.change === "new") {
    return `🆕 ${change.itemName} mới vào ${rankingName}!`;
  } else if (change.change === "out") {
    return `📉 ${change.itemName} rơi khỏi ${rankingName}`;
  } else if (change.change === "up") {
    return `📈 ${change.itemName} tăng ${change.changeAmount} hạng trong ${rankingName}!`;
  } else {
    return `📊 ${change.itemName} giảm ${change.changeAmount} hạng trong ${rankingName}`;
  }
}

async function sendOneSignalNotification(appId, apiKey, playerIds, message) {
  const response = await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      include_player_ids: playerIds,
      contents: { en: message, vi: message },
      headings: { en: "RankAlert", vi: "RankAlert" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OneSignal API error: ${response.statusText}`);
  }

  return response.json();
}

async function sendNotifications(ranking, changes, env) {
  const subscriptions = await env.DB.prepare(
    "SELECT DISTINCT ud.onesignal_player_id FROM subscriptions s JOIN user_devices ud ON s.user_id = ud.user_id WHERE s.ranking_id = ? AND s.notify_on_change = 1"
  )
    .bind(ranking.id)
    .all();

  if (subscriptions.results.length === 0) {
    console.log("No subscribers for this ranking");
    return;
  }

  const significantChanges = changes.filter(
    (c) =>
      c.change === "new" ||
      c.change === "out" ||
      (c.changeAmount && c.changeAmount >= 3)
  );

  if (significantChanges.length === 0) {
    console.log("No significant changes to notify");
    return;
  }

  const message = formatNotificationMessage(ranking.name, significantChanges);
  const playerIds = subscriptions.results.map((s) => s.onesignal_player_id);

  await sendOneSignalNotification(
    env.ONESIGNAL_APP_ID,
    env.ONESIGNAL_API_KEY,
    playerIds,
    message
  );

  console.log(`Sent notifications to ${playerIds.length} devices`);
}

// ============================================
// MAIN WORKER
// ============================================
async function processRanking(ranking, env) {
  console.log(`Processing ranking: ${ranking.id}`);

  let newItems;
  if (ranking.type === "vieon") {
    newItems = await fetchVieONRanking(ranking.source_url);
  } else {
    throw new Error(`Unsupported ranking type: ${ranking.type}`);
  }

  const oldItems = await env.DB.prepare(
    "SELECT * FROM ranking_items WHERE ranking_id = ? ORDER BY position ASC"
  )
    .bind(ranking.id)
    .all();

  const changes = compareRankings(oldItems.results, newItems);

  const timestamp = new Date().toISOString();

  await env.DB.prepare("DELETE FROM ranking_items WHERE ranking_id = ?")
    .bind(ranking.id)
    .run();

  for (const item of newItems) {
    await env.DB.prepare(
      "INSERT INTO ranking_items (id, ranking_id, position, item_id, item_name, item_image, score, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        `${ranking.id}-${item.itemId}-${Date.now()}`,
        ranking.id,
        item.position,
        item.itemId,
        item.itemName,
        item.itemImage || null,
        item.score || null,
        item.metadata ? JSON.stringify(item.metadata) : null,
        timestamp
      )
      .run();
  }

  for (const change of changes) {
    await env.DB.prepare(
      "INSERT INTO ranking_history (id, ranking_id, item_id, item_name, old_position, new_position, change_type, change_amount, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        `${ranking.id}-${change.itemId}-${Date.now()}`,
        ranking.id,
        change.itemId,
        change.itemName,
        change.oldPosition || null,
        change.newPosition,
        change.change,
        change.changeAmount || null,
        timestamp
      )
      .run();
  }

  await env.DB.prepare("UPDATE rankings SET last_updated = ? WHERE id = ?")
    .bind(timestamp, ranking.id)
    .run();

  if (changes.length > 0) {
    await sendNotifications(ranking, changes, env);
  }

  console.log(`Processed ${newItems.length} items, ${changes.length} changes`);
}

// ============================================
// WORKER EXPORT
// ============================================
export default {
  async scheduled(event, env, ctx) {
    console.log("Cron triggered at", new Date(event.scheduledTime));

    const rankings = await env.DB.prepare(
      'SELECT * FROM rankings WHERE last_updated IS NULL OR datetime(last_updated) < datetime("now", "-" || update_frequency || " seconds")'
    ).all();

    for (const ranking of rankings.results) {
      try {
        await processRanking(ranking, env);
      } catch (error) {
        console.error(`Error processing ranking ${ranking.id}:`, error);
      }
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Manual update trigger
    if (url.pathname === "/api/update" && request.method === "POST") {
      const { rankingId } = await request.json();
      const ranking = await env.DB.prepare(
        "SELECT * FROM rankings WHERE id = ?"
      )
        .bind(rankingId)
        .first();

      if (!ranking) {
        return new Response("Ranking not found", {
          status: 404,
          headers: corsHeaders,
        });
      }

      await processRanking(ranking, env);
      return new Response("OK", { headers: corsHeaders });
    }

    // Get ranking items
    if (url.pathname.startsWith("/api/rankings/")) {
      const rankingId = url.pathname.split("/").pop();
      const items = await env.DB.prepare(
        "SELECT * FROM ranking_items WHERE ranking_id = ? ORDER BY position ASC"
      )
        .bind(rankingId)
        .all();

      return new Response(JSON.stringify(items.results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      "RankAlert Worker - Use /api/rankings/{id} or /api/update",
      {
        headers: corsHeaders,
      }
    );
  },
};
