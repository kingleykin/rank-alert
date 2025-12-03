"use client";

import { useEffect, useState } from "react";

export default function InstallGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS - improved detection for modern iPads
    const userAgent = navigator.userAgent;
    const platform = (navigator as any).platform || '';
    
    // Check for iPhone/iPod
    const isIPhone = /iPhone|iPod/.test(userAgent);
    
    // Check for iPad - modern iPads report as Macintosh
    const isIPad = /iPad/.test(userAgent) || 
                   (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const iOS = isIPhone || isIPad;
    setIsIOS(iOS);

    // Detect Android
    const android = /Android/.test(userAgent);
    setIsAndroid(android);

    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Show guide if on mobile and not installed
    const hasSeenGuide = localStorage.getItem("hasSeenInstallGuide");
    if ((iOS || android) && !standalone && !hasSeenGuide) {
      // Show after 3 seconds
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowGuide(false);
    localStorage.setItem("hasSeenInstallGuide", "true");
  };

  const handleShowAgain = () => {
    setShowGuide(true);
  };

  if (isStandalone || (!isIOS && !isAndroid)) {
    return null;
  }

  return (
    <>
      {/* Floating button to show guide again */}
      {!showGuide && (
        <button
          onClick={handleShowAgain}
          className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-40 animate-bounce"
          title="Hướng dẫn cài đặt"
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      )}

      {/* Installation Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-3xl">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-2">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.2" />
                  <rect x="2" y="2" width="44" height="44" rx="10" fill="white" />
                  <rect x="10" y="28" width="8" height="14" rx="2" fill="#3B82F6" />
                  <rect x="20" y="18" width="8" height="24" rx="2" fill="#8C4AFF" />
                  <rect x="30" y="10" width="8" height="32" rx="2" fill="#EC3BFF" />
                  <circle cx="40" cy="8" r="3" fill="#EF3B4A" />
                </svg>
                <div>
                  <h2 className="text-2xl font-bold">Cài đặt RankAlert</h2>
                  <p className="text-white/90 text-sm">Thêm vào màn hình chính</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isIOS && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">📱</span>
                      <h3 className="font-bold text-gray-800">Hướng dẫn cho iPhone/iPad</h3>
                    </div>
                    
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-semibold">Nhấn nút Share</p>
                          <p className="text-gray-600">Biểu tượng <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 rounded">⬆️</span> ở thanh công cụ Safari</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-semibold">Cuộn xuống và chọn</p>
                          <p className="text-gray-600">"Add to Home Screen" (Thêm vào màn hình chính)</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-semibold">Nhấn "Add" (Thêm)</p>
                          <p className="text-gray-600">Icon sẽ xuất hiện trên màn hình chính</p>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800">
                        <strong>⚠️ Lưu ý:</strong> Phải dùng Safari, không hoạt động trên Chrome iOS
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isAndroid && (
                <div className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🤖</span>
                      <h3 className="font-bold text-gray-800">Hướng dẫn cho Android</h3>
                    </div>
                    
                    <ol className="space-y-3 text-sm text-gray-700">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <p className="font-semibold">Nhấn menu</p>
                          <p className="text-gray-600">Biểu tượng <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded">⋮</span> (3 chấm dọc) ở góc trên</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <p className="font-semibold">Chọn</p>
                          <p className="text-gray-600">"Add to Home screen" hoặc "Install app"</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <p className="font-semibold">Nhấn "Add" hoặc "Install"</p>
                          <p className="text-gray-600">Icon sẽ xuất hiện trên màn hình chính</p>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <strong>💡 Mẹo:</strong> Một số trình duyệt sẽ tự động hiển thị banner cài đặt
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-6 space-y-2">
                <h4 className="font-bold text-gray-800 mb-3">✨ Lợi ích khi cài đặt:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Truy cập nhanh từ màn hình chính</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Nhận thông báo ngay lập tức</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Hoạt động như app native</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-green-500">✓</span>
                    <span>Không tốn dung lượng như app thường</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={handleClose}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all"
                >
                  Đã hiểu
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-gray-600 font-medium py-2 text-sm hover:text-gray-800"
                >
                  Để sau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
