import axiosInstance from './axiosConfig';

export const fetchAllCampaigns = async () => {
  try {
    const response = await axiosInstance.get('/campaigns/all');
    return response.data; // Return the campaign data
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    throw error; // Re-throw for handling in the calling function
  }
};

// Fetch all categories
export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get('/categories/all');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    return [];
  }
};

// Add a new category
export const addCategory = async (categoryName) => {
  try {
    const response = await axiosInstance.post('/categories/add', { name: categoryName });
    return response.data.data;
  } catch (error) {
    console.error('Error adding category:', error.response?.data || error.message);
    throw error;
  }
};
