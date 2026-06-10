import { useState } from 'react';
import { useRemoveGroupMember } from 'api/queries/groups';
import { deleteUserFromGoPhish } from 'utils/gophishUtils';
import { toast } from 'utils/toast';

export const useHandleRemoveGroupMember = () => {
  const { mutateAsync: removeGroupMember } = useRemoveGroupMember();
  const [loading, setLoading] = useState(false);

  const handleRemoveGroupMember = async (groupId, gophishGroupID, userId, email) => {
    setLoading(true);
    try {
      // Step 1: Remove from GoPhish
      if (gophishGroupID) {
        await deleteUserFromGoPhish(gophishGroupID, email);
      }

      // Step 2: Remove from our app
      await removeGroupMember({ groupId, userId });

      toast({
        message: 'Group member removed successfully!',
        type: 'success'
      });
    } catch (err) {
      toast({
        message: err.message || 'Failed to remove group member',
        type: 'error'
      });
      console.error('Error removing group member:', err);
    } finally {
      setLoading(false);
    }
  };

  return { handleRemoveGroupMember, loading };
};
