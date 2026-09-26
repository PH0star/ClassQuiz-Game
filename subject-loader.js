// ============================================================
// 數據與視覺設計跨科目動態題庫載入引擎 (Subject & Google Sheet Loader)
// ============================================================

(function(window) {
  // 內建預設科目清單
  const BUILTIN_SUBJECTS = [
    {
      id: 'visual_design',
      name: '🎨 視覺設計專業',
      title: '視覺設計大冒險',
      description: '設計概念、色彩學、檔案類型、影像設計工具、CIS品牌識別、印前製程（400 題）',
      file: 'questions_visual_design.json',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1cfztbR0I5KIG4u9c06yFGS1u3y0qLFFPeihJ526nOoQ/edit?usp=sharing',
      defaultModule: '設計概念'
    },
    {
      id: 'data_analysis',
      name: '📊 數據分析實戰',
      title: '數據分析大冒險',
      description: '新手入門、資料清理、數據抓取、分析流程、資料視覺化（200 題）',
      file: 'questions.json',
      sheetUrl: 'https://docs.google.com/spreadsheets/d/1GJNNymUhtKtW0LDy8ifpa688_7TXHgpuc-uFLmmi2Bg/edit?usp=sharing',
      defaultModule: '新手入門'
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

    // 擷取 Sheet ID
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      const sheetId = match[1];
      // 擷取特定的分頁 gid
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
    // 第一輪：優先進行精確字串比對 (防止 question 與 question_type 誤配)
    for (const [standardKey, candidates] of Object.entries(fieldMap)) {
      const idx = headers.findIndex(h => candidates.some(c => h === c));
      if (idx !== -1) {
        headerIndices[standardKey] = idx;
      }
    }
    // 第二輪：針對未匹配項進行模糊子字串比對
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
      if (!qText) continue; // 忽略無題目的空行

      let rawAns = getVal('answer', 'A').toUpperCase().replace(/[^A-D]/g, '');
      if (!rawAns || rawAns.length === 0) rawAns = 'A';
      const ans = rawAns[0]; // 確保只取 A/B/C/D 單一字母

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

      parsedQuestions.append ? null : parsedQuestions.push({
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

  // 跨科目載入器主類別
  class SubjectLoader {
    constructor() {
      this.builtinSubjects = BUILTIN_SUBJECTS;
      this.currentSubject = BUILTIN_SUBJECTS[0]; // 預設視覺設計
      this.loadedQuestions = [];
    }

    getSubjects() {
      return this.builtinSubjects;
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
            return await this.loadFromGoogleSheet(builtin.sheetUrl, builtin.name);
          }
          throw err;
        }
      }

      // 2. 若為 Google Sheet 網址
      return await this.loadFromGoogleSheet(subjectIdOrUrl);
    }

    // 自 Google Sheet 網址直接拉取並解析題庫
    async loadFromGoogleSheet(sheetUrl, customName = '') {
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

        const subjectInfo = {
          id: 'custom_sheet_' + Date.now().toString(36),
          name: customName || '📋 自訂 Google Sheet 題庫',
          title: customName || '自訂科目互動競賽',
          description: `自試算表線上即時載入，共 ${questions.length} 道精選題目`,
          sheetUrl: sheetUrl
        };

        this.currentSubject = subjectInfo;
        this.loadedQuestions = questions;
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
