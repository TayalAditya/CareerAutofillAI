import { FieldType, DetectionStatus } from './enums';

// Data for the field detection dashboard
export const mockRootProps = {
  detectionStatus: DetectionStatus.COMPLETE,
  totalFields: 10,
  autoFillableFields: 10,
  fields: [
    {
      id: 'full-name',
      label: 'Full Name',
      isRequired: true,
      completionPercentage: 80,
      type: FieldType.NAME,
      willFillValue: 'Aditya Tayal'
    },
    {
      id: 'email',
      label: 'Email Address',
      isRequired: true,
      completionPercentage: 80,
      type: FieldType.EMAIL,
      willFillValue: 'aditya.tayal@example.com'
    },
    {
      id: 'phone',
      label: 'Phone Number',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.PHONE,
      willFillValue: '+91-9876543210'
    },
    {
      id: 'address',
      label: 'Address',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.ADDRESS,
      willFillValue: 'New Delhi, India'
    },
    {
      id: 'company',
      label: 'Current Company',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.COMPANY,
      willFillValue: 'Tech Solutions Inc.'
    },
    {
      id: 'position',
      label: 'Current Position',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.POSITION,
      willFillValue: 'Senior Software Developer'
    },
    {
      id: 'experience',
      label: 'Years of Experience',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.EXPERIENCE,
      willFillValue: '5 years'
    },
    {
      id: 'portfolio',
      label: 'Portfolio/LinkedIn',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.WEBSITE,
      willFillValue: 'https://github.com/AdityaTayal'
    },
    {
      id: 'skills',
      label: 'Key Skills',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.SKILLS,
      willFillValue: 'React, JavaScript, Node.js, Python'
    },
    {
      id: 'education',
      label: 'Education',
      isRequired: false,
      completionPercentage: 80,
      type: FieldType.EDUCATION,
      willFillValue: 'B.Tech Computer Science'
    }
  ]
};