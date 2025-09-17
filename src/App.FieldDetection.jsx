import React from 'react';
import FieldDetectionDashboard from './components/fieldDetection/FieldDetectionDashboard';
import { mockRootProps } from './components/fieldDetection/fieldDetectionMockData';

const App = () => {
  return (
    <div className="App">
      <FieldDetectionDashboard {...mockRootProps} />
    </div>
  );
};

export default App;