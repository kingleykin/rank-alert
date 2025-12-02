import type { RankingChange } from './types';

export function compareRankings(oldItems: any[], newItems: any[]): RankingChange[] {
  const changes: RankingChange[] = [];
  
  const oldMap = new Map(oldItems.map(item => [item.item_id, item]));
  const newMap = new Map(newItems.map(item => [item.itemId, item]));
  
  for (const newItem of newItems) {
    const oldItem = oldMap.get(newItem.itemId);
    
    if (!oldItem) {
      changes.push({
        itemId: newItem.itemId,
        itemName: newItem.itemName,
        newPosition: newItem.position,
        change: 'new',
        changeAmount: 0
      });
    } else if (oldItem.position !== newItem.position) {
      const changeAmount = oldItem.position - newItem.position;
      changes.push({
        itemId: newItem.itemId,
        itemName: newItem.itemName,
        oldPosition: oldItem.position,
        newPosition: newItem.position,
        change: changeAmount > 0 ? 'up' : 'down',
        changeAmount: Math.abs(changeAmount)
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
        change: 'out',
        changeAmount: 0
      });
    }
  }
  
  return changes;
}
