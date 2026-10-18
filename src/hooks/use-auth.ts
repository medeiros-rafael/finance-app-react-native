import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/api/auth';
import { useSession } from '@/stores/session';

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const auth = await authApi.login(email.trim(), password);
      await useSession.getState().signIn(auth);
      return auth.user;
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string }) => {
      const auth = await authApi.register(input.name.trim(), input.email.trim(), input.password);
      await useSession.getState().signIn(auth);
      return auth.user;
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email.trim()) });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) =>
      authApi.resetPassword(email.trim(), code.trim(), newPassword),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
  });
}

export function useUpdateProfile() {
  return useMutation({
    mutationFn: async (name: string) => {
      const user = await authApi.updateProfile(name.trim());
      await useSession.getState().updateUser(user);
      return user;
    },
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await authApi.logout().catch(() => undefined);
      await useSession.getState().clear();
      client.clear();
    },
  });
}
