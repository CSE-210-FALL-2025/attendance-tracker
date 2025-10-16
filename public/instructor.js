// Google Sheets Integration
class GoogleSheetsIntegration {
  constructor() {
    this.apiKey = null;
    this.sheetId = null;
    this.config = null;
    this.loadConfig();
  }
  async loadConfig() {
    try {
      const response = await fetch("/api/config");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to load configuration");
      }
      this.config = data;
      this.apiKey = this.config.googleSheets.apiKey;
    } catch (e) {
      console.error("Error loading configuration:", e);
      this.apiKey = null;
    }
  }
  extractSheetId(sheetUrl) {
    try {
      const url = new URL(sheetUrl);
      const parts = url.pathname.split("/");
      const idx = parts.indexOf("d");
      if (idx !== -1 && idx + 1 < parts.length) return parts[idx + 1];
      throw new Error("Invalid Google Sheets URL format");
    } catch (e) {
      console.error("Error extracting sheet ID:", e);
      throw new Error("Please provide a valid Google Sheets URL");
    }
  }
  async fetchSheetData(sheetId, range = "A:Z") {
    if (!this.apiKey) await this.loadConfig();
    if (!this.apiKey)
      throw new Error(
        "Google Sheets API key not available. Please check your configuration."
      );
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${this.apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();
    return data.values || [];
  }
  parseAttendanceData(rawData) {
    if (!rawData || rawData.length < 2)
      return { questions: [], totalResponses: 0 };
    const headers = rawData[0];
    const data = rawData.slice(1);
    const questionColumns = headers
      .map((h, i) => {
        if (h && h.toLowerCase().includes("question"))
          return { index: i, title: h, responses: [] };
        return null;
      })
      .filter(Boolean);
    if (questionColumns.length === 0)
      throw new Error("No question columns found.");
    questionColumns.forEach((col) => {
      data.forEach((row) => {
        const r = row[col.index];
        if (r && r.trim()) col.responses.push(r.trim());
      });
    });
    const questions = questionColumns.map((col) => {
      const counts = {};
      col.responses.forEach((r) => {
        counts[r] = (counts[r] || 0) + 1;
      });
      const chartData = Object.keys(counts)
        .map((label) => ({ label, count: counts[label] }))
        .sort((a, b) => b.count - a.count);
      return {
        id: col.title,
        title: col.title,
        responses: chartData,
        totalResponses: col.responses.length,
      };
    });
    return { questions, totalResponses: data.length };
  }
}

class InstructorDashboard {
  constructor() {
    this.formManager = new FormManager();
    this.sheetsIntegration = new GoogleSheetsIntegration();
    this.init();
  }
  init() {
    this.setupEventListeners();
  }
  setupEventListeners() {
    const showResultsBtn = document.getElementById("showResultsBtn");
    const refreshResultsBtn = document.getElementById("refreshResultsBtn");
    const closeResultsBtn = document.getElementById("closeResultsBtn");
    if (showResultsBtn)
      showResultsBtn.addEventListener("click", () => {
        this.showResults();
      });
    if (refreshResultsBtn)
      refreshResultsBtn.addEventListener("click", () => {
        this.refreshResults();
      });
    if (closeResultsBtn)
      closeResultsBtn.addEventListener("click", () => {
        this.hideResults();
      });
  }
  async showResults() {
    const resultsContainer = document.getElementById("resultsContainer");
    if (!resultsContainer) return;
    try {
      resultsContainer.style.display = "block";
      document.getElementById("chartContainer").innerHTML =
        '<div class="loading"></div>';
      const currentForm = this.formManager.getCurrentForm();
      if (!currentForm) throw new Error("No active form selected");
      if (!currentForm.sheetUrl)
        throw new Error("No Google Sheet URL provided for this form.");
      const sheetId = this.sheetsIntegration.extractSheetId(
        currentForm.sheetUrl
      );
      const rawData = await this.sheetsIntegration.fetchSheetData(sheetId);
      const attendanceData =
        this.sheetsIntegration.parseAttendanceData(rawData);
      this.displayTotalCount(attendanceData.totalResponses);
      this.updateResultsData(attendanceData);
      this.showNotification("Results loaded successfully!", "success");
    } catch (e) {
      console.error("Error loading results:", e);
      document.getElementById("chartContainer").innerHTML = `
                <div class="error">
                    <h3>Error Loading Results</h3>
                    <p>${e.message}</p>
                    <button onclick="window.instructorDashboard.showResults()">Retry</button>
                </div>`;
      this.showNotification(e.message, "error");
    }
  }
  async refreshResults() {
    this.showNotification("Refreshing data...", "info");
    await this.showResults();
  }
  hideResults() {
    const c = document.getElementById("resultsContainer");
    if (c) c.style.display = "none";
  }
  displayTotalCount(total) {
    const h = document.querySelector(".results-header h3");
    if (h) h.textContent = `Total Responses: ${total}`;
    const chart = document.getElementById("chartContainer");
    if (chart) {
      chart.innerHTML = `<div class="simple-count-display"><div class="count-value">${total}</div><div class="count-label">Total Responses Received</div></div>`;
    }
  }
  updateResultsData(data) {
    const el = document.getElementById("resultsData");
    if (!el) return;
    el.innerHTML = "";
  }
  showNotification(message, type = "info") {
    const n = document.createElement("div");
    n.className = `notification ${type}`;
    n.textContent = message;
    n.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 1000; animation: slideIn 0.3s ease; background: ${
      type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#667eea"
    }; box-shadow: 0 5px 15px rgba(0,0,0,0.2);`;
    document.body.appendChild(n);
    setTimeout(() => {
      n.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (n.parentNode) n.parentNode.removeChild(n);
      }, 300);
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const a = new InstructorDashboard();
  window.instructorDashboard = a;
});
