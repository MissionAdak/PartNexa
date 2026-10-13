import { Router, Response, NextFunction } from 'express';
import * as servicesService from './services.service';
import { successResponse } from '../../utils/response';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { AuthenticatedRequest } from '../../types';
import { UserRole } from '@prisma/client';

const router = Router();

// ============================================================================
// CUSTOMER APPOINTMENTS
// ============================================================================

// 1. Book Standalone Service Appointment
router.post('/book', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await servicesService.createServiceAppointment(req.user!.id, req.body);
    return successResponse(res, result, 'Service appointment confirmed successfully!', 201);
  } catch (error) {
    next(error);
  }
});

// Also support POST /appointments as alias
router.post('/appointments', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await servicesService.createServiceAppointment(req.user!.id, req.body);
    return successResponse(res, result, 'Service appointment confirmed successfully!', 201);
  } catch (error) {
    next(error);
  }
});

// 2. Get Logged-in Customer's Appointments
router.get('/my', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const appointments = await servicesService.getCustomerAppointments(req.user!.id);
    return successResponse(res, appointments);
  } catch (error) {
    next(error);
  }
});

router.get('/appointments', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const appointments = await servicesService.getCustomerAppointments(req.user!.id);
    return successResponse(res, appointments);
  } catch (error) {
    next(error);
  }
});

// 3. Admin: View All Service Appointments
router.get('/admin', authenticate, authorize(UserRole.ADMIN), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const list = await servicesService.listAllAppointmentsForAdmin({
      status: req.query.status as string,
      mode: req.query.mode as string,
    });
    return successResponse(res, list);
  } catch (error) {
    next(error);
  }
});

import { verifyInstallationCompletion } from './installationCompletion.service';

// 4. Get Single Appointment by ID
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const appointment = await servicesService.getAppointmentById(
      req.params.id as string,
      req.user!.id,
      req.user!.role
    );
    return successResponse(res, appointment);
  } catch (error) {
    next(error);
  }
});

// Step 11: Verify Service Booking Installation Completion
router.post('/bookings/:id/verify-completion', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await verifyInstallationCompletion({
      bookingId: req.params.id as string,
      code: req.body.code,
      notes: req.body.notes,
      user: req.user!,
    });
    return successResponse(res, result, 'Installation completion verified successfully!');
  } catch (error) {
    next(error);
  }
});

export default router;
