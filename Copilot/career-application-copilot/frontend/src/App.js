import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Upload, FileText, Brain, Copy, Check, X } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Common field types for quick selection
  const commonFields = [
    { name: 'Full Name', type: 'name', label: 'Enter your full name' },
    { name: 'Email Address', type: 'email', label: 'Enter your email address' },
    { name: 'Phone Number', type: 'phone', label: 'Enter your phone number' },
    { name: 'University', type: 'university', label: 'Enter your university/college' },
    { name: 'Degree', type: 'degree', label: 'Enter your degree/qualification' },
    { name: 'Technical Skills', type: 'skills', label: 'List your technical skills' },
    { name: 'Work Experience', type: 'experience', label: 'Describe your work experience' },
    { name: 'Cover Letter', type: 'cover_letter', label: 'Write a cover letter' },
    { name: 'Why this company?', type: 'cover_letter', label: 'Why do you want to work at this company?' },
    { name: 'Why this role?', type: 'cover_letter', label: 'Why are you interested in this role?' }
  ];

  // File upload handler
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE}/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSessionId(response.data.session_id);
      setProfile(response.data.profile);
      toast.success('Resume uploaded and analyzed successfully!');
    } catch (error) {
      toast.error('Failed to upload resume: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Add form field
  const addFormField = (preset = null) => {
    const newField = {
      id: Date.now(),
      field_name: preset ? preset.type : '',
      label: preset ? preset.label : '',
      field_type: 'text',
      current_value: ''
    };
    setFormFields([...formFields, newField]);
  };

  // Add preset field
  const addPresetField = (preset) => {
    addFormField(preset);
  };

  // Update form field
  const updateFormField = (id, field, value) => {
    setFormFields(formFields.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  // Remove form field
  const removeFormField = (id) => {
    setFormFields(formFields.filter(f => f.id !== id));
  };

  // Get suggestions
  const getSuggestions = async () => {
    if (!sessionId || formFields.length === 0) {
      toast.error('Please upload resume and add form fields first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await axios.post(`${API_BASE}/get-suggestions/${sessionId}`, {
        fields: formFields.map(f => ({
          field_type: f.field_type,
          field_name: f.field_name,
          label: f.label,
          current_value: f.current_value
        })),
        job_description: jobDescription || null,
        company_name: companyName || null
      });

      setSuggestions(response.data.suggestions);
      toast.success('Suggestions generated successfully!');
    } catch (error) {
      toast.error('Failed to get suggestions: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Career AutoFill Assistant</h1>
                <p className="text-sm text-gray-500">Upload resume → Get instant form suggestions</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              by Aditya Tayal | IIT Mandi CSE
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Upload & Profile */}
          <div className="space-y-6">
            
            {/* Resume Upload */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-indigo-600" />
                Upload Resume
              </h2>
              
              {!profile ? (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  {isUploading ? (
                    <p className="text-gray-600">Uploading and analyzing...</p>
                  ) : (
                    <>
                      <p className="text-gray-600 mb-2">
                        {isDragActive ? 'Drop your resume here...' : 'Drag & drop your resume here'}
                      </p>
                      <p className="text-sm text-gray-500">PDF or DOCX files only</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">✓ Resume Analyzed</p>
                      <p className="text-green-600 text-sm">{profile.name || 'Profile'} loaded successfully</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfile(null);
                        setSessionId(null);
                        setSuggestions([]);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Summary */}
            {profile && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                  Profile Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Name:</span> 
                    <span className="text-gray-900">{profile.name || 'Not found'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Email:</span> 
                    <span className="text-gray-900">{profile.email || 'Not found'}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Phone:</span> 
                      <span className="text-gray-900">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">University:</span> 
                    <span className="text-gray-900">{profile.university || 'Not found'}</span>
                  </div>
                  {profile.degree && (
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Degree:</span> 
                      <span className="text-gray-900">{profile.degree}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Skills:</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {profile.skills.slice(0, 8).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {profile.skills.length > 8 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{profile.skills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Experience:</span> 
                      <span className="text-gray-900">{profile.experience.length} entries</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Projects:</span> 
                      <span className="text-gray-900">{profile.projects.length} found</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Job Context */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Context (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description for better suggestions..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form Fields & Suggestions */}
          <div className="space-y-6">
            
            {/* Form Fields */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Application Form Fields</h2>
                <button
                  onClick={() => addFormField()}
                  className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
                >
                  Add Custom Field
                </button>
              </div>

              {/* Quick Presets */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Add Common Fields:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {commonFields.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => addPresetField(preset)}
                      className="text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      disabled={formFields.some(f => f.field_name === preset.type)}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {formFields.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No form fields added yet</p>
                  <p className="text-sm mt-1">Click on common fields above or add custom fields for job applications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formFields.map((field) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {commonFields.find(cf => cf.type === field.field_name)?.name || `Field ${field.id}`}
                        </h4>
                        <button
                          onClick={() => removeFormField(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Field Type</label>
                          <input
                            type="text"
                            value={field.field_name}
                            onChange={(e) => updateFormField(field.id, 'field_name', e.target.value)}
                            placeholder="e.g., name, email, phone, skills"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Form Question/Label</label>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateFormField(field.id, 'label', e.target.value)}
                            placeholder="e.g., Enter your full name, Why do you want this job?"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formFields.length > 0 && profile && (
                <div className="mt-6">
                  <button
                    onClick={getSuggestions}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-4 rounded-md hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 font-medium"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Suggestions...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Brain className="h-4 w-4 mr-2" />
                        Get Smart AutoFill Suggestions
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-indigo-600" />
                  Smart AutoFill Suggestions
                </h2>
                <div className="space-y-4">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {suggestion.field_name.replace('_', ' ')}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            suggestion.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                            suggestion.confidence > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            suggestion.confidence > 0 ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {suggestion.confidence > 0 ? 
                              `${Math.round(suggestion.confidence * 100)}% match` : 
                              'No data'
                            }
                          </span>
                        </div>
                        {suggestion.suggested_value && (
                          <button
                            onClick={() => copyToClipboard(suggestion.suggested_value)}
                            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                            <span className="text-sm font-medium">Copy</span>
                          </button>
                        )}
                      </div>
                      
                      {suggestion.suggested_value ? (
                        <div className="bg-gray-50 rounded-md p-3 mb-3 border-l-4 border-indigo-500">
                          <div className="text-sm text-gray-800 whitespace-pre-wrap">
                            {suggestion.suggested_value}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-md p-3 mb-3 border-l-4 border-red-500">
                          <div className="text-sm text-red-700">
                            No data found in resume for this field
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-600 italic">{suggestion.explanation}</p>
                    </div>
                  ))}
                </div>
                
                {/* Bulk copy section */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const allSuggestions = suggestions
                          .filter(s => s.suggested_value)
                          .map(s => `${s.field_name}: ${s.suggested_value}`)
                          .join('\n\n');
                        copyToClipboard(allSuggestions);
                      }}
                      className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md"
                    >
                      Copy All Suggestions
                    </button>
                    <button
                      onClick={() => setSuggestions([])}
                      className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-md"
                    >
                      Clear Suggestions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Career AutoFill Assistant - Streamline your job applications with AI</p>
          <p className="mt-1">Built by Aditya Tayal | IIT Mandi CSE | AI Agent Assignment</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
