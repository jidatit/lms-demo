// src/utils/groupApiUtils.js
import axiosInstance from 'utils/axiosConfig';
import { toast } from 'utils/toast';

/**
 * Deletes a group by calling the LMS delete endpoint.
 * Shows toast on error conditions.
 *
 * @param {number|string} selectedGroupId - The LMS group ID to delete
 * @returns {object} API response data
 */
export async function deleteLmsGroup(selectedGroupId) {
  try {
    const resp = await axiosInstance.post('/groups/group/delete', { group_id: selectedGroupId });
    return resp.data;
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    console.error('deleteLmsGroup error:', msg);
    toast({
      message: 'Error: Group cannot be deleted.',
      type: 'error'
    });
    throw error;
  }
}

/**
 * Deactivates a group (sets is_active = false on group, leaders, subscribers).
 *
 * @param {number|string} selectedGroupId - The LMS group ID to deactivate
 * @returns {object} API response data
 */
export async function deactivateLmsGroup(selectedGroupId) {
  try {
    const resp = await axiosInstance.post('/groups/group/deactivate', { group_id: selectedGroupId });
    if (!resp.data.success) {
      toast({
        message: `Error: ${resp.data.message || 'Could not deactivate group.'}`,
        type: 'error'
      });
    }
    return resp.data;
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    console.error('deactivateLmsGroup error:', msg);
    toast({
      message: 'Error: Group cannot be deactivated.',
      type: 'error'
    });
    throw error;
  }
}

/**
 * Activates a group (sets is_active = true on group, leaders, subscribers).
 *
 * @param {number|string} selectedGroupId - The LMS group ID to activate
 * @returns {object} API response data
 */
export async function activateLmsGroup(selectedGroupId) {
  try {
    const resp = await axiosInstance.post('/groups/group/activate', { group_id: selectedGroupId });
    if (!resp.data.success) {
      toast({
        message: `Error: ${resp.data.message || 'Could not activate group.'}`,
        type: 'error'
      });
    }
    return resp.data;
  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    console.error('activateLmsGroup error:', msg);
    toast({
      message: 'Error: Group cannot be activated.',
      type: 'error'
    });
    throw error;
  }
}
