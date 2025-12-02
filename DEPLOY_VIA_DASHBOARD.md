# 🌐 Deploy Workers qua Cloudflare Dashboard (UI)

> ⚠️ **Lưu ý:** Cách này đơn giản hơn nhưng có hạn chế. Khuyến khích dùng Wrangler CLI.

## Bước 1: Tạo D1 Database

1. Vào Cloudflare Dashboard → **Storage & Databases** → **D1**
2. Click **Create database**
3. Name: `rankalert`
4. Click **Create**

### Run SQL Schema

1. Click vào database `rankalert`
2. Tab **Console**
3. Copy & paste SQL từ `database/schema.sql`
4. Click **Execute**
5. Copy & paste SQL từ `database/seed.sql`
6. Click **Execute**

## Bước 2: Tạo Worker

1. Vào **Workers & Pages**
2. Click **Create application**
3. Chọn **Create Worker**
4. Name: `rankalert-worker`
5. Click **Deploy**

## Bước 3: Paste Code

1. Click **Edit code**
2. **XÓA HẾT** code Hello World mặc định
3. Copy toàn bộ code từ file: `workers/bundle-for-dashboard.js`
4. Paste vào editor
5. Click **Save and Deploy**

## Bước 4: Bind D1 Database

1. Quay lại Worker settings
2. Tab **Settings** → **Variables**
3. Scroll xuống **D1 Database Bindings**
4. Click **Add binding**
   - Variable name: `DB`
   - D1 database: Chọn `rankalert`
5. Click **Save**

## Bước 5: Add Environment Variables

Vẫn ở tab **Settings** → **Variables**:

1. Click **Add variable**
   - Variable name: `ONESIGNAL_APP_ID`
   - Value: `your-onesignal-app-id`
   - Click **Save**

2. Click **Add variable**
   - Variable name: `ONESIGNAL_API_KEY`
   - Value: `your-onesignal-rest-api-key`
   - Click **Save**

## Bước 6: Setup Cron Trigger

1. Tab **Triggers**
2. Scroll xuống **Cron Triggers**
3. Click **Add Cron Trigger**
4. Cron expression: `*/10 * * * *` (mỗi 10 phút)
5. Click **Add Trigger**

## Bước 7: Test Worker

### Test API Endpoint

```bash
# Thay your-subdomain bằng subdomain của bạn
curl https://rankalert-worker.your-subdomain.workers.dev/api/rankings/vieon-atsh
```

### Test Manual Update

```bash
curl -X POST https://rankalert-worker.your-subdomain.workers.dev/api/update \
  -H "Content-Type: application/json" \
  -d '{"rankingId":"vieon-atsh"}'
```

## Bước 8: View Logs

1. Tab **Logs** → **Begin log stream**
2. Trigger một request để xem logs
3. Hoặc đợi cron chạy (mỗi 10 phút)

## Bước 9: Update Frontend

Copy Worker URL:

```bash
# .env.local
NEXT_PUBLIC_WORKERS_API_URL=https://rankalert-worker.your-subdomain.workers.dev
```

## ⚠️ Hạn chế của cách này

1. **Không có TypeScript** - Khó debug
2. **Không có modules** - Tất cả code trong 1 file
3. **Khó maintain** - Mỗi lần update phải paste lại toàn bộ
4. **Không có version control** - Không track changes
5. **Không test local** - Phải deploy mới test được

## ✅ Khuyến khích: Dùng Wrangler CLI

Xem file `DEPLOY_WORKERS.md` để deploy đúng cách với:
- ✅ TypeScript
- ✅ Multiple files/modules
- ✅ Local development
- ✅ Git version control
- ✅ Easy updates

## So sánh

| Feature         | Dashboard UI | Wrangler CLI |
| --------------- | ------------ | ------------ |
| Setup           | Dễ           | Cần install  |
| TypeScript      | ❌            | ✅            |
| Modules         | ❌            | ✅            |
| Local dev       | ❌            | ✅            |
| Version control | ❌            | ✅            |
| Updates         | Khó          | Dễ           |
| Professional    | ❌            | ✅            |

## Kết luận

**Dùng Dashboard UI nếu:**
- Bạn muốn test nhanh
- Không quen command line
- Chỉ cần MVP đơn giản

**Dùng Wrangler CLI nếu:**
- Dự án production
- Cần maintain lâu dài
- Team nhiều người
- Muốn professional workflow

👉 **Khuyến khích: Dùng Wrangler CLI** (xem `DEPLOY_WORKERS.md`)
