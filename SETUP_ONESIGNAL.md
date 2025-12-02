# 🔔 Setup OneSignal cho RankAlert

## Bước 1: Tạo OneSignal App

1. Truy cập https://onesignal.com và đăng ký/đăng nhập
2. Click **New App/Website**
3. Chọn **Web Push**
4. Điền thông tin:
   - App Name: `RankAlert`
   - Website URL: `https://your-domain.vercel.app` (hoặc localhost cho dev)

## Bước 2: Cấu hình Web Push

### Typical Site Setup (Recommended)

1. Chọn **Typical Site**
2. Site URL: `https://your-domain.vercel.app`
3. Auto Resubscribe: **ON**
4. Default Notification Icon: Upload logo của bạn

### Permission Prompt

1. Chọn **Slide Prompt** (đẹp hơn browser default)
2. Customize text:
   - Title: "Nhận thông báo từ RankAlert"
   - Message: "Được thông báo ngay khi thứ hạng thay đổi"
   - Accept: "Cho phép"
   - Cancel: "Không"

## Bước 3: Lấy App ID

1. Sau khi setup xong, vào **Settings** → **Keys & IDs**
2. Copy **App ID**
3. Paste vào file `.env.local`:

```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=your-app-id-here
```

## Bước 4: Setup cho Production

### Vercel Deployment

1. Push code lên GitHub
2. Connect với Vercel
3. Thêm Environment Variable:
   - Key: `NEXT_PUBLIC_ONESIGNAL_APP_ID`
   - Value: `your-app-id-here`
4. Deploy

### OneSignal Settings

1. Vào **Settings** → **All Browsers**
2. Update **Site URL** thành production URL
3. Add **Allowed Origins**: `https://your-domain.vercel.app`

## Bước 5: Test Notifications

### Local Testing

```bash
npm run dev
```

1. Mở http://localhost:3000
2. Click vào một ranking
3. Click "Bật thông báo"
4. Allow notifications
5. Check console log để xem Player ID

### Send Test Notification

1. Vào OneSignal Dashboard
2. Click **Messages** → **New Push**
3. Audience: **Test Users** hoặc **All Users**
4. Message:
   - Title: "Test từ RankAlert"
   - Message: "Đây là test notification 🎉"
5. Click **Send Message**

## Bước 6: Tag-based Targeting

RankAlert sử dụng tags để target users theo ranking:

```javascript
// Subscribe to ranking
OneSignal.sendTag("ranking_vieon-atsh", "true");

// Unsubscribe
OneSignal.deleteTag("ranking_vieon-atsh");
```

### Send Notification to Specific Ranking

1. OneSignal Dashboard → **Messages** → **New Push**
2. Audience → **Add Filter**
3. Filter: `User Tag` → `ranking_vieon-atsh` → `is` → `true`
4. Compose message và send

## Bước 7: API Integration (Backend)

Workers sẽ gửi notification qua OneSignal REST API:

```typescript
// workers/src/notifications.ts
const response = await fetch('https://onesignal.com/api/v1/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Basic YOUR_REST_API_KEY'
  },
  body: JSON.stringify({
    app_id: 'YOUR_APP_ID',
    filters: [
      { field: 'tag', key: 'ranking_vieon-atsh', relation: '=', value: 'true' }
    ],
    contents: { en: 'Message here', vi: 'Tin nhắn ở đây' },
    headings: { en: 'RankAlert', vi: 'RankAlert' }
  })
});
```

### Get REST API Key

1. OneSignal Dashboard → **Settings** → **Keys & IDs**
2. Copy **REST API Key**
3. Add vào `workers/wrangler.toml`:

```toml
[vars]
ONESIGNAL_APP_ID = "your-app-id"
ONESIGNAL_API_KEY = "your-rest-api-key"
```

## Troubleshooting

### Notification không hiện

- Check browser console có lỗi không
- Verify App ID đúng
- Check notification permission: `Notification.permission`
- Test trên HTTPS (localhost OK, HTTP không OK)

### Player ID null

- OneSignal chưa init xong
- User chưa allow notification
- Check console log

### Không nhận được notification

- Check user có subscribe không: `OneSignal.isPushNotificationsEnabled()`
- Verify tags: `OneSignal.getTags()`
- Check OneSignal Dashboard → **Audience** → **All Users**

## Best Practices

1. **Không spam**: Chỉ gửi khi có thay đổi quan trọng
2. **Personalize**: Dùng tags để target đúng users
3. **Timing**: Gửi vào giờ hợp lý (không gửi lúc nửa đêm)
4. **Clear message**: Nội dung ngắn gọn, rõ ràng
5. **Action URL**: Link đến trang ranking khi click notification

## Resources

- [OneSignal Web Push Docs](https://documentation.onesignal.com/docs/web-push-quickstart)
- [OneSignal REST API](https://documentation.onesignal.com/reference/create-notification)
- [OneSignal React SDK](https://github.com/OneSignal/react-onesignal)
