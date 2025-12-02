# 🔐 Setup Supabase Auth với Google OAuth

## Bước 1: Tạo Supabase Project

1. Truy cập https://supabase.com
2. Click **New Project**
3. Điền thông tin:
   - Name: `rankalert`
   - Database Password: (tạo password mạnh)
   - Region: chọn gần nhất (Singapore cho VN)
4. Click **Create new project**

## Bước 2: Lấy API Keys

1. Vào **Settings** → **API**
2. Copy 2 keys:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...`
3. Paste vào `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Bước 3: Setup Google OAuth

### 3.1. Tạo Google OAuth Client

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. Điền thông tin:
   - Name: `RankAlert`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (dev)
     - `https://your-domain.vercel.app` (production)
   - Authorized redirect URIs:
     - `https://xxxxx.supabase.co/auth/v1/callback`
7. Click **Create**
8. Copy **Client ID** và **Client Secret**

### 3.2. Configure Supabase

1. Vào Supabase Dashboard → **Authentication** → **Providers**
2. Tìm **Google** và click để mở
3. Enable **Google enabled**
4. Paste:
   - **Client ID**: từ Google Console
   - **Client Secret**: từ Google Console
5. Click **Save**

## Bước 4: Configure OAuth Consent Screen

1. Google Cloud Console → **OAuth consent screen**
2. Chọn **External** (cho public app)
3. Điền thông tin:
   - App name: `RankAlert`
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Scopes: Thêm:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Test users: Thêm email của bạn để test
6. Click **Save and Continue**

## Bước 5: Setup Database Schema

Supabase tự động tạo bảng `auth.users`, nhưng ta cần thêm bảng custom:

```sql
-- Tạo bảng profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Function to handle new user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Chạy SQL này tại: **SQL Editor** → **New query**

## Bước 6: Test Login Flow

### Local Testing

```bash
npm run dev
```

1. Mở http://localhost:3000
2. Click "Đăng nhập với Google"
3. Chọn Google account
4. Allow permissions
5. Redirect về trang chủ
6. Check user info hiển thị

### Production Testing

1. Deploy lên Vercel
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Update Google OAuth redirect URIs với production URL
4. Test login flow

## Bước 7: Integrate với OneSignal

Sau khi user login, lưu user ID vào OneSignal:

```typescript
// src/lib/onesignal.ts
import { supabase } from "./supabase";

export async function syncUserWithOneSignal() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await OneSignal.setExternalUserId(user.id);
    console.log("Synced user with OneSignal:", user.id);
  }
}
```

## Bước 8: Protected Routes (Optional)

Nếu muốn protect một số routes:

```typescript
// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/");
  }

  return <div>Protected content</div>;
}
```

## Troubleshooting

### "Invalid redirect URI"

- Check Google Console redirect URIs khớp với Supabase callback URL
- Format: `https://xxxxx.supabase.co/auth/v1/callback`

### "Access blocked: This app's request is invalid"

- Complete OAuth consent screen
- Add test users nếu app chưa publish
- Verify scopes đã add

### User không được tạo trong profiles table

- Check trigger `on_auth_user_created` đã chạy
- Check RLS policies
- Xem logs tại **Database** → **Logs**

### Session không persist

- Check middleware đang chạy
- Verify cookies được set
- Check CORS settings

## Security Best Practices

1. **Never expose service_role key** - Chỉ dùng anon key ở frontend
2. **Enable RLS** - Bật Row Level Security cho tất cả tables
3. **Validate user input** - Luôn validate data từ client
4. **Use HTTPS** - Production phải dùng HTTPS
5. **Rotate secrets** - Định kỳ đổi API keys

## Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
