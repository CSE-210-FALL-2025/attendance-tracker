// Anti-Screenshot QR Code Generator
class AntiScreenshotQRGenerator {
  constructor() {
    this.size = 300;
    this.refreshInterval = 5000; // 5 seconds
    this.countdownInterval = null;
    this.qrRefreshInterval = null;
  }

  async generate(text, patternId = 0) {
    const qrContainer = document.getElementById("qrCode");
    const uniqueText = text;

    try {
      const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${
        this.size
      }x${this.size}&data=${encodeURIComponent(uniqueText)}&ecc=M&margin=2`;
      const img = document.createElement("img");
      img.src = qrServerUrl;
      img.alt = "QR Code";
      img.style.border = "3px solid #28a745";
      img.style.borderRadius = "10px";
      img.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)";
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("QR Server API failed"));
        setTimeout(() => reject(new Error("QR Server API timeout")), 3000);
      });
    } catch {}

    try {
      const googleChartsUrl = `https://chart.googleapis.com/chart?chs=${
        this.size
      }x${this.size}&cht=qr&chl=${encodeURIComponent(uniqueText)}&choe=UTF-8`;
      const img = document.createElement("img");
      img.src = googleChartsUrl;
      img.alt = "QR Code";
      img.style.border = "3px solid #28a745";
      img.style.borderRadius = "10px";
      img.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)";
      return new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Google Charts API failed"));
        setTimeout(() => reject(new Error("Google Charts API timeout")), 3000);
      });
    } catch {}

    return this.createUniquePatternQR(text, patternId);
  }

  createUniquePatternQR(text, patternId) {
    const canvas = document.createElement("canvas");
    canvas.width = this.size;
    canvas.height = this.size;
    const ctx = canvas.getContext("2d");

    const hue = (patternId * 137.5) % 360;
    ctx.fillStyle = `hsl(${hue}, 20%, 95%)`;
    ctx.fillRect(0, 0, this.size, this.size);

    const borderWidth = 2 + (patternId % 3);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(0, 0, this.size, this.size);

    const cornerSize = 60;
    ctx.fillStyle = "#000000";
    ctx.fillRect(10, 10, cornerSize, cornerSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(25, 25, cornerSize / 2, cornerSize / 2);
    ctx.fillStyle = "#000000";
    ctx.fillRect(35, 35, cornerSize / 4, cornerSize / 4);

    ctx.fillStyle = "#FF0000";
    for (let i = 0; i < patternId % 5; i++) {
      ctx.fillRect(15 + i * 10, 15 + i * 5, 3, 3);
    }

    ctx.fillStyle = "#000000";
    ctx.fillRect(this.size - 70, 10, cornerSize, cornerSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(this.size - 55, 25, cornerSize / 2, cornerSize / 2);
    ctx.fillStyle = "#000000";
    ctx.fillRect(this.size - 45, 35, cornerSize / 4, cornerSize / 4);

    ctx.fillStyle = "#000000";
    ctx.fillRect(10, this.size - 70, cornerSize, cornerSize);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(25, this.size - 55, cornerSize / 2, cornerSize / 2);
    ctx.fillStyle = "#000000";
    ctx.fillRect(35, this.size - 45, cornerSize / 4, cornerSize / 4);

    ctx.fillStyle = "#000000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("SCAN ME", this.size / 2, this.size / 2 - 30);
    ctx.fillText("QR CODE", this.size / 2, this.size / 2 - 10);
    ctx.fillText("ATTENDANCE", this.size / 2, this.size / 2 + 10);
    ctx.font = "10px Arial";
    ctx.fillText(`Pattern: ${patternId}`, this.size / 2, this.size / 2 + 30);

    canvas.style.border = "3px solid #28a745";
    canvas.style.borderRadius = "10px";
    canvas.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.1)";

    return Promise.resolve(canvas);
  }

  startCountdown(seconds) {
    const countdownElement = document.getElementById("countdown");
    if (!countdownElement) return;

    let timeLeft = seconds;
    const updateCountdown = () => {
      countdownElement.textContent = `QR code refreshes in ${timeLeft} seconds`;
      if (timeLeft <= 3) {
        countdownElement.style.color = "#dc3545";
        countdownElement.style.fontSize = "16px";
      } else if (timeLeft <= 5) {
        countdownElement.style.color = "#ffc107";
        countdownElement.style.fontSize = "14px";
      } else {
        countdownElement.style.color = "#28a745";
        countdownElement.style.fontSize = "12px";
      }
      timeLeft--;
      if (timeLeft < 0) {
        clearInterval(this.countdownInterval);
        countdownElement.textContent = "Refreshing QR code...";
      }
    };
    updateCountdown();
    this.countdownInterval = setInterval(updateCountdown, 1000);
  }

  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}

// Chart Manager (used by potential chart features)
class ChartManager {
  constructor() {
    this.chart = null;
  }
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }
}

// Student View QR Scanner
class StudentQRScanner {
  constructor() {
    this.currentSessionId = null;
    this.formManager = new FormManager();
    this.qrGenerator = new AntiScreenshotQRGenerator();
    this.patternId = 0;
    this.autoRefreshEnabled = true;
    this.init();
  }

  async init() {
    try {
      // Ensure forms are loaded before attempting to generate the QR
      await this.formManager.init();
    } catch (_e) {
      // ignore; FormManager will fallback to default form
    }
    this.generateNewSession();
    this.startQRRefreshCycle();
    this.updateFormInfo();
  }

  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `session_${timestamp}_${random}`;
  }

  generateNewSession() {
    this.currentSessionId = this.generateSessionId();
    this.patternId = 0;
    this.generateQRCode();
  }

  async generateQRCode() {
    const qrContainer = document.getElementById("qrCode");
    if (!qrContainer) {
      console.error("QR code container not found");
      return;
    }

    const currentForm = this.formManager.getCurrentForm();
    if (!currentForm) {
      qrContainer.innerHTML = `
                <div class="error">
                    <h3>No Forms Available</h3>
                    <p>Please add a Google Form URL in the instructor dashboard.</p>
                </div>
            `;
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
            const textArea = document.createElement("textarea");
            textArea.value = attendanceUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            this.showNotification("URL copied to clipboard!", "success");
          });
      };
      this.qrGenerator.startCountdown(this.qrGenerator.refreshInterval / 1000);
    } catch (error) {
      console.error("Error generating QR code:", error);
      qrContainer.innerHTML = `
                <div class="error">
                    <h3>QR Code Generation Failed</h3>
                    <p>Error: ${error.message}</p>
                    <button onclick="window.studentQRScanner.generateQRCode()">Retry</button>
                </div>
            `;
    }
  }

  startQRRefreshCycle() {
    this.qrRefreshInterval = setInterval(() => {
      this.patternId++;
      this.generateQRCode();
    }, this.qrGenerator.refreshInterval);
  }

  stopQRRefreshCycle() {
    if (this.qrRefreshInterval) {
      clearInterval(this.qrRefreshInterval);
      this.qrRefreshInterval = null;
    }
    this.qrGenerator.stopCountdown();
  }

  updateFormInfo() {
    const currentFormName = document.getElementById("currentFormName");
    if (currentFormName) {
      const currentForm = this.formManager.getCurrentForm();
      currentFormName.textContent = currentForm
        ? currentForm.name
        : "No forms available";
    }
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 10px; color: white; font-weight: 600; z-index: 1000; animation: slideIn 0.3s ease; background: ${
      type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#667eea"
    }; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);`;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode)
          notification.parentNode.removeChild(notification);
      }, 300);
    }, 3000);
  }

  getCurrentSessionId() {
    return this.currentSessionId;
  }
  getAttendanceUrl() {
    const currentForm = this.formManager.getCurrentForm();
    if (!currentForm) return null;
    return currentForm.url;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const studentQRScanner = new StudentQRScanner();
  window.studentQRScanner = studentQRScanner;
});
