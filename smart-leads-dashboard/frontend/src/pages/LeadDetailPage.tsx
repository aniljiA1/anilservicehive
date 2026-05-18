import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, Mail, Calendar, User, FileText } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { Lead, CreateLeadData } from '../types';
import { StatusBadge, SourceBadge, LoadingOverlay, Modal, ConfirmDialog } from '../components/ui';
import LeadForm from '../components/leads/LeadForm';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLead, isLoading, isSubmitting, fetchLeadById, updateLead, deleteLead, clearCurrentLead } = useLeadStore();
  const { user } = useAuthStore();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) fetchLeadById(id);
    return () => clearCurrentLead();
  }, [id]);

  const handleUpdate = async (data: CreateLeadData) => {
    if (!currentLead) return;
    try {
      await updateLead(currentLead._id, data);
      setEditOpen(false);
      toast.success('Lead updated!');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!currentLead) return;
    try {
      await deleteLead(currentLead._id);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (isLoading) return <LoadingOverlay />;
  if (!currentLead) return (
    <div className="p-6 text-center text-gray-500">Lead not found.</div>
  );

  const lead: Lead = currentLead;
  const canDelete = user?.role === 'admin' || lead.createdBy?._id === user?._id;

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      {/* Back */}
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Leads
      </button>

      <div className="card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg">
              {lead.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{lead.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditOpen(true)} className="btn-secondary p-2">
              <Pencil size={15} />
            </button>
            {canDelete && (
              <button onClick={() => setDeleteOpen(true)} className="btn-danger p-2">
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          <SourceBadge source={lead.source} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <Mail size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{lead.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <User size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created By</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {typeof lead.createdBy === 'object' ? lead.createdBy.name : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
              <Calendar size={14} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {new Date(lead.updatedAt).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Notes</p>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Lead">
        <LeadForm
          initialData={lead}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${lead.name}"? This cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
