'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';

interface RFQ {
  _id: string;
  rfqNumber: string;
  title: string;
  rfqType: string;
  rfqStatus: 'draft' | 'published' | 'under_evaluation' | 'awarded' | 'cancelled';
  submissionDeadline: string;
  requester: {
    name: string;
    email: string;
  };
  description?: string;
  category?: string;
  createdAt?: string;
}

const RFQTable: React.FC = () => {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof RFQ>('submissionDeadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch RFQ data
  const fetchRFQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rfqs');
      if (!response.ok) {
        throw new Error('Failed to fetch RFQs');
      }
      const data = await response.json();
      setRfqs(data.rfqs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRFQs();
  }, []);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status) {
        case 'draft':
          return { color: 'bg-gray-100 text-gray-800', icon: FileText };
        case 'published':
          return { color: 'bg-blue-100 text-blue-800', icon: CheckCircle };
        case 'under_evaluation':
          return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
        case 'awarded':
          return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
        case 'cancelled':
          return { color: 'bg-red-100 text-red-800', icon: AlertCircle };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: FileText };
      }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Sort functionality
  const handleSort = (field: keyof RFQ) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort RFQs
  const filteredAndSortedRFQs = rfqs
    .filter(rfq => filterStatus === 'all' || rfq.rfqStatus === filterStatus)
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle nested objects
      if (sortField === 'requester') {
        aValue = a.requester?.name || '';
        bValue = b.requester?.name || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading RFQs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Request for Quotations</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedRFQs.length} RFQ{filteredAndSortedRFQs.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {/* Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="under_evaluation">Under Evaluation</option>
              <option value="awarded">Awarded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button
              onClick={fetchRFQs}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rfqNumber')}
              >
                <div className="flex items-center space-x-1">
                  <span>RFQ ID</span>
                  {sortField === 'rfqNumber' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  {sortField === 'title' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rfqType')}
              >
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Type</span>
                  {sortField === 'rfqType' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rfqStatus')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortField === 'rfqStatus' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('submissionDeadline')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Deadline</span>
                  {sortField === 'submissionDeadline' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('requester')}
              >
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>Requester</span>
                  {sortField === 'requester' && (
                    <span className="text-blue-600">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedRFQs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No RFQs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {filterStatus === 'all' ? 'No RFQs exist in the system.' : `No RFQs with status "${filterStatus}".`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedRFQs.map((rfq) => (
                <tr key={rfq._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rfq.rfqNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{rfq.title}</div>
                      {rfq.description && (
                        <div className="text-gray-500 text-xs truncate mt-1">
                          {rfq.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {rfq.rfqType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={rfq.rfqStatus} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {formatDate(rfq.submissionDeadline)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <div className="font-medium">{rfq.requester?.name || 'N/A'}</div>
                        <div className="text-gray-500 text-xs">{rfq.requester?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredAndSortedRFQs.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredAndSortedRFQs.length} of {rfqs.length} RFQs
            </span>
            <span className="text-xs">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQTable; 