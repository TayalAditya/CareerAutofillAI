import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Mail, Phone } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const TestCases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const testCases = [
    { id: 1, name: 'LinkedIn Job Form', type: 'Form Detection', accuracy: '96%', status: 'Passed', category: 'Social Media' },
    { id: 2, name: 'Indeed Application', type: 'Auto-Fill', accuracy: '94%', status: 'Passed', category: 'Job Board' },
    { id: 3, name: 'Company Career Page', type: 'Field Mapping', accuracy: '89%', status: 'Failed', category: 'Corporate' },
    { id: 4, name: 'Startup Application', type: 'Resume Parse', accuracy: '97%', status: 'Passed', category: 'Startup' },
    { id: 5, name: 'Government Portal', type: 'Complex Form', accuracy: '85%', status: 'Passed', category: 'Government' }
  ];
  
  const filteredTestCases = testCases.filter(testCase =>
    testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Test Cases</h2>
        <Button>
          <Plus size={20} className="mr-2" />
          Add Test Case
        </Button>
      </div>
      
      {/* Search and Filters */}
      <Card>
        <Card.Content>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search test cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter size={20} className="mr-2" />
              Filters
            </Button>
          </div>
        </Card.Content>
      </Card>
      
      {/* Users Table */}
      <Card>
        <Card.Content padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Test Case</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Accuracy</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTestCases.map((testCase) => (
                  <tr key={testCase.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {testCase.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{testCase.name}</p>
                          <p className="text-sm text-gray-500">{testCase.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-900">{testCase.type}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testCase.category === 'Social Media' ? 'bg-purple-100 text-purple-800' :
                        testCase.category === 'Job Board' ? 'bg-blue-100 text-blue-800' :
                        testCase.category === 'Corporate' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {testCase.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-medium text-gray-900">{testCase.accuracy}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        testCase.status === 'Passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {testCase.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default TestCases;