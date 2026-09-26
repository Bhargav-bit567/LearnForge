document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "";

  // ── State ──────────────────────────────────────────────────────────────────
  let currentFile = null;
  let currentMCQs = [];
  let currentResultId = null;
  let authToken = localStorage.getItem("auth_token") || null;
  let currentUser = JSON.parse(localStorage.getItem("auth_user") || "null");
  
  // Tab state management
  let quizAnswers = new Map(); // Store quiz answers separately from submission state
  let quizSubmitted = false;
  let currentActiveTab = "summaryTab";

  // ── TabManager Class ───────────────────────────────────────────────────────
  class TabManager {
    constructor(tabBarSelector, options = {}) {
      this.tabBar = document.querySelector(tabBarSelector);
      this.tabs = this.tabBar?.querySelectorAll('.tab-btn') || [];
      this.activeTab = null;
      this.isHistoryPanel = tabBarSelector.includes('history');
      this.options = options;
      this.init();
    }

    init() {
      if (!this.tabBar) return;
      
      // Find initially active tab
      this.activeTab = this.tabBar.querySelector('.tab-btn.active')?.dataset.tab || null;
      
      // Add event listeners
      this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchTab(tab.dataset.tab);
        });
        
        // Add keyboard support
        tab.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.switchTab(tab.dataset.tab);
          }
        });
      });
    }

    switchTab(targetTab) {
      if (!targetTab || targetTab === this.activeTab) return;
      
      // Save quiz answers before switching (only for main results tabs)
      if (!this.isHistoryPanel && this.activeTab === 'quizTab') {
        this.saveQuizAnswers();
      }
      
      // Update tab buttons within this specific tab bar
      this.tabs.forEach(tab => {
        const isActive = tab.dataset.tab === targetTab;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive);
      });
      
      // Update tab content - scope to the container context
      const container = this.isHistoryPanel ? 
        document.querySelector('#historyPanel') : 
        document.querySelector('.results-container');
      
      if (container) {
        const tabContents = container.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
          const isVisible = content.id === targetTab;
          content.classList.toggle('hidden', !isVisible);
        });
      }
      
      // Update active tab state
      const prevTab = this.activeTab;
      this.activeTab = targetTab;
      
      // Handle specific functionality based on context
      if (this.isHistoryPanel) {
        this.handleHistoryTabSwitch(targetTab);
      } else {
        currentActiveTab = targetTab;
        // Restore quiz answers if switching to quiz tab
        if (targetTab === 'quizTab') {
          this.restoreQuizAnswers();
        }
        // Update quiz tab badge
        this.updateQuizTabBadge();
      }
      
      console.log(`${this.isHistoryPanel ? 'History' : 'Results'} tab switched from ${prevTab} to ${targetTab}`);
    }

    handleHistoryTabSwitch(targetTab) {
      // History-specific tab switching logic
      if (targetTab === 'quizTab' && authToken) {
        loadQuizHistory();
      } else if (targetTab === 'resultsTab' && authToken) {
        // Results tab is loaded when history panel opens, but we can refresh if needed
      }
    }

    saveQuizAnswers() {
      const mcqItems = document.querySelectorAll('.mcq-item');
      mcqItems.forEach((item, index) => {
        const selectedOption = item.querySelector('input[type="radio"]:checked');
        if (selectedOption) {
          quizAnswers.set(index, selectedOption.value);
        }
      });
    }

    restoreQuizAnswers() {
      const mcqItems = document.querySelectorAll('.mcq-item');
      mcqItems.forEach((item, index) => {
        if (quizAnswers.has(index)) {
          const savedAnswer = quizAnswers.get(index);
          const targetOption = item.querySelector(`input[value="${savedAnswer}"]`);
          if (targetOption) {
            targetOption.checked = true;
            targetOption.closest('.mcq-option-label').classList.add('selected');
          }
        }
      });
    }

    updateQuizTabBadge() {
      if (this.isHistoryPanel || !quizTabBadge || currentMCQs.length === 0) return;
      
      const answeredCount = quizAnswers.size;
      const totalCount = currentMCQs.length;
      
      if (quizSubmitted && scoreValue && scoreTotal) {
        // Show actual score if submitted
        const score = scoreValue.textContent;
        const total = scoreTotal.textContent;
        quizTabBadge.textContent = `${score}/${total}`;
        quizTabBadge.classList.remove('hidden');
      } else if (answeredCount > 0) {
        // Show progress if answering
        quizTabBadge.textContent = `${answeredCount}/${totalCount}`;
        quizTabBadge.classList.remove('hidden');
      } else {
        // Hide badge if no progress
        quizTabBadge.classList.add('hidden');
      }
    }

    resetQuizState() {
      if (this.isHistoryPanel) return; // Only reset for main results tabs
      
      quizAnswers.clear();
      quizSubmitted = false;
      this.updateQuizTabBadge();
    }

    getActiveTab() {
      return this.activeTab;
    }
  }

  // ── Element refs ───────────────────────────────────────────────────────────
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const filePreview = document.getElementById("filePreview");
  const fileNameEl = document.getElementById("fileName");
  const fileSizeEl = document.getElementById("fileSize");
  const removeFileBtn = document.getElementById("removeFileBtn");
  const btnSummary = document.getElementById("btnSummary");
  const btnMCQs = document.getElementById("btnMCQs");
  const errorBanner = document.getElementById("errorBanner");
  const errorMessage = document.getElementById("errorMessage");
  const closeAlertBtn = document.getElementById("closeAlertBtn");
  const loadingCard = document.getElementById("loadingCard");
  const loadingTitle = document.getElementById("loadingTitle");
  const loadingDesc = document.getElementById("loadingDesc");
  const resultsContainer = document.getElementById("resultsContainer");
  const summaryCard = document.getElementById("summaryCard");
  const summaryContent = document.getElementById("summaryContent");
  const keyPointsList = document.getElementById("keyPointsList");
  const copySummaryBtn = document.getElementById("copySummaryBtn");
  const mcqCard = document.getElementById("mcqCard");
  const mcqList = document.getElementById("mcqList");
  const btnSubmitQuiz = document.getElementById("btnSubmitQuiz");
  const btnResetQuiz = document.getElementById("btnResetQuiz");
  const quizScoreBadge = document.getElementById("quizScoreBadge");
  const scoreValue = document.getElementById("scoreValue");
  const scoreTotal = document.getElementById("scoreTotal");
  const backendStatus = document.getElementById("backendStatus");
  const guestNote = document.getElementById("guestNote");

  // Auth elements
  const authButtons = document.getElementById("authButtons");
  const userMenu = document.getElementById("userMenu");
  const userEmail = document.getElementById("userEmail");
  const btnShowSignIn = document.getElementById("btnShowSignIn");
  const btnShowSignUp = document.getElementById("btnShowSignUp");
  const btnSignOut = document.getElementById("btnSignOut");
  const btnHistory = document.getElementById("btnHistory");
  const authModal = document.getElementById("authModal");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const signInError = document.getElementById("signInError");
  const signUpError = document.getElementById("signUpError");
  const switchToSignUp = document.getElementById("switchToSignUp");
  const switchToSignIn = document.getElementById("switchToSignIn");
  const btnSignIn = document.getElementById("btnSignIn");
  const btnSignUp = document.getElementById("btnSignUp");
  const signInPrompt = document.getElementById("signInPrompt");

  // History elements
  const historyPanel = document.getElementById("historyPanel");
  const closeHistory = document.getElementById("closeHistory");
  const historyList = document.getElementById("historyList");
  const quizHistoryList = document.getElementById("quizHistoryList");
  const tabBtns = document.querySelectorAll(".tab-btn");

  // Results tab elements
  const resultsTabBar = document.getElementById("resultsTabBar");
  const summaryTabBtn = document.getElementById("summaryTabBtn");
  const quizTabBtn = document.getElementById("quizTabBtn");
  const quizTabBadge = document.getElementById("quizTabBadge");
  const summaryTab = document.getElementById("summaryTab");
  const quizTab = document.getElementById("quizTab");

  // History tab elements
  const historyTabBar = document.getElementById("historyTabBar");
  const historyResultsTabBtn = document.getElementById("historyResultsTabBtn");
  const historyQuizTabBtn = document.getElementById("historyQuizTabBtn");

  // ── Health check ───────────────────────────────────────────────────────────
  async function checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      backendStatus.textContent = res.ok ? "Backend Connected" : "Backend Offline";
    } catch {
      backendStatus.textContent = "Backend Offline";
    }
  }
  checkHealth();

  // ── Initialize TabManager ──────────────────────────────────────────────────
  let resultsTabManager;
  let historyTabManager;
  
  // Initialize tab managers after DOM is ready
  function initTabManagers() {
    resultsTabManager = new TabManager('#resultsTabBar');
    historyTabManager = new TabManager('#historyTabBar');
  }
  
  // Call initialization
  initTabManagers();

  // ── Auth UI state ──────────────────────────────────────────────────────────
  function updateAuthUI() {
    if (authToken && currentUser) {
      authButtons.classList.add("hidden");
      userMenu.classList.remove("hidden");
      userEmail.textContent = currentUser.email;
      guestNote.classList.add("hidden");
    } else {
      authButtons.classList.remove("hidden");
      userMenu.classList.add("hidden");
      if (currentFile) guestNote.classList.remove("hidden");
    }
  }
  updateAuthUI();

  // ── Auth modal ─────────────────────────────────────────────────────────────
  function openAuthModal(mode = "signin") {
    authModal.classList.remove("hidden");
    if (mode === "signup") {
      signInForm.classList.add("hidden");
      signUpForm.classList.remove("hidden");
    } else {
      signUpForm.classList.add("hidden");
      signInForm.classList.remove("hidden");
    }
  }

  btnShowSignIn.addEventListener("click", () => openAuthModal("signin"));
  btnShowSignUp.addEventListener("click", () => openAuthModal("signup"));
  signInPrompt.addEventListener("click", () => openAuthModal("signin"));
  closeAuthModal.addEventListener("click", () => authModal.classList.add("hidden"));
  authModal.addEventListener("click", (e) => { if (e.target === authModal) authModal.classList.add("hidden"); });
  switchToSignUp.addEventListener("click", () => { signInForm.classList.add("hidden"); signUpForm.classList.remove("hidden"); });
  switchToSignIn.addEventListener("click", () => { signUpForm.classList.add("hidden"); signInForm.classList.remove("hidden"); });

  // Sign In
  btnSignIn.addEventListener("click", async () => {
    const email = document.getElementById("signInEmail").value.trim();
    const password = document.getElementById("signInPassword").value;
    signInError.classList.add("hidden");
    btnSignIn.textContent = "Signing in...";
    try {
      const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign in failed");
      authToken = data.access_token;
      currentUser = { email: data.email, id: data.user_id };
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(currentUser));
      authModal.classList.add("hidden");
      updateAuthUI();
    } catch (err) {
      signInError.textContent = err.message;
      signInError.classList.remove("hidden");
    } finally {
      btnSignIn.textContent = "Sign In";
    }
  });

  // Sign Up
  btnSignUp.addEventListener("click", async () => {
    const full_name = document.getElementById("signUpName").value.trim();
    const email = document.getElementById("signUpEmail").value.trim();
    const password = document.getElementById("signUpPassword").value;
    signUpError.classList.add("hidden");
    btnSignUp.textContent = "Creating account...";
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Sign up failed");

      if (data.confirmation_required) {
        signUpError.textContent = `Account created. Please check ${data.email} to confirm your email before signing in.`;
        signUpError.classList.remove("hidden");
        return;
      }

      authToken = data.access_token;
      currentUser = { email: data.email, id: data.user_id };
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(currentUser));
      authModal.classList.add("hidden");
      updateAuthUI();
    } catch (err) {
      signUpError.textContent = err.message;
      signUpError.classList.remove("hidden");
    } finally {
      btnSignUp.textContent = "Create Account";
    }
  });

  // Sign Out
  btnSignOut.addEventListener("click", () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    updateAuthUI();
  });

  // ── History panel ──────────────────────────────────────────────────────────
  btnHistory.addEventListener("click", async () => {
    historyPanel.classList.remove("hidden");
    loadHistory();
    loadStats();
  });
  closeHistory.addEventListener("click", () => historyPanel.classList.add("hidden"));
  historyPanel.addEventListener("click", (e) => { if (e.target === historyPanel) historyPanel.classList.add("hidden"); });

  // Legacy tab handling is now managed by TabManager classes
  // This section is kept for any additional history-specific functionality
  historyResultsTabBtn?.addEventListener("click", () => {
    // Additional logic for results tab if needed
    if (authToken) {
      loadHistory();
    }
  });
  
  historyQuizTabBtn?.addEventListener("click", () => {
    // Additional logic for quiz history tab if needed  
    if (authToken) {
      loadQuizHistory();
    }
  });

  async function loadStats() {
    try {
      const res = await fetch(`${API_BASE}/api/stats`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      document.getElementById("statDocs").textContent = data.documents_count;
      document.getElementById("statResults").textContent = data.results_count;
      document.getElementById("statQuizzes").textContent = data.quiz_attempts_count;
      document.getElementById("statScore").textContent = data.average_score_pct + "%";
    } catch {}
  }

  async function loadHistory() {
    historyList.innerHTML = "<p class='text-muted'>Loading...</p>";
    try {
      const res = await fetch(`${API_BASE}/api/history/results`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!data.length) { historyList.innerHTML = "<p class='text-muted'>No results yet. Upload a PDF to get started.</p>"; return; }
      historyList.innerHTML = data.map(r => `
        <div class="history-item" data-id="${r.id}" data-action="${r.action}">
          <div class="history-meta">
            <span class="pill ${r.action === 'summary' ? 'pill-cyan' : 'pill-purple'}">${r.action === 'summary' ? 'Summary' : 'MCQs'}</span>
            <span class="history-filename">${r.documents?.filename || 'Unknown file'}</span>
          </div>
          <span class="history-date">${new Date(r.created_at).toLocaleDateString()}</span>
          <button class="btn btn-ghost btn-sm load-result-btn" data-id="${r.id}" data-action="${r.action}">Load</button>
        </div>
      `).join("");

      historyList.querySelectorAll(".load-result-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const resultId = btn.dataset.id;
          const action = btn.dataset.action;
          const res2 = await fetch(`${API_BASE}/api/history/results/${resultId}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          });
          const result = await res2.json();
          historyPanel.classList.add("hidden");
          resultsContainer.classList.remove("hidden");
          currentResultId = resultId;
          if (action === "summary") {
            renderSummary(result);
          } else {
            renderMCQs(result);
          }
        });
      });
    } catch {
      historyList.innerHTML = "<p class='text-muted'>Failed to load history.</p>";
    }
  }

  async function loadQuizHistory() {
    quizHistoryList.innerHTML = "<p class='text-muted'>Loading...</p>";
    try {
      const res = await fetch(`${API_BASE}/api/history/quiz`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (!data.length) { quizHistoryList.innerHTML = "<p class='text-muted'>No quiz attempts yet.</p>"; return; }
      quizHistoryList.innerHTML = data.map(a => `
        <div class="history-item">
          <div class="history-meta">
            <span class="history-filename">${a.results?.documents?.filename || 'Unknown file'}</span>
          </div>
          <div class="quiz-score-inline">
            <span class="score-num">${a.score}/${a.total}</span>
            <span class="score-pct">${Math.round((a.score/a.total)*100)}%</span>
          </div>
          <span class="history-date">${new Date(a.attempted_at).toLocaleDateString()}</span>
        </div>
      `).join("");
    } catch {
      quizHistoryList.innerHTML = "<p class='text-muted'>Failed to load quiz history.</p>";
    }
  }

  // ── File handling ──────────────────────────────────────────────────────────
  browseBtn.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("click", (e) => { if (e.target !== browseBtn) fileInput.click(); });

  ["dragenter", "dragover"].forEach(e => dropZone.addEventListener(e, (ev) => { ev.preventDefault(); dropZone.classList.add("dragover"); }));
  ["dragleave", "drop"].forEach(e => dropZone.addEventListener(e, (ev) => { ev.preventDefault(); dropZone.classList.remove("dragover"); }));
  dropZone.addEventListener("drop", (e) => { if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener("change", (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      showError("Please select a valid PDF file."); return;
    }
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatBytes(file.size);
    dropZone.classList.add("hidden");
    filePreview.classList.remove("hidden");
    btnSummary.disabled = false;
    btnMCQs.disabled = false;
    hideError();
    if (!authToken) guestNote.classList.remove("hidden");
  }

  removeFileBtn.addEventListener("click", () => {
    currentFile = null;
    fileInput.value = "";
    filePreview.classList.add("hidden");
    dropZone.classList.remove("hidden");
    btnSummary.disabled = true;
    btnMCQs.disabled = true;
    guestNote.classList.add("hidden");
    
    // Reset tab state when file is removed
    if (resultsTabManager) {
      resultsTabManager.resetQuizState();
      resultsTabManager.switchTab('summaryTab'); // Default to summary tab
    }
  });

  closeAlertBtn.addEventListener("click", hideError);
  function showError(msg) { errorMessage.textContent = msg; errorBanner.classList.remove("hidden"); }
  function hideError() { errorBanner.classList.add("hidden"); }

  function setLoading(isLoading, action = "summary") {
    if (isLoading) {
      hideError();
      btnSummary.disabled = true;
      btnMCQs.disabled = true;
      loadingCard.classList.remove("hidden");
      loadingTitle.textContent = action === "summary"
        ? "Azure Foundry Agent is generating your summary..."
        : "Azure Foundry Agent is crafting MCQs...";
      loadingDesc.textContent = action === "summary"
        ? "Scanning concepts, formulas, and definitions."
        : "Synthesizing challenging questions with explanations.";
    } else {
      btnSummary.disabled = !currentFile;
      btnMCQs.disabled = !currentFile;
      loadingCard.classList.add("hidden");
    }
  }

  // ── Study actions ──────────────────────────────────────────────────────────
  btnSummary.addEventListener("click", () => triggerStudyAction("summary"));
  btnMCQs.addEventListener("click", () => triggerStudyAction("mcqs"));

  async function triggerStudyAction(action) {
    if (!currentFile) return;
    setLoading(true, action);
    
    // Reset tab state when processing new content
    if (resultsTabManager) {
      resultsTabManager.resetQuizState();
    }
    
    const formData = new FormData();
    formData.append("file", currentFile);
    formData.append("action", action);

    try {
      const headers = {};
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

      const response = await fetch(`${API_BASE}/api/study`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error (${response.status})`);
      }
      const data = await response.json();
      currentResultId = data.result_id || null;
      resultsContainer.classList.remove("hidden");
      
      if (action === "summary") {
        renderSummary(data);
        // Switch to summary tab automatically when summary is generated
        if (resultsTabManager) {
          resultsTabManager.switchTab('summaryTab');
        }
      } else {
        renderMCQs(data);
        // Switch to quiz tab automatically when MCQs are generated
        if (resultsTabManager) {
          resultsTabManager.switchTab('quizTab');
        }
      }
    } catch (err) {
      showError(err.message || "Failed to process the document.");
    } finally {
      setLoading(false, action);
    }
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatInlineMarkdown(str) {
    if (!str) return "";
    let safe = escapeHtml(str);
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong class="overview-bold">$1</strong>');
    safe = safe.replace(/\*(.*?)\*/g, '<em class="overview-italic">$1</em>');
    safe = safe.replace(/`([^`]+)`/g, '<code class="overview-code">$1</code>');
    return safe;
  }

  function renderIntroductoryOverview(container, data) {
    const overviewBlock = document.createElement("div");
    overviewBlock.className = "summary-overview";

    const blocks = data.overview_blocks;
    if (Array.isArray(blocks) && blocks.length > 0) {
      blocks.forEach(block => {
        const cardEl = document.createElement("div");
        cardEl.className = "summary-overview-card";

        if (block.heading) {
          const hEl = document.createElement("h4");
          hEl.className = "summary-overview-heading";
          hEl.innerHTML = `<span class="overview-heading-pill"></span><span>${escapeHtml(block.heading)}</span>`;
          cardEl.appendChild(hEl);
        }

        if (block.content && block.content.trim()) {
          block.content.split(/\n{2,}/).forEach(para => {
            if (!para.trim()) return;
            const p = document.createElement("p");
            p.className = "summary-overview-p";
            p.innerHTML = formatInlineMarkdown(para.trim());
            cardEl.appendChild(p);
          });
        }

        if (Array.isArray(block.bullet_points) && block.bullet_points.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "summary-overview-bullets";
          block.bullet_points.forEach(bullet => {
            if (!bullet.trim()) return;
            const li = document.createElement("li");
            li.className = "summary-overview-bullet-item";
            li.innerHTML = `<span class="overview-bullet-dot"></span><span class="overview-bullet-text">${formatInlineMarkdown(bullet)}</span>`;
            ul.appendChild(li);
          });
          cardEl.appendChild(ul);
        }

        if (Array.isArray(block.numbered_points) && block.numbered_points.length > 0) {
          const ol = document.createElement("ol");
          ol.className = "summary-overview-numbered";
          block.numbered_points.forEach((item, idx) => {
            if (!item.trim()) return;
            const li = document.createElement("li");
            li.className = "summary-overview-numbered-item";
            li.innerHTML = `<span class="overview-num-badge">${idx + 1}</span><span class="overview-numbered-text">${formatInlineMarkdown(item)}</span>`;
            ol.appendChild(li);
          });
          cardEl.appendChild(ol);
        }

        overviewBlock.appendChild(cardEl);
      });
    } else {
      const rawText = data.summary || "No summary was generated.";
      const rawLines = rawText.split(/\r?\n/);
      let currentCard = document.createElement("div");
      currentCard.className = "summary-overview-card";
      let currentUl = null;
      let currentOl = null;

      rawLines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          currentUl = null;
          currentOl = null;
          return;
        }

        const headingMatch = trimmed.match(/^#{2,4}\s+(.*)/);
        if (headingMatch) {
          if (currentCard.children.length > 0) {
            overviewBlock.appendChild(currentCard);
            currentCard = document.createElement("div");
            currentCard.className = "summary-overview-card";
          }
          const hEl = document.createElement("h4");
          hEl.className = "summary-overview-heading";
          hEl.innerHTML = `<span class="overview-heading-pill"></span><span>${escapeHtml(headingMatch[1])}</span>`;
          currentCard.appendChild(hEl);
          currentUl = null;
          currentOl = null;
          return;
        }

        const bulletMatch = trimmed.match(/^[\u2022\u25cf\-\*]\s+(.*)/);
        if (bulletMatch) {
          if (!currentUl) {
            currentUl = document.createElement("ul");
            currentUl.className = "summary-overview-bullets";
            currentCard.appendChild(currentUl);
          }
          const li = document.createElement("li");
          li.className = "summary-overview-bullet-item";
          li.innerHTML = `<span class="overview-bullet-dot"></span><span class="overview-bullet-text">${formatInlineMarkdown(bulletMatch[1])}</span>`;
          currentUl.appendChild(li);
          currentOl = null;
          return;
        }

        const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
        if (numMatch) {
          if (!currentOl) {
            currentOl = document.createElement("ol");
            currentOl.className = "summary-overview-numbered";
            currentCard.appendChild(currentOl);
          }
          const li = document.createElement("li");
          li.className = "summary-overview-numbered-item";
          li.innerHTML = `<span class="overview-num-badge">${numMatch[1]}</span><span class="overview-numbered-text">${formatInlineMarkdown(numMatch[2])}</span>`;
          currentOl.appendChild(li);
          currentUl = null;
          return;
        }

        const p = document.createElement("p");
        p.className = "summary-overview-p";
        p.innerHTML = formatInlineMarkdown(trimmed);
        currentCard.appendChild(p);
        currentUl = null;
        currentOl = null;
      });

      if (currentCard.children.length > 0) {
        overviewBlock.appendChild(currentCard);
      }
    }

    container.appendChild(overviewBlock);
  }

  // ── Render summary ─────────────────────────────────────────────────────────
  function renderSummary(data) {
    summaryContent.innerHTML = "";

    // ── 1. Introductory Structured Overview ────────────────────────────────
    renderIntroductoryOverview(summaryContent, data);

    // ── 2. Detailed Sections ───────────────────────────────────────────────
    const sections = data.sections || [];
    if (sections.length > 0) {
      const sectionsWrap = document.createElement("div");
      sectionsWrap.className = "summary-sections";
      const sectLabel = document.createElement("h4");
      sectLabel.className = "summary-section-group-label";
      sectLabel.textContent = "Detailed Breakdown";
      sectionsWrap.appendChild(sectLabel);
      sections.forEach(sec => {
        const secEl = document.createElement("div");
        secEl.className = "summary-section";
        const titleEl = document.createElement("div");
        titleEl.className = "summary-section-title";
        titleEl.innerHTML = `<span class="section-dot"></span>${sec.title || "Section"}`;
        const bodyEl = document.createElement("p");
        bodyEl.className = "summary-section-body";
        bodyEl.textContent = sec.content || "";
        secEl.appendChild(titleEl);
        secEl.appendChild(bodyEl);
        sectionsWrap.appendChild(secEl);
      });
      summaryContent.appendChild(sectionsWrap);
    }

    // ── 3. Key Points ──────────────────────────────────────────────────────
    keyPointsList.innerHTML = "";
    const kps = data.key_points || [];
    if (kps.length > 0) {
      kps.forEach((p, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<span class="kp-badge">${i + 1}</span><span>${p}</span>`;
        keyPointsList.appendChild(li);
      });
      keyPointsList.parentElement.classList.remove("hidden");
    } else {
      keyPointsList.parentElement.classList.add("hidden");
    }

    // ── 4. Key Terms Glossary ──────────────────────────────────────────────
    const existingGlossary = summaryContent.parentElement.querySelector(".key-terms-section");
    if (existingGlossary) existingGlossary.remove();

    const keyTerms = data.key_terms || [];
    if (keyTerms.length > 0) {
      const glossarySection = document.createElement("div");
      glossarySection.className = "key-terms-section";
      const glossLabel = document.createElement("h4");
      glossLabel.className = "key-points-heading";
      glossLabel.textContent = "Key Terms Glossary";
      glossarySection.appendChild(glossLabel);
      const grid = document.createElement("div");
      grid.className = "key-terms-grid";
      keyTerms.forEach(kt => {
        const card = document.createElement("div");
        card.className = "key-term-card";
        const chip = document.createElement("div");
        chip.className = "term-chip";
        chip.textContent = kt.term || "";
        const def = document.createElement("p");
        def.className = "term-def";
        def.textContent = kt.definition || "";
        card.appendChild(chip);
        card.appendChild(def);
        grid.appendChild(card);
      });
      glossarySection.appendChild(grid);
      summaryCard.querySelector(".key-points-section").after(glossarySection);
    }

    // ── 5. Study Tips ──────────────────────────────────────────────────────
    const existingTips = summaryContent.parentElement.querySelector(".study-tips-section");
    if (existingTips) existingTips.remove();

    const tips = data.study_tips || [];
    if (tips.length > 0) {
      const tipsSection = document.createElement("div");
      tipsSection.className = "study-tips-section";
      const tipsLabel = document.createElement("h4");
      tipsLabel.className = "key-points-heading study-tips-heading";
      tipsLabel.innerHTML = "<span>💡</span> Study Tips";
      tipsSection.appendChild(tipsLabel);
      const tipsList = document.createElement("ul");
      tipsList.className = "study-tips-list";
      tips.forEach(tip => {
        const li = document.createElement("li");
        li.className = "study-tip-item";
        li.textContent = tip;
        tipsList.appendChild(li);
      });
      tipsSection.appendChild(tipsList);
      // Append after glossary if present, otherwise after key-points
      const afterEl = summaryCard.querySelector(".key-terms-section") ||
                      summaryCard.querySelector(".key-points-section");
      if (afterEl) afterEl.after(tipsSection);
      else summaryCard.appendChild(tipsSection);
    }

    summaryCard.classList.remove("hidden");
    summaryCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  copySummaryBtn.addEventListener("click", () => {
    let text = "=== SUMMARY ===\n" + (summaryContent.querySelector(".summary-overview")?.innerText || "") + "\n\n";

    summaryContent.querySelectorAll(".summary-section").forEach(s => {
      const title = s.querySelector(".summary-section-title")?.innerText || "";
      const body = s.querySelector(".summary-section-body")?.innerText || "";
      text += `--- ${title} ---\n${body}\n\n`;
    });

    text += "=== KEY POINTS ===\n";
    keyPointsList.querySelectorAll("li").forEach(li => { text += `• ${li.querySelector("span:last-child")?.textContent}\n`; });

    const glossaryCards = summaryCard.querySelectorAll(".key-term-card");
    if (glossaryCards.length) {
      text += "\n=== KEY TERMS ===\n";
      glossaryCards.forEach(c => {
        text += `${c.querySelector(".term-chip")?.textContent}: ${c.querySelector(".term-def")?.textContent}\n`;
      });
    }

    const tipItems = summaryCard.querySelectorAll(".study-tip-item");
    if (tipItems.length) {
      text += "\n=== STUDY TIPS ===\n";
      tipItems.forEach(t => { text += `• ${t.textContent}\n`; });
    }

    navigator.clipboard.writeText(text).then(() => {
      const orig = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = "<span>Copied!</span>";
      setTimeout(() => (copySummaryBtn.innerHTML = orig), 2000);
    });
  });

  // ── Render MCQs ────────────────────────────────────────────────────────────
  function renderMCQs(data) {
    currentMCQs = data.mcqs || [];
    mcqList.innerHTML = "";
    quizScoreBadge.classList.add("hidden");
    btnResetQuiz.classList.add("hidden");
    btnSubmitQuiz.classList.remove("hidden");
    btnSubmitQuiz.disabled = false;
    
    // Reset button text and style
    btnSubmitQuiz.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Check Answers
    `;
    
    // Reset quiz state when rendering new MCQs
    if (resultsTabManager) {
      resultsTabManager.resetQuizState();
    }

    if (!currentMCQs.length) {
      mcqList.innerHTML = "<p class='text-muted'>No questions returned.</p>";
      mcqCard.classList.remove("hidden");
      return;
    }

    // Add quiz header with progress info
    const quizHeader = document.createElement("div");
    quizHeader.className = "quiz-header";
    quizHeader.innerHTML = `
      <div style="background: rgba(0,255,100,0.04); border: 1px solid var(--border); border-radius: var(--r-md); padding: 14px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="font-family: var(--font-heading); font-size: 0.95rem; font-weight: 600; color: var(--text-primary);">
            📝 Practice Quiz
          </span>
          <span id="quiz-progress-indicator" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">
            0/${currentMCQs.length} answered
          </span>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
          Answer all questions, then click "Check Answers" to see your results and explanations.
        </div>
      </div>
    `;
    mcqList.appendChild(quizHeader);

    currentMCQs.forEach((item, index) => {
      const itemEl = document.createElement("div");
      itemEl.className = "mcq-item";
      itemEl.dataset.index = index;

      const qTitle = document.createElement("div");
      qTitle.className = "mcq-question";
      qTitle.innerHTML = `
        <span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 0.8rem; margin-right: 8px;">
          Q${index + 1}
        </span>
        ${item.question}
      `;
      itemEl.appendChild(qTitle);

      const optGroup = document.createElement("div");
      optGroup.className = "mcq-options";

      item.options.forEach(opt => {
        const label = document.createElement("label");
        label.className = "mcq-option-label";
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `q_${index}`;
        radio.value = opt;
        radio.addEventListener("change", () => {
          optGroup.querySelectorAll(".mcq-option-label").forEach(l => l.classList.remove("selected"));
          label.classList.add("selected");
          
          // Update quiz answers state and tab badge
          quizAnswers.set(index, opt);
          if (resultsTabManager) {
            resultsTabManager.updateQuizTabBadge();
          }
          
          // Update progress indicator
          updateQuizProgressIndicator();
        });
        const span = document.createElement("span");
        span.textContent = opt;
        label.appendChild(radio);
        label.appendChild(span);
        optGroup.appendChild(label);
      });

      itemEl.appendChild(optGroup);
      const expDiv = document.createElement("div");
      expDiv.className = "mcq-explanation hidden";
      expDiv.textContent = `💡 ${item.explanation}`;
      itemEl.appendChild(expDiv);
      mcqList.appendChild(itemEl);
    });

    mcqCard.classList.remove("hidden");
    
    // Restore saved answers if any exist
    if (resultsTabManager && quizAnswers.size > 0) {
      resultsTabManager.restoreQuizAnswers();
      updateQuizProgressIndicator();
    }
    
    // Only scroll if we're currently on the quiz tab
    if (currentActiveTab === 'quizTab') {
      mcqCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // Helper function to update quiz progress indicator
  function updateQuizProgressIndicator() {
    const progressIndicator = document.getElementById('quiz-progress-indicator');
    if (progressIndicator) {
      const answeredCount = quizAnswers.size;
      const totalCount = currentMCQs.length;
      progressIndicator.textContent = `${answeredCount}/${totalCount} answered`;
      
      if (answeredCount === totalCount) {
        progressIndicator.style.color = 'var(--neon)';
        progressIndicator.innerHTML = `✓ All ${totalCount} questions answered`;
      } else {
        progressIndicator.style.color = 'var(--text-muted)';
      }
    }
  }

  // ── Quiz scoring ───────────────────────────────────────────────────────────
  btnSubmitQuiz.addEventListener("click", async () => {
    // Validate that all questions are answered
    const unansweredQuestions = [];
    const unansweredElements = [];
    
    currentMCQs.forEach((item, index) => {
      const itemEl = mcqList.querySelector(`[data-index="${index}"]`);
      const selected = itemEl.querySelector(`input[name="q_${index}"]:checked`);
      if (!selected) {
        unansweredQuestions.push(index + 1);
        unansweredElements.push(itemEl);
      }
    });

    if (unansweredQuestions.length > 0) {
      // Highlight unanswered questions
      unansweredElements.forEach(el => {
        el.style.border = '2px solid var(--red)';
        el.style.borderRadius = 'var(--r-md)';
        el.style.padding = '12px';
        el.style.marginBottom = '8px';
        setTimeout(() => {
          el.style.border = '';
          el.style.padding = '';
          el.style.marginBottom = '';
        }, 3000);
      });
      
      // Scroll to first unanswered question
      unansweredElements[0].scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Show better error message
      showError(`Please answer ${unansweredQuestions.length === 1 ? 'question' : 'questions'} ${unansweredQuestions.join(', ')} before submitting.`);
      return;
    }

    // Show submission confirmation with loading state
    btnSubmitQuiz.disabled = true;
    btnSubmitQuiz.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
      Checking Answers...
    `;

    let score = 0;
    const answers = [];

    // Process each question with visual feedback
    currentMCQs.forEach((item, index) => {
      const itemEl = mcqList.querySelector(`[data-index="${index}"]`);
      const selected = itemEl.querySelector(`input[name="q_${index}"]:checked`);
      itemEl.querySelector(".mcq-explanation").classList.remove("hidden");

      // Mark correct answers
      itemEl.querySelectorAll(".mcq-option-label").forEach(opt => {
        if (opt.querySelector("input").value === item.correct_answer) {
          opt.classList.add("correct");
        }
      });

      const isCorrect = selected && selected.value === item.correct_answer;
      if (isCorrect) {
        score++;
      } else if (selected) {
        selected.parentElement.classList.add("incorrect");
      }

      answers.push({ 
        question: item.question, 
        selected: selected?.value || null, 
        correct: item.correct_answer, 
        is_correct: isCorrect 
      });
    });

    // Update score display with animation
    scoreValue.textContent = score;
    scoreTotal.textContent = currentMCQs.length;
    quizScoreBadge.classList.remove("hidden");
    
    // Add score-based styling
    const percentage = (score / currentMCQs.length) * 100;
    if (percentage >= 80) {
      quizScoreBadge.style.background = 'rgba(0,255,120,0.15)';
      quizScoreBadge.style.color = 'var(--neon)';
      quizScoreBadge.style.borderColor = 'var(--neon)';
    } else if (percentage >= 60) {
      quizScoreBadge.style.background = 'var(--amber-dim)';
      quizScoreBadge.style.color = 'var(--amber)';
      quizScoreBadge.style.borderColor = 'rgba(255,183,0,0.3)';
    } else {
      quizScoreBadge.style.background = 'var(--red-dim)';
      quizScoreBadge.style.color = 'var(--red)';
      quizScoreBadge.style.borderColor = 'rgba(255,77,109,0.3)';
    }
    
    btnSubmitQuiz.classList.add("hidden");
    btnResetQuiz.classList.remove("hidden");
    
    // Mark quiz as submitted and update tab badge
    quizSubmitted = true;
    if (resultsTabManager) {
      resultsTabManager.updateQuizTabBadge();
    }

    // Show completion message
    const completionMessage = document.createElement('div');
    completionMessage.className = 'quiz-completion-message';
    completionMessage.innerHTML = `
      <div style="background: rgba(0,255,100,0.08); border: 1px solid var(--border); border-radius: var(--r-md); padding: 16px; margin: 16px 0; text-align: center;">
        <div style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 4px;">
          🎉 Quiz Complete!
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.9rem; color: var(--text-secondary);">
          Score: ${score}/${currentMCQs.length} (${Math.round(percentage)}%)
          ${percentage >= 80 ? ' - Excellent work!' : percentage >= 60 ? ' - Good job!' : ' - Keep practicing!'}
        </div>
      </div>
    `;
    
    mcqList.insertBefore(completionMessage, mcqList.firstChild);
    
    // Scroll to show completion message
    completionMessage.scrollIntoView({ behavior: "smooth", block: "center" });

    // Save attempt if authenticated and we have a result_id
    if (authToken && currentResultId) {
      try {
        await fetch(`${API_BASE}/api/history/quiz`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
          body: JSON.stringify({ result_id: currentResultId, score, total: currentMCQs.length, answers }),
        });
      } catch {}
    }
  });

  btnResetQuiz.addEventListener("click", () => {
    // Show confirmation for reset
    const confirmed = confirm("Are you sure you want to reset the quiz? This will clear all your answers and allow you to retake it.");
    if (!confirmed) return;
    
    // Reset TabManager state
    if (resultsTabManager) {
      resultsTabManager.resetQuizState();
    }
    
    // Remove completion message
    const completionMessage = document.querySelector('.quiz-completion-message');
    if (completionMessage) {
      completionMessage.remove();
    }
    
    // Reset score badge styling
    quizScoreBadge.style.background = '';
    quizScoreBadge.style.color = '';
    quizScoreBadge.style.borderColor = '';
    
    // Re-render the quiz
    renderMCQs({ mcqs: currentMCQs });
    
    // Show reset notification
    const resetMessage = document.createElement('div');
    resetMessage.innerHTML = `
      <div style="background: rgba(0,229,204,0.08); border: 1px solid var(--border); border-radius: var(--r-md); padding: 12px; margin: 16px 0; text-align: center; color: var(--teal);">
        ✨ Quiz reset! You can now retake all questions.
      </div>
    `;
    mcqList.insertBefore(resetMessage, mcqList.firstChild);
    
    // Remove reset message after 3 seconds
    setTimeout(() => {
      if (resetMessage && resetMessage.parentNode) {
        resetMessage.remove();
      }
    }, 3000);
  });
});

