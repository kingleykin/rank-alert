# 🚀 Deploy Cloudflare Workers

## Cấu trúc Workers

```
workers/
├── src/
│   ├── index.ts           # Main worker (cron + API endpoints)
│   ├── compare.ts         # So sánh rankings
│   ├── notifications.ts   # Gửi OneSignal notifications
│   ├── types.ts          # TypeScript types
│   └── fetchers/
│       └── vieon.ts      # Fetch VieON data
├── package.json
├── tsconfig.json
└── wrangler.toml         # Cloudflare config
```

## Bước 1: Setup Cloudflare Account

1. Đăng ký tại https://dash.cloudflare.com
2. Verify email
3. Vào **Workers & Pages**

## Bước 2: Install Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## Bước 3: Tạo D1 Database

```bash
cd workers

# Tạo database
wrangler d1 create rankalert

# Output sẽ có database_id, copy nó
# [[d1_databases]]
# binding = "DB"
# database_name = "rankalert"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**Update `wrangler.toml`:**

```toml
[[d1_databases]]
binding = "DB"
database_name = "rankalert"
database_id = "paste-your-database-id-here"  # <-- Paste database_id ở đây
```

## Bước 4: Run Migrations

```bash
# Chạy schema
wrangler d1 execute rankalert --file=../database/schema.sql

# Chạy seed data
wrangler d1 execute rankalert --file=../database/seed.sql

# Verify data
wrangler d1 execute rankalert --command="SELECT * FROM rankings"
```

## Bước 5: Configure Environment Variables

**Update `wrangler.toml`:**

```toml
[vars]
ONESIGNAL_APP_ID = "your-onesignal-app-id"
ONESIGNAL_API_KEY = "your-onesignal-rest-api-key"
```

**Lấy OneSignal REST API Key:**
1. OneSignal Dashboard → Settings → Keys & IDs
2. Copy **REST API Key**

## Bước 6: Install Dependencies

```bash
cd workers
npm install
```

## Bước 7: Test Locally

```bash
# Dev mode với D1 local
npm run dev

# Test API endpoint
curl http://localhost:8787/api/rankings/vieon-atsh
```

## Bước 8: Deploy to Production

```bash
# Deploy worker
npm run deploy

# Output sẽ có URL:
# Published rankalert-worker (0.xx sec)
#   https://rankalert-worker.your-subdomain.workers.dev
```

## Bước 9: Setup Cron Trigger

Cron đã được config trong `wrangler.toml`:

```toml
[triggers]
crons = ["*/10 * * * *"]  # Chạy mỗi 10 phút
```

Sau khi deploy, cron sẽ tự động chạy.

**Verify cron:**
1. Cloudflare Dashboard → Workers & Pages
2. Click vào worker của bạn
3. Tab **Triggers** → Xem Cron Triggers

## Bước 10: Update Frontend

Copy Worker URL và update `.env.local`:

```bash
NEXT_PUBLIC_WORKERS_API_URL=https://rankalert-worker.your-subdomain.workers.dev
```

## API Endpoints

Worker expose các endpoints sau:

### 1. Get Ranking Items
```bash
GET /api/rankings/{rankingId}

# Example
curl https://your-worker.workers.dev/api/rankings/vieon-atsh
```

### 2. Manual Update Trigger
```bash
POST /api/update
Content-Type: application/json

{
  "rankingId": "vieon-atsh"
}
```

### 3. Subscribe to Ranking (TODO)
```bash
POST /api/subscriptions
Content-Type: application/json

{
  "userId": "uuid",
  "rankingId": "vieon-atsh",
  "playerId": "onesignal-player-id"
}
```

## Monitoring & Logs

### View Logs
```bash
# Real-time logs
wrangler tail

# Hoặc xem trên Dashboard
# Workers & Pages → Your Worker → Logs
```

### Metrics
- Cloudflare Dashboard → Workers & Pages → Your Worker
- Tab **Metrics**: Requests, Errors, CPU time

## Troubleshooting

### Error: "Database not found"
```bash
# Verify database exists
wrangler d1 list

# Re-create if needed
wrangler d1 create rankalert
```

### Error: "Unauthorized"
```bash
# Re-login
wrangler logout
wrangler login
```

### Cron not running
- Check Cloudflare Dashboard → Triggers
- Verify cron syntax in wrangler.toml
- Check logs: `wrangler tail`

### OneSignal notifications not sending
- Verify ONESIGNAL_API_KEY is correct (REST API Key, not App ID)
- Check OneSignal Dashboard → Delivery → All Messages
- Verify users have tags: `ranking_vieon-atsh = true`

## Update Worker

Sau khi sửa code:

```bash
cd workers

# Test locally
npm run dev

# Deploy update
npm run deploy
```

## Cost

**Free Tier:**
- 100,000 requests/day
- 10ms CPU time/request
- Unlimited D1 reads (first 5M/month)
- 100,000 D1 writes/day

**Ước tính cho RankAlert:**
- Cron: 144 requests/day (mỗi 10 phút)
- API calls: ~1,000 requests/day
- **Total: ~1,200 requests/day** → Hoàn toàn FREE ✅

## Production Checklist

- [ ] D1 database created & migrated
- [ ] OneSignal API key configured
- [ ] Cron triggers enabled
- [ ] Worker deployed successfully
- [ ] Frontend updated with Worker URL
- [ ] Test manual update endpoint
- [ ] Verify cron runs (check logs after 10 mins)
- [ ] Test notification flow end-to-end

## Next Steps

1. **Implement VieON fetcher**: Update `workers/src/fetchers/vieon.ts` với real API
2. **Add more sources**: TikTok, YouTube, Spotify
3. **Add authentication**: Verify requests từ frontend
4. **Add rate limiting**: Prevent abuse
5. **Add analytics**: Track notification delivery

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
