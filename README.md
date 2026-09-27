# 跨科目實戰線上互動競賽遊戲系統 (Multi-Subject Interactive Quiz System)
### 🎨 視覺設計專業 400 題 • 📊 數據分析實戰 200 題 • 🔗 支援 Google Sheet 自由載入

---

## 🌟 專案核心特色

本專案專為大班級實體課堂與線上互動教學量身打造，具備專業級教學輔助能力：

1. **跨科目題庫自由切換**：
   - 內建 **🎨 視覺設計專業（400 題完整版）**：全面涵蓋設計概念、色彩學、檔案類型、影像設計工具、CIS 品牌識別、印前製程 6 大單元。
   - 內建 **📊 數據分析實戰（200 題完整版）**：涵蓋新手入門觀念、數據抓取、資料清理、資料視覺化、分析流程 5 大單元。
   - **🔗 支援任意 Google Sheet 試算表即時載入**：直接貼上 Google 試算表連結，系統於 3 秒內自動完成跨網路拉取、欄位解析與動態題庫抽換！
2. **大螢幕高對比自適應投影 (`projector.html`)**：
   - 智慧感應外接投影機與大螢幕比例，支援 **16:9 寬螢幕** 與 **4:3 傳統投影機** 一鍵切換。
   - 搶答成功榮譽橫幅直觀醒目，並於得標作答時**同步完整呈現題幹與 A、B、C、D 選項**。
   - 揭曉答案時提供**特大字體（約 28~36px）觀念教學重點卡片**，後排學員亦能輕鬆閱讀。
3. **學員手機極速作答端 (`play.html`)**：
   - 支援手機掃描大螢幕 QR Code 立即免安裝加入。
   - 斷線重登身分持久化：學員誤關瀏覽器或網路斷線，重新開啟**自動沿用原身分與累計積分**，絕不分裂產生同名分身。
4. **教師全方位戰情主控台 (`console.html`)**：
   - 自由設定各房間之**預期應答人數（1~200 人）**與**小組組別數量（2~16 組）**，進度條動態聯動。
   - 具備**三重防重複計分鎖（Triple-Lock Idempotency）**，每道題目保證有且僅有一次加分，絕不重算。
   - 支援各房間歷史積分、作答紀錄與自訂設定之獨立雲端記憶（Room Memory）。
   - 支援一鍵匯出全場戰報與逐題作答明細為 UTF-8 CSV 試算表。

---

## 📚 題庫架構與 Google 試算表連結

