// Form Submission Response Data Integration - Updated Version 2.0
// Form Submission Response Data Integration
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
    console.log('parseAttendanceData called with:', rawData);
    if (!rawData || rawData.length < 2) {
      return { questions: [], totalResponses: 0 };
    }
    
    const headers = rawData[0];
    const data = rawData.slice(1);
    
    // Process all columns after Column A (index 0) as questions
    const questionColumns = headers
      .slice(1) // Skip Column A (index 0)
      .map((header, index) => {
        const actualIndex = index + 1; // Adjust for skipped Column A
        return { 
          index: actualIndex, 
          title: header || `Question ${actualIndex}`, 
          responses: [] 
        };
      });

    // Count responses for each question
    questionColumns.forEach(question => {
      const responseCounts = {};
      
      data.forEach(row => {
        const response = row[question.index];
        if (response && response.trim()) {
          const trimmedResponse = response.trim();
          responseCounts[trimmedResponse] = (responseCounts[trimmedResponse] || 0) + 1;
        }
      });
      
      // Convert to array format
      question.responses = Object.entries(responseCounts)
        .map(([option, count]) => ({ option, count }))
        .sort((a, b) => b.count - a.count);
    });

    const totalResponses = data.length;
    
    return {
      questions: questionColumns,
      totalResponses: totalResponses
    };
  }
}

// Instructor Dashboard
class InstructorDashboard {
  constructor() {
    this.sheetsIntegration = new GoogleSheetsIntegration();
    this.loadSheets();
  }

  async loadSheets() {
    try {
      const response = await fetch("/api/sheets");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed to load sheets");
      this.displaySheets(data.sheets);
    } catch (error) {
      console.error("Error loading sheets:", error);
      this.displaySheetsError(error.message);
    }
  }

