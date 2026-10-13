import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import * as returnsController from './returns.controller';

// 1. Customer Returns Router (/api/returns)
export const returnsRouter = Router();

returnsRouter.use(authenticate);

returnsRouter.get('/eligibility/:orderId/:orderItemId', returnsController.checkEligibility);
returnsRouter.post('/', returnsController.createReturn);
returnsRouter.get('/my', returnsController.getMyReturns);
returnsRouter.get('/:id', returnsController.getReturnById);

// 2. Admin Returns Router (/api/admin/returns)
export const adminReturnsRouter = Router();

adminReturnsRouter.use(authenticate);
adminReturnsRouter.use(authorize(UserRole.ADMIN));

adminReturnsRouter.get('/', returnsController.adminListReturns);
adminReturnsRouter.get('/:id', returnsController.getReturnById);
adminReturnsRouter.post('/:id/review', returnsController.adminReviewReturn);
adminReturnsRouter.patch('/:id/review', returnsController.adminReviewReturn);
adminReturnsRouter.post('/:id/inspect', returnsController.adminInspectReturn);
adminReturnsRouter.patch('/:id/inspect', returnsController.adminInspectReturn);
adminReturnsRouter.post('/:id/refund', returnsController.adminProcessRefund);
adminReturnsRouter.patch('/:id/refund', returnsController.adminProcessRefund);

export default returnsRouter;
