import { Response } from 'express';
import { FilterQuery } from 'mongoose';
import { Lead, ILeadDocument } from '../models/Lead';
import { AuthenticatedRequest, LeadFilterQuery, LeadStatus, LeadSource } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export const createLead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { name, email, status, source, notes, assignedTo } = req.body as {
      name: string;
      email: string;
      status?: LeadStatus;
      source: LeadSource;
      notes?: string;
      assignedTo?: string;
    };

    const lead = await Lead.create({
      name,
      email,
      status: status || 'New',
      source,
      notes,
      assignedTo,
      createdBy: req.user.id,
    });

    const populated = await lead.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: { lead: populated },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create lead';
    res.status(500).json({ success: false, message });
  }
};

export const getLeads = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const {
      page = String(DEFAULT_PAGE),
      limit = String(DEFAULT_LIMIT),
      status,
      source,
      search,
      sort = 'latest',
    } = req.query as LeadFilterQuery;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: FilterQuery<ILeadDocument> = {};

    // Role-based filter: sales users only see their own leads
    if (req.user.role === 'sales') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (source) filter.source = source;

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const sortOrder = sort === 'oldest' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Lead.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      message: 'Leads fetched successfully.',
      data: { leads },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch leads';
    res.status(500).json({ success: false, message });
  }
};

export const getLeadById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const lead = await Lead.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Sales users can only view their own leads
    if (
      req.user.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lead fetched successfully.',
      data: { lead },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch lead';
    res.status(500).json({ success: false, message });
  }
};

export const updateLead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const updates = req.body as Partial<{
      name: string;
      email: string;
      status: LeadStatus;
      source: LeadSource;
      notes: string;
      assignedTo: string;
    }>;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: { lead: updated },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update lead';
    res.status(500).json({ success: false, message });
  }
};

export const deleteLead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({ success: false, message: 'Lead not found.' });
      return;
    }

    // Only admins or the creator can delete
    if (
      req.user.role === 'sales' &&
      lead.createdBy.toString() !== req.user.id
    ) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete lead';
    res.status(500).json({ success: false, message });
  }
};

export const exportLeadsCSV = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { status, source, search } = req.query as {
      status?: LeadStatus;
      source?: LeadSource;
      search?: string;
    };

    const filter: FilterQuery<ILeadDocument> = {};

    if (req.user.role === 'sales') {
      filter.createdBy = req.user.id;
    }

    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const leads = await Lead.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Build CSV manually
    const headers = ['ID', 'Name', 'Email', 'Status', 'Source', 'Notes', 'Created By', 'Created At'];
    const rows = leads.map((lead) => {
      const createdBy = lead.createdBy as unknown as { name: string; email: string };
      return [
        String(lead._id),
        `"${lead.name}"`,
        lead.email,
        lead.status,
        lead.source,
        `"${lead.notes || ''}"`,
        createdBy ? `"${createdBy.name}"` : '',
        new Date(lead.createdAt).toISOString(),
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-${Date.now()}.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to export leads';
    res.status(500).json({ success: false, message });
  }
};

export const getLeadStats = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const matchFilter: FilterQuery<ILeadDocument> =
      req.user.role === 'sales' ? { createdBy: req.user.id } : {};

    const [statusStats, sourceStats, total] = await Promise.all([
      Lead.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$source', count: { $sum: 1 } } },
      ]),
      Lead.countDocuments(matchFilter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Stats fetched.',
      data: { total, statusStats, sourceStats },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stats';
    res.status(500).json({ success: false, message });
  }
};
