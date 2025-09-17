import React from 'react';
import { Users, DollarSign, ShoppingCart, TrendingUp, Activity, Clock } from 'lucide-react';
import StatsCard from './StatsCard';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Dashboard = () => {
  const stats = [
    {
      title: 'Forms Processed',
      value: '1,247',
      change: '+15% accuracy improvement',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Model Accuracy',
      value: '94.2%',
      change: '+2.1% this week',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Processing Speed',
      value: '0.3s',
      change: '-0.1s optimization',
      changeType: 'positive',
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Success Rate',
      value: '89.7%',
      change: '+3.2% improvement',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'orange'
    }
  ];
  
  const recentActivities = [
    { id: 1, action: 'Form detection model updated', time: '2 minutes ago', type: 'model' },
    { id: 2, action: 'Resume parsing completed', time: '5 minutes ago', type: 'processing' },
    { id: 3, action: 'New test case added', time: '10 minutes ago', type: 'testing' },
    { id: 4, action: 'Algorithm optimization deployed', time: '15 minutes ago', type: 'optimization' },
    { id: 5, action: 'Performance metrics updated', time: '20 minutes ago', type: 'metrics' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Model Performance</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">AI model accuracy and performance metrics</p>
              </div>
            </div>
          </Card.Content>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title>Development Log</Card.Title>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock size={12} className="mr-1" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <Card.Title>Development Tools</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Users size={24} />
              <span>Test Cases</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity size={24} />
              <span>Run Models</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <TrendingUp size={24} />
              <span>Performance</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Activity size={24} />
              <span>Debug</span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default Dashboard;