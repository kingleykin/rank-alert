export default function Logo({ size = 64 }: { size?: number }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer gradient ring */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 animate-pulse-slow"></div>

      {/* Inner white background */}
      <div className="absolute inset-1 rounded-xl bg-white flex items-center justify-center">
        {/* Chart bars icon */}
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Bar 1 - shortest */}
          <rect
            x="3"
            y="14"
            width="4"
            height="7"
            rx="1"
            className="fill-blue-500"
          />
          {/* Bar 2 - medium */}
          <rect
            x="10"
            y="8"
            width="4"
            height="13"
            rx="1"
            className="fill-purple-500"
          />
          {/* Bar 3 - tallest with arrow */}
          <rect
            x="17"
            y="3"
            width="4"
            height="18"
            rx="1"
            className="fill-pink-500"
          />
          {/* Arrow up indicator */}
          <path
            d="M19 6L19 3L22 6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Notification dot */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
    </div>
  );
}
