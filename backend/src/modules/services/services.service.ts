import prisma from '../../config/prisma';
import AppError from '../../utils/AppError';
import { createNotification } from '../notifications/notifications.service';

export interface CreateBookingDto {
  serviceCode: string;
  serviceName: string;
  serviceMode?: 'DOORSTEP' | 'WORKSHOP';
  mode?: 'DOORSTEP' | 'WORKSHOP';
  preferredDate: string | Date;
  customerVehicleId?: string | null;
  vehicleInfo?: string | null;
  vehicleNumber?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  shopId?: string | null;
  addressId?: string | null;
  notes?: string | null;
  quotedLaborPrice?: number | string;
}

export const createServiceAppointment = async (userId: string, dto: CreateBookingDto) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });

  if (!user) {
    throw AppError.notFound('Customer account not found.');
  }

  const mode = (dto.mode || dto.serviceMode || 'DOORSTEP').toUpperCase() as 'DOORSTEP' | 'WORKSHOP';
  const preferredDate = new Date(dto.preferredDate);
  if (isNaN(preferredDate.getTime())) {
    throw AppError.badRequest('Invalid preferred date provided.');
  }

  // 1. Resolve Vehicle Information
  let vehicleInfo = dto.vehicleInfo || '';
  let vehicleNumber = dto.vehicleNumber || '';
  let customerVehicle = null;

  if (dto.customerVehicleId) {
    customerVehicle = await prisma.customerVehicle.findFirst({
      where: { id: dto.customerVehicleId, userId },
      include: {
        variant: {
          include: { model: { include: { make: true } } },
        },
      },
    });

    if (customerVehicle) {
      const v = customerVehicle.variant;
      const vehicleDesc = `${v?.model?.make?.name || ''} ${v?.model?.name || ''} ${v?.year || ''} (${v?.name || ''})`.trim();
      vehicleInfo = vehicleInfo || customerVehicle.nickname || vehicleDesc;
      vehicleNumber = vehicleNumber || customerVehicle.regNumber || '';
    }
  }

  // 2. Resolve Customer Contact
  const contactName =
    dto.contactName?.trim() ||
    `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
    user.email;
  const contactPhone = dto.contactPhone?.trim() || user.phone || '9876543210';

  // 3. Resolve Address for Doorstep
  let addressId = dto.addressId || null;
  if (mode === 'DOORSTEP' && !addressId) {
    const defaultAddr = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
    if (defaultAddr) {
      addressId = defaultAddr.id;
    }
  }

  // 4. Resolve Workshop / Shop
  let shopId = dto.shopId || null;
  if (mode === 'WORKSHOP' && !shopId) {
    // If workshop mode but shopId not specified, pick first verified active shop
    const defaultShop = await prisma.shop.findFirst({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
    });
    if (defaultShop) {
      shopId = defaultShop.id;
    }
  } else if (mode === 'DOORSTEP' && !shopId) {
    // For doorstep, assign to an active workshop in the network
    const doorstepShop = await prisma.shop.findFirst({
      where: { isActive: true },
      orderBy: { rating: 'desc' },
    });
    if (doorstepShop) {
      shopId = doorstepShop.id;
    }
  }

  const laborPrice = Number(dto.quotedLaborPrice) || 0;

  // 5. Create Standalone ServiceAppointment
  const appointment = await prisma.serviceAppointment.create({
    data: {
      customerId: userId,
      customerVehicleId: customerVehicle?.id || null,
      shopId: shopId || null,
      serviceCode: dto.serviceCode || 'general_service',
      serviceName: dto.serviceName || 'General Vehicle Service',
      mode,
      addressId,
      preferredDate,
      scheduledDate: preferredDate,
      status: 'CONFIRMED',
      quotedLaborPrice: laborPrice,
      notes: dto.notes || null,
      contactName,
      contactPhone,
      vehicleInfo,
      vehicleNumber,
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      customerVehicle: {
        include: {
          variant: { include: { model: { include: { make: true } } } },
        },
      },
      shop: true,
      address: true,
    },
  });

  // 6. WORKSHOP REFLECTION: Create corresponding ShopJob in workshop calendar
  let shopJob = null;
  if (shopId) {
    try {
      shopJob = await prisma.shopJob.create({
        data: {
          shopId,
          customerName: contactName,
          customerPhone: contactPhone,
          vehicleInfo: vehicleInfo || 'Customer Vehicle',
          vehicleNumber: vehicleNumber || null,
          serviceName: dto.serviceName || 'Service Appointment',
          jobType: mode === 'DOORSTEP' ? 'DIFM_DOORSTEP_VISIT' : 'DIFM_SHOP_VISIT',
          locationType: mode === 'DOORSTEP' ? 'DOORSTEP' : 'SHOP',
          status: 'SCHEDULED',
          totalServiceAmount: laborPrice,
          serviceFee: laborPrice,
          installationFee: laborPrice,
          scheduledDate: preferredDate,
          notes: dto.notes || `Direct ${mode} booking (Appointment #${appointment.id.substring(0, 8)})`,
        },
      });
    } catch (jobErr) {
      console.error('Warning: Failed to create shopJob for appointment:', jobErr);
    }
  }

  // Authoritative Notifications
  try {
    // 1. Customer: Service scheduled
    await createNotification({
      userId,
      title: 'Service Appointment Confirmed',
      body: `Your ${dto.serviceName || 'Service'} appointment is confirmed for ${preferredDate.toLocaleDateString('en-IN')}. Mode: ${mode}.`,
      channel: 'IN_APP',
      status: 'DELIVERED',
      data: {
        route: '/customer/services',
        appointmentId: appointment.id,
        type: 'SERVICE_BOOKED',
      },
    });

    // 2. Workshop: New service job
    if (shopId) {
      const shop = await prisma.shop.findUnique({ where: { id: shopId } });
      if (shop?.ownerId) {
        await createNotification({
          userId: shop.ownerId,
          title: 'New Service Appointment',
          body: `New ${mode} booking for ${contactName}: ${dto.serviceName || 'Service'} (${vehicleInfo || 'Vehicle'}).`,
          channel: 'IN_APP',
          status: 'DELIVERED',
          data: {
            route: '/shop/calendar',
            appointmentId: appointment.id,
            shopJobId: shopJob?.id,
            type: 'SHOP_NEW_APPOINTMENT',
          },
        });
      }
    }
  } catch (notifErr) {
    console.warn('[Services] Notification error:', notifErr);
  }

  return {
    appointment,
    shopJob,
  };
};

export const getCustomerAppointments = async (userId: string) => {
  return prisma.serviceAppointment.findMany({
    where: { customerId: userId },
    include: {
      customerVehicle: {
        include: {
          variant: { include: { model: { include: { make: true } } } },
        },
      },
      shop: true,
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAppointmentById = async (id: string, userId: string, role?: string) => {
  const appointment = await prisma.serviceAppointment.findUnique({
    where: { id },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      customerVehicle: {
        include: {
          variant: { include: { model: { include: { make: true } } } },
        },
      },
      shop: true,
      address: true,
    },
  });

  if (!appointment) {
    throw AppError.notFound('Service appointment not found.');
  }

  if (role !== 'ADMIN' && appointment.customerId !== userId) {
    throw AppError.forbidden('You do not have permission to view this appointment.');
  }

  return appointment;
};

export const listAllAppointmentsForAdmin = async (query: { status?: string; mode?: string } = {}) => {
  return prisma.serviceAppointment.findMany({
    where: {
      ...(query.status && { status: query.status }),
      ...(query.mode && { mode: query.mode }),
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      customerVehicle: {
        include: {
          variant: { include: { model: { include: { make: true } } } },
        },
      },
      shop: true,
      address: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};
