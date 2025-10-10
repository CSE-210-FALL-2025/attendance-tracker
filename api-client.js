// API Client for communicating with the serverless backend
class APIClient {
    constructor() {
        // Update this URL to your Vercel deployment URL
        // Check if we're running locally (localhost or file:// protocol)
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
        
        this.baseURL = isLocal 
            ? 'http://localhost:3000/api' 
            : 'https://your-vercel-app.vercel.app/api';
        
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Get all forms
    async getForms() {
        return await this.request('/forms');
    }

    // Add a new form
    async addForm(name, url, sheetUrl = '') {
        return await this.request('/forms', {
            method: 'POST',
            body: JSON.stringify({
                name,
                url,
                sheetUrl
            })
        });
    }

    // Get a specific form by ID
    async getForm(id) {
        return await this.request(`/forms/${id}`);
    }

    // Update a specific form
    async updateForm(id, updates) {
        return await this.request(`/forms/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    // Delete a form
    async deleteForm(id) {
        return await this.request(`/forms?id=${id}`, {
            method: 'DELETE'
        });
    }

    // Set active form
    async setActiveForm(id) {
        return await this.request('/forms', {
            method: 'PUT',
            body: JSON.stringify({
                id,
                action: 'setActive'
            })
        });
    }

    // Update settings
    async updateSettings(settings) {
        return await this.request('/forms', {
            method: 'PUT',
            body: JSON.stringify({
                action: 'updateSettings',
                ...settings
            })
        });
    }
}

// Form Manager that uses the API client
class FormManager {
    constructor() {
        this.api = new APIClient();
        this.forms = [];
        this.currentFormIndex = 0;
        // Don't call init() here - let the caller handle it
    }

    async init() {
        await this.loadForms();
    }

    async loadForms() {
        try {
            const response = await this.api.getForms();
            this.forms = response.forms || [];
            
            // Set current form index
            if (response.settings && response.settings.currentFormIndex !== undefined) {
                this.currentFormIndex = response.settings.currentFormIndex;
            } else if (this.forms.length > 0) {
                this.currentFormIndex = 0;
            }
        } catch (error) {
            console.error('Failed to load forms:', error);
            // Fallback to default form
            this.forms = [{
                id: 1,
                name: 'Default Attendance',
                url: 'https://docs.google.com/forms/d/e/1FAIpQLSfJQOOhFtkqpmmHIyNf_XE_EHAL9v5JsiPJ7D0cAnHVpagBTA/viewform',
                sheetUrl: 'https://docs.google.com/spreadsheets/d/1FAIpQLSfJQOOhFtkqpmmHIyNf_XE_EHAL9v5JsiPJ7D0cAnHVpagBTA/edit',
                createdAt: new Date().toISOString(),
                isActive: true
            }];
            this.currentFormIndex = 0;
        }
    }

    async addForm(name, url, sheetUrl) {
        if (!name.trim() || !url.trim()) {
            throw new Error('Form name and URL are required');
        }
        
        // Validate URLs
        try {
            new URL(url);
            if (sheetUrl && sheetUrl.trim()) {
                new URL(sheetUrl.trim());
            }
        } catch {
            throw new Error('Please enter valid URLs');
        }

        try {
            const response = await this.api.addForm(name.trim(), url.trim(), sheetUrl ? sheetUrl.trim() : '');
            
            // Reload forms to get the updated list
            await this.loadForms();
            
            return response.form;
        } catch (error) {
            throw new Error('Failed to add form: ' + error.message);
        }
    }

    async removeForm(index) {
        if (index >= 0 && index < this.forms.length) {
            const form = this.forms[index];
            
            try {
                await this.api.deleteForm(form.id);
                
                // Reload forms to get the updated list
                await this.loadForms();
            } catch (error) {
                throw new Error('Failed to remove form: ' + error.message);
            }
        }
    }

    getCurrentForm() {
        if (this.forms.length === 0) return null;
        return this.forms[this.currentFormIndex];
    }

    async setCurrentForm(index) {
        if (index >= 0 && index < this.forms.length) {
            const form = this.forms[index];
            
            try {
                await this.api.setActiveForm(form.id);
                this.currentFormIndex = index;
            } catch (error) {
                throw new Error('Failed to set active form: ' + error.message);
            }
        }
    }

    nextForm() {
        if (this.forms.length > 1) {
            const newIndex = (this.currentFormIndex + 1) % this.forms.length;
            this.setCurrentForm(newIndex);
        }
    }

    previousForm() {
        if (this.forms.length > 1) {
            const newIndex = this.currentFormIndex === 0 
                ? this.forms.length - 1 
                : this.currentFormIndex - 1;
            this.setCurrentForm(newIndex);
        }
    }
}
