// ============================================================
// 數據與視覺設計跨科目動態題庫載入與持久化掛載引擎 (Subject & Google Sheet Loader)
// ============================================================

(function(window) {
  const MOUNTED_STORAGE_KEY = 'game_mounted_subjects';
  const UNMOUNTED_STORAGE_KEY = 'game_unmounted_subject_ids';

  // 內建核心預設科目清單 (不可卸載)
  const BUILTIN_SUBJECTS = [
    {
      id: 'ai_applications',
      name: '🤖 AI 應用實務',
      title: 'AI 應用系統實務競賽',
      description: '生成式AI原理、Prompt結構化、多媒體生成、RAG檢索、數據分析儀表、文書處理、辦公自動化、VibeCoding、Agent智能代理（1000 題完整平衡版）',
      file: 'questions_ai_applications.json',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1i7glTdlhEb7nKTHTZsfrBPFjUOiClxQzdw2Yvt6YG9A/edit?usp=sharing',
      defaultModule: '生成式 AI 原理與基礎應用',
      questionCount: 1000,
      isBuiltin: true
    },
    {
      id: 'visual_design',
      name: '🎨 視覺設計專業',
      title: '視覺設計大冒險',
      description: '設計概念、色彩學、檔案類型、影像設計工具、CIS品牌識別、印前製程（400 題完整平衡版）',
      file: 'questions_visual_design.json',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1wmg9hMwzmxOhcWRzraX3ayNJh9WsFKBmStJXWiYsMdQ/edit?usp=sharing',
      defaultModule: '設計概念',
      questionCount: 400,
      isBuiltin: true
    },
    {
      id: 'data_analysis',
      name: '📊 數據分析實戰',
      title: '數據分析大冒險',
      description: '新手入門、資料清理、數據抓取、分析流程、資料視覺化（200 題完整版）',
      file: 'questions.json',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1GJNNymUhtKtW0LDy8ifpa688_7TXHgpuc-uFLmmi2Bg/edit?usp=sharing',
      defaultModule: '新手入門',
      questionCount: 200,
      isBuiltin: true
    }
  ];

  // 將任何 Google Sheets 網址轉化為直接 CSV 抓取端點
  function convertToGoogleSheetCsvUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    const url = rawUrl.trim();

    // 若已經是 CSV 格式匯出網址直接返回
    if (url.includes('output=csv') || url.includes('out:csv')) {
      return url;
    }

    // 支援發布至網路的 /pubhtml 網址
    if (url.includes('/pubhtml')) {
      return url.replace('/pubhtml', '/pub?output=csv');
    }

    // 若直接輸入純 Sheet ID (英數字、底線、減號，長度 >= 20)
    if (/^[a-zA-Z0-9-_]{20,}$/.test(url)) {
      return `https://docs.google.com/spreadsheets/d/${url}/gviz/tq?tqx=out:csv`;
    }

    // 擷取一般 Google 試算表 ID
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      if (sheetId === 'e') {
        return url.replace(/\/(pubhtml|edit).*$/, '/pub?output=csv');
      }
      const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
      const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';
      return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gidParam}`;
    }

    return url;
  }

  // 零依賴強健型 CSV 解析器 (支援換行、引號內含逗號、UTF-8 BOM、中英文欄位自動映射)
  function parseCSV(csvText) {
    if (!csvText) return [];
    
    // 移除 UTF-8 BOM
    let cleanText = csvText.charCodeAt(0) === 0xFEFF ? csvText.slice(1) : csvText;
    cleanText = cleanText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (insideQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentCell += '"';
            i++; // 跳過轉義引號
          } else {
            insideQuotes = false;
          }
        } else {
          currentCell += char;
        }
      } else {
        if (char === '"') {
          insideQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentCell.trim());
          currentCell = '';
        } else if (char === '\n') {
          currentRow.push(currentCell.trim());
          if (currentRow.some(cell => cell.length > 0)) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    // 欄位名稱正規化對應字典
    const headers = rows[0].map(h => h.toLowerCase().replace(/[\s_\-]/g, ''));
    const fieldMap = {
      id: ['id', '題號', '編號', '序號', '代碼'],
      module: ['module', '模組', '單元', '主題', '分類', '類別'],
      subcategory: ['subcategory', '子類別', '子單元', '小節', '細項', '領域'],
      question_type: ['questiontype', '題型', '類型', '型態'],
      difficulty: ['difficulty', '難度', '等級', '難易度'],
      score: ['score', '分數', '配分', '得分'],
      question: ['question', '題目', '題幹', '問題', '題目內容'],
      option_a: ['optiona', 'a', '選項a', '選項1'],
      option_b: ['optionb', 'b', '選項b', '選項2'],
      option_c: ['optionc', 'c', '選項c', '選項3'],
      option_d: ['optiond', 'd', '選項d', '選項4'],
      answer: ['answer', '答案', '解答', '標準答案', '正解'],
      explanation: ['explanation', '解析', '說明', '教學要點', '觀念重點', '詳解']
    };

    const headerIndices = {};
    for (const [standardKey, candidates] of Object.entries(fieldMap)) {
      const idx = headers.findIndex(h => candidates.some(c => h === c));
      if (idx !== -1) {
        headerIndices[standardKey] = idx;
      }
    }
    for (const [standardKey, candidates] of Object.entries(fieldMap)) {
      if (headerIndices[standardKey] === undefined) {
        const idx = headers.findIndex(h => candidates.some(c => h.includes(c) || c.includes(h)));
        if (idx !== -1) {
          headerIndices[standardKey] = idx;
        }
      }
    }

    const parsedQuestions = [];
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const getVal = (key, defaultVal = '') => {
        const idx = headerIndices[key];
        return (idx !== undefined && row[idx] !== undefined && row[idx] !== '') ? row[idx] : defaultVal;
      };

      const qText = getVal('question');
      if (!qText) continue;

      let rawAns = getVal('answer', 'A').toUpperCase().replace(/[^A-D]/g, '');
      if (!rawAns || rawAns.length === 0) rawAns = 'A';
      const ans = rawAns[0];

      const diff = getVal('difficulty', '初級');
      let scoreVal = parseInt(getVal('score', '0'), 10);
      if (!scoreVal || isNaN(scoreVal)) {
        scoreVal = diff === '初級' ? 100 : diff === '中級' ? 150 : 200;
      }

      let qType = getVal('question_type', 'single_choice');
      if (qType.includes('搶答') || qType.includes('buzzer')) {
        qType = 'speed_buzzer';
      } else {
        qType = 'single_choice';
      }

      parsedQuestions.push({
        id: getVal('id', `Q_${r}`),
        module: getVal('module', '通用單元'),
        subcategory: getVal('subcategory', '基本觀念'),
        question_type: qType,
        difficulty: diff,
        score: scoreVal,
        question: qText,
        option_a: getVal('option_a', '選項 A'),
        option_b: getVal('option_b', '選項 B'),
        option_c: getVal('option_c', '選項 C'),
        option_d: getVal('option_d', '選項 D'),
        answer: ans,
        explanation: getVal('explanation', '本題主要測驗基本核心觀念。')
      });
    }

    return parsedQuestions;
  }

  // 跨科目載入器主類別 (包含本機持久化掛載、內存快取與安全雙向雲端同步)
  class SubjectLoader {
    constructor() {
      this.builtinSubjects = BUILTIN_SUBJECTS;
      this.mountedSubjects = this.loadMountedFromStorage();
      this.unmountedIds = this.loadUnmountedFromStorage();
      this.memoryQuestionCache = new Map();
      this.currentSubject = BUILTIN_SUBJECTS[0]; // 預設視覺設計
      this.loadedQuestions = [];
    }

    // 從 localStorage 讀取自訂掛載題庫中繼資料 (輕量 < 2KB，絕不超標)
    loadMountedFromStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(MOUNTED_STORAGE_KEY);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list)) {
              return list;
            }
          }
        }
      } catch (e) {
        console.warn('[SubjectLoader] 讀取本地掛載題庫失敗:', e);
      }
      return [];
    }

    // 儲存掛載題庫中繼資料 (僅儲存基本參數，不儲存數百題內容以防止 QuotaExceededError)
    saveMountedToStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const cleanList = this.mountedSubjects.map(s => ({
            id: s.id,
            name: s.name,
            title: s.title,
            description: s.description,
            sheetUrl: s.sheetUrl,
            questionCount: s.questionCount || 0,
            mountedAt: s.mountedAt || Date.now(),
            isBuiltin: false
          }));
          localStorage.setItem(MOUNTED_STORAGE_KEY, JSON.stringify(cleanList));
        }
      } catch (e) {
        console.warn('[SubjectLoader] 儲存本地掛載題庫失敗:', e);
      }
    }

    loadUnmountedFromStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem(UNMOUNTED_STORAGE_KEY);
          if (raw) {
            return new Set(JSON.parse(raw));
          }
        }
      } catch (e) {}
      return new Set();
    }

    saveUnmountedToStorage() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(UNMOUNTED_STORAGE_KEY, JSON.stringify(Array.from(this.unmountedIds)));
        }
      } catch (e) {}
    }

    // 取得所有可用科目 (內建 + 已掛載)
    getSubjects() {
      return [...this.builtinSubjects, ...this.mountedSubjects];
    }

    getBuiltinSubjects() {
      return this.builtinSubjects;
    }

    getMountedSubjects() {
      return this.mountedSubjects;
    }

    // 掛載新題庫或更新現有掛載題庫
    mountSubject(sheetUrl, customName, questions = []) {
      if (!sheetUrl) return null;
      const cleanUrl = sheetUrl.trim();
      const match = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const sheetKey = match ? match[1].slice(0, 16) : Date.now().toString(36);
      const subjectId = `sheet_${sheetKey}`;

      // 若先前曾被卸載，重新掛載時移出卸載黑名單
      this.unmountedIds.delete(subjectId);
      this.saveUnmountedToStorage();

      const displayName = customName && customName.trim() ? customName.trim() : '📋 自訂試算表題庫';
      const existingIdx = this.mountedSubjects.findIndex(s => s.id === subjectId || s.sheetUrl === cleanUrl);

      const subjectInfo = {
        id: subjectId,
        name: displayName,
        title: displayName.replace(/^📋\s*/, ''),
        description: `自 Google Sheet 掛載，共 ${questions.length} 題`,
        sheetUrl: cleanUrl,
        questionCount: questions.length,
        mountedAt: Date.now(),
        isBuiltin: false
      };

      if (existingIdx >= 0) {
        this.mountedSubjects[existingIdx] = subjectInfo;
        console.log(`[SubjectLoader] 🔄 已更新掛載題庫: ${displayName} (${subjectId})`);
      } else {
        this.mountedSubjects.push(subjectInfo);
        console.log(`[SubjectLoader] ➕ 成功掛載新題庫: ${displayName} (${subjectId})`);
      }

      // 記憶體快取：當前 session 內免重複拉取
      if (questions && questions.length > 0) {
        this.memoryQuestionCache.set(subjectId, questions);
      }

      this.saveMountedToStorage();
      this.currentSubject = subjectInfo;
      return subjectInfo;
    }

    // 卸載自訂題庫
    unmountSubject(subjectId) {
      if (this.builtinSubjects.some(s => s.id === subjectId)) {
        return { success: false, error: '系統內建核心題庫受到保護，無法卸載！' };
      }

      this.mountedSubjects = this.mountedSubjects.filter(s => s.id !== subjectId);
      this.memoryQuestionCache.delete(subjectId);
      this.unmountedIds.add(subjectId);

      this.saveMountedToStorage();
      this.saveUnmountedToStorage();
      console.log(`[SubjectLoader] 🗑️ 成功卸載題庫: ${subjectId}`);

      let fallbackSubject = null;
      if (this.currentSubject && this.currentSubject.id === subjectId) {
        this.currentSubject = this.builtinSubjects[0];
        fallbackSubject = this.currentSubject;
      }

      return {
        success: true,
        remaining: this.getSubjects(),
        fallbackSubject: fallbackSubject
      };
    }

    // 安全雙向同步：整合來自 Firebase 雲端的題庫清單 (絕不暴力抹除本地自訂題庫！)
    syncCloudMountedSubjects(cloudBankList, pushLocalToCloudCallback = null) {
      if (!Array.isArray(cloudBankList)) return this.getSubjects();

      const existingMap = new Map();
      this.mountedSubjects.forEach(s => existingMap.set(s.id, s));

      // 1. 併入雲端題目
      cloudBankList.forEach(item => {
        if (!item || !item.id) return;
        if (this.unmountedIds.has(item.id)) return; // 若本地已主動卸載，不予復活

        const subjectInfo = {
          id: item.id,
          name: item.name || '📋 自訂試算表題庫',
          title: item.title || (item.name || '').replace(/^📋\s*/, ''),
          description: item.description || `自 Google Sheet 掛載，共 ${item.questionCount || 0} 題`,
          sheetUrl: item.sheetUrl,
          questionCount: item.questionCount || 0,
          mountedAt: item.mountedAt || Date.now(),
          isBuiltin: false
        };

        existingMap.set(item.id, subjectInfo);
      });

      // 2. 本地存在但雲端尚未擁有的題庫，自動向上補傳
      if (pushLocalToCloudCallback) {
        existingMap.forEach((localSubj, id) => {
          if (!cloudBankList.some(c => c && c.id === id)) {
            console.log(`[SubjectLoader] ⬆️ 本地題庫 ${localSubj.name} 自動同步上傳至雲端`);
            pushLocalToCloudCallback(localSubj);
          }
        });
      }

      this.mountedSubjects = Array.from(existingMap.values());
      this.saveMountedToStorage();
      console.log(`[SubjectLoader] ☁️ 題庫整合完成，目前共有 ${this.mountedSubjects.length} 個自訂掛載題庫`);
      return this.getSubjects();
    }

    // 依科目 ID 或 Google Sheet 網址載入題庫
    async loadSubject(subjectIdOrUrl) {
      // 1. 檢查是否為內建科目
      const builtin = this.builtinSubjects.find(s => s.id === subjectIdOrUrl);
      if (builtin) {
        this.currentSubject = builtin;
        try {
          const res = await fetch(`${builtin.file}?t=${Date.now()}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          this.loadedQuestions = await res.json();
          console.log(`[SubjectLoader] 🟢 成功載入內建科目【${builtin.name}】共 ${this.loadedQuestions.length} 題`);
          return {
            success: true,
            subject: builtin,
            questions: this.loadedQuestions,
            sourceType: 'builtin'
          };
        } catch (err) {
          console.warn(`[SubjectLoader] 載入本地檔案失敗，嘗試轉載 Google Sheet 備援:`, err);
          if (builtin.sheetUrl) {
            return await this.loadFromGoogleSheet(builtin.sheetUrl, builtin.name, false);
          }
          throw err;
        }
      }

      // 2. 檢查是否為已掛載科目
      const mounted = this.mountedSubjects.find(s => s.id === subjectIdOrUrl);
      if (mounted) {
        this.currentSubject = mounted;
        // 優先檢查 RAM 快取
        if (this.memoryQuestionCache.has(mounted.id)) {
          this.loadedQuestions = this.memoryQuestionCache.get(mounted.id);
          console.log(`[SubjectLoader] ⚡ 從記憶體秒開題庫【${mounted.name}】共 ${this.loadedQuestions.length} 題`);
          return {
            success: true,
            subject: mounted,
            questions: this.loadedQuestions,
            sourceType: 'ram_cache'
          };
        }
        // 從 Google Sheet 拉取最新並填入快取
        return await this.loadFromGoogleSheet(mounted.sheetUrl, mounted.name, true);
      }

      // 3. 若傳入的是直接 Google Sheet 網址
      return await this.loadFromGoogleSheet(subjectIdOrUrl);
    }

    // 自 Google Sheet 網址直接拉取、解析並自動掛載題庫
    async loadFromGoogleSheet(sheetUrl, customName = '', shouldAutoMount = true) {
      const csvUrl = convertToGoogleSheetCsvUrl(sheetUrl);
      console.log(`[SubjectLoader] 正在從 Google Sheet 抓取 CSV: ${csvUrl}`);

      try {
        const res = await fetch(csvUrl);
        if (!res.ok) throw new Error(`Google Sheet 讀取失敗 (HTTP ${res.status})，請確認試算表已開啟「知道連結的任何人均可檢視」`);
        const csvText = await res.text();
        const questions = parseCSV(csvText);

        if (!questions || questions.length === 0) {
          throw new Error('未能在試算表中解析出有效題目，請確認試算表格式包含：題目、選項A、選項B、選項C、選項D、答案');
        }

        let subjectInfo;
        if (shouldAutoMount) {
          subjectInfo = this.mountSubject(sheetUrl, customName, questions);
        } else {
          subjectInfo = {
            id: 'temp_sheet_' + Date.now().toString(36),
            name: customName || '📋 雲端試算表題庫',
            title: customName || '試算表互動競賽',
            description: `自試算表即時載入，共 ${questions.length} 題`,
            sheetUrl: sheetUrl,
            questionCount: questions.length,
            isBuiltin: false
          };
          this.currentSubject = subjectInfo;
        }

        this.loadedQuestions = questions;
        this.memoryQuestionCache.set(subjectInfo.id, questions);
        console.log(`[SubjectLoader] 🟢 成功從 Google Sheet 載入 ${questions.length} 題！`);

        return {
          success: true,
          subject: subjectInfo,
          questions: questions,
          sourceType: 'google_sheet'
        };
      } catch (err) {
        console.error('[SubjectLoader] Google Sheet 載入異常:', err);
        return {
          success: false,
          error: err.message,
          questions: []
        };
      }
    }
  }

  // 導出全域物件 (相容瀏覽器 window 與 Node 測試環境)
  const targetScope = typeof window !== 'undefined' ? window : global;
  targetScope.SubjectLoader = SubjectLoader;
  targetScope.parseGoogleSheetCSV = parseCSV;
  targetScope.convertToGoogleSheetCsvUrl = convertToGoogleSheetCsvUrl;
  if (typeof global !== 'undefined') {
    global.SubjectLoader = SubjectLoader;
    global.parseGoogleSheetCSV = parseCSV;
    global.convertToGoogleSheetCsvUrl = convertToGoogleSheetCsvUrl;
  }

})(typeof window !== 'undefined' ? window : global);
