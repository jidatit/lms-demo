import { getCompanies } from 'api/queries/companies';
import { getGroupsByCompany } from 'api/queries/groups';
import axiosInstance from 'utils/axiosConfig';
// Function to fetch all companies using new API logic
export const fetchAllCompanies = async () => {
  try {
    // Pass no filters for "all companies"
    const response = await getCompanies();

    // In case you only want the array of companies
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
};
// Function to fetch companies by contributor
export const fetchCompaniesByContributor = async (contributorId) => {
  try {

    const response = await getCompanies({ createdBy: contributorId });

    // In case you only want the array of companies
    return response.data;
  } catch (error) {
    console.error('Error fetching companies by contributor:', error);
    throw error; // Handle error appropriately
  }
};

export const fetchGroupsByCompany = async (companyId) => {
  try {
    const { data } = await getGroupsByCompany(companyId);
    return data; // just returning the groups array
  } catch (error) {
    console.error('Error fetching groups by company:', error);
    throw error;
  }
};
