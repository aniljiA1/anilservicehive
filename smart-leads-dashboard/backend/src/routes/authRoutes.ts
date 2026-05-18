import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, getAllUsers } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/errorHandler';

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'sales']).withMessage('Role must be admin or sales'),
  ],
  validateRequest,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  login
);

// GET /api/auth/me
router.get('/me', authenticate, getProfile);

// GET /api/auth/users — admin only
router.get('/users', authenticate, authorize('admin'), getAllUsers);

export default router;
