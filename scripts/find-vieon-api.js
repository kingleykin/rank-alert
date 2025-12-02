#!/usr/bin/env node

/**
 * Script để tìm VieON API endpoint
 *
 * Cách dùng:
 * 1. Mở trang VieON Anh Trai Say Hi
 * 2. Mở DevTools → Console
 * 3. Copy & paste script này vào Console
 * 4. Chạy: findVieONAPI()
 */

function findVieONAPI() {
  console.log("🔍 Đang tìm VieON API endpoints...\n");

  // Method 1: Check performance entries
  console.log("📡 Method 1: Performance Entries");
  const resources = performance.getEntriesByType("resource");
  const apiCalls = resources
    .filter(
      (r) =>
        r.name.includes("api") ||
        r.name.includes("vote") ||
        r.name.includes("ranking") ||
        r.name.includes("backend")
    )
    .map((r) => r.name);

  if (apiCalls.length > 0) {
    console.log("✅ Found API calls:");
    apiCalls.forEach((url) => console.log(`   ${url}`));
  } else {
    console.log("❌ No API calls found in performance entries");
  }

  console.log("\n");

  // Method 2: Check fetch/XHR
  console.log("📡 Method 2: Intercept Fetch");
  console.log("⚠️  Refresh trang để bắt requests...\n");

  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    if (
      typeof url === "string" &&
      (url.includes("api") || url.includes("vote") || url.includes("ranking"))
    ) {
      console.log("🎯 Fetch detected:", url);
    }
    return originalFetch.apply(this, args);
  };

  // Method 3: Check window objects
  console.log("📡 Method 3: Window Objects");
  const keys = Object.keys(window).filter(
    (key) =>
      key.toLowerCase().includes("api") ||
      key.toLowerCase().includes("config") ||
      key.toLowerCase().includes("endpoint")
  );

  if (keys.length > 0) {
    console.log("✅ Found potential config objects:");
    keys.forEach((key) => {
      console.log(`   window.${key}:`, window[key]);
    });
  } else {
    console.log("❌ No config objects found");
  }

  console.log("\n");

  // Method 4: Check scripts
  console.log("📡 Method 4: Script Tags");
  const scripts = Array.from(document.querySelectorAll("script"));
  const inlineScripts = scripts
    .filter((s) => !s.src && s.textContent.includes("api"))
    .map((s) => s.textContent.substring(0, 200));

  if (inlineScripts.length > 0) {
    console.log('✅ Found inline scripts with "api":');
    inlineScripts.forEach((text, i) => {
      console.log(`   Script ${i + 1}:`, text + "...");
    });
  }

  console.log("\n");
  console.log("💡 Tips:");
  console.log("   1. Mở Network tab → Filter: Fetch/XHR");
  console.log("   2. Click vào tab bình chọn");
  console.log("   3. Tìm request có response chứa ranking data");
  console.log("   4. Copy URL và test với curl");
  console.log("\n");
  console.log("📝 Test API với curl:");
  console.log('   curl "URL_HERE" -H "User-Agent: Mozilla/5.0" | jq "."');
}

// Auto run if in browser
if (typeof window !== "undefined") {
  console.log("🎤 VieON API Finder");
  console.log("Run: findVieONAPI()");
  window.findVieONAPI = findVieONAPI;
}

// Export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { findVieONAPI };
}
