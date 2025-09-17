// API service for Career AutoFill Frontend
import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.message);
    
    // Handle common errors
    if (error.response?.status === 404) {
      console.warn('Resource not found');
    } else if (error.response?.status >= 500) {
      console.error('Server error occurred');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running');
    }
    
    return Promise.reject(error);
  }
);

// API Service Class
class ApiService {
  // Health check
  async healthCheck() {
    try {
      const response = await apiClient.get('/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Resume upload and parsing
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Get user profile
  async getProfile(sessionId) {
    try {
      const response = await apiClient.get(`/profile/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // AI-powered job analysis
  async analyzeJob(jobDescription, companyName = null, roleTitle = null) {
    try {
      const response = await apiClient.post('/ai/analyze-job', {
        job_description: jobDescription,
        company_name: companyName,
        role_title: roleTitle,
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Generate application package
  async generateApplicationPackage(jobDescription, companyName, roleTitle, sessionId) {
    try {
      const response = await apiClient.post('/ai/generate-application', {
        job_description: jobDescription,
        company_name: companyName,
        role_title: roleTitle,
        session_id: sessionId,
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Get AI-enhanced profile
  async getAIProfile(sessionId) {
    try {
      const response = await apiClient.get(`/ai/profile/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Auto-fill suggestions
  async getAutoFillSuggestions(fields, jobDescription = null, companyName = null) {
    try {
      const response = await apiClient.post('/autofill', {
        fields,
        job_description: jobDescription,
        company_name: companyName,
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Extension-specific endpoints
  async getExtensionProfile() {
    try {
      const response = await apiClient.post('/extension/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || error.message 
      };
    }
  }

  // Analytics endpoints
  async trackEvent(eventType, data = {}) {
    try {
      const response = await apiClient.post('/api/analytics/events', {
        events: [{
          type: eventType,
          timestamp: Date.now(),
          data,
          sessionId: this.getSessionId()
        }]
      });

      return { success: true, data: response.data };
    } catch (error) {
      // Don't throw errors for analytics - fail silently
      console.warn('Analytics tracking failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  getSessionId() {
    let sessionId = localStorage.getItem('career_copilot_session');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('career_copilot_session', sessionId);
    }
    return sessionId;
  }

  clearSession() {
    localStorage.removeItem('career_copilot_session');
  }

  // Test connection to backend
  async testConnection() {
    try {
      const response = await apiClient.get('/', { timeout: 5000 });
      return { 
        success: true, 
        message: 'Backend connection successful',
        data: response.data 
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Backend connection failed',
        error: error.message,
        suggestion: 'Make sure the backend server is running on http://localhost:8000'
      };
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService();

export default apiService;

// Named exports for specific functions
export const {
  healthCheck,
  uploadResume,
  getProfile,
  analyzeJob,
  generateApplicationPackage,
  getAIProfile,
  getAutoFillSuggestions,
  getExtensionProfile,
  trackEvent,
  testConnection,
  getSessionId,
  clearSession
} = apiService;