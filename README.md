# 📊 RankAlert

Nền tảng theo dõi bảng xếp hạng theo thời gian thực - Nhận thông báo ngay khi thứ hạng thay đổi.

## 🎯 Triết lý

"Đừng mất thời gian refresh. Chúng tôi theo dõi giùm bạn — chỉ thông báo khi có thay đổi đáng giá."

## 🏗️ Kiến trúc

- **Frontend**: Next.js 15 + PWA (Vercel)
- **Backend**: Cloudflare Workers + D1
- **Notifications**: OneSignal
- **Database**: Cloudflare D1 (SQLite)

## 📁 Cấu trúc dự án

```
rankalert/
├── src/              # Next.js app (frontend)
│   ├── app/         # App router
│   ├── components/  # React components
│   ├── lib/         # Utilities (OneSignal, etc)
│   └── types/       # TypeScript types
├── workers/         # Cloudflare Workers (backend)
│   └── src/
│       ├── fetchers/
│       ├── compare.ts
│       └── notifications.ts
├── database/        # D1 schemas & migrations
└── public/          # Static assets & PWA files
```

## 🚀 Bắt đầu

### 1. Setup Supabase

1. Tạo project tại https://supabase.com
2. Copy Project URL và anon key
3. Chạy SQL schema: `database/supabase-schema.sql`
4. Setup Google OAuth (xem `SETUP_SUPABASE.md`)
5. Thêm vào `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Setup OneSignal

1. Tạo app tại https://onesignal.com
2. Chọn Web Push
3. Copy App ID
4. Tạo file `.env.local`:

```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id-here
NEXT_PUBLIC_WORKERS_API_URL=https://your-worker.workers.dev
```

### 2. Setup Database

```bash
cd workers
wrangler d1 create rankalert
# Copy database_id vào wrangler.toml

wrangler d1 execute rankalert --file=../database/schema.sql
wrangler d1 execute rankalert --file=../database/seed.sql
```

### 3. Deploy Workers

```bash
cd workers
npm install
npm run deploy
```

### 4. Deploy Frontend (Vercel)

```bash
# Tại root directory
npm install
npm run build

# Push lên GitHub và connect với Vercel
# Hoặc dùng Vercel CLI:
vercel --prod
```

**Environment Variables trên Vercel:**
- `NEXT_PUBLIC_ONESIGNAL_APP_ID`
- `NEXT_PUBLIC_WORKERS_API_URL`

## 🔧 Development

```bash
# Frontend dev
npm run dev

# Workers dev
cd workers && npm run dev
```

## 📱 Cài đặt App trên Mobile

### 📲 iPhone / iPad (iOS / iPadOS)

1. **Mở Safari** và truy cập website RankAlert
2. Nhấn nút **Share** (biểu tượng chia sẻ ở thanh công cụ)
3. Cuộn xuống và chọn **"Add to Home Screen"** (Thêm vào màn hình chính)
4. Đặt tên cho app (mặc định: "RankAlert")
5. Nhấn **"Add"** (Thêm)
6. Icon app sẽ xuất hiện trên màn hình chính

**Lưu ý:** 
- Phải dùng Safari, không hoạt động trên Chrome iOS
- Icon sẽ hiển thị với kích thước 180x180px
- App sẽ mở ở chế độ toàn màn hình (standalone)

### 🤖 Android

1. **Mở Chrome** và truy cập website RankAlert
2. Nhấn vào menu **⋮** (3 chấm dọc ở góc trên bên phải)
3. Chọn **"Add to Home screen"** hoặc **"Install app"**
4. Xác nhận tên app
5. Nhấn **"Add"** hoặc **"Install"**
6. Icon app sẽ xuất hiện trên màn hình chính

**Hoặc:**
- Một số trình duyệt sẽ tự động hiển thị banner "Add to Home screen" khi bạn truy cập
- Nhấn vào banner để cài đặt nhanh

**Lưu ý:**
- Icon sẽ tự động điều chỉnh theo launcher của bạn (tròn, vuông, squircle)
- Hỗ trợ adaptive icons với safe zone 20%

## ✨ PWA Features

- ✅ Installable như native app
- ✅ Offline support
- ✅ Push notifications
- ✅ Add to home screen
- ✅ Fast loading với service worker cache
- ✅ Icon tối ưu cho iOS & Android

## 🔔 OneSignal Integration

**Tính năng:**
- Subscribe/Unsubscribe từng bảng xếp hạng
- Tag-based targeting (ranking_vieon-atsh, etc)
- Custom notification messages
- Player ID tracking

**Flow:**
1. User click "Bật thông báo"
2. Request notification permission
3. Subscribe to OneSignal
4. Tag user với ranking ID
5. Save player ID + ranking ID vào D1
6. Workers gửi notification khi có thay đổi

## 📝 MVP Phase 1

- ✅ 1 nguồn: VieON → Anh Trai Say Hi
- ✅ Fetch + lưu database
- ✅ So sánh thay đổi
- ✅ Thông báo push với OneSignal
- ✅ PWA web app
- ✅ Install prompt
- ✅ Subscribe/Unsubscribe UI

## 🌱 Roadmap

- [ ] Backend API integration (Workers ↔ Frontend)
- [ ] User authentication (optional)
- [ ] TikTok trending
- [ ] Spotify Top VN
- [ ] YouTube trending Music
- [ ] Lịch sử biến động chi tiết
- [ ] Snapshot cuối ngày/tuần
- [ ] Analytics dashboard

## 🧪 Testing Notifications

**Local testing:**
1. Chạy `npm run dev`
2. Mở http://localhost:3000
3. Click vào ranking
4. Click "Bật thông báo"
5. Allow notifications
6. Check console để xem Player ID

**Production testing:**
1. Deploy lên Vercel
2. Mở trên mobile hoặc desktop
3. Test subscribe flow
4. Gửi test notification từ OneSignal dashboard

## 📚 Docs

- [Next.js](https://nextjs.org/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [OneSignal Web Push](https://documentation.onesignal.com/docs/web-push-quickstart)
- [PWA](https://web.dev/progressive-web-apps/)
