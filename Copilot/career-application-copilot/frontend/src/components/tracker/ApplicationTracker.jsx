import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, ExternalLink, Calendar, Star, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { formatApplicationStatus, formatDate } from '../../utils/formatters';
import { ApplicationStatus, Priority } from '../../careerCopilotMockData';

const ApplicationTracker = ({ applications, onUpdateApplication }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { toast } = useToast();

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appliedDate) - new Date(a.appliedDate);
        case 'company':
          return a.companyName.localeCompare(b.companyName);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case ApplicationStatus.INTERVIEW:
        return 'success';
      case ApplicationStatus.IN_REVIEW:
        return 'primary';
      case ApplicationStatus.APPLIED:
        return 'default';
      case ApplicationStatus.REJECTED:
        return 'error';
      case ApplicationStatus.OFFER_RECEIVED:
        return 'gradient';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'error';
      case Priority.MEDIUM:
        return 'warning';
      case Priority.LOW:
        return 'default';
      default:
        return 'default';
    }
  };

  const ApplicationCard = ({ app }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer" 
          onClick={() => setSelectedApp(app)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {app.companyName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {app.position}
              </h3>
              <p className="text-gray-600">{app.companyName}</p>
            </div>
          </div>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
            <MoreHorizontal size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(app.status)}>
            {formatApplicationStatus(app.status)}
          </Badge>
          <Badge variant={getPriorityColor(app.priority)} size="sm">
            {app.priority}
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Applied:</span>
            <span>{formatDate(new Date(app.appliedDate))}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Skills Match:</span>
            <span className="font-medium text-green-600">
              {Math.round(app.skillsMatch * 100)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>ATS Score:</span>
            <span className="font-medium text-blue-600">
              {Math.round(app.atsScore * 100)}%
            </span>
          </div>
        </div>

        {app.notes && (
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            {app.notes}
          </p>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-600 mt-2">Manage and track all your job applications in one place</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={Plus}>
          Add Application
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card variant="glass" padding="md" className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {applications.length}
          </div>
          <div className="text-sm text-gray-600">Total Applications</div>
        </Card>
        <Card variant="glass" padding="md" className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {applications.filter(app => app.status === ApplicationStatus.INTERVIEW).length}
          </div>
          <div className="text-sm text-gray-600">Interviews</div>
        </Card>
        <Card variant="glass" padding="md" className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {applications.filter(app => app.status === ApplicationStatus.OFFER_RECEIVED).length}
          </div>
          <div className="text-sm text-gray-600">Offers</div>
        </Card>
        <Card variant="glass" padding="md" className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {Math.round(applications.reduce((acc, app) => acc + app.skillsMatch, 0) / applications.length * 100) || 0}%
          </div>
          <div className="text-sm text-gray-600">Avg Match</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by company or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="all">All Status</option>
              <option value={ApplicationStatus.APPLIED}>Applied</option>
              <option value={ApplicationStatus.IN_REVIEW}>In Review</option>
              <option value={ApplicationStatus.INTERVIEW}>Interview</option>
              <option value={ApplicationStatus.OFFER_RECEIVED}>Offer</option>
              <option value={ApplicationStatus.REJECTED}>Rejected</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="date">Sort by Date</option>
              <option value="company">Sort by Company</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((app) => (
          <ApplicationCard key={app.id} app={app} />
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Start by adding your first job application'}
          </p>
          <Button onClick={() => setShowAddModal(true)} icon={Plus}>
            Add Application
          </Button>
        </Card>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`${selectedApp.position} at ${selectedApp.companyName}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Badge variant={getStatusColor(selectedApp.status)}>
                  {formatApplicationStatus(selectedApp.status)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <Badge variant={getPriorityColor(selectedApp.priority)}>
                  {selectedApp.priority}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(selectedApp.skillsMatch * 100)}%
                </div>
                <div className="text-sm text-gray-600">Skills Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(selectedApp.atsScore * 100)}%
                </div>
                <div className="text-sm text-gray-600">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(selectedApp.relevanceScore * 100)}%
                </div>
                <div className="text-sm text-gray-600">Relevance</div>
              </div>
            </div>

            {selectedApp.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-800">{selectedApp.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-600">
                Applied on {formatDate(new Date(selectedApp.appliedDate))}
              </div>
              <div className="flex items-center space-x-3">
                {selectedApp.jobUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(selectedApp.jobUrl, '_blank')}
                    icon={ExternalLink}
                  >
                    View Job
                  </Button>
                )}
                <Button variant="ghost" size="sm" icon={Calendar}>
                  Schedule Follow-up
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Application Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Application"
        size="md"
      >
        <div className="space-y-4">
          <Input label="Company Name" placeholder="e.g., Google, Microsoft" />
          <Input label="Position Title" placeholder="e.g., Software Engineer Intern" />
          <Input label="Job URL (Optional)" placeholder="https://..." />
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value={ApplicationStatus.APPLIED}>Applied</option>
                <option value={ApplicationStatus.IN_REVIEW}>In Review</option>
                <option value={ApplicationStatus.INTERVIEW}>Interview</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.LOW}>Low</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Add any notes about this application..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={() => {
              setShowAddModal(false);
              toast.success('Application added successfully!');
            }} className="flex-1">
              Add Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationTracker;