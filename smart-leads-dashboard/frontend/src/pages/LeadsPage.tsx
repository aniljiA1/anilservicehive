import { useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { useLeadStore } from '../store/leadStore';
import { Lead, CreateLeadData } from '../types';
import { Modal, ConfirmDialog, LoadingOverlay } from '../components/ui';
import LeadFilters from '../components/leads/LeadFilters';
import LeadTable from '../components/leads/LeadTable';
import LeadForm from '../components/leads/LeadForm';
import toast from 'react-hot-toast';

export default function LeadsPage() {
  const {
    leads,
    filters,
    isLoading,
    isSubmitting,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    exportCSV,
  } = useLeadStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);

  // Fetch on filter/page change
  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const handleCreate = async (data: CreateLeadData) => {
    try {
      await createLead(data);
      setShowCreateModal(false);
      toast.success('Lead created successfully!');
    } catch {
      toast.error('Failed to create lead');
    }
  };

  const handleUpdate = async (data: CreateLeadData) => {
    if (!editingLead) return;
    try {
      await updateLead(editingLead._id, data);
      setEditingLead(null);
      toast.success('Lead updated!');
    } catch {
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async () => {
    if (!deletingLead) return;
    try {
      await deleteLead(deletingLead._id);
      setDeletingLead(null);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleExport = async () => {
    try {
      await exportCSV();
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="p-6 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage and track all your sales leads</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus size={16} />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters />

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <LoadingOverlay />
        ) : (
          <LeadTable
            leads={leads}
            onEdit={setEditingLead}
            onDelete={setDeletingLead}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Lead"
      >
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <LeadForm
            initialData={editingLead}
            onSubmit={handleUpdate}
            onCancel={() => setEditingLead(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deletingLead?.name}"? This action cannot be undone.`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
