import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticate);

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
const LEAD_SOURCES = ['Website', 'Instagram', 'Referral'];

// GET /api/leads/stats
router.get('/stats', getLeadStats);

// GET /api/leads/export
router.get('/export', exportLeadsCSV);

// GET /api/leads
router.get('/', getLeads);

// POST /api/leads
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('status').optional().isIn(LEAD_STATUSES).withMessage('Invalid status'),
    body('source').isIn(LEAD_SOURCES).withMessage('Invalid source'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
  ],
  validateRequest,
  createLead
);

// GET /api/leads/:id
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validateRequest,
  getLeadById
);

// PUT /api/leads/:id
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid lead ID'),
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('status').optional().isIn(LEAD_STATUSES).withMessage('Invalid status'),
    body('source').optional().isIn(LEAD_SOURCES).withMessage('Invalid source'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes max 500 characters'),
  ],
  validateRequest,
  updateLead
);

// DELETE /api/leads/:id
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid lead ID')],
  validateRequest,
  authorize('admin', 'sales'),
  deleteLead
);

export default router;
