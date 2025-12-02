import type { RankingItem } from '../types';

export async function fetchVieONRanking(url: string): Promise<RankingItem[]> {
  // TODO: Implement actual VieON API call
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return data.items.map((item: any, index: number) => ({
      id: `${item.id}-${Date.now()}`,
      rankingId: 'vieon-atsh',
      position: index + 1,
      itemId: item.id,
      itemName: item.name,
      itemImage: item.avatar,
      score: item.votes,
      metadata: {
        votes: item.votes,
        percentage: item.percentage
      },
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching VieON ranking:', error);
    
    // Fallback mock data
    return [
      {
        id: '1',
        rankingId: 'vieon-atsh',
        position: 1,
        itemId: 'atsh-001',
        itemName: 'Anh Trai A',
        itemImage: 'https://example.com/avatar1.jpg',
        score: 15000,
        metadata: { votes: 15000 },
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        rankingId: 'vieon-atsh',
        position: 2,
        itemId: 'atsh-002',
        itemName: 'Anh Trai B',
        itemImage: 'https://example.com/avatar2.jpg',
        score: 12000,
        metadata: { votes: 12000 },
        timestamp: new Date().toISOString()
      }
    ];
  }
}
