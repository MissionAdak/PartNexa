export type ReturnStatusType =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PICKUP_ASSIGNED'
  | 'PICKED_UP'
  | 'RECEIVED'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'REFUND_APPROVED'
  | 'REFUNDED'
  | 'REJECTED'
  | 'CANCELLED';

export type ReturnReasonType =
  | 'WRONG_PART'
  | 'COMPATIBILITY_ISSUE'
  | 'DAMAGED_PRODUCT'
  | 'DEFECTIVE_PART'
  | 'DIFFERENT_FROM_DESCRIPTION'
  | 'OTHER';

export interface CreateReturnRequestInput {
  orderId: string;
  orderItemId: string;
  quantity?: number;
  reason: ReturnReasonType;
  details?: string;
  photos?: string[];
}

export interface AdminReviewReturnInput {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface AdminInspectionInput {
  outcome: 'PASSED' | 'FAILED';
  notes?: string;
  condition?: 'GOOD' | 'UNOPENED' | 'DAMAGED';
}
