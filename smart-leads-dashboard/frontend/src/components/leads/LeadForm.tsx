import { useState, FormEvent } from 'react';
import { Lead, LeadStatus, LeadSource, CreateLeadData } from '../../types';
import { Spinner } from '../ui';

interface LeadFormProps {
  initialData?: Partial<Lead>;
  onSubmit: (data: CreateLeadData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCES: LeadSource[] = ['Website', 'Instagram', 'Referral'];

export default function LeadForm({ initialData, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    status: (initialData?.status || 'New') as LeadStatus,
    source: (initialData?.source || 'Website') as LeadSource,
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email required';
    if (!formData.source) newErrors.source = 'Source is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const field = (key: keyof typeof formData, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Name *</label>
        <input
          className={`input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={formData.name}
          onChange={(e) => field('name', e.target.value)}
          placeholder="e.g. Rahul Sharma"
          autoFocus
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="label">Email *</label>
        <input
          type="email"
          className={`input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
          value={formData.email}
          onChange={(e) => field('email', e.target.value)}
          placeholder="e.g. rahul@example.com"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={formData.status}
            onChange={(e) => field('status', e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Source *</label>
          <select
            className={`input ${errors.source ? 'border-red-400' : ''}`}
            value={formData.source}
            onChange={(e) => field('source', e.target.value)}
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.source && <p className="text-xs text-red-500 mt-1">{errors.source}</p>}
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={formData.notes}
          onChange={(e) => field('notes', e.target.value)}
          placeholder="Optional notes about this lead..."
          maxLength={500}
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{formData.notes.length}/500</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn-primary flex-1" disabled={isLoading}>
          {isLoading && <Spinner size={14} className="text-white" />}
          {initialData?._id ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
