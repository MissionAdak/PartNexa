import { Response, NextFunction } from 'express';
import { successResponse, createdResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';
import * as returnsService from './returns.service';
import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';

/**
 * GET /api/returns/eligibility/:orderId/:orderItemId
 * Checks whether an item in an order is eligible for return.
 */
export const checkEligibility = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.orderId as string;
    const orderItemId = req.params.orderItemId as string;
    const userId = req.user!.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        deliveryAssignments: true,
        tracking: true,
        returnRequests: true,
        items: true,
      },
    });

    if (!order) {
      throw AppError.notFound('Order not found.');
    }

    if (order.userId !== userId && req.user?.role !== 'ADMIN') {
      throw AppError.forbidden('Forbidden: Cannot check eligibility for another customer order.');
    }

    const eligibility = returnsService.checkItemReturnEligibility(
      order,
      orderItemId,
      order.returnRequests || []
    );

    return successResponse(res, eligibility, 'Return eligibility retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/returns
 * Customer creates an item-level return request.
 */
export const createReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const result = await returnsService.createReturnRequest(userId, req.body);
    return createdResponse(res, result, 'Return request submitted successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/returns/my
 * Customer gets their return requests.
 */
export const getMyReturns = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const returns = await returnsService.getCustomerReturns(userId);
    return successResponse(res, returns, 'Customer returns retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/returns/:id
 * Retrieve a single return request.
 */
export const getReturnById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const isAdmin = req.user?.role === 'ADMIN';
    const ret = await returnsService.getReturnById(id, userId, isAdmin);
    return successResponse(res, ret, 'Return details retrieved successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/returns
 * Admin lists all returns with filter/search.
 */
export const adminListReturns = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const returns = await returnsService.adminListReturns({
      status,
      search,
    });
    return successResponse(res, returns, 'All returns retrieved for admin oversight.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:id/review
 * Admin approves or rejects a return request.
 */
export const adminReviewReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const id = req.params.id as string;
    const result = await returnsService.adminReviewReturn(adminId, id, req.body);
    return successResponse(res, result, 'Return request reviewed successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:id/inspect
 * Admin / QA inspector records physical item inspection outcome.
 */
export const adminInspectReturn = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const id = req.params.id as string;
    const result = await returnsService.updateReturnInspection(adminId, id, req.body);
    return successResponse(res, result, 'Return inspection recorded successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/returns/:id/refund
 * Admin approves and executes backend refund.
 */
export const adminProcessRefund = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user!.id;
    const id = req.params.id as string;
    const result = await returnsService.processRefund(adminId, id);
    return successResponse(res, result, 'Refund executed and recorded successfully.');
  } catch (error) {
    next(error);
  }
};
