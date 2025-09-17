// String formatters for Career Application Copilot
import { ApplicationStatus, CoverLetterTone, SkillLevel, JobType, Priority } from '../careerCopilotMockData';

export const formatApplicationStatus = (status) => {
  const statusMap = {
    [ApplicationStatus.APPLIED]: 'Applied',
    [ApplicationStatus.IN_REVIEW]: 'In Review',
    [ApplicationStatus.INTERVIEW]: 'Interview',
    [ApplicationStatus.REJECTED]: 'Rejected',
    [ApplicationStatus.OFFER_RECEIVED]: 'Offer Received',
    [ApplicationStatus.WITHDRAWN]: 'Withdrawn',
    [ApplicationStatus.FOLLOW_UP_REQUIRED]: 'Follow-up Required'
  };
  return statusMap[status] || status;
};

export const formatCoverLetterTone = (tone) => {
  const toneMap = {
    [CoverLetterTone.PROFESSIONAL]: 'Professional',
    [CoverLetterTone.ENTHUSIASTIC]: 'Enthusiastic',
    [CoverLetterTone.FORMAL]: 'Formal',
    [CoverLetterTone.CREATIVE]: 'Creative'
  };
  return toneMap[tone] || tone;
};

export const formatSkillLevel = (level) => {
  const levelMap = {
    [SkillLevel.BEGINNER]: 'Beginner',
    [SkillLevel.INTERMEDIATE]: 'Intermediate',
    [SkillLevel.ADVANCED]: 'Advanced',
    [SkillLevel.EXPERT]: 'Expert'
  };
  return levelMap[level] || level;
};

export const formatJobType = (type) => {
  const typeMap = {
    [JobType.INTERNSHIP]: 'Internship',
    [JobType.FULL_TIME]: 'Full-time',
    [JobType.PART_TIME]: 'Part-time',
    [JobType.CONTRACT]: 'Contract',
    [JobType.FREELANCE]: 'Freelance'
  };
  return typeMap[type] || type;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatPercentage = (value) => {
  return `${Math.round(value * 100)}%`;
};

export const formatPriority = (priority) => {
  const priorityMap = {
    [Priority.LOW]: 'Low',
    [Priority.MEDIUM]: 'Medium', 
    [Priority.HIGH]: 'High',
    [Priority.URGENT]: 'Urgent'
  };
  return priorityMap[priority] || priority;
};

export const formatDaysAgo = (date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};