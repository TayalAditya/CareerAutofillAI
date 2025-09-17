// Mock data for Career Application Copilot

// Enums
export const ApplicationStatus = {
  APPLIED: 'applied',
  IN_REVIEW: 'in_review', 
  INTERVIEW: 'interview',
  REJECTED: 'rejected',
  OFFER_RECEIVED: 'offer_received',
  WITHDRAWN: 'withdrawn',
  FOLLOW_UP_REQUIRED: 'follow_up_required'
};

export const CoverLetterTone = {
  PROFESSIONAL: 'professional',
  ENTHUSIASTIC: 'enthusiastic', 
  FORMAL: 'formal',
  CREATIVE: 'creative'
};

export const SkillLevel = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const JobType = {
  INTERNSHIP: 'internship',
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  FREELANCE: 'freelance'
};

export const Priority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Data for global state store
export const mockStore = {
  user: {
    id: "user_123",
    name: "Aditya Tayal",
    email: "aditya.tayal@iitmandi.ac.in",
    university: "IIT Mandi",
    department: "Computer Science and Engineering",
    year: "UG (Batch 2023)",
    profileComplete: true,
    subscriptionPlan: "premium",
    createdAt: "2024-01-15T10:00:00Z",
    lastActive: "2024-12-16T14:30:00Z"
  },
  profile: {
    personalInfo: {
      phone: "+91 9876543210",
      location: "Mandi, Himachal Pradesh",
      linkedin: "https://linkedin.com/in/adityatayal",
      github: "https://github.com/adityatayal",
      portfolio: "https://adityatayal.dev"
    },
    skills: [
      { name: "Python", level: SkillLevel.ADVANCED },
      { name: "Machine Learning", level: SkillLevel.ADVANCED },
      { name: "Flask", level: SkillLevel.INTERMEDIATE },
      { name: "Next.js", level: SkillLevel.INTERMEDIATE },
      { name: "TensorFlow", level: SkillLevel.INTERMEDIATE },
      { name: "React", level: SkillLevel.ADVANCED },
      { name: "JavaScript", level: SkillLevel.ADVANCED },
      { name: "Linux", level: SkillLevel.INTERMEDIATE }
    ],
    projects: [
      {
        title: "DyslexoFly",
        description: "AI-powered accessible learning platform with summarization and TTS for dyslexic students",
        technologies: ["Python", "Flask", "TensorFlow", "React"],
        duration: "6 months",
        impact: "Improved learning accessibility for 500+ students"
      },
      {
        title: "CaptureSmart", 
        description: "Real-time camera enhancement with TensorFlow and Android SDK",
        technologies: ["TensorFlow", "Android SDK", "Computer Vision"],
        duration: "4 months",
        impact: "Enhanced photo quality with 40% improvement in clarity"
      },
      {
        title: "Deepfake Detection",
        description: "Vision transformer based detection pipeline for identifying deepfake content",
        technologies: ["PyTorch", "Computer Vision", "Deep Learning"],
        duration: "3 months", 
        impact: "Achieved 95% accuracy in deepfake detection"
      }
    ],
    experience: [
      {
        title: "STAC Core Member",
        organization: "IIT Mandi",
        duration: "2023-2024",
        description: "Led technical workshops and mentored junior students"
      },
      {
        title: "GCS Core Member",
        organization: "IIT Mandi",
        duration: "2023-2024", 
        description: "Organized coding competitions and hackathons"
      },
      {
        title: "SAE Co-Coordinator",
        organization: "IIT Mandi",
        duration: "2022-2023",
        description: "Coordinated automotive engineering projects and events"
      }
    ]
  },
  settings: {
    autoFill: true,
    notifications: true,
    darkMode: false,
    defaultTone: CoverLetterTone.PROFESSIONAL,
    privacyMode: false,
    dataRetention: 365
  }
};

// Data returned by API queries
export const mockQuery = {
  applications: [
    {
      id: "app_001",
      companyName: "Google",
      position: "Software Engineering Intern",
      jobType: JobType.INTERNSHIP,
      status: ApplicationStatus.INTERVIEW,
      appliedDate: "2024-12-10T09:00:00Z",
      followUpDate: "2024-12-20T09:00:00Z",
      priority: Priority.HIGH,
      skillsMatch: 0.92,
      atsScore: 0.88,
      relevanceScore: 0.95,
      jobUrl: "https://careers.google.com/jobs/123",
      notes: "Technical interview scheduled for next week"
    },
    {
      id: "app_002", 
      companyName: "Microsoft",
      position: "ML Research Intern",
      jobType: JobType.INTERNSHIP,
      status: ApplicationStatus.IN_REVIEW,
      appliedDate: "2024-12-08T14:30:00Z",
      followUpDate: "2024-12-18T14:30:00Z",
      priority: Priority.HIGH,
      skillsMatch: 0.89,
      atsScore: 0.91,
      relevanceScore: 0.87,
      jobUrl: "https://careers.microsoft.com/jobs/456",
      notes: "Strong match for ML background"
    },
    {
      id: "app_003",
      companyName: "Meta",
      position: "Frontend Developer Intern", 
      jobType: JobType.INTERNSHIP,
      status: ApplicationStatus.APPLIED,
      appliedDate: "2024-12-12T11:15:00Z",
      followUpDate: "2024-12-22T11:15:00Z",
      priority: Priority.MEDIUM,
      skillsMatch: 0.78,
      atsScore: 0.82,
      relevanceScore: 0.80,
      jobUrl: "https://careers.meta.com/jobs/789",
      notes: "Good React experience highlighted"
    }
  ],
  analytics: {
    totalApplications: 15,
    successRate: 0.67,
    averageResponseTime: 7,
    interviewRate: 0.33,
    topSkills: ["Python", "Machine Learning", "React", "JavaScript"],
    applicationTrends: [
      { month: "Oct", applications: 3, interviews: 1 },
      { month: "Nov", applications: 5, interviews: 2 },
      { month: "Dec", applications: 7, interviews: 3 }
    ]
  },
  jobDescriptions: [
    {
      id: "jd_001",
      title: "Software Engineering Intern",
      company: "Google",
      extractedSkills: ["Python", "Data Structures", "Algorithms", "System Design"],
      keywords: ["software", "engineering", "intern", "python", "algorithms", "teamwork"],
      requirements: "Strong programming skills in Python, knowledge of data structures and algorithms",
      seniority: "entry",
      parsedAt: "2024-12-10T08:30:00Z"
    }
  ]
};

// Data passed as props to the root component
export const mockRootProps = {
  initialView: "dashboard",
  isExtensionMode: false,
  theme: "light",
  userPreferences: {
    defaultTone: CoverLetterTone.PROFESSIONAL,
    autoSave: true,
    showTutorial: false
  }
};