import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge, SourceBadge, EmptyState } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { useLeadStore } from '../../store/leadStore';

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

export default function LeadTable({ leads, onEdit, onDelete }: LeadTableProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { pagination, filters, setFilters } = useLeadStore();

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads found"
        description="No leads match your current filters. Try adjusting the search or create a new lead."
      />
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Created</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {leads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-fade-in">
                <td className="px-4 py-3.5">
                  <div className="font-semibold text-gray-900 dark:text-white">{lead.name}</div>
                  {lead.notes && (
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">{lead.notes}</div>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 font-mono text-xs">{lead.email}</td>
                <td className="px-4 py-3.5"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3.5"><SourceBadge source={lead.source} /></td>
                <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => navigate(`/leads/${lead._id}`)}
                      className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="View"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => onEdit(lead)}
                      className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    {(user?.role === 'admin' || lead.createdBy?._id === user?._id) && (
                      <button
                        onClick={() => onDelete(lead)}
                        className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800 mt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} leads
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilters({ page: filters.page - 1 })}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setFilters({ page })}
                  className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                    page === pagination.page
                      ? 'bg-brand-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setFilters({ page: filters.page + 1 })}
              disabled={!pagination.hasNextPage}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
