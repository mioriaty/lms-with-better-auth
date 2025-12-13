import { authClient } from '@/libs/utils/auth-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useLogout() {
  const router = useRouter();

  const handleLogout = async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('Logged out successfully');
          router.push('/');
        },
        onError: (error) => {
          toast.error(error.error.message);
        }
      }
    });
  };

  return handleLogout;
}
