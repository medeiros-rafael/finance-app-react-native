import { useLocalSearchParams } from 'expo-router';

import { AccountFormScreen } from '@/components/accounts/account-form-screen';

export default function EditAccountScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AccountFormScreen accountId={id} />;
}
