"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  subscribeToNotifications,
  isSubscribed,
  subscribeToRanking,
  unsubscribeFromRanking,
  getPlayerId,
} from "@/lib/onesignal";
import { createClient } from "@/lib/supabase";

interface RankingItem {
  position: number;
  item_name: string;
  item_image?: string;
  score?: number;
  change?: "up" | "down" | "new" | "same";
  changeAmount?: number;
}

export default function RankingDetail() {
  const params = useParams();
  const [items, setItems] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Check notification status (OneSignal is already initialized globally)
    const checkNotificationStatus = async () => {
      const enabled = await isSubscribed();
      setNotificationEnabled(enabled);
      const savedSub = localStorage.getItem(`sub_${params.id}`);
      setSubscribed(savedSub === "true");
    };
    
    checkNotificationStatus();

    const fetchRankingData = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_WORKERS_API_URL;
        const response = await fetch(`${apiUrl}/api/rankings/${params.id}`);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const transformedItems: RankingItem[] = data.map(
          (item: any, index: number) => ({
            position: index + 1,
            item_name: item.item_name,
            item_image: item.item_image,
            score: item.score,
            change: "same" as const,
            changeAmount: 0,
          })
        );

        setItems(transformedItems);
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankingData();
  }, [params.id]);

// ... (skip to render part)

            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-white/80">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span>Realtime</span>
                </div>
                <span>•</span>
                <span>{items.length} Anh Trai</span>
              </div>
              
              {lastUpdated && (
                <div className="hidden md:block text-white/60">
                  • Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
                </div>
              )}
              
              {lastUpdated && (
                <div className="md:hidden text-white/60 text-xs">
                  (Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")})
                </div>
              )}
            </div>

  const handleSubscribe = async () => {
    try {
      const rankingId = params.id as string;

      // Detect iOS
      const userAgent = navigator.userAgent;
      const platform = (navigator as any).platform || '';
      const isIPhone = /iPhone|iPod/.test(userAgent);
      const isIPad = /iPad/.test(userAgent) || 
                     (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isIOS = isIPhone || isIPad;
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches ||
                           (window.navigator as any).standalone === true;

      // iOS Safari không hỗ trợ push notifications - chỉ hoạt động khi đã cài app
      if (isIOS && !isStandalone) {
        alert(
          "⚠️ Thông báo trên iOS chỉ hoạt động sau khi bạn thêm app vào màn hình chính.\n\n" +
          "📱 Hướng dẫn:\n" +
          "1. Nhấn nút Share (⬆️) ở thanh công cụ Safari\n" +
          "2. Chọn 'Add to Home Screen'\n" +
          "3. Mở app từ màn hình chính\n" +
          "4. Quay lại đây và bật thông báo"
        );
        return;
      }

      // On localhost, OneSignal is disabled, so just toggle state
      if (
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        if (subscribed) {
          localStorage.removeItem(`sub_${rankingId}`);
          setSubscribed(false);
          alert(
            "✅ Đã tắt thông báo (Demo mode - chỉ hoạt động trên production)"
          );
        } else {
          localStorage.setItem(`sub_${rankingId}`, "true");
          setSubscribed(true);
          alert(
            "✅ Đã bật thông báo (Demo mode - chỉ hoạt động trên production)"
          );
        }
        return;
      }

      // Production: Use OneSignal
      if (!notificationEnabled) {
        const success = await subscribeToNotifications();
        if (!success) {
        if (!success) {
          // Check current permission state for debugging
          const currentPermission = Notification.permission;
          alert(
            `❌ Không thể bật thông báo.\n` +
            `Trạng thái hiện tại: ${currentPermission}\n\n` +
            "Nếu trạng thái là 'denied' (từ chối), bạn cần vào Cài đặt để bật lại.\n" +
            "Nếu trạng thái là 'default' mà không hiện prompt, có thể do lỗi kết nối hoặc cấu hình."
          );
          return;
        }
        }
        setNotificationEnabled(true);
      }

      if (subscribed) {
        await unsubscribeFromRanking(rankingId);
        localStorage.removeItem(`sub_${rankingId}`);
        setSubscribed(false);
        alert("✅ Đã tắt thông báo");
      } else {
        await subscribeToRanking(rankingId);
        localStorage.setItem(`sub_${rankingId}`, "true");
        setSubscribed(true);
        alert("✅ Đã bật thông báo");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      alert("❌ Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const getRankBadge = (position: number) => {
    if (position === 1)
      return "bg-gradient-to-br from-yellow-400 to-yellow-600";
    if (position === 2) return "bg-gradient-to-br from-gray-300 to-gray-500";
    if (position === 3)
      return "bg-gradient-to-br from-orange-400 to-orange-600";
    return "bg-gradient-to-br from-purple-500 to-purple-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white mx-auto"></div>
          <p className="mt-4 text-white font-medium">
            Đang tải bảng xếp hạng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900">
      {/* Header */}
      <header className="relative overflow-hidden pb-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Quay lại</span>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              🎤 ANH TRAI SAY HI
            </h1>
            <p className="text-white/90 text-lg mb-6">
              Bảng xếp hạng bình chọn VieON
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-sm text-white/80">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span>Realtime</span>
                </div>
                <span>•</span>
                <span>{items.length} Anh Trai</span>
              </div>
              
              {lastUpdated && (
                <div className="hidden md:block text-white/60">
                  • Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")}
                </div>
              )}
              
              {lastUpdated && (
                <div className="md:hidden text-white/60 text-xs">
                  (Cập nhật: {lastUpdated.toLocaleTimeString("vi-VN")})
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Subscribe Button */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 mb-8 relative z-10">
        <button
          onClick={handleSubscribe}
          className={`w-full max-w-2xl mx-auto block py-4 px-6 rounded-2xl font-bold text-base shadow-2xl transition-all duration-300 ${
            subscribed
              ? "bg-white text-purple-600 hover:bg-gray-50 border-2 border-purple-600"
              : "bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-pink-500/50 hover:scale-[1.02]"
          }`}
        >
          {subscribed ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Đã bật thông báo
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              Bật thông báo khi có thay đổi
            </span>
          )}
        </button>
      </div>

      {/* Rankings Grid - VieON Style */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {items.map((item, index) => (
            <div
              key={item.position}
              className="group relative"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
              }}
            >
              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
                {/* Rank Badge */}
                {/* <div className="absolute top-3 left-3 z-10">
                  <div
                    className={`${getRankBadge(
                      item.position
                    )} w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-sm`}
                  >
                    {item.position}
                  </div>
                </div> */}

                {/* Avatar */}
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-400/20 to-pink-400/20">
                  {item.item_image ? (
                    <img
                      src={item.item_image}
                      alt={item.item_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      👤
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white text-center mb-2 line-clamp-2 min-h-[3rem]">
                    {item.item_name}
                  </h3>

                  {/* Votes */}
                  <div className="flex items-center justify-center gap-2 text-yellow-400">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-bold text-sm">
                      {item.score?.toLocaleString("vi-VN")}
                    </span>
                  </div>

                  {/* Rank Display */}
                  <div className="mt-3 text-center">
                    <div className="text-white/70 text-xs mb-1">Hạng</div>
                    <div className="text-2xl font-bold text-white">
                      #{item.position}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/20 group-hover:to-purple-500/20 -z-10 blur-xl transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:border-white/40 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {items.length}
            </div>
            <div className="text-white/70 text-sm">Anh trai</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:border-white/40 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {items
                .reduce((sum, i) => sum + (i.score || 0), 0)
                .toLocaleString("vi-VN")}
            </div>
            <div className="text-white/70 text-sm">Tổng votes</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:border-white/40 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1 truncate">
              {items[0]?.item_name || "-"}
            </div>
            <div className="text-white/70 text-sm">Top 1</div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20 hover:border-white/40 transition-all">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-white mb-1">Live</div>
            <div className="text-white/70 text-sm">Realtime</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
