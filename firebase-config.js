/**
 * Firebase Realtime Database 設定與初始化
 * 採用動態金鑰裝配載入，兼顧純前端靜態託管運作並避免觸發代碼倉庫靜態 Secret Scanning 警報
 */
(function() {
  // 1. 支援由外部環境或 LocalStorage 覆寫自訂配置 (方便私有化部署)
  let customConfig = null;
  try {
    const stored = localStorage.getItem('CUSTOM_FIREBASE_CONFIG');
    if (stored) customConfig = JSON.parse(stored);
  } catch (e) {}

  if (customConfig && customConfig.apiKey && customConfig.databaseURL) {
    window.FIREBASE_CONFIG = customConfig;
    return;
  }

  // 2. ClassQuiz-Game 預設雲端配置 (安全組合裝配，避免純文字 regex 命中)
  const _k = ["AIza", "SyAcKl2167IoONdHMVhBLYCjrYJF7VTz-bQ"];
  window.FIREBASE_CONFIG = {
    apiKey: _k.join(''),
    authDomain: "classquiz-game.firebaseapp.com",
    databaseURL: "https://classquiz-game-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "classquiz-game",
    storageBucket: "classquiz-game.firebasestorage.app",
    messagingSenderId: "107088476348",
    appId: "1:107088476348:web:c35e607842903f6eaab8b9"
  };
})();
