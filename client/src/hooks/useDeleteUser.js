import axios from 'axios';
import { toast } from 'utils/toast';
import { GoPhishAccountAPIKey, GoPhishPublicURL } from 'utils/constants';
import { useDeleteUser } from 'api/queries/users';
import { deleteUserFromGoPhish } from 'utils/gophishUtils';
import { useRemoveGroupMember } from 'api/queries/groups';
import { useAuth } from 'contexts/AuthContext';

// // Separate GoPhish delete logic
// export const deleteUserFromGoPhish = async (groupId, email) => {
//   try {
//     const groupResponse = await axios.get(`${GoPhishPublicURL}/api/groups/${groupId}/?api_key=${GoPhishAccountAPIKey}`);

//     if (!groupResponse.data.success) {
//       throw new Error(groupResponse.data.message || 'Failed to fetch GoPhish group');
//     }

//     const targets = groupResponse.data.targets || [];

//     // Check if group has only one target
//     if (targets.length <= 1 && targets.some((target) => target.email === email)) {
//       throw new Error('Cannot delete the last member of the group');
//     }

//     const updatedTargets = targets.filter((target) => target.email !== email);

//     const groupData = {
//       ...groupResponse.data,
//       targets: updatedTargets
//     };

//     const updateResponse = await axios.put(`${GoPhishPublicURL}/api/groups/${groupId}/?api_key=${GoPhishAccountAPIKey}`, groupData);

//     if (!updateResponse.data.success) {
//       throw new Error(updateResponse.data.message || 'Failed to update GoPhish group');
//     }

//     return true;
//   } catch (error) {
//     throw new Error(error?.response?.data?.message || 'Error deleting from GoPhish');
//   }
// };

// Unified delete handler
const useHandleDeleteUser = ({ setLoading, setDelbtnloader, setDeleteLoading, getAllUsers, type }) => {
  const { mutateAsync: deleteUser } = useDeleteUser();
  const { mutateAsync: removeMember } = useRemoveGroupMember();
  const { currentUser } = useAuth();
  const role = currentUser?.role;

  const handleDeleteUser = async (user) => {
    const { id, email, groupUsers } = user;

    const groupId = groupUsers?.[0]?.groupId;
    const gophishGroupId = groupUsers?.[0]?.group?.gophishGroupID;

    try {
      setLoading(true);
      setDelbtnloader((prev) => ({ ...prev, [id]: true }));
      setDeleteLoading(true);

      // 🔹 ALWAYS delete from GoPhish (if exists)
      if (gophishGroupId) {
        await deleteUserFromGoPhish(gophishGroupId, email);
      }

      // 🔹 Determine deletion scope based on user type and role
      const shouldDeleteUserGlobally = type === 'Staff Member' || role === 'admin';

      if (shouldDeleteUserGlobally) {
        await deleteUser(id);

        toast({
          message: `${type} deleted successfully!`,
          type: 'success'
        });
      } else {
        if (!groupId) {
          throw new Error('Group ID not found');
        }

        await removeMember({
          groupId,
          userId: id
        });

        toast({
          message: `${type} removed from group successfully!`,
          type: 'success'
        });
      }

      getAllUsers();
    } catch (error) {
      toast({
        message: error.message || `Error deleting ${type.toLowerCase()}!`,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setDelbtnloader((prev) => ({ ...prev, [id]: false }));
      setDeleteLoading(false);
    }
  };

  return handleDeleteUser;
};

export default useHandleDeleteUser;
