import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Github, Linkedin, Globe, Plus, X, Edit2, Save } from 'lucide-react';
import { formatSkillLevel } from '../../utils/formatters';

const ProfileManager = ({ profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' });
  const [newProject, setNewProject] = useState({ title: '', description: '', technologies: [], duration: '', impact: '' });

  const handleSave = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      setEditedProfile({
        ...editedProfile,
        skills: [...editedProfile.skills, newSkill]
      });
      setNewSkill({ name: '', level: 'intermediate' });
    }
  };

  const removeSkill = (index) => {
    setEditedProfile({
      ...editedProfile,
      skills: editedProfile.skills.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    if (newProject.title.trim()) {
      setEditedProfile({
        ...editedProfile,
        projects: [...editedProfile.projects, newProject]
      });
      setNewProject({ title: '', description: '', technologies: [], duration: '', impact: '' });
    }
  };

  const removeProject = (index) => {
    setEditedProfile({
      ...editedProfile,
      projects: editedProfile.projects.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and professional details</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
            isEditing 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isEditing ? <Save size={20} /> : <Edit2 size={20} />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Personal Information */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.personalInfo?.phone || ''}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    personalInfo: { ...editedProfile.personalInfo, phone: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <Phone size={16} className="text-gray-500" />
                  <span className="text-gray-900">{profile.personalInfo?.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.personalInfo?.location || ''}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    personalInfo: { ...editedProfile.personalInfo, location: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <MapPin size={16} className="text-gray-500" />
                  <span className="text-gray-900">{profile.personalInfo?.location || 'Not provided'}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
              {isEditing ? (
                <input
                  type="url"
                  value={editedProfile.personalInfo?.linkedin || ''}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    personalInfo: { ...editedProfile.personalInfo, linkedin: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <Linkedin size={16} className="text-gray-500" />
                  <a href={profile.personalInfo?.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {profile.personalInfo?.linkedin || 'Not provided'}
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
              {isEditing ? (
                <input
                  type="url"
                  value={editedProfile.personalInfo?.github || ''}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    personalInfo: { ...editedProfile.personalInfo, github: e.target.value }
                  })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                  <Github size={16} className="text-gray-500" />
                  <a href={profile.personalInfo?.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    {profile.personalInfo?.github || 'Not provided'}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Technical Skills</h2>
          {isEditing && (
            <button
              onClick={addSkill}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              <Plus size={16} />
              <span>Add Skill</span>
            </button>
          )}
        </div>

        {isEditing && (
          <div className="flex space-x-3 mb-6">
            <input
              type="text"
              placeholder="Skill name"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <select
              value={newSkill.level}
              onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(isEditing ? editedProfile.skills : profile.skills)?.map((skill, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
            >
              <div>
                <h3 className="font-medium text-gray-900">{skill.name}</h3>
                <p className="text-sm text-gray-600">{formatSkillLevel(skill.level)}</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => removeSkill(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
          {isEditing && (
            <button
              onClick={addProject}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              <Plus size={16} />
              <span>Add Project</span>
            </button>
          )}
        </div>

        <div className="space-y-6">
          {(isEditing ? editedProfile.projects : profile.projects)?.map((project, index) => (
            <div
              key={index}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                </div>
                {isEditing && (
                  <button
                    onClick={() => removeProject(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies?.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="text-gray-900 ml-2">{project.duration}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Impact:</span>
                  <span className="text-gray-900 ml-2">{project.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;