import React from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Clock, Globe, Code, GraduationCap } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { formatFieldLabel, formatFieldType, formatWillFill, formatPercentage } from './stringFormatters';
import { FieldType } from './enums';

const getFieldIcon = (type) => {
  const iconProps = { size: 20, className: "text-blue-500" };
  
  switch (type) {
    case FieldType.NAME:
      return <User {...iconProps} />;
    case FieldType.EMAIL:
      return <Mail {...iconProps} />;
    case FieldType.PHONE:
      return <Phone {...iconProps} />;
    case FieldType.ADDRESS:
      return <MapPin {...iconProps} />;
    case FieldType.COMPANY:
      return <Building {...iconProps} />;
    case FieldType.POSITION:
      return <Briefcase {...iconProps} />;
    case FieldType.EXPERIENCE:
      return <Clock {...iconProps} />;
    case FieldType.WEBSITE:
      return <Globe {...iconProps} />;
    case FieldType.SKILLS:
      return <Code {...iconProps} />;
    case FieldType.EDUCATION:
      return <GraduationCap {...iconProps} />;
    default:
      return <User {...iconProps} />;
  }
};

const FieldCard = ({ field }) => {
  const { label, isRequired, completionPercentage, type, willFillValue } = field;

  return (
    <Card variant="glass" className="p-4 hover-lift animate-scale-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {getFieldIcon(type)}
          <div>
            <h3 className="font-semibold text-gray-800">
              {formatFieldLabel(label, isRequired)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatFieldType(type)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green-600">
            {formatPercentage(completionPercentage)}
          </div>
        </div>
      </div>

      <ProgressBar 
        progress={completionPercentage} 
        variant="success" 
        size="sm" 
        className="mb-3"
      />

      <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <span className="font-medium">{formatWillFill(willFillValue)}</span>
      </div>
    </Card>
  );
};

export default FieldCard;