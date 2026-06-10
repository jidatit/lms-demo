// utils/gophishUtils.js
import axios from 'axios'; // Assuming axios is used globally
import { GoPhishAccountAPIKey, GoPhishPublicURL } from './constants';

// Create a group in GoPhish
export const createGophishGroup = async (name, targets) => {
  try {
    const response = await axios.post(`${GoPhishPublicURL}/api/groups/?api_key=${GoPhishAccountAPIKey}`, {
      name,
      targets
    });
    return response.data;
  } catch (error) {
    console.error('Failed to create GoPhish group:', error);
    throw new Error(`Failed to create GoPhish group: ${error?.response?.data?.message || error.message}`);
  }
};

// Delete a group in GoPhish
export const deleteGophishGroup = async (groupId) => {
  try {
    await axios.delete(`${GoPhishPublicURL}/api/groups/${groupId}?api_key=${GoPhishAccountAPIKey}`);
  } catch (error) {
    console.error('Failed to delete GoPhish group:', error);
    // Optionally, handle or log the error without throwing, as this is a cleanup step
  }
};

// Add a member to an existing GoPhish group
export const addMemberToGophishGroup = async (gophishGroupId, newTarget) => {
  try {
    // 1. Get the current group details
    const groupResponse = await axios.get(`${GoPhishPublicURL}/api/groups/${gophishGroupId}/?api_key=${GoPhishAccountAPIKey}`);
    const targets = groupResponse?.data?.targets || [];

    // 2. Add the new target
    const updatedTargets = [...targets, newTarget];

    // 3. Update the group in GoPhish
    const groupData = {
      ...groupResponse.data,
      targets: updatedTargets
    };

    const updateResponse = await axios.put(`${GoPhishPublicURL}/api/groups/${gophishGroupId}/?api_key=${GoPhishAccountAPIKey}`, groupData);

    if (updateResponse.status !== 200) {
      throw new Error('Failed to update GoPhish group');
    }

    return updateResponse.data;
  } catch (error) {
    console.error(`Failed to add member to GoPhish group ${gophishGroupId}:`, error);
    throw error;
  }
};
//Add bulk memebers to existing go phish group
// Add multiple members to an existing GoPhish group
export const addMembersToGophishGroup = async (gophishGroupId, newTargets) => {
  try {
    if (!Array.isArray(newTargets) || newTargets.length === 0) {
      throw new Error('newTargets must be a non-empty array');
    }

    // 1. Get the current group details
    const groupResponse = await axios.get(`${GoPhishPublicURL}/api/groups/${gophishGroupId}/?api_key=${GoPhishAccountAPIKey}`);

    const targets = groupResponse?.data?.targets || [];

    // 2. Add all new targets
    const updatedTargets = [...targets, ...newTargets];

    // 3. Update the group in GoPhish
    const groupData = {
      ...groupResponse.data,
      targets: updatedTargets
    };

    const updateResponse = await axios.put(`${GoPhishPublicURL}/api/groups/${gophishGroupId}/?api_key=${GoPhishAccountAPIKey}`, groupData);

    if (updateResponse.status !== 200) {
      throw new Error('Failed to update GoPhish group');
    }

    return updateResponse.data;
  } catch (error) {
    console.error(`Failed to add members to GoPhish group ${gophishGroupId}:`, error);
    throw error;
  }
};

export const deleteUserFromGoPhish = async (gophishGroupID, email) => {
  try {
    const groupResponse = await axios.get(`${GoPhishPublicURL}/api/groups/${gophishGroupID}/?api_key=${GoPhishAccountAPIKey}`);
    // Any non-200 that isn't 404 → throw
    if (groupResponse.status !== 200) {
      throw new Error(`Failed to fetch GoPhish group (status: ${groupResponse.status})`);
    }

    const targets = groupResponse.data.targets || [];

    // If user not found in group → treat as success
    if (!targets.some((target) => target.email === email)) {
      return true;
    }

    // Prevent deleting last member
    if (targets.length <= 1) {
      throw new Error('Cannot delete the last member of the group');
    }

    // Remove the user from targets
    const updatedTargets = targets.filter((target) => target.email !== email);

    const groupData = {
      ...groupResponse.data,
      targets: updatedTargets
    };

    const updateResponse = await axios.put(`${GoPhishPublicURL}/api/groups/${gophishGroupID}/?api_key=${GoPhishAccountAPIKey}`, groupData);

    // GoPhish PUT group also doesn’t return `success` — just check status
    if (updateResponse.status !== 200) {
      throw new Error(`Failed to update GoPhish group (status: ${updateResponse.status})`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting from GoPhish:', error);
    throw new Error(error?.response?.data?.message || error.message || 'Error deleting from GoPhish');
  }
};
