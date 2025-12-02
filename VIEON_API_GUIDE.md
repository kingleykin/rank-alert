# 🎤 VieON Anh Trai Say Hi - API Integration Guide

## Tìm API Endpoint

### Cách 1: Inspect Network Tab (Khuyến khích)

1. Mở trang VieON Anh Trai Say Hi: https://vieon.vn/anh-trai-say-hi
2. Mở Chrome DevTools (F12)
3. Tab **Network**
4. Filter: **Fetch/XHR**
5. Refresh trang hoặc click vào tab bình chọn
6. Tìm request có response chứa data bảng xếp hạng

**Ví dụ endpoint có thể có:**
```
https://api.vieon.vn/backend/cm/v5/vote/ranking?programId=ATSH2024
https://api.vieon.vn/backend/user/v2/vote/list?showId=xxx
https://vieon.vn/api/ranking/anh-trai-say-hi
```

### Cách 2: Reverse Engineering

```javascript
// Paste vào Console của trang VieON
// Tìm các API calls
performance.getEntriesByType('resource')
  .filter(r => r.name.includes('api') || r.name.includes('vote') || r.name.includes('ranking'))
  .forEach(r => console.log(r.name));
```

### Cách 3: Check Source Code

1. View Page Source (Ctrl+U)
2. Search: `api`, `vote`, `ranking`, `endpoint`
3. Tìm các script tags hoặc data attributes

## Phân tích Response Format

Sau khi tìm được API endpoint, check response format:

```bash
# Test API
curl 'https://api.vieon.vn/backend/cm/v5/vote/ranking?programId=ATSH2024' \
  -H 'User-Agent: Mozilla/5.0' \
  | jq '.'
```

**Response format thường gặp:**

### Format 1: Direct Array
```json
{
  "data": [
    {
      "id": "contestant_001",
      "name": "Anh Trai A",
      "avatar": "https://...",
      "votes": 15000,
      "rank": 1
    }
  ]
}
```

### Format 2: Nested Object
```json
{
  "result": {
    "ranking": [
      {
        "contestantId": "001",
        "fullName": "Anh Trai A",
        "imageUrl": "https://...",
        "totalVotes": 15000,
        "position": 1
      }
    ]
  }
}
```

### Format 3: Paginated
```json
{
  "data": {
    "items": [...],
    "total": 30,
    "page": 1
  }
}
```

## Update Fetcher Code

Sau khi có API endpoint và format, update `workers/src/fetchers/vieon.ts`:

```typescript
export async function fetchVieONRanking(url: string): Promise<RankingItem[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        // Thêm headers khác nếu cần (Authorization, Cookie, etc)
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform data về format chuẩn
    // Adjust theo response format thực tế
    const items = data.data || data.result?.ranking || data.items || [];
    
    return items.map((item: any, index: number) => ({
      id: `${item.id || item.contestantId}-${Date.now()}`,
      rankingId: 'vieon-atsh',
      position: item.rank || item.position || index + 1,
      itemId: item.id || item.contestantId,
      itemName: item.name || item.fullName,
      itemImage: item.avatar || item.imageUrl,
      score: item.votes || item.totalVotes,
      metadata: {
        votes: item.votes || item.totalVotes,
        percentage: item.percentage || null
      },
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching VieON ranking:', error);
    throw error;
  }
}
```

## Update Database

### Via Wrangler CLI

```bash
cd workers

# Update URL
wrangler d1 execute rankalert --file=../database/update-vieon-url.sql

# Hoặc direct command
wrangler d1 execute rankalert --command="UPDATE rankings SET source_url = 'https://api.vieon.vn/...' WHERE id = 'vieon-atsh'"
```

### Via Dashboard

1. Cloudflare Dashboard → D1 → rankalert
2. Tab **Console**
3. Paste SQL:
```sql
UPDATE rankings 
SET source_url = 'https://api.vieon.vn/backend/cm/v5/vote/ranking?programId=ATSH2024'
WHERE id = 'vieon-atsh';
```
4. Click **Execute**

## Test Integration

### 1. Test Fetcher Locally

```bash
cd workers

# Create test file
cat > test-vieon.js << 'EOF'
async function test() {
  const url = 'https://api.vieon.vn/...'; // Your API URL
  const response = await fetch(url);
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
EOF

node test-vieon.js
```

### 2. Test Worker

```bash
# Local dev
npm run dev

# Test endpoint
curl http://localhost:8787/api/rankings/vieon-atsh
```

### 3. Test Manual Update

```bash
curl -X POST http://localhost:8787/api/update \
  -H "Content-Type: application/json" \
  -d '{"rankingId":"vieon-atsh"}'
```

## Xử lý các trường hợp đặc biệt

### Case 1: API cần Authentication

```typescript
const response = await fetch(url, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'X-API-Key': 'YOUR_API_KEY'
  }
});
```

### Case 2: API có Rate Limiting

```typescript
// Add delay between requests
await new Promise(resolve => setTimeout(resolve, 1000));
```

### Case 3: API trả về HTML (cần scrape)

```typescript
// Sử dụng HTMLRewriter hoặc regex
const html = await response.text();
const dataMatch = html.match(/var rankingData = ({.*?});/);
if (dataMatch) {
  const data = JSON.parse(dataMatch[1]);
  // Process data...
}
```

### Case 4: API có Pagination

```typescript
async function fetchAllPages(baseUrl: string) {
  let allItems = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const response = await fetch(`${baseUrl}?page=${page}`);
    const data = await response.json();
    allItems = [...allItems, ...data.items];
    hasMore = data.hasNextPage;
    page++;
  }
  
  return allItems;
}
```

## Troubleshooting

### Error: CORS

```typescript
// VieON API có thể block CORS từ Workers
// Giải pháp: Add origin header
headers: {
  'Origin': 'https://vieon.vn',
  'Referer': 'https://vieon.vn/anh-trai-say-hi'
}
```

### Error: 403 Forbidden

```typescript
// API check User-Agent
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}
```

### Error: Data format khác

```typescript
// Log raw response để debug
console.log('Raw response:', await response.text());
```

## Production Checklist

- [ ] Tìm được API endpoint chính xác
- [ ] Test API trả về data đúng
- [ ] Update `vieon.ts` fetcher
- [ ] Update database với source_url
- [ ] Test local với `wrangler dev`
- [ ] Deploy worker
- [ ] Test production endpoint
- [ ] Verify cron job chạy thành công
- [ ] Check logs không có errors

## Monitoring

```bash
# Watch logs real-time
wrangler tail

# Check last update
wrangler d1 execute rankalert --command="SELECT id, name, last_updated FROM rankings WHERE id = 'vieon-atsh'"
```

## Fallback Strategy

Nếu không tìm được API public:

1. **Web Scraping**: Parse HTML từ trang web
2. **Manual Updates**: Admin update thủ công qua dashboard
3. **Third-party API**: Tìm API aggregator khác
4. **Contact VieON**: Yêu cầu API access chính thức

## Resources

- [VieON Website](https://vieon.vn)
- [Cloudflare Workers Fetch API](https://developers.cloudflare.com/workers/runtime-apis/fetch/)
- [HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/)
