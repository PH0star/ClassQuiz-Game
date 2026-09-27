# 跨科目實戰線上互動競賽遊戲系統 (Multi-Subject Interactive Quiz System)
### 🤖 AI 應用實務 1000 題 • 🎨 視覺設計 400 題 • 📊 數據分析 200 題 • 🔗 支援 Google Sheet 自由載入

---

## 🌟 專案核心特色

本專案專為大班級實體課堂與線上互動教學量身打造，具備專業級教學輔助能力：

1. **三大核心預設科目題庫，隨開即用**：
   * **🤖 AI 應用系統實務（1000 題旗艦版）**：包含生成式 AI 原理、Prompt 提示詞結構化、多媒體生成、RAG 檢索、數據分析動態儀表、文書處理、辦公自動化、VibeCoding 編碼、Agent 智能代理 9 大單元。
   * **🎨 視覺設計專業（400 題完整平衡版）**：全面涵蓋設計概念、色彩學、檔案類型、影像設計工具、CIS 品牌識別、印前製程 6 大單元。
   * **📊 數據分析實戰（200 題完整版）**：涵蓋新手入門觀念 (80題無代碼)、數據抓取、資料清理、資料視覺化、分析流程 5 大單元。
   * **🔗 支援任意 Google Sheet 試算表即時載入**：直接貼上 Google 試算表連結，系統自動解析並永久保存於本機與 Firebase 雲端資料庫，跨裝置自動同步！
2. **大螢幕高對比自適應投影 (`projector.html`)**：
   * 智慧感應外接投影機與大螢幕比例，支援 **16:9 寬螢幕** 與 **4:3 傳統投影機** 一鍵切換。
   * 搶答題專屬倒數與得標榮譽橫幅，大螢幕同步顯示題幹與 A、B、C、D 選項及限時作答倒數。
   * 揭曉答案時提供**特大字體（約 28~36px）觀念教學重點卡片**，後排學員亦能清晰閱覽。
3. **學員手機極速作答端 (`play.html`)**：
   * 手機掃描大螢幕 QR Code 立即免安裝加入。
   * 斷線重登身分持久化：學員誤關瀏覽器或網路重連，重新開啟**自動沿用原身分與累計積分**。
4. **教師精簡雙層中控台 (`console.html`)**：
   * 採用均衡對稱的雙層工具列，整合題目篩選、計時出題、個人/小組代表制切換與排行榜投影。
   * 具備**各房間獨立題庫記憶與積分存檔**，換房時自動載入該房間進行中之專屬題庫。

---

## 📚 題庫架構與 Google 試算表連結

### 1. 🤖 AI 應用系統實務題庫（1000 題旗艦版）
* **線上試算表檢視與建立副本**：[AI 應用系統實務題庫 (1000題全單元完整版 - 答案平衡版)](https://docs.google.com/spreadsheets/d/1i7glTdlhEb7nKTHTZsfrBPFjUOiClxQzdw2Yvt6YG9A/edit?usp=sharing)
* **9 大專業單元分布**：
  1. **生成式 AI 原理與基礎應用** - 112 題 (Transformer 架構、自注意力機制、SFT/RLHF/DPO、KV Cache、量化與開源生態)
  2. **Prompt 提示詞結構化應用** - 111 題 (PTCF/RTF 框架、Few-Shot、CoT 思維鏈、Tree of Thoughts、系統提示詞、JSON Schema 結構化輸出)
  3. **多媒體(圖像、影片、音樂)生成應用** - 111 題 (擴散模型原理、Midjourney、Stable Diffusion、ControlNet、Sora/Runway、Suno/Udio、SynthID 水印)
  4. **RAG 檢索應用** - 111 題 (向量資料庫、Embedding 語意空間、Chunking 分塊策略、Hybrid Search、Reranking 重排、HyDE、GraphRAG)
  5. **數據分析與動態儀表實務應用** - 111 題 (Code Interpreter 沙盒、自動化 EDA、Text-to-SQL、Plotly 互動圖表、Streamlit 動態儀表)
  6. **文書處理與生成應用** - 111 題 (長文結構化摘要、AIDA/PAS 行銷文案、在地化翻譯、合約風險初審、Markdown 心智圖大綱)
  7. **辦公室效率與自動化應用** - 111 題 (Zapier/Make/n8n 工作流、智慧會議紀要、Excel/Sheets 函數自動化、NotebookLM、RPA 整合)
  8. **VibeCoding 程式編碼應用** - 111 題 (VibeCoding 哲學、Cursor/Claude Code/Cline、.cursorrules 規範、TDD 自動測試生成、除錯修復)
  9. **Agent 智能代理實務應用** - 111 題 (ReAct 推理循環、Plan-and-Solve、Tool/Function Calling、MCP 協議、LangGraph 多代理、Human-in-the-Loop)

### 2. 🎨 視覺設計專業題庫（400 題完整平衡版）
* **線上試算表檢視與建立副本**：[視覺設計互動遊戲題庫 (400題全單元完整版 - 答案平衡版)](https://docs.google.com/spreadsheets/d/1wmg9hMwzmxOhcWRzraX3ayNJh9WsFKBmStJXWiYsMdQ/edit?usp=sharing)

### 3. 📊 數據分析實戰題庫（200 題完整版）
* **線上試算表檢視與建立副本**：[數據分析互動遊戲題庫 (200題完整版)](https://docs.google.com/spreadsheets/d/1GJNNymUhtKtW0LDy8ifpa688_7TXHgpuc-uFLmmi2Bg/edit?usp=sharing)
