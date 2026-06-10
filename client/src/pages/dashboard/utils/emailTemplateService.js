import axiosInstance from 'utils/axiosConfig';

export const emailTemplateService = {
  // Get all email templates with pagination
  getAllTemplates: async (page = 1, limit = 10, onlyActive = false) => {
    return axiosInstance.get('/email_template/all', {
      params: {
        page,
        limit,
        onlyActive
      }
    });
  },

  // Get a single email template by ID
  getTemplate: async (id) => {
    return axiosInstance.get(`/email_template/get/${id}`);
  },

  // Add a new email template
  addTemplate: async (templateData) => {
    return axiosInstance.post('/email_template/add', templateData);
  },

  // Update an existing email template
  updateTemplate: async (id, templateData) => {
    return axiosInstance.put(`/email_template/update/${id}`, templateData);
  },

  // Delete an email template
  deleteTemplate: async (id) => {
    return axiosInstance.delete(`/email_template/delete/${id}`);
  }
};
