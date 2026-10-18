import { useLocalSearchParams } from 'expo-router';

import { TransactionFormScreen } from '@/components/transactions/transaction-form-screen';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TransactionFormScreen transactionId={id} />;
}
