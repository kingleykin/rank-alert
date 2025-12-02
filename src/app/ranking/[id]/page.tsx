"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  initOneSignal,
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
  const supabase = createClient();

  useEffect(() => {
    // Initialize OneSignal
    initOneSignal().then(async () => {
      const enabled = await isSubscribed();
      setNotificationEnabled(enabled);

      // Check if subscribed to this ranking
      // TODO: Check from backend or localStorage
      const savedSub = localStorage.getItem(`sub_${params.id}`);
      setSubscribed(savedSub === "true");
    });

    // TODO: Fetch từ API
    setItems([
      {
        position: 1,
        item_name: "Anh Trai A",
        score: 15000,
        change: "up",
        changeAmount: 2,
      },
      {
        position: 2,
        item_name: "Anh Trai B",
        score: 12000,
        change: "down",
        changeAmount: 1,
      },
      {
        position: 3,
        item_name: "Anh Trai C",
        score: 10500,
        change: "same",
      },
      {
        position: 4,
        item_name: "Anh Trai D",
        score: 9800,
        change: "new",
      },
      {
        position: 5,
        item_name: "Anh Trai E",
        score: 8500,
        change: "up",
        changeAmount: 3,
      },
    ]);
    setLoading(false);
  }, [params.id]);

  const handleSubscribe = async () => {
    try {
      // Nếu chưa enable notification, yêu cầu permission trước
      if (!notificationEnabled) {
        const success = await subscribeToNotifications();
        if (!success) {
          alert("Vui lòng cho phép thông báo để tiếp tục");
          return;
        }
        setNotificationEnabled(true);
      }

      const rankingId = params.id as string;

      if (subscribed) {
        // Unsubscribe
        await unsubscribeFromRanking(rankingId);
        localStorage.removeItem(`sub_${rankingId}`);
        setSubscribed(false);

        // TODO: Call backend API to remove subscription
        // await fetch('/api/subscriptions', {
        //   method: 'DELETE',
        //   body: JSON.stringify({ rankingId, playerId: await getPlayerId() })
        // });
      } else {
        // Subscribe
        await subscribeToRanking(rankingId);
        localStorage.setItem(`sub_${rankingId}`, "true");
        setSubscribed(true);

        // Save subscription to backend
        const playerId = await getPlayerId();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log("Player ID:", playerId);
        console.log("User ID:", user?.id);

        // TODO: Call Workers API to save subscription
        // await fetch('/api/subscriptions', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     rankingId,
        //     playerId,
        //     userId: user?.id
        //   })
        // });
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const getRankBadge = (position: number) => {
    if (position === 1)
      return "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white";
    if (position === 2)
      return "bg-gradient-to-br from-gray-300 to-gray-500 text-white";
    if (position === 3)
      return "bg-gradient-to-br from-orange-400 to-orange-600 text-white";
    return "bg-gradient-to-br from-blue-500 to-blue-600 text-white";
  };

  const getChangeIcon = (change?: string, amount?: number) => {
    if (!change || change === "same") return null;
    if (change === "new")
      return <span className="text-green-500 text-xs font-bold">🆕 NEW</span>;
    if (change === "up")
      return (
        <span className="text-green-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-bold">+{amount}</span>
        </span>
      );
    if (change === "down")
      return (
        <span className="text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-bold">-{amount}</span>
        </span>
      );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
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

          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🎤</div>
            <div>
              <h1 className="text-3xl font-bold">Anh Trai Say Hi</h1>
              <p className="text-purple-100">Bảng xếp hạng VieON</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              <span>Cập nhật realtime</span>
            </div>
            <span>•</span>
            <span>Vừa cập nhật 2 phút trước</span>
          </div>
        </div>
      </header>

      {/* Subscribe Button */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <button
          onClick={handleSubscribe}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 ${
            subscribed
              ? "bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-[1.02]"
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

      {/* Rankings List */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-800">
              Top {items.length} Anh Trai
            </h2>
          </div>

          <div className="divide-y">
            {items.map((item, index) => (
              <div
                key={item.position}
                className="p-4 hover:bg-gray-50 transition-colors"
                style={{
                  animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-xl ${getRankBadge(
                      item.position
                    )} flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0`}
                  >
                    {item.position}
                  </div>

                  {/* Avatar Placeholder */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
                    👤
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg truncate">
                        {item.item_name}
                      </h3>
                      {getChangeIcon(item.change, item.changeAmount)}
                    </div>
                    {item.score && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-4 h-4 text-yellow-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold">
                          {item.score.toLocaleString("vi-VN")}
                        </span>
                        <span className="text-gray-400">votes</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <button className="text-gray-400 hover:text-purple-600 transition-colors">
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold mb-1">{items.length}</div>
            <div className="text-blue-100 text-sm">Anh trai tham gia</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold mb-1">
              {items.filter((i) => i.change === "up").length}
            </div>
            <div className="text-purple-100 text-sm">Đang tăng hạng</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
