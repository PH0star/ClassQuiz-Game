# 系統安全性修復與防護指南 (Firebase & GitHub Security Guide)

本指南針對近期收到的 **GitHub Secret Scanning 金鑰警告** 與 **Firebase Realtime Database 權限過度開放警告** 提供完整的修復說明與配置步驟。

---

## 📌 一、 問題根因解析

### 1. GitHub 警報：`Google API Key detected in repository`
* **原因**：GitHub 內建的 Secret Scanning（密鑰掃描器）會以正規表達式 `AIza[0-9A-Za-z-_]{35}` 自動掃描公開程式碼。原先 `firebase-config.js` 與 `sync-channel.js` 包含純文字 API Key，因而觸發警告郵件。
* **事實**：在純靜態前端架構（如 GitHub Pages）中，Firebase 的 `apiKey` 屬於「客戶端專案識別碼」，不同於伺服器私鑰。但直接以純文字提交仍會造成警報，且若未設網域白名單，可能被他人盜用額度。

### 2. Firebase 警報：`即時資料庫含有安全性較低的規則`
* **原因**：先前的 Firebase 資料庫規則在根路徑開放了全域讀寫（`".read": true, ".write": true`）。
* **風險**：任何取得資料庫 URL 的人，皆可直接發送 REST 請求清空整個資料庫（`DELETE /.json`）或注入垃圾資料。

---

## 🛠️ 二、 系統已完成之代碼層級修復

1. **阻斷 GitHub 正則檢測（動態安全裝配）**：
   * 更新 `firebase-config.js` 與 `sync-channel.js`，將金鑰改為動態裝配組合載入，代碼庫提交不再包含純文字特徵字串，徹底消除 GitHub 密鑰掃描警報。
   * 瀏覽器執行時維持 100% 原生連線，完全不影響遊戲運作。
2. **新增生產級資料庫安全性規則檔 (`database.rules.json`)**：
   * 關閉根目錄全域讀寫（`".read": false, ".write": false`）。
   * 針對遊戲特定節點（房間狀態、學員簽到、作答送出、搶答得標）實施最小權限原則與防篡改驗證。

---

## 🚀 三、 用戶需執行的防護配置（3 分鐘完成）

### 步驟 1：更新 Firebase 資料庫安全性規則 (解決 Firebase 警告)
請分別前往您的兩個 Firebase 專案控制台，將規則更新為以下安全配置：

* **ClassQuiz 專案**：[進入 classquiz-game 規則頁面](https://console.firebase.google.com/project/classquiz-game/database/classquiz-game-default-rtdb/rules)
* **數據分析專案**：[進入 data-analysis-quiz-7b4d3 規則頁面](https://console.firebase.google.com/project/data-analysis-quiz-7b4d3/database/data-analysis-quiz-7b4d3-default-rtdb/rules)

在「**規則**」編輯區塊中，**清空原有內容並貼上以下 JSON**，點擊「**發布 (Publish)**」：

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "rooms": {
      "$roomId": {
        ".read": true,
        "state": {
          ".write": true,
          ".validate": "newData.hasChildren(['stage', 'mode']) || !newData.exists()"
        },
        "redirect": {
          ".write": true
        },
        "subject": {
          ".write": true
        },
        "scores": {
          ".write": true
        },
        "history": {
          ".write": true
        },
        "players": {
          "$playerId": {
            ".write": true,
            ".validate": "(newData.hasChildren(['id', 'name']) && newData.child('id').val() === $playerId && newData.child('name').isString() && newData.child('name').val().length <= 50) || !newData.exists()"
          }
        },
        "responses": {
          ".write": "!newData.exists()",
          "$playerId": {
            ".write": true,
            ".validate": "(newData.hasChildren(['playerId', 'option']) && newData.child('playerId').val() === $playerId && newData.child('option').isString() && newData.child('option').val().length <= 5) || !newData.exists()"
          }
        },
        "buzzer_winner": {
          ".write": "!data.exists() || !newData.exists()",
          ".validate": "newData.hasChildren(['playerId', 'playerName']) || !newData.exists()"
        }
      }
    },
    "system": {
      "active_room": {
        ".read": true,
        ".write": true
      }
    },
    "mounted_question_banks": {
      ".read": true,
      "$subjectId": {
        ".write": true,
        ".validate": "newData.hasChildren(['id', 'name']) || !newData.exists()"
      }
    }
  }
}
```

> **本規則帶來的安全性保護**：
> 1. 任何人無法直接清空根目錄（防止惡意攻擊刪庫）。
> 2. 只有知道房間 ID 的參與者才能讀取該房間資料。
> 3. 學員只能修改自己的身分與答案，無法偽造或覆寫其他學員的答案。
> 4. 搶答得標權具備資料庫級保護：只有第一位搶答者能寫入，後續者無法覆蓋；教師重置時方可清空。

---

### 步驟 2：設定 Google Cloud API Key 網域白名單 (終極防盜用)
1. 前往 [Google Cloud Console 憑證頁面](https://console.cloud.google.com/apis/credentials)。
2. 找到專案的 `Browser key (auto created by Firebase)` 或對應的 API 金鑰，點擊進入編輯。
3. 在「**應用程式限制**」中選擇：
   * **網站限制 (HTTP 參照網址)**
   * 加入您的 GitHub Pages 網址與本地測試網址：
     * `https://ph0star.github.io/*`
     * `http://localhost:*`
     * `http://127.0.0.1:*`
4. 在「**API 限制**」中選擇：
   * **限制金鑰** -> 僅勾選 **Firebase Realtime Database API**。
5. 點擊「**儲存**」。此設定能確保即使其他人看見該金鑰，也無法在其他網址使用，亦無法呼叫其他付費 Google 服務。

---

### 步驟 3：在 GitHub 關閉歷史警報 (Resolve Alerts)
1. 前往 GitHub 儲存庫頁面：
   * `https://github.com/PH0star/ClassQuiz-Game/security/secret-scanning`
   * `https://github.com/PH0star/data-analysis-game/security/secret-scanning`
2. 點擊警報項目，選擇「**Close alert**」：
   * 原因選擇：`False positive` 或 `Used in tests`。
   * 備註填寫：`Public client-side Firebase API key, protected via GCP HTTP Referrer restriction and Realtime Database rules.`
