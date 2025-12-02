import type { RankingItem } from '../types';

interface VieONResponse {
  code: number;
  message: string;
  result: Array<{
    id: string;
    campaign_id: string;
    programme_id: string;
    name: string;
    avatar_url: string;
    description: string;
    order: number;
    position: number;
    votes: number;
  }>;
}

export async function fetchVieONRanking(url: string): Promise<RankingItem[]> {
  try {
    console.log('Fetching VieON ranking from:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json() as VieONResponse;
    
    // Check response format
    if (data.code !== 0) {
      throw new Error(`VieON API error: ${data.message}`);
    }
    
    if (!data.result || !Array.isArray(data.result)) {
      throw new Error('Invalid response format: result is not an array');
    }
    
    console.log(`Fetched ${data.result.length} items from VieON`);
    
    // Transform to RankingItem format
    return data.result.map((item) => ({
      id: `${item.id}-${Date.now()}`,
      rankingId: 'vieon-atsh',
      position: item.position,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.avatar_url,
      score: item.votes,
      metadata: {
        votes: item.votes,
        campaign_id: item.campaign_id,
        programme_id: item.programme_id,
        description: item.description,
        order: item.order
      },
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching VieON ranking:', error);
    throw error; // Re-throw để worker có thể handle
  }
}
