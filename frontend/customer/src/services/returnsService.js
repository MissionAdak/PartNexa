import api from './api';

export const returnsService = {
  checkEligibility: async (orderId, orderItemId) => {
    const res = await api.get(`/returns/eligibility/${orderId}/${orderItemId}`);
    return res.data?.data || res.data;
  },

  createReturn: async (data) => {
    const res = await api.post('/returns', data);
    return res.data?.data || res.data;
  },

  getMyReturns: async () => {
    const res = await api.get('/returns/my');
    return res.data?.data || res.data;
  },

  getReturnById: async (id) => {
    const res = await api.get(`/returns/${id}`);
    return res.data?.data || res.data;
  },

  adminListReturns: async (params = {}) => {
    const res = await api.get('/admin/returns', { params });
    return res.data?.data || res.data;
  },

  adminReviewReturn: async (id, data) => {
    const res = await api.post(`/admin/returns/${id}/review`, data);
    return res.data?.data || res.data;
  },

  adminInspectReturn: async (id, data) => {
    const res = await api.post(`/admin/returns/${id}/inspect`, data);
    return res.data?.data || res.data;
  },

  adminProcessRefund: async (id) => {
    const res = await api.post(`/admin/returns/${id}/refund`);
    return res.data?.data || res.data;
  },
};

export default returnsService;
