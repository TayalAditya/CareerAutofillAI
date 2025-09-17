export const formatPercentage = (value) => {
  return `${value}%`;
};

export const formatFieldLabel = (label, isRequired) => {
  return isRequired ? `${label} *` : label;
};

export const formatFieldType = (type) => {
  return `Type: ${type}`;
};

export const formatWillFill = (value) => {
  return `Will fill: "${value}"`;
};