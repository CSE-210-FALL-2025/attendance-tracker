// Reuses AntiScreenshotQRGenerator and ChartManager from student.js if needed
class AntiScreenshotQRGenerator {
  constructor() {
    this.size = 300;
    this.refreshInterval = 5000;
    this.countdownInterval = null;
    this.qrRefreshInterval = null;
  }
  async generate(text, patternId = 0) {
    const uniqueText = text;
    try {
      const u = `https://api.qrserver.com/v1/create-qr-code/?size=${
        this.size
      }x${this.size}&data=${encodeURIComponent(uniqueText)}&ecc=M&margin=2`;
      const img = document.createElement("img");
      img.src = u;
      img.alt = "QR Code";
      img.style.border = "3px solid #28a745";
      img.style.borderRadius = "10px";
      img.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
      return new Promise((r, j) => {
        img.onload = () => r(img);
        img.onerror = () => j(new Error("QR Server API failed"));
        setTimeout(() => j(new Error("QR Server API timeout")), 3000);
      });
    } catch {}
    try {
      const u = `https://chart.googleapis.com/chart?chs=${this.size}x${
        this.size
      }&cht=qr&chl=${encodeURIComponent(uniqueText)}&choe=UTF-8`;
      const img = document.createElement("img");
      img.src = u;
      img.alt = "QR Code";
      img.style.border = "3px solid #28a745";
      img.style.borderRadius = "10px";
      img.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
      return new Promise((r, j) => {
        img.onload = () => r(img);
        img.onerror = () => j(new Error("Google Charts API failed"));
        setTimeout(() => j(new Error("Google Charts API timeout")), 3000);
      });
    } catch {}
    return this.createUniquePatternQR(text, patternId);
  }
  createUniquePatternQR(text, patternId) {
    const c = document.createElement("canvas");
    c.width = this.size;
    c.height = this.size;
    const x = c.getContext("2d");
    const h = (patternId * 137.5) % 360;
    x.fillStyle = `hsl(${h}, 20%, 95%)`;
    x.fillRect(0, 0, this.size, this.size);
    const bw = 2 + (patternId % 3);
    x.strokeStyle = "#000000";
    x.lineWidth = bw;
    x.strokeRect(0, 0, this.size, this.size);
    const cs = 60;
    x.fillStyle = "#000000";
    x.fillRect(10, 10, cs, cs);
    x.fillStyle = "#FFFFFF";
    x.fillRect(25, 25, cs / 2, cs / 2);
    x.fillStyle = "#000000";
    x.fillRect(35, 35, cs / 4, cs / 4);
    x.fillStyle = "#FF0000";
    for (let i = 0; i < patternId % 5; i++) {
      x.fillRect(15 + i * 10, 15 + i * 5, 3, 3);
    }
    x.fillStyle = "#000000";
    x.fillRect(this.size - 70, 10, cs, cs);
    x.fillStyle = "#FFFFFF";
    x.fillRect(this.size - 55, 25, cs / 2, cs / 2);
    x.fillStyle = "#000000";
    x.fillRect(this.size - 45, 35, cs / 4, cs / 4);
    x.fillStyle = "#000000";
    x.fillRect(10, this.size - 70, cs, cs);
    x.fillStyle = "#FFFFFF";
    x.fillRect(25, this.size - 55, cs / 2, cs / 2);
    x.fillStyle = "#000000";
    x.fillRect(35, this.size - 45, cs / 4, cs / 4);
    x.fillStyle = "#000000";
    x.font = "bold 14px Arial";
    x.textAlign = "center";
    x.fillText("SCAN ME", this.size / 2, this.size / 2 - 30);
    x.fillText("QR CODE", this.size / 2, this.size / 2 - 10);
    x.fillText("ATTENDANCE", this.size / 2, this.size / 2 + 10);
    x.font = "10px Arial";
    x.fillText(`Pattern: ${patternId}`, this.size / 2, this.size / 2 + 30);
    c.style.border = "3px solid #28a745";
    c.style.borderRadius = "10px";
    c.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
    return Promise.resolve(c);
  }
  startCountdown(s) {
    const e = document.getElementById("countdown");
    if (!e) return;
    let t = s;
    const u = () => {
      e.textContent = `QR code refreshes in ${t} seconds`;
      if (t <= 3) {
        e.style.color = "#dc3545";
        e.style.fontSize = "16px";
      } else if (t <= 5) {
        e.style.color = "#ffc107";
        e.style.fontSize = "14px";
      } else {
        e.style.color = "#28a745";
        e.style.fontSize = "12px";
      }
      t--;
      if (t < 0) {
        clearInterval(this.countdownInterval);
        e.textContent = "Refreshing QR code...";
      }
    };
    u();
    this.countdownInterval = setInterval(u, 1000);
  }
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}