// ── Neural Canvas Background ──────────────────────────────────────────────
(function initNeuralCanvas() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let W, H, nodes, animId;

  const NODE_COUNT   = 55;
  const MAX_DIST     = 160;
  const NODE_COLOR   = "rgba(0,255,100,";
  const LINE_COLOR   = "rgba(0,255,100,";
  const PULSE_COLOR  = "rgba(0,229,204,";

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeNode() {
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - 0.5) * 0.45,
      vy:   (Math.random() - 0.5) * 0.45,
      r:    Math.random() * 1.8 + 0.8,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.025 + 0.01,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = LINE_COLOR + alpha + ")";
          ctx.lineWidth = 0.7;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();

          // Data pulse dot travelling along line
          if (Math.random() < 0.001) {
            const t  = (Date.now() % 1200) / 1200;
            const px = nodes[i].x + (nodes[j].x - nodes[i].x) * t;
            const py = nodes[i].y + (nodes[j].y - nodes[i].y) * t;
            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = PULSE_COLOR + "0.9)";
            ctx.fill();
          }
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const glow = (Math.sin(n.pulse) + 1) / 2;
      const alpha = 0.35 + glow * 0.55;
      const r     = n.r + glow * 1.2;

      // Outer glow ring
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3.5);
      grad.addColorStop(0, NODE_COLOR + (alpha * 0.5) + ")");
      grad.addColorStop(1, NODE_COLOR + "0)");
      ctx.beginPath();
      ctx.arc(n.x, n.y, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = NODE_COLOR + alpha + ")";
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(animId);
    init();
    draw();
  });
})();
