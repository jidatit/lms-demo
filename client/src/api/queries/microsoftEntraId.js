import { useMutation } from '@tanstack/react-query';
import apiClient from '../client';

// ✅ Resend Microsoft Entra ID invitation for a user
export const useResendMicrosoftInvitation = () => {
  const { mutate, mutateAsync, ...rest } = useMutation({
    mutationKey: ['resend-microsoft-invitation'],
    mutationFn: async (userId) => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await apiClient.post(`/users/${userId}/resend-microsoft-invitation`);
      return response.data;
    }
  });

  return { resendInvitation: mutate, resendInvitationAsync: mutateAsync, ...rest };
};
