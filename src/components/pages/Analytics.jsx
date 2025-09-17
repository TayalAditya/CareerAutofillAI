import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp, Activity, Cpu, Zap } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

const Analytics = () => {
  const [realTimeData, setRealTimeData] = useState({
    processingSpeed: 320,
    accuracy: 94.2,
    activeModels: 3,
    requestsPerMinute: 45
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        processingSpeed: Math.max(200, Math.min(500, prev.processingSpeed + (Math.random() - 0.5) * 20)),
        accuracy: Math.max(85, Math.min(98, prev.accuracy + (Math.random() - 0.5) * 1)),
        activeModels: Math.max(1, Math.min(5, Math.round(prev.activeModels + (Math.random() - 0.5)))),
        requestsPerMinute: Math.max(10, Math.min(100, prev.requestsPerMinute + (Math.random() - 0.5) * 10))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Real-time AI model performance and system metrics</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button size="sm">Generate Report</Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing Speed</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(realTimeData.processingSpeed)}ms</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
          <ProgressBar progress={(500 - realTimeData.processingSpeed) / 3} variant="default" size="sm" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Model Accuracy</p>
              <p className="text-2xl font-bold text-green-600">{realTimeData.accuracy.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <ProgressBar progress={realTimeData.accuracy} variant="success" size="sm" />
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Models</p>
              <p className="text-2xl font-bold text-purple-600">{realTimeData.activeModels}</p>
            </div>
            <Cpu className="w-8 h-8 text-purple-500" />
          </div>
          <div className="flex space-x-1 mt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div 
                key={i} 
                className={`h-2 flex-1 rounded ${
                  i < realTimeData.activeModels ? 'bg-purple-500' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requests/min</p>
              <p className="text-2xl font-bold text-orange-600">{Math.round(realTimeData.requestsPerMinute)}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-500" />
          </div>
          <ProgressBar progress={realTimeData.requestsPerMinute} variant="warning" size="sm" />
        </Card>
      </div>
      
      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Model Performance Trends</Card.Title>
              <Badge variant="success" pulse={true}>Live</Badge>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <LineChart size={48} className="text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700 font-medium">Performance Timeline</p>
                <p className="text-blue-600 text-sm">Accuracy and speed metrics</p>
              </div>
              <div className="absolute top-2 right-2">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600">Real-time</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>User Distribution</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart size={48} className="text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Pie Chart</p>
                <p className="text-green-600 text-sm">User demographics</p>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Monthly Performance</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 size={48} className="text-purple-600 mx-auto mb-2" />
                <p className="text-purple-700 font-medium">Bar Chart</p>
                <p className="text-purple-600 text-sm">Monthly metrics</p>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Header>
            <Card.Title>Growth Analysis</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp size={48} className="text-orange-600 mx-auto mb-2" />
                <p className="text-orange-700 font-medium">Trend Analysis</p>
                <p className="text-orange-600 text-sm">Growth patterns</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <Card.Content>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-blue-600">85%</p>
              <p className="text-gray-600 mt-1">Conversion Rate</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-green-600">$125K</p>
              <p className="text-gray-600 mt-1">Total Revenue</p>
            </div>
          </Card.Content>
        </Card>
        
        <Card>
          <Card.Content>
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-purple-600">2.4x</p>
              <p className="text-gray-600 mt-1">Growth Factor</p>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;