"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setShowInstall(false);
    }

    setDeferredPrompt(null);
  };

  if (!showInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl p-6 z-50 animate-slide-up border-2 border-purple-200">
      <button
        onClick={() => setShowInstall(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="12" fill="url(#gradient)" />
            <rect x="2" y="2" width="44" height="44" rx="10" fill="white" />
            <rect x="10" y="28" width="8" height="14" rx="2" fill="#3B82F6" />
            <rect x="20" y="18" width="8" height="24" rx="2" fill="#8C4AFF" />
            <rect x="30" y="10" width="8" height="32" rx="2" fill="#EC3BFF" />
            <circle cx="40" cy="8" r="3" fill="#EF3B4A" />
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                y1="0"
                x2="48"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#3B82F6" />
                <stop offset="0.5" stopColor="#8C4AFF" />
                <stop offset="1" stopColor="#EC3BFF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">Cài đặt RankAlert</h3>
          <p className="text-sm text-gray-600 mb-4">
            Cài đặt app để nhận thông báo nhanh hơn và truy cập dễ dàng hơn
          </p>

          <button
            onClick={handleInstall}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
          >
            Cài đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}