### 1. 🎨 視覺設計專業題庫（400 題完整版）
* **線上試算表檢視與建立副本**：[視覺設計互動遊戲題庫 (400題全單元完整版)](https://docs.google.com/spreadsheets/d/1wmg9hMwzmxOhcWRzraX3ayNJh9WsFKBmStJXWiYsMdQ/edit?usp=sharing)
* **6 大專業單元分布**：
  1. **設計概念 (Design Concepts)** - 67 題（完形心理學、排版字體學、視覺層次、格線系統、留白構圖、無障礙設計）
  2. **色彩學 (Color Theory)** - 67 題（色彩三要素、色彩模型 RGB/CMYK/HSB/Lab、色相環體系、配色法則、色彩心理學、混色原理）
  3. **檔案類型 (File Formats)** - 67 題（點陣 vs 向量、JPG/PNG/GIF/SVG/WebP/TIFF/PDF/RAW、DPI/PPI/LPI、壓縮演算法、透明色版、貝茲曲線）
  4. **影像設計工具應用 (Imaging Tools)** - 67 題（Photoshop 核心技巧、Illustrator 向量技術、InDesign 排版長文件、Figma/UI 現代工具）
  5. **CIS 品牌識別系統 (Brand Identity)** - 66 題（MI/BI/VI 三核心、VI 基礎系統、Logo 型態學、VI 應用系統、品牌手冊規範）
  6. **印前製程 (Pre-press & Printing)** - 66 題（3mm 出血與安全框、CMYK 總墨量 TAC、特別色 Pantone、合版 vs 獨立版、紙張材質克重、印後加工裝訂）

### 2. 📊 數據分析實戰題庫（200 題完整版）
* **線上試算表檢視與建立副本**：[數據分析互動遊戲題庫 (200題完整版)](https://docs.google.com/spreadsheets/d/1GJNNymUhtKtW0LDy8ifpa688_7TXHgpuc-uFLmmi2Bg/edit?usp=sharing)
* **5 大模組分布**：
  1. **🌟 新手入門 (80 題)**：純生活生活情境比喻與商業思維，零程式碼門檻。
  2. **1. 數據抓取 (30 題)**、**2. 資料清理 (30 題)**、**3. 資料視覺化 (30 題)**、**4. 分析流程 (30 題)**。

---

## 🚀 GitHub 新專案建立與 GitHub Pages 部署步驟

請依照以下 4 個步驟，將本專案發布為您專屬的獨立線上網站：

### 步驟 1：在 GitHub 建立全新 Repository
1. 登入您的 GitHub 帳號，前往 [GitHub New Repository 頁面](https://github.com/new)。
2. 輸入儲存庫名稱（Repository name），例如：`visual-design-game` 或 `interactive-quiz-system`。
3. 選擇 **Public（公開）**。
4. 勾選 **Add a README file**（或保持空白），點擊綠色的 **Create repository**。

### 步驟 2：上傳專案所有檔案
1. 解壓縮下載的專案 ZIP 壓縮檔。
2. 進入剛建立的 GitHub 儲存庫頁面，點擊 **Add file > Upload files**。
3. 將解壓縮出的**所有檔案**直接拖曳丟入上傳區：
   * `index.html`（導航入口首頁）
   * `console.html`（教師主控台）
   * `projector.html`（大螢幕投影端）
   * `play.html`（學員作答端）
   * `subject-loader.js`（多科目與 Google Sheet 載入引擎）
   * `sync-channel.js`（即時通訊中繼引擎）
   * `firebase-config.js`（雲端資料庫設定檔）
   * `questions_visual_design.json`（視覺設計 400 題庫）
   * `questions_visual_design.csv`（視覺設計 CSV 試算表格式）
   * `questions.json`（數據分析 200 題庫）
4. 在下方點擊綠色的 **Commit changes**。

### 步驟 3：啟用 GitHub Pages 免費網站託管
1. 在該 GitHub 儲存庫頂部點擊 **Settings（設定）**。
2. 在左側選單點選 **Pages**。
3. 在 **Build and deployment > Branch** 下拉選單中：
   * 選擇 **`main`** 分支。
   * 資料夾保持 **`/ (root)`**。
   * 點擊右側的 **Save** 按鈕。
4. 等待約 1 ~ 2 分鐘，重新整理頁面，頂部會出現綠色勾勾與專屬網址：
   `Your site is live at https://<你的帳號>.github.io/<儲存庫名稱>/`

---

## 🔥 新 Firebase Realtime Database 申請與串接教學

> 💡 **貼心提醒**：專案內附的 `firebase-config.js` 目前已經配置了可正常運作的雲端資料庫服務，您可以直接上線使用！若您希望為新專案建立完全獨立的 Firebase 專案，請依下列指引操作：

### 步驟 1：建立 Firebase 專案
1. 前往 [Google Firebase Console](https://console.firebase.google.com/)，登入 Google 帳號。
2. 點擊 **「新增專案」**，輸入專案名稱（例如：`visual-design-quiz`），點擊繼續直至專案建立完成。

### 步驟 2：啟用 Realtime Database
1. 進入專案後台，在左側選單點擊 **Build（建置） > Realtime Database**。
2. 點擊 **「建立資料庫」**。
3. 地理位置（Location）推薦選擇：**`asia-southeast1 (新加坡)`**，延遲最低。
4. 安全性規則選擇：**「以測試模式啟動（Start in test mode）」**，點擊啟用。

### 步驟 3：設定安全規則（允許遊戲連線讀寫）
1. 在 Realtime Database 頁面頂部切換到 **Rules（規則）** 標籤。
2. 將規則修改為以下公開讀寫格式（供課堂學員即時連線）：
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. 點擊右上角 **Publish（發布）**。

### 步驟 4：取得 Web 設定參數並填入 `firebase-config.js`
1. 點擊左上角齒輪圖示 **Project settings（專案設定）**。
2. 在「一般」標籤下方捲至「您的應用程式」，點擊 **Web 圖示（`</>`）** 新增網頁應用。
3. 輸入應用暱稱，點擊註冊應用，畫面會顯示包含 `apiKey`、`databaseURL` 等物件代碼。
4. 打開專案中的 `firebase-config.js`，將內容替換為您的參數即可：
   ```javascript
   window.FIREBASE_CONFIG = {
     apiKey: "你的-API-KEY",
     authDomain: "你的專案.firebaseapp.com",
     databaseURL: "https://你的專案-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "你的專案-ID",
     storageBucket: "你的專案.appspot.com",
     messagingSenderId: "你的-SENDER-ID",
     appId: "你的-APP-ID"
   };
   ```

---

## 📋 如何製作與載入自己的 Google Sheet 試算表題庫？

教師主控台支援將您自行設計的 Google 試算表一鍵轉為互動題目：

### 1. 試算表標準欄位命名（第一列 Header，中英文皆相容）
| id (題號) | module (單元) | subcategory (子類別) | difficulty (難度) | score (配分) | question_type (題型) | question (題目內容) | option_a (選項A) | option_b (選項B) | option_c (選項C) | option_d (選項D) | answer (答案) | explanation (解析) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| VD_01 | 設計概念 | 完形心理學 | 初級 | 100 | single_choice | 距離接近的物體被視為一體是？ | 接近法則 | 閉合法則 | 相似法則 | 連續法則 | A | 接近法則指出空間相近者大腦自動歸為同組。 |

* **欄位彈性**：支援中文欄位名（`題號`、`單元`、`題目`、`選項A`、`選項B`、`選項C`、`選項D`、`答案`、`難度`、`解析`）。
* **題型設定**：填寫 `single_choice` 為標準選擇題；若包含 `搶答` 或 `speed_buzzer` 則自動轉為極速搶答題。

### 2. 開啟試算表權限並在主控台載入
1. 在 Google 試算表右上角點擊 **「共用」**。
2. 一般存取權改為 **「知道連結的任何人」**，角色設定為 **「檢視者」**。
3. 點擊 **「複製連結」**。
4. 打開教師主控台（`console.html`），點擊頂部 **「🔗 載入 Google 試算表」** 按鈕，貼上連結點擊載入，系統將立即在全場同步抽換新題庫！