class InstructorDashboard {
  constructor() {
    this.currentSessionId = null;
    this.formManager = new FormManager();
    this.qrGenerator = new AntiScreenshotQRGenerator();
    this.patternId = 0;
    this.autoRefreshEnabled = true;
    this.init();
  }
  async init() {
    this.generateNewSession();
    this.setupEventListeners();
    this.startQRRefreshCycle();
    try {
      await this.formManager.init();
    } catch (_e) {}
    this.updateDashboard();
    this.updateFormInfo();
  }
  generateSessionId() {
    const t = Date.now();
    const r = Math.random().toString(36).substring(2, 15);
    return `session_${t}_${r}`;
  }
  generateNewSession() {
    this.currentSessionId = this.generateSessionId();
    this.patternId = 0;
    this.updateSessionInfo();
    this.generateQRCode();
  }
  updateSessionInfo() {
    const el = document.getElementById("currentSessionId");
    if (el) el.textContent = this.currentSessionId;
  }
  async generateQRCode() {
    const qrContainer = document.getElementById("qrCode");
    if (!qrContainer) return;
    const currentForm = this.formManager.getCurrentForm();
    if (!currentForm) {
      qrContainer.innerHTML = `
                <div class="error">
                    <h3>No Forms Available</h3>
                    <p>Please add a Google Form URL in the instructor dashboard.</p>
                </div>`;
      return;
    }
    const attendanceUrl = currentForm.url;
    if (this.patternId === 0) {
      qrContainer.innerHTML =
        '<div class="loading"></div><p>Generating QR code...</p>';
    }
    try {
      const qrElement = await this.qrGenerator.generate(
        attendanceUrl,
        this.patternId
      );
      qrContainer.innerHTML = "";
      qrContainer.appendChild(qrElement);
      qrElement.style.cursor = "pointer";
      qrElement.title = "Click to copy URL";
      qrElement.onclick = () => {
        navigator.clipboard
          .writeText(attendanceUrl)
          .then(() => {
            this.showNotification("URL copied to clipboard!", "success");
          })
          .catch(() => {
            const ta = document.createElement("textarea");
            ta.value = attendanceUrl;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            this.showNotification("URL copied to clipboard!", "success");
          });
      };
      this.qrGenerator.startCountdown(this.qrGenerator.refreshInterval / 1000);
    } catch (e) {
      qrContainer.innerHTML = `
                <div class="error">
                    <h3>QR Code Generation Failed</h3>
                    <p>Error: ${e.message}</p>
                    <button onclick="window.instructorDashboard.generateQRCode()">Retry</button>
                </div>`;
    }
  }
  startQRRefreshCycle() {
    this.qrRefreshInterval = setInterval(() => {
      this.patternId++;
      this.generateQRCode();
      this.updateSessionInfo();
    }, this.qrGenerator.refreshInterval);
  }
  stopQRRefreshCycle() {
    if (this.qrRefreshInterval) {
      clearInterval(this.qrRefreshInterval);
      this.qrRefreshInterval = null;
    }
    this.qrGenerator.stopCountdown();
  }
  setupEventListeners() {
    const newSessionBtn = document.getElementById("newSessionBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    const toggleAutoRefreshBtn = document.getElementById("toggleAutoRefresh");
    if (newSessionBtn)
      newSessionBtn.addEventListener("click", () => {
        this.stopQRRefreshCycle();
        this.generateNewSession();
        this.startQRRefreshCycle();
        this.showNotification("New session generated!", "success");
      });
    if (refreshBtn)
      refreshBtn.addEventListener("click", () => {
        this.patternId++;
        this.generateQRCode();
        this.updateSessionInfo();
        this.showNotification("QR code refreshed!", "success");
      });
    if (toggleAutoRefreshBtn)
      toggleAutoRefreshBtn.addEventListener("click", () => {
        this.autoRefreshEnabled = !this.autoRefreshEnabled;
        if (this.autoRefreshEnabled) {
          this.startQRRefreshCycle();
          toggleAutoRefreshBtn.textContent = "Auto Refresh: ON";
          this.showNotification("Auto refresh enabled", "success");
        } else {
          this.stopQRRefreshCycle();
          toggleAutoRefreshBtn.textContent = "Auto Refresh: OFF";
          this.showNotification("Auto refresh disabled", "info");
        }
      });
    this.setupFormManagement();
    setInterval(() => {
      this.stopQRRefreshCycle();
      this.generateNewSession();
      this.startQRRefreshCycle();
    }, 5 * 60 * 1000);
  }
  setupFormManagement() {
    const addFormBtn = document.getElementById("addFormBtn");
    const formNameInput = document.getElementById("formName");
    const formUrlInput = document.getElementById("formUrl");
    const sheetUrlInput = document.getElementById("sheetUrl");
    if (addFormBtn) {
      addFormBtn.addEventListener("click", async () => {
        const name = formNameInput.value.trim();
        const url = formUrlInput.value.trim();
        const sheetUrl = sheetUrlInput.value.trim();
        try {
          addFormBtn.textContent = "Adding...";
          addFormBtn.disabled = true;
          await this.formManager.addForm(name, url, sheetUrl);
          this.updateDashboard();
          this.updateFormInfo();
          formNameInput.value = "";
          formUrlInput.value = "";
          sheetUrlInput.value = "";
          this.showNotification(
            `Form "${name}" added successfully!`,
            "success"
          );
        } catch (e) {
          this.showNotification(e.message, "error");
        } finally {
          addFormBtn.textContent = "Add Form";
          addFormBtn.disabled = false;
        }
      });
    }
    [formNameInput, formUrlInput, sheetUrlInput].forEach((input) => {
      if (input) {
        input.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            addFormBtn.click();
          }
        });
      }
    });
  }
  updateDashboard() {
    this.updateFormsList();
    this.updateSessionInfo();
  }
  updateFormsList() {
    const list = document.getElementById("formsList");
    if (!list) return;
    if (this.formManager.forms.length === 0) {
      list.innerHTML =
        '<p class="no-forms">No forms added yet. Add your first form above.</p>';
      return;
    }
    list.innerHTML = this.formManager.forms
      .map(
        (form, index) => `
            <div class="form-item ${
              index === this.formManager.currentFormIndex ? "active" : ""
            }">
                <div class="form-info">
                    <h4>${form.name}</h4>
                    <p class="form-url">Form: ${form.url}</p>
                    ${
                      form.sheetUrl
                        ? `<p class="sheet-url">Sheet: ${form.sheetUrl}</p>`
                        : '<p class="sheet-url no-sheet">No sheet URL provided</p>'
                    }
                </div>
                <div class="form-actions">
                    <button class="btn btn-small ${
                      index === this.formManager.currentFormIndex
                        ? "btn-primary"
                        : "btn-secondary"
                    }" onclick="window.instructorDashboard.setCurrentForm(${index})">
                        ${
                          index === this.formManager.currentFormIndex
                            ? "Active"
                            : "Set Active"
                        }
                    </button>
                    <button class="btn btn-small btn-danger" onclick="window.instructorDashboard.removeForm(${index})">Remove</button>
                </div>
            </div>`
      )
      .join("");
  }
  async setCurrentForm(index) {
    try {
      await this.formManager.setCurrentForm(index);
      this.updateDashboard();
      this.updateFormInfo();
      this.generateQRCode();
      this.showNotification(
        `Switched to "${this.formManager.getCurrentForm().name}"`,
        "success"
      );
    } catch (e) {
      this.showNotification("Failed to set active form: " + e.message, "error");
    }
  }
  async removeForm(index) {
    const form = this.formManager.forms[index];
    if (confirm(`Are you sure you want to remove "${form.name}"?`)) {
      try {
        await this.formManager.removeForm(index);
        this.updateDashboard();
        this.updateFormInfo();
        this.generateQRCode();
        this.showNotification(`Form "${form.name}" removed`, "info");
      } catch (e) {
        this.showNotification("Failed to remove form: " + e.message, "error");
      }
    }
  }
  updateFormInfo() {
    const el = document.getElementById("currentFormName");
    if (el) {
      const f = this.formManager.getCurrentForm();
      el.textContent = f ? f.name : "No forms available";
    }
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
  const d = new InstructorDashboard();
  window.instructorDashboard = d;
});
