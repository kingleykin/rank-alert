"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// import AuthButton from "@/components/AuthButton"; // Temporarily disabled

interface Ranking {
  id: string;
  name: string;
  type: string;
  description: string;
  last_updated: string;
  icon: string;
  color: string;
}

export default function Home() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data cho MVP
    setRankings([
      {
        id: "vieon-atsh",
        name: "Anh Trai Say Hi",
        type: "vieon",
        description: "Bảng xếp hạng bình chọn Anh Trai Say Hi trên VieON",
        last_updated: new Date().toISOString(),
        icon: "🎤",
        color: "from-purple-500 to-pink-500",
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl animate-pulse">📊</span>
            </div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">
            Đang tải bảng xếp hạng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-block animate-float mb-6">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto drop-shadow-2xl"
              >
                <rect
                  width="120"
                  height="120"
                  rx="30"
                  fill="white"
                  fillOpacity="0.95"
                />
                <rect
                  x="25"
                  y="70"
                  width="20"
                  height="35"
                  rx="5"
                  fill="#3B82F6"
                />
                <rect
                  x="50"
                  y="45"
                  width="20"
                  height="60"
                  rx="5"
                  fill="#8C4AFF"
                />
                <rect
                  x="75"
                  y="20"
                  width="20"
                  height="85"
                  rx="5"
                  fill="#EC3BFF"
                />
                <path
                  d="M85 30L85 20L95 30"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="100" cy="20" r="8" fill="#EF3B4A" />
              </svg>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 tracking-tight">
              RankAlert
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Đừng mất thời gian refresh. Chúng tôi theo dõi giúp bạn — chỉ
              thông báo khi có thay đổi đáng giá.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-white/90 text-sm mt-1">
                  Theo dõi liên tục
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
                <div className="text-3xl">⚡</div>
                <div className="text-white/90 text-sm mt-1">
                  Thông báo tức thì
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20">
                <div className="text-3xl">🎯</div>
                <div className="text-white/90 text-sm mt-1">Chính xác 100%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="10" fill="url(#gradient)" />
              <rect x="2" y="2" width="36" height="36" rx="8" fill="white" />
              <rect x="8" y="23" width="7" height="12" rx="2" fill="#3B82F6" />
              <rect x="16" y="15" width="7" height="20" rx="2" fill="#8C4AFF" />
              <rect x="24" y="8" width="7" height="27" rx="2" fill="#EC3BFF" />
              <circle cx="33" cy="7" r="3" fill="#EF3B4A" />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0"
                  y1="0"
                  x2="40"
                  y2="40"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#3B82F6" />
                  <stop offset="0.5" stopColor="#8C4AFF" />
                  <stop offset="1" stopColor="#EC3BFF" />
                </linearGradient>
              </defs>
            </svg>
            <span className="font-bold text-xl text-gray-800">RankAlert</span>
          </div>
          {/* <AuthButton /> */} {/* Temporarily disabled */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bảng xếp hạng đang theo dõi
          </h2>
          <p className="text-gray-600">Chọn bảng xếp hạng để bật thông báo</p>
        </div>

        {/* Rankings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rankings.map((ranking, index) => (
            <Link
              key={ranking.id}
              href={`/ranking/${ranking.id}`}
              className="group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative bg-white rounded-2xl shadow-lg card-hover overflow-hidden h-full">
                {/* Gradient Header */}
                <div
                  className={`h-32 bg-gradient-to-br ${ranking.color} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      {ranking.icon}
                    </span>
                  </div>

                  {/* Live indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {ranking.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {ranking.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Vừa cập nhật</span>
                    </div>
                    <div className="flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                      <span>Xem chi tiết</span>
                      <svg
                        className="w-4 h-4"
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
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {rankings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Chưa có bảng xếp hạng nào
            </h3>
            <p className="text-gray-500">
              Chúng tôi đang cập nhật thêm nhiều bảng xếp hạng mới
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">🔔</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Thông báo thông minh
            </h3>
            <p className="text-gray-600 text-sm">
              Chỉ nhận thông báo khi có thay đổi quan trọng, không spam
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Theo dõi xu hướng
            </h3>
            <p className="text-gray-600 text-sm">
              Xem lịch sử thay đổi và phân tích xu hướng theo thời gian
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-3xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Cập nhật realtime
            </h3>
            <p className="text-gray-600 text-sm">
              Dữ liệu được cập nhật liên tục mỗi 10 phút
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
