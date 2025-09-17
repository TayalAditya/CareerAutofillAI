import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Clock, Target, ArrowUpRight, Calendar, Briefcase, Zap, Award, TrendingDown } from 'lucide-react';
import StatCard from './StatCard';
import ApplicationChart from './ApplicationChart';
import RecentApplications from './RecentApplications';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const Dashboard = ({ analytics, applications }) => {
  const [animatedStats, setAnimatedStats] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const stats = [
    {
      title: 'Total Applications',
      value: analytics?.totalApplications || 0,
      change: '+12%',
      trend: 'up',
      icon: Briefcase,
      color: 'blue',
      description: 'Applications submitted this month'
    },
    {
      title: 'Success Rate',
      value: `${Math.round((analytics?.successRate || 0) * 100)}%`,
      change: '+5%',
      trend: 'up',
      icon: Target,
      color: 'green',
      description: 'Interview to offer conversion'
    },
    {
      title: 'Interview Rate',
      value: `${Math.round((analytics?.interviewRate || 0) * 100)}%`,
      change: '+8%',
      trend: 'up',
      icon: Users,
      color: 'purple',
      description: 'Applications leading to interviews'
    },
    {
      title: 'Avg Response Time',
      value: `${analytics?.averageResponseTime || 0} days`,
      change: '-2 days',
      trend: 'up',
      icon: Clock,
      color: 'orange',
      description: 'Time to hear back from companies'
    }
  ];
  
  useEffect(() => {
    // Animate stats on mount
    stats.forEach((stat, index) => {
      setTimeout(() => {
        setAnimatedStats(prev => [...prev, index]);
      }, index * 200);
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <Card variant="gradient" className="p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back, Aditya! 
              </h1>
              <div className="animate-bounce">👋</div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl">
              Here's what's happening with your job applications today. You're doing great!
            </p>
            <div className="flex items-center space-x-4">
              <Badge variant="success" icon={Award}>
                {Math.round((analytics?.successRate || 0) * 100)}% Success Rate
              </Badge>
              <Badge variant="primary" icon={Zap}>
                {analytics?.totalApplications || 0} Applications
              </Badge>
            </div>
          </div>
          
          <div className="hidden md:block">
            <Card variant="glass" padding="lg" className="text-center min-w-[120px]">
              <Calendar size={40} className="text-blue-600 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
              </p>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {currentTime.getDate()}
              </p>
              <p className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('en-US', { month: 'long' })}
              </p>
            </Card>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`transform transition-all duration-500 ${
              animatedStats.includes(index) 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Application Trends</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('View trends details')}
              icon={ArrowUpRight}
              iconPosition="right"
            >
              View Details
            </Button>
          </div>
          <ApplicationChart data={analytics?.applicationTrends || []} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Recent Applications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('View all applications')}
              icon={ArrowUpRight}
              iconPosition="right"
            >
              View All
            </Button>
          </div>
          <RecentApplications applications={applications?.slice(0, 5) || []} />
        </Card>
      </div>

      {/* Top Skills */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Top Skills in Demand</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('View all skills')}
          >
            View All
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {(analytics?.topSkills || []).map((skill, index) => (
            <Badge
              key={index}
              variant="gradient"
              className="cursor-pointer hover:scale-105 transition-transform"
              onClick={() => console.log('Skill clicked:', skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;