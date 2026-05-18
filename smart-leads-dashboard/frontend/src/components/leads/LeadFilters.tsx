import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { LeadStatus, LeadSource } from '../../types';
import { useLeadStore } from '../../store/leadStore';
import { useDebounce } from '../../hooks/useDebounce';

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export default function LeadFilters() {
  const { filters, setFilters, resetFilters } = useLeadStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);

  // Apply debounced search to store
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      setFilters({ search: debouncedSearch, page: 1 });
    }
  }, [debouncedSearch]);

  const hasActiveFilters =
    filters.status || filters.source || filters.search || filters.sort !== 'latest';

  const handleReset = () => {
    setSearchInput('');
    resetFilters();
  };

  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9 pr-3"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          className="input w-auto min-w-[130px]"
          value={filters.status || ''}
          onChange={(e) => setFilters({ status: e.target.value as LeadStatus | '', page: 1 })}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Source filter */}
        <select
          className="input w-auto min-w-[130px]"
          value={filters.source || ''}
          onChange={(e) => setFilters({ source: e.target.value as LeadSource | '', page: 1 })}
        >
          <option value="">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="input w-auto min-w-[120px]"
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as 'latest' | 'oldest', page: 1 })}
        >
          <option value="latest">Latest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="btn-secondary gap-1.5 whitespace-nowrap"
          >
            <SlidersHorizontal size={14} />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
