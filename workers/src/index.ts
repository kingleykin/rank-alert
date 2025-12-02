import { fetchVieONRanking } from './fetchers/vieon';
import { compareRankings } from './compare';
import { sendNotifications } from './notifications';
import type { RankingItem } from './types';

export interface Env {
  DB: D1Database;
  ONESIGNAL_APP_ID: string;
  ONESIGNAL_API_KEY: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('Cron triggered at', new Date(event.scheduledTime));
    
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

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (url.pathname === '/api/update' && request.method === 'POST') {
      const { rankingId } = await request.json();
      const ranking = await env.DB.prepare('SELECT * FROM rankings WHERE id = ?').bind(rankingId).first();
      
      if (!ranking) {
        return new Response('Ranking not found', { status: 404, headers: corsHeaders });
      }
      
      await processRanking(ranking, env);
      return new Response('OK', { headers: corsHeaders });
    }

    if (url.pathname.startsWith('/api/rankings/')) {
      try {
        const rankingId = url.pathname.split('/').pop();
        const items = await env.DB.prepare(
          'SELECT * FROM ranking_items WHERE ranking_id = ? ORDER BY score DESC, position ASC'
        ).bind(rankingId).all();
        
        return new Response(JSON.stringify(items.results), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: 'Database error', message: String(error) }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('RankAlert Worker', { headers: corsHeaders });
  }
};

async function processRanking(ranking: any, env: Env) {
  console.log(`Processing ranking: ${ranking.id}`);
  
  let newItems: RankingItem[];
  if (ranking.type === 'vieon') {
    newItems = await fetchVieONRanking(ranking.source_url);
  } else {
    throw new Error(`Unsupported ranking type: ${ranking.type}`);
  }

  const oldItems = await env.DB.prepare(
    'SELECT * FROM ranking_items WHERE ranking_id = ? ORDER BY position ASC'
  ).bind(ranking.id).all();

  const changes = compareRankings(oldItems.results, newItems);

  const timestamp = new Date().toISOString();
  
  await env.DB.prepare('DELETE FROM ranking_items WHERE ranking_id = ?').bind(ranking.id).run();
  
  for (const item of newItems) {
    await env.DB.prepare(
      'INSERT INTO ranking_items (id, ranking_id, position, item_id, item_name, item_image, score, metadata, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      `${ranking.id}-${item.itemId}-${Date.now()}`,
      ranking.id,
      item.position,
      item.itemId,
      item.itemName,
      item.itemImage || null,
      item.score || null,
      item.metadata ? JSON.stringify(item.metadata) : null,
      timestamp
    ).run();
  }

  for (const change of changes) {
    await env.DB.prepare(
      'INSERT INTO ranking_history (id, ranking_id, item_id, item_name, old_position, new_position, change_type, change_amount, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      `${ranking.id}-${change.itemId}-${Date.now()}`,
      ranking.id,
      change.itemId,
      change.itemName,
      change.oldPosition || null,
      change.newPosition,
      change.change,
      change.changeAmount || null,
      timestamp
    ).run();
  }

  await env.DB.prepare('UPDATE rankings SET last_updated = ? WHERE id = ?').bind(timestamp, ranking.id).run();

  if (changes.length > 0) {
    await sendNotifications(ranking, changes, env);
  }

  console.log(`Processed ${newItems.length} items, ${changes.length} changes`);
}