  displaySheets(sheets) {
    const sheetsList = document.getElementById("sheetsList");
    
    // Check if the element exists (only exists on main instructor page, not results page)
    if (!sheetsList) {
      console.log("sheetsList element not found - likely on results page");
      return;
    }
    
    if (!sheets || sheets.length === 0) {
      sheetsList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>No Form Submission Response Data Found</h3>
          <p>No Form Submission Response Data is currently linked to your forms.</p>
        </div>
      `;
      return;
    }

    sheetsList.innerHTML = sheets
      .map(
        (sheet) => `
        <div class="sheet-card">
          <div class="sheet-header">
            <h3>${sheet.name}</h3>
            <span class="sheet-status">Active</span>
          </div>
          <div class="sheet-details">
            <p><strong>Form ID:</strong> ${sheet.id}</p>
            <p><strong>Sheet URL:</strong> <a href="${sheet.sheetUrl}" target="_blank" class="sheet-link">View Sheet</a></p>
          </div>
          <div class="sheet-actions">
            <button class="btn btn-primary" onclick="instructorDashboard.showResultsForSheet('${sheet.sheetUrl}', '${sheet.name}')">
              <i class="fas fa-chart-bar"></i> View Results
            </button>
          </div>
        </div>
      `
      )
      .join("");
  }

  displaySheetsError(errorMessage) {
    const sheetsList = document.getElementById("sheetsList");
    
    // Check if the element exists (only exists on main instructor page, not results page)
    if (!sheetsList) {
      console.log("sheetsList element not found - likely on results page");
      return;
    }
    
    sheetsList.innerHTML = `
      <div class="error-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Sheets</h3>
        <p>${errorMessage}</p>
        <button class="btn btn-primary" onclick="instructorDashboard.loadSheets()">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    `;
  }

  async showResultsForSheet(sheetUrl, sheetName) {
    try {
      console.log('Loading results for sheet:', sheetName);
      
      const sheetId = this.sheetsIntegration.extractSheetId(sheetUrl);
      const rawData = await this.sheetsIntegration.fetchSheetData(sheetId);
      const attendanceData = this.sheetsIntegration.parseAttendanceData(rawData);
      
      this.openResultsWindow(attendanceData, sheetName, sheetUrl);
      
      this.showNotification(`Results loaded for ${sheetName}!`, "success");
    } catch (e) {
      console.error("Error loading results:", e);
      this.showNotification(e.message, "error");
    }
  }

  openResultsWindow(attendanceData, sheetName, sheetUrl) {
    // Navigate to the results page with parameters
    const encodedSheetUrl = encodeURIComponent(sheetUrl);
    const encodedSheetName = encodeURIComponent(sheetName);
    
    // Store sheet data globally for refresh functionality
    window.currentSheetData = {
      sheetUrl: sheetUrl,
      sheetName: sheetName,
      attendanceData: attendanceData
    };
    
    // Navigate to results page
    window.location.href = `/instructor/results?sheetUrl=${encodedSheetUrl}&sheetName=${encodedSheetName}`;
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

  // Helper methods for refresh functionality
  extractSheetId(sheetUrl) {
    try {
      const url = new URL(sheetUrl);
      const parts = url.pathname.split('/');
      const idx = parts.indexOf('d');
      if (idx !== -1 && idx + 1 < parts.length) return parts[idx + 1];
      throw new Error('Invalid Google Sheets URL format');
    } catch (e) {
      console.error('Error extracting sheet ID:', e);
      throw new Error('Please provide a valid Google Sheets URL');
    }
  }

  async getApiKey() {
    try {
      const response = await fetch('/api/config');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Failed to load configuration');
      return data.googleSheets.apiKey;
    } catch (error) {
      console.error('Error loading API key:', error);
      throw new Error('Google Sheets API key not available');
    }
  }

  parseAttendanceData(rawData) {
    if (!rawData || rawData.length < 2) {
      return { questions: [], totalResponses: 0 };
    }
    
    const headers = rawData[0];
    const data = rawData.slice(1);
    
    // Process all columns after Column A (index 0) as questions
    const questionColumns = headers
      .slice(1) // Skip Column A (index 0)
      .map((header, index) => {
        const actualIndex = index + 1; // Adjust for skipped Column A
        return { 
          index: actualIndex, 
          title: header || `Question ${actualIndex}`, 
          responses: [] 
        };
      });

    // Count responses for each question
    questionColumns.forEach(question => {
      const responseCounts = {};
      
      data.forEach(row => {
        const response = row[question.index];
        if (response && response.trim()) {
          const trimmedResponse = response.trim();
          responseCounts[trimmedResponse] = (responseCounts[trimmedResponse] || 0) + 1;
        }
      });
      
      // Convert to array format
      question.responses = Object.entries(responseCounts)
        .map(([option, count]) => ({ option, count }))
        .sort((a, b) => b.count - a.count);
    });

    const totalResponses = data.length;
    
    return {
      questions: questionColumns,
      totalResponses: totalResponses
    };
  }

  updatePageContent(attendanceData, sheetName, sheetUrl) {
    console.log('Updating page content with:', attendanceData);
    
    // Update the sheet name
    const sheetNameElement = document.querySelector('.sheet-info h3');
    if (sheetNameElement) {
      sheetNameElement.textContent = sheetName;
    }
    
    // Update the timestamp
    const timestampElement = document.querySelector('.sheet-info .timestamp');
    if (timestampElement) {
      timestampElement.textContent = `Last Updated: ${new Date().toLocaleString()}`;
    }
    
    // Update total responses
    const totalResponsesElement = document.querySelector('.total-responses');
    if (totalResponsesElement) {
      totalResponsesElement.textContent = `Total Responses: ${attendanceData.totalResponses}`;
    }
    
    // Update each question's data
    attendanceData.questions.forEach((question, questionIndex) => {
      // Update response summary
      const responseSummaryElement = document.querySelector(`.question-item:nth-child(${questionIndex + 1}) .responses-summary .response-breakdown`);
      if (responseSummaryElement) {
        responseSummaryElement.innerHTML = question.responses
          .map(response => `
            <div class="response-item">
              <span class="option-name">${response.option}</span>
              <span class="option-count">${response.count}</span>
            </div>
          `).join('');
      }
      
      // Update chart bars
      const chartBarsElement = document.querySelector(`.question-item:nth-child(${questionIndex + 1}) .chart-bars`);
      if (chartBarsElement) {
        const maxCount = Math.max(...question.responses.map(r => r.count));
        chartBarsElement.innerHTML = question.responses
          .map(response => {
            const width = (response.count / maxCount) * 100;
            return `
              <div class="bar-container">
                <div class="bar" style="width: ${width}%">
                  <span class="bar-label">${response.option}</span>
                  <span class="bar-value">${response.count}</span>
                </div>
              </div>
            `;
          }).join('');
        
        // Force style recalculation to ensure solid colors are maintained
        this.ensureBarStyles();
      }
    });
    
    console.log('Page content updated successfully');
  }

  ensureBarStyles() {
    // Force a reflow to ensure styles are properly applied
    const bars = document.querySelectorAll('.bar');
    bars.forEach((bar, index) => {
      // Trigger a reflow to ensure CSS is applied
      bar.offsetHeight;
      
      // Apply different colors based on position
      const colorSchemes = [
        { bg: 'linear-gradient(135deg, #667eea, #764ba2)', shadow: 'rgba(102, 126, 234, 0.3)' },
        { bg: 'linear-gradient(135deg, #8b5cf6, #a855f7)', shadow: 'rgba(139, 92, 246, 0.3)' },
        { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', shadow: 'rgba(99, 102, 241, 0.3)' },
        { bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', shadow: 'rgba(124, 58, 237, 0.3)' },
        { bg: 'linear-gradient(135deg, #5b21b6, #4c1d95)', shadow: 'rgba(91, 33, 182, 0.3)' },
        { bg: 'linear-gradient(135deg, #9333ea, #7e22ce)', shadow: 'rgba(147, 51, 234, 0.3)' },
        { bg: 'linear-gradient(135deg, #c084fc, #a855f7)', shadow: 'rgba(192, 132, 252, 0.3)' },
        { bg: 'linear-gradient(135deg, #e879f9, #d946ef)', shadow: 'rgba(232, 121, 249, 0.3)' }
      ];
      
      const colorScheme = colorSchemes[index % colorSchemes.length];
      
      // Ensure the bar has the correct styling
      if (!bar.style.background || bar.style.background === '') {
        bar.style.background = colorScheme.bg;
        bar.style.borderRadius = '20px';
        bar.style.height = '40px';
        bar.style.display = 'flex';
        bar.style.alignItems = 'center';
        bar.style.justifyContent = 'space-between';
        bar.style.padding = '0 15px';
        bar.style.color = 'white';
        bar.style.fontWeight = '600';
        bar.style.boxShadow = `0 2px 8px ${colorScheme.shadow}`;
        bar.style.transition = 'all 0.3s ease';
        bar.style.minWidth = '60px';
        bar.style.position = 'relative';
        bar.style.overflow = 'hidden';
      }
      
      // Ensure text elements are white
      const label = bar.querySelector('.bar-label');
      const value = bar.querySelector('.bar-value');
      
      if (label) {
        label.style.color = 'white';
        label.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        label.style.fontWeight = '600';
      }
      
      if (value) {
        value.style.color = 'white';
        value.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.3)';
        value.style.fontWeight = '700';
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const a = new InstructorDashboard();
  window.instructorDashboard = a;
});

// Global event listener for refresh button (works with dynamically created content)
document.addEventListener('click', function(event) {
  console.log('Click detected on:', event.target);
  if (event.target && event.target.id === 'refreshDataBtn') {
    console.log('Refresh button clicked!');
    // Call the refresh function from the global scope
    if (window.refreshData) {
      window.refreshData();
    } else {
      console.error('refreshData function not found in global scope');
    }
  }
});

// Global refresh function that works with the instructor dashboard
window.refreshData = async function() {
  console.log('Global refreshData called');
  
  try {
    // Get the current sheet data
    const currentData = window.currentSheetData;
    if (!currentData) {
      throw new Error('No sheet data available for refresh');
    }
    
    console.log('Current sheet data:', currentData);
    
    // Get the instructor dashboard instance
    const dashboard = window.instructorDashboard;
    if (!dashboard) {
      throw new Error('Instructor dashboard not available');
    }
    
    // Extract sheet ID from the stored sheet URL
    const sheetId = dashboard.extractSheetId(currentData.sheetUrl);
    console.log('Extracted sheet ID:', sheetId);
    
    // Get fresh API key
    const apiKey = await dashboard.getApiKey();
    console.log('API key status:', apiKey ? 'Available' : 'Not available');
    
    if (!apiKey) {
      throw new Error('Google Sheets API key not available');
    }
    
    // Construct the API URL
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A:Z?key=${apiKey}`;
    console.log('API URL:', apiUrl);
    
    // Fetch fresh data
    const response = await fetch(apiUrl);
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the sheet');
    }
    
    // Parse the fresh data
    const freshAttendanceData = dashboard.parseAttendanceData(data.values);
    console.log('Parsed fresh data:', freshAttendanceData);
    
    // Update the page content
    dashboard.updatePageContent(freshAttendanceData, currentData.sheetName, currentData.sheetUrl);
    
    // Show success notification
    dashboard.showNotification('Data refreshed successfully!', 'success');
    
  } catch (error) {
    console.error('Refresh failed:', error);
    // Try to show notification using dashboard instance
    if (window.instructorDashboard) {
      window.instructorDashboard.showNotification(`Refresh failed: ${error.message}`, 'error');
    } else {
      alert(`Refresh failed: ${error.message}`);
    }
  }
};
